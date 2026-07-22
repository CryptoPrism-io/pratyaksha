# GCP → AWS migration runbook (Pratyaksha)

**Status:** complete and live since 2026-07-17; push-to-deploy CI since 2026-07-19.

This is the record of how Pratyaksha moved off GCP Cloud Run onto AWS, and the runbook to repeat it for another app. It documents what was actually done, including the parts that were done in the wrong order.

For a reusable, app-agnostic version with copy-paste templates, use the **`gcp-to-aws-migration`** Claude Code skill (`~/.claude/skills/gcp-to-aws-migration/`).

---

## 1. Architecture

The migration was a **split**, not a lift-and-shift. The frontend stayed on Firebase; only the backend and database moved.

```
Browser
  │
  ├─ https://ai-becoming.web.app          Firebase Hosting  (canonical frontend)
  │    site `ai-becoming` in GCP project social-data-pipeline-and-push
  │    also deployed to pratyaksha-3f089.web.app
  │
  ├─ Firebase Auth                        project pratyaksha-3f089 (UNCHANGED)
  │
  └─ https://pratyaksha.8xy5d1tats0s8.us-east-1.cs.amazonlightsail.com
       AWS Lightsail container service `pratyaksha` (micro, us-east-1)
       image: ECR 405633560616.dkr.ecr.us-east-1.amazonaws.com/pratyaksha:latest
       env:   AWS Secrets Manager /cryptoprism/pratyaksha/*
       data:  RDS dbcp-aws.ci348o64i4ep.us-east-1.rds.amazonaws.com
              Postgres 16 · database `becoming` · role `becoming_app` · pgvector
```

The frontend reaches the backend by **absolute URL**, baked in at build time as `VITE_API_BASE_URL` and routed through `src/lib/api.ts` → `apiFetch()`. Its default is the empty string, so a same-origin single-container build still works unchanged.

### Why this shape

| Decision | Reason |
|---|---|
| Frontend stays on Firebase Hosting | The free `*.web.app` URL is auto-SSL and **automatically an authorized domain in Firebase Auth**. Moving it would have meant migrating Auth — i.e. rebuilding every user's login — for no gain. |
| Lightsail Containers, not App Runner | AWS account `405633560616` is restricted to **2 App Runner services per region**. Found only after the App Runner config was written. Check service quotas before designing. |
| No custom domain | `pratyaksha.app` was considered and dropped 2026-07-18. `web.app` needs zero DNS or cert work. |
| Secrets in Secrets Manager, read at deploy time | One source of truth; the deploy script injects them, so nothing is stored in the repo or the image. |

---

## 2. The sequence

Run these in order. Steps 2, 3 and 7 are the ones that hurt when deferred.

**1 — Inventory every consumer.** Every repo, service, scheduler and pipeline that reads or writes what's moving, *including ones in other repos*. The earlier CryptoPrism DB migration missed pipelines living in separate repos and they sat stale for days.

**2 — Database, with the security group pre-opened.** Provision RDS, create the database and an app-scoped role (not master). **Open the security group for every real caller before cutover** — the June 2026 outage was caused by an SG allowing only one home IP, so GitHub runners were silently blocked and every job just timed out. Audit for the idle-connection pattern (long fetch, then write → RDS has already dropped the SSL connection): reconnect immediately before writing and use `sslmode=require`.

**3 — Secrets.** Ten values under `/cryptoprism/pratyaksha/*`, each validated against its provider before deploying — a bad key surfaces as a runtime 500, not a deploy failure. Issue **dedicated per-app API keys with spend caps**; the first deploy shared an OpenRouter key with a $1 account-wide cap and burned 44% of it in testing.

**4 — Container.** `Pratyaksha/dashboard/Dockerfile` — multi-stage `node:20-alpine`, prod deps only in stage 2, port 8080, `/health`. Note that every `VITE_*` var is **baked into the image**: changing one requires a rebuild, not a redeploy.

**5 — Lightsail.** Create the service, enable `ecrImagePullerRole`, then `Pratyaksha/dashboard/scripts/deploy-lightsail.sh` does the rest: grants the puller principal an ECR repository policy, reads env from Secrets Manager, and submits `create-container-service-deployment` with a health-checked public endpoint.

**6 — Split the frontend off the container.** Add `apiFetch()` and route every `/api` call through it; enable CORS on the backend; add the backend host to Firebase Auth authorized domains; then **grep the built bundle** to confirm no server secrets leaked. The direct browser→Airtable write path tree-shook out, so the public bundle carries only the public Firebase web config and the backend URL.

**7 — Make deploys propagate.** A migrated SPA behind a service worker keeps serving the pre-migration bundle, which points at the now-dead old backend — it looks exactly like a data-loss bug. Fixed in PR #16: `sw.js` v3 fetches navigation HTML with `cache: 'reload'`, and `index.html` + `sw.js` are served no-cache.

**8 — Wire CI in the same PR as the cutover.** See §3. This was deferred for two weeks and it was the most expensive mistake of the migration.

**9 — Decommission behind two gates.** Export **and** parity-check before deleting anything on GCP. Keep the old resource running idle through that window — it is the rollback path.

---

## 3. Deploys today

`git push` to `main` ships both halves. Nothing local is required — no Docker, no Firebase token, no AWS creds.

| Workflow | Deploys | Triggered by | Auth |
|---|---|---|---|
| `.github/workflows/deploy-pratyaksha.yml` | Frontend → Firebase Hosting `ai-becoming` | push to `main` under `Pratyaksha/dashboard/**` | **Keyless WIF** (`WIF_PROVIDER` / `WIF_SERVICE_ACCOUNT`) |
| `.github/workflows/deploy-backend.yml` | Backend → ECR → Lightsail | push to `main` under `Pratyaksha/dashboard/server/**`, `Dockerfile`, `package*.json`, `scripts/deploy-lightsail.sh` | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` 🔴 |

The backend image is built **on the GitHub runner**, which is what removed the local-Docker dependency entirely.

`.gitattributes` pins `*.sh text eol=lf` — without it a CRLF shebang breaks the Linux runner.

Both workflows were verified green on their first push (PR #20: frontend 2m55s, backend 3m49s).

🔴 The backend still authenticates with static AWS access keys. The durable end state is an **AWS OIDC role** — `cpio_website/deploy-aws.yml` and `gyanmarg/deploy-aws.yml` already do this and are the reference.

---

## 4. What went wrong

**"I see Mario demo data" after cutover.** The browser was still serving the old `ai-becoming` bundle pointing at the dead Cloud Run backend, so `fetchEntries` fell through to `getDemoData("mario")`. Fixed three ways: deploy the new build, make `fetchEntries` throw rather than fall back for signed-in users, and gate the query on auth-loading so there's no flash of demo content (PRs #14, #15, #16).

**Nearly wiped newer data.** RDS `becoming` (565 entries, 55 users) is **newer** than the Airtable base it originally came from, which stops at 2026-02-10. Running `migrate-airtable.mjs` "to sync" would have destroyed months of real private journal entries. **Never re-import; never insert synthetic data into this database.**

**No CI for two weeks.** Every release ran from the Windows laptop and depended on three independently-rotting conditions: Docker Desktop up, a fresh Firebase CLI token, local AWS creds present. One routine change became a multi-hour session — `deploy-all.sh` silently no-op'd three times with the Docker daemon down, then Firebase failed with "credentials no longer valid" *while `firebase login:list` reported logged-in*. `firebase login --reauth` refuses non-interactive mode, so only the user typing it in their own terminal could fix it.

**Nearly created a credential that already existed.** The plan called for a new `FIREBASE_SERVICE_ACCOUNT`. Git history at `ae857a4` showed the pre-migration Cloud Run deploy already using `WIF_PROVIDER`/`WIF_SERVICE_ACCOUNT` for the same GCP project; `FIREBASE_SERVICE_ACCOUNT` had only ever been referenced, never set. Reusing the existing keyless WIF needed zero manual IAM steps. **Check `gh secret list` and git history before creating any deploy credential.**

---

## 5. Known gaps

- **Push notifications** — `firebase-admin` used the GCP metadata server for default credentials. There is no metadata server on AWS, so it needs an explicit service-account JSON. Not yet done.
- **Notification cron** — was Cloud Scheduler → `/api/cron/notifications` with a `CRON_SECRET` header. Not yet recreated on EventBridge Scheduler.
- **Backend CI uses static AWS keys**, not OIDC.
- **Marketing websites** not deployed.
- `ui-tests.yml` (Playwright visual regression) has failed on `main` since Feb 2026 — missing snapshot baselines, pre-existing and unrelated to this migration.

---

## 6. Gotchas worth memorising

- **`firebase login:list` lies.** It reports the cached identity, not token validity. The real probe is `firebase projects:list`.
- **`firebase login --reauth` cannot be automated.** It refuses non-interactive mode; an agent or a `!`-prefixed command will always fail it. Never build a deploy path that needs it.
- **Health checks lie.** Confirm the check tests real connectivity (`SELECT 1`), not just "process exited 0." A false-green hid the entire June DB outage.
- **No rollback exists.** Every deploy in this fleet is roll-forward only.
- **Don't trust a bundle hash to prove what deployed** — grep the deployed asset for a string you just changed.

---

## Related

- Skill: `gcp-to-aws-migration` — app-agnostic runbook + templates
- Skill: `cryptoprism-deploy` — which workflow to copy per deploy target
- Skill: `incident-triage` — check whether a failure is already a known pattern
- KB: `65-playbooks/cloud-provider-migration.md`, `60-incidents/manual-deploy-no-ci-local-state-rot.md`, `50-company/operations/incident-gcp-aws-migration.md`

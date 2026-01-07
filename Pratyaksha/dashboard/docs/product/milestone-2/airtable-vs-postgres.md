# Airtable vs PostgreSQL: Migration Analysis

**Date**: January 2026
**Status**: Defer to Milestone 3
**Recommendation**: Stay with Airtable through Milestone 2

---

## Executive Summary

PostgreSQL migration is **technically straightforward** but **strategically premature**. The current Airtable integration uses no exotic features, making future migration low-risk. Authentication and multi-user support provide more immediate value.

---

## Current State Analysis

### Airtable Integration Depth

| Factor | Finding | Migration Impact |
|--------|---------|------------------|
| Table count | 1 table | Trivial |
| Linked records | None | No JOIN complexity |
| Calculated fields | None (computed in code) | No formula translation |
| Automations | None | No workflow migration |
| Record count | ~76 entries | Trivial data volume |
| API pattern | Simple REST calls | Direct port to any DB |

### Files Using Airtable

**Backend (4 files)**:
- `server/lib/airtable.ts` - Main DB client
- `server/routes/entry.ts` - CRUD operations
- `server/routes/weeklySummary.ts` - Summary caching
- `server/routes/dailySummary.ts` - Daily summaries

**Frontend (2 files)**:
- `src/lib/airtable.ts` - API client (calls backend)
- `src/hooks/useEntries.ts` - Data fetching hooks

**Total**: ~6 files need modification for migration

---

## Why Stay with Airtable Now

### 1. No Pain Points

| Metric | Current | Airtable Limit | Headroom |
|--------|---------|----------------|----------|
| Records | 76 | 50,000 | 99.8% free |
| API calls | ~100/day | 5 calls/sec | Negligible |
| Attachments | 0 | 20GB | N/A |

### 2. Auth is Higher Priority

```
Value delivered to users:

Milestone 2 (Auth)     → Multi-user support, personal data
Milestone 3 (Postgres) → Same functionality, different backend

Users don't care where data lives. They care about features.
```

### 3. Migration Can Happen Anytime

The schema is stable:
- No planned field additions post-auth
- AI pipeline output is fixed
- No complex relationships to untangle

### 4. Airtable Provides Free Admin UI

- Visual data browser
- Quick field edits
- Export to CSV
- No pgAdmin setup needed

---

## Migration Effort Estimate

### PostgreSQL Schema

```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  name TEXT,
  type TEXT,
  date DATE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- AI-generated fields
  inferred_mode TEXT,
  energy_level TEXT,
  energy_shape TEXT,
  contradiction TEXT,
  snapshot TEXT,
  summary TEXT,
  themes TEXT[],
  sentiment TEXT,
  actionable_insights TEXT,
  next_action TEXT,
  loops TEXT,

  -- Metadata
  is_deleted BOOLEAN DEFAULT FALSE,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  is_summary BOOLEAN DEFAULT FALSE,
  meta_flag TEXT,
  word_count INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_date ON entries(date);
CREATE INDEX idx_entries_user_date ON entries(user_id, date);
```

### Task Breakdown

| Task | Effort | Notes |
|------|--------|-------|
| Schema creation | 2h | Single table + indexes |
| `server/lib/db.ts` | 4h | Replace Airtable client with pg client |
| Update routes | 2h | Swap function calls |
| Data migration script | 2h | Airtable export → pg import |
| Testing | 4h | Verify all CRUD + filtering |
| **Total** | **~14h** | ~2 working days |

---

## When to Migrate (Milestone 3 Triggers)

Migrate when ANY of these occur:

| Trigger | Threshold | Why |
|---------|-----------|-----|
| Record count | >10,000 | Approaching Airtable limits |
| API costs | >$50/mo | Airtable pricing tiers |
| Complex queries | Need JOINs | Multi-table analytics |
| Performance | >500ms latency | Direct DB faster |
| User count | >500 users | Need connection pooling |

---

## Risk Assessment

### Staying with Airtable (Low Risk)

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hit 50K limit | Low (at 76) | Monitor, migrate before 40K |
| API rate limits | Low | Already under limits |
| Airtable outage | Low | They have 99.9% SLA |
| Price increase | Medium | Data is exportable |

### Migrating Now (Medium Risk)

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Delays auth work | High | 2 days lost |
| New bugs | Medium | Different query patterns |
| Hosting complexity | Medium | Need managed Postgres |
| No admin UI | Certain | Build or use pgAdmin |

---

## Recommended Postgres Provider (For Milestone 3)

| Provider | Free Tier | Pros | Cons |
|----------|-----------|------|------|
| **Supabase** | 500MB, 50K rows | Built-in auth, realtime | May not need their auth |
| **Neon** | 512MB, branching | Serverless, auto-scale | Newer service |
| **Railway** | $5 credit/mo | Simple deploy | No persistent free tier |
| **PlanetScale** | 5GB (MySQL) | Generous free tier | Not Postgres |

**Recommendation**: Supabase or Neon for serverless Postgres with generous free tiers.

---

## Decision Matrix

| Criteria | Migrate Now | Migrate in M3 |
|----------|-------------|---------------|
| User value | None | Same |
| Technical risk | Medium | Low (proven schema) |
| Time cost | 2 days now | 2 days later |
| Airtable headroom | 99.8% unused | Still plenty |
| Auth complexity | Adds variables | Isolated change |

**Score**: Migrate in M3 wins on all criteria.

---

## Conclusion

**Stay with Airtable for Milestone 2.**

The migration is straightforward but provides zero user-facing value. Focus engineering effort on authentication and multi-user support. Revisit PostgreSQL migration when approaching 10K records or when complex analytics require SQL capabilities.

---

## Appendix: Current Airtable Fields

| Field | Type | Used For |
|-------|------|----------|
| Name | Text | Entry title/snapshot |
| Text | Long text | Full journal entry |
| Type | Single select | 15 entry types |
| Date | Date | Entry date |
| Timestamp | DateTime | Creation time |
| Inferred Mode | Single select | 15 psychological states |
| Inferred Energy | Single select | 10 energy levels |
| Energy Shape | Single select | 12 energy patterns |
| Contradiction | Single select | 12 internal tensions |
| Entry Theme Tags (AI) | Text | Comma-separated tags |
| Entry Sentiment (AI) | Single select | Positive/Negative/Neutral |
| Summary (AI) | Long text | AI summary |
| Actionable Insights (AI) | Long text | AI recommendations |
| Next Action | Text | Suggested action |
| Loops | Text | Recurring patterns |
| Snapshot | Text | Brief summary |
| Is Deleted? | Checkbox | Soft delete flag |
| Is Bookmarked? | Checkbox | User bookmark |
| Is Summary? | Checkbox | Weekly summary marker |
| Meta Flag | Text | Entry origin |
| Entry Length (Words) | Number | Word count |

**Total**: 21 fields, all simple types, no relationships.

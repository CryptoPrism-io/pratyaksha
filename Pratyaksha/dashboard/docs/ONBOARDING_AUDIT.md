# Onboarding & Tutorial Audit

> Generated: 2026-02-07 | Verdict: Current flow is ~3x longer than industry standard

---

## The Problem

The current onboarding is **two disconnected systems** totaling **27+ steps** before a user writes their first real journal entry. Industry standard for wellness/SaaS apps is **3-5 steps** with **< 90 seconds** to core value.

```
CURRENT FLOW (6-10 minutes, 27+ interactions)
==============================================

  Login/Signup
      |
      v
  SYSTEM 1: First-Time Onboarding (10-slide modal)
  +----+----+----+----+----+----+----+----+----+----+
  | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9  | 10 |
  |Welc|Demo|Pat*|Seed|Priv|Mem |AI* |Psyc|Feat|Comm|
  |ome |grap|erns|Entr|acy |orie|Pipe|Cont|ure*|itme|
  |    |hics|    |y   |    |s   |line|ext |    |nt  |
  +----+----+----+----+----+----+----+----+----+----+
    INFO DATA INFO DATA INFO DATA INFO DATA INFO PREF
      |                                          |
      | "Skip" = permanently completed (BUG)     |
      |                                          v
      |                                    Badge animations
      |                                    (up to 12 sec)
      |                                          |
      v                                          v
  SYSTEM 2: Guided Tour (driver.js, 17 popovers)
  +--Phase 1--+  +--Phase 2--+  +----Phase 3-----+
  | Welcome   |  | Logs Tour |  | Dashboard Tour |
  | 2 screens |->| 5 steps   |->| 13 steps       |
  | /logs page|  | /logs     |  | /dashboard     |
  +-----------+  +-----------+  +-----------------+
                                        |
                                        v
                                  READY TO JOURNAL
                                  (6-10 min later)

  * = Purely informational, collects zero data
```

---

## Current Slides Breakdown

| # | Slide | Type | Data Collected | Time | Verdict |
|---|-------|------|---------------|------|---------|
| 1 | Welcome | INFO | None | 30s | Merge into slide 2 |
| 2 | Demographics | DATA | Name*, age, sex, profession | 45s | Keep name only |
| 3 | Patterns | INFO | None | 20s | **DELETE** - tells before shows |
| 4 | Seed Entry | DATA | First entry (20+ chars) | 60s | Keep - this IS the product |
| 5 | Privacy | INFO | None | 15s | Merge into final slide |
| 6 | Memories | DATA | 0-3 topic selections | 30s | **DEFER** to week 1 |
| 7 | AI Pipeline | INFO | None | 20s | **DELETE** - confusing, shows 9 agents (arch says 4) |
| 8 | Psych Context | DATA | 4 sliders + goal text | 60s | **DEFER** to after 5 entries |
| 9 | Feature Preview | INFO | None | 15s | **DELETE** - shows features for empty state |
| 10 | Commitment | PREF | Reminders, entry mode, tour toggle | 30s | Simplify to 1 toggle |

**5 of 10 slides collect zero data.** They explain things the user hasn't experienced yet.

---

## 13 Issues Found

### Critical (breaks the flow)

| # | Issue | Impact |
|---|-------|--------|
| 1 | **"Skip" on slide 1 permanently marks onboarding complete** - user can never restart | Users who skip get zero profile data, permanently |
| 2 | **Two parallel systems** - 10-slide modal then 17-step tour with no visual transition | Cognitive overload, user doesn't know tour is coming |
| 3 | **Auto-skip for existing users** - if user has entries, onboarding is silently skipped forever | Returning users get zero personalization benefit |

### High (misleading UX)

| # | Issue | Impact |
|---|-------|--------|
| 4 | **Slide 9 shows features that don't exist** - "Smart Prompts" and "Milestones" | Sets false expectations |
| 5 | **Voice recording button on slide 4 doesn't work** - mic button is non-functional | Silent failure, looks broken |
| 6 | **AI Pipeline slide shows 9 agents, architecture says 4** - includes Daily/Weekly/Monthly/Personal | Confusing, misaligned with backend |

### Medium (poor UX)

| # | Issue | Impact |
|---|-------|--------|
| 7 | **Optional fields feel required** - badges need them, creating obligation pressure | Users don't know what actually matters |
| 8 | **Tour only starts if opted in on slide 10** - toggle buried on final slide | Many users never see tour |
| 9 | **Demo users get zero guidance** - no onboarding, no tour | Low engagement for unconverted visitors |
| 10 | **No way to restart tour** - permanently marked complete after first run | Users seeking help can't re-learn |
| 11 | **Badge animations block interaction** - up to 12 seconds of forced waiting | Feels unresponsive |
| 12 | **No resume indicator** - if user closes mid-flow, no "continue where you left off" | Friction on return |
| 13 | **Dashboard tour explains empty charts** - user has 0-1 entries when tour runs | Explaining nothing to no one |

---

## Industry Benchmark Comparison

| Metric | Headspace | Calm | Day One | Notion | **Becoming** |
|--------|-----------|------|---------|--------|-------------|
| Steps to value | 3 questions + sample | Goal + breathing exercise | 4 intro screens | Use case + workspace | **10 slides + 17 tour steps** |
| Time to core action | < 60s | < 30s | < 30s | < 60s | **6-10 min** |
| Data collected upfront | 3 fields | 1 field | 0 fields | 1 field | **14 fields** |
| Informational screens | 0 | 1 | 3 (quick) | 0 | **5 full slides** |
| Feature tour | None (contextual) | None | None | Contextual tips | **17-step linear tour** |

**Industry verdict**: 3-5 steps, < 90 seconds to value. Every extra step loses ~3% conversion.

---

## Proposed New Flow

### The 3-Slide Onboarding (< 90 seconds)

```
PROPOSED FLOW
=============

  Login/Signup
      |
      v
  +-------------------------------------------+
  | SLIDE 1: Welcome + Intent (15 sec)        |
  |                                           |
  | "Welcome to Becoming, [name]."            |
  | "What brings you here?"                   |
  |                                           |
  | [ ] Self-discovery                        |
  | [ ] Stress management                     |
  | [ ] Emotional awareness                   |
  | [ ] Building better habits                |
  |                                           |
  | Collects: name (from auth) + intent       |
  +-------------------------------------------+
      |
      v
  +-------------------------------------------+
  | SLIDE 2: First Entry (60 sec)             |
  |                                           |
  | "Write your first thought."               |
  |                                           |
  | [    Large textarea with prompt    ]      |
  | [    based on selected intent      ]      |
  |                                           |
  | Quick starters: "I feel..." "Today..."    |
  |                                           |
  | -> Submit -> SHOW AI RESULTS LIVE         |
  | -> User sees: type, mode, themes, insight |
  | -> "This is what Becoming does."          |
  |                                           |
  | Collects: first entry (processed by AI)   |
  +-------------------------------------------+
      |
      v
  +-------------------------------------------+
  | SLIDE 3: You're In (15 sec)               |
  |                                           |
  | "Your thoughts are sacred."               |
  | [lock] Never shared  [trash] Delete any   |
  | time  [heart] No judgment                 |
  |                                           |
  | [ ] Remind me daily at [8:00 PM]          |
  |                                           |
  | [  Start Journaling  ]                    |
  +-------------------------------------------+
      |
      v
  DASHBOARD (with contextual empty states)
  - Charts show: "Write 3+ entries to unlock"
  - First chart with data gets a one-time tooltip
  - Features reveal themselves as data accumulates
```

### What Gets Deferred (Progressive Disclosure)

| Data | When to Collect | How |
|------|----------------|-----|
| Demographics (age, sex, profession) | After 3rd entry | Subtle prompt: "Help us personalize your insights" |
| Memory topics | After 1 week | Card in dashboard: "Ready to explore deeper?" |
| Psychological sliders | After 5 entries | Pre-filled from AI analysis, user confirms/adjusts |
| Personal goal | After 1 week | Life Blueprint prompt in dashboard |
| Entry mode preference | Never ask | Learn from behavior (morning vs evening patterns) |
| Badge explanations | On first badge earn | Surprise-and-delight notification |
| AI pipeline details | On first AI result | Tooltip: "9 AI agents analyzed your entry" |
| Privacy details | In settings/footer | Available on demand, not forced upfront |

### Tour Replacement: Contextual Micro-Tips

Instead of a 17-step linear tour, use **progressive contextual hints**:

```
CONTEXTUAL HINTS (appear when relevant)
========================================

LOGS PAGE:
  0 entries  -> "Write your first entry above"
  1 entry    -> "Great start! Entries appear here"
  3 entries  -> [one-time] "Filters unlocked" tooltip on filter bar

DASHBOARD:
  0 entries  -> Each chart card shows: "Needs 3+ entries"
  3 entries  -> First chart with data gets tooltip explaining it
  5 entries  -> "Your patterns are forming" notification
  10 entries -> "Soul Mapping unlocked" card appears
  25 entries -> "Core topics unlocked" card appears

CHAT:
  First visit -> "Ask me anything about your entries"
  No entries  -> "Write some entries first, then I can help"
```

---

## Comparison: Before vs After

| Metric | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| Steps to first entry | 10 slides | 2 slides | **5x fewer** |
| Time to core value | 6-10 min | < 90 sec | **4-7x faster** |
| Data collected upfront | 14 fields | 2 fields (name + intent) | **7x less friction** |
| Informational screens | 5 | 0 | **Eliminated** |
| Tour steps | 17 popovers | 0 (contextual instead) | **Eliminated** |
| Total interactions before journaling | 27+ | 4-5 | **5-6x fewer** |
| Estimated completion rate | ~30-40% | ~70-80% | **~2x better** |

---

## Implementation Priority

### Phase 1: Fix Critical Bugs (1 day)
1. Fix "Skip" to NOT mark onboarding as permanently complete
2. Add "Resume onboarding" banner for partially completed flows
3. Remove non-functional voice button from slide 4
4. Remove non-existent features from slide 9

### Phase 2: Simplify to 3 Slides (3-5 days)
1. Build new 3-slide flow (Welcome+Intent, First Entry with live AI results, Privacy+Begin)
2. Move deferred data collection to contextual prompts
3. Replace badge-during-onboarding with surprise-and-delight notifications

### Phase 3: Replace Tour with Contextual Hints (3-5 days)
1. Remove driver.js tour entirely
2. Add empty-state messages to each dashboard chart card
3. Add one-time tooltips that trigger when charts first get data
4. Add progressive unlock notifications (Soul Mapping, Life Blueprint)

### Phase 4: Add Demo User Guidance (2 days)
1. Demo users see brief "This is a demo journal" overlay
2. Persona selector is immediately visible
3. "Sign up to start your own" appears contextually after exploring

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/onboarding/FirstTimeOnboarding.tsx` | Rewrite: 3-slide flow |
| `src/components/onboarding/OnboardingTour.tsx` | Delete entirely |
| `src/components/onboarding/slides/*` | Keep SlideSeedEntry, delete rest, create 2 new slides |
| `src/lib/onboardingStorage.ts` | Simplify: fewer fields, add intent |
| `src/hooks/useOnboardingProfile.ts` | Simplify to match new flow |
| `src/components/onboarding/OnboardingProgress.tsx` | Simplify for 3 steps |
| `src/components/layout/DashboardGrid.tsx` | Add empty-state messages per chart |
| `src/pages/Dashboard.tsx` | Add contextual hint logic |
| `src/pages/Logs.tsx` | Add contextual hint logic |
| `src/App.tsx` | Update onboarding rendering logic |

---

## Sources

- [Appcues - Headspace Onboarding](https://goodux.appcues.com/blog/headspaces-mindful-onboarding-sequence)
- [Appcues - Calm New User Experience](https://goodux.appcues.com/blog/calm-app-new-user-experience)
- [Candu - Notion Onboarding Lessons](https://www.candu.ai/blog/how-notion-crafts-a-personalized-onboarding-experience-6-lessons-to-guide-new-users)
- [ProductLed - SaaS Onboarding 2025](https://productled.com/blog/5-best-practices-for-better-saas-user-onboarding)
- [INSAIM - SaaS Onboarding Best Practices 2025](https://www.insaim.design/blog/saas-onboarding-best-practices-for-2025-examples)
- [DesignStudioUIUX - SaaS Onboarding UX 2026](https://www.designstudiouiux.com/blog/saas-onboarding-ux/)
- [Flowjam - SaaS Onboarding Guide 2025](https://www.flowjam.com/blog/saas-onboarding-best-practices-2025-guide-checklist)
- [Userpilot - Onboarding Benchmarks](https://userpilot.com/blog/onboarding-checklist-completion-rate-benchmarks/)
- [LoginRadius - Progressive Disclosure](https://www.loginradius.com/blog/identity/progressive-disclosure-user-onboarding)
- [Qurioos - Why Linear Onboarding Flows Fail](https://www.qurioos.com/blog/why-linear-onboarding-flows-are-failing-your-saas-users)

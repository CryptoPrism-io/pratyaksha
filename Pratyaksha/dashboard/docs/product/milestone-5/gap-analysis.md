# Milestone 5: Gap Analysis

> **Document Type:** Gap Analysis
> **Last Updated:** January 12, 2026

---

## Executive Summary

This document analyzes the gaps between the current Pratyaksha implementation and the Milestone 5 requirements for user journey and gamification. Each section identifies what exists, what's missing, and the effort required to bridge the gap.

---

## 1. Onboarding & Tour System

### Current State ✅

| Component | Status | Location |
|-----------|--------|----------|
| OnboardingTour | Exists | `src/components/onboarding/OnboardingTour.tsx` |
| Driver.js Integration | Exists | Used for 3-phase tour |
| Tour CSS Styling | Exists | `src/index.css` (pratyaksha-tour-popover) |
| Tour Trigger | Exists | First-time dashboard visit |

**Existing Tour Phases:**
1. Welcome phase - Stats bar introduction
2. Logs phase - Entry creation
3. Dashboard phase - Charts overview

### Gaps Identified ❌

| Gap | Description | Priority |
|-----|-------------|----------|
| **No Landing Page Tour** | Tour only exists on dashboard, not for demo viewing | P0 |
| **No "Start Your Journey" CTA** | Current tour just educates, doesn't convert | P0 |
| **No Demo-Specific Tour** | Tour assumes user is logged in | P1 |
| **Tour Not Under 30 Seconds** | Current tour is longer, more detailed | P1 |
| **No Persistent CTA** | CTA only on final step, not all steps | P1 |

### Bridge Actions

```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT                         │  TARGET                       │
├─────────────────────────────────┼───────────────────────────────┤
│ Tour on /dashboard (logged in)  │  Tour on /dashboard (demo)    │
│ 3 phases, educational           │  6 steps, conversion-focused  │
│ No CTA during tour              │  "Start Your Journey" on all  │
│ ~60s reading time               │  <30s reading time            │
│ driver.js implementation        │  Keep driver.js, new config   │
└─────────────────────────────────┴───────────────────────────────┘
```

**Effort Estimate:** 3-4 days
- Modify OnboardingTour.tsx for demo mode
- Create new ProductTour.tsx for landing conversion
- Update tour steps and timing
- Add persistent CTA component

---

## 2. First Entry Flow

### Current State ✅

| Component | Status | Location |
|-----------|--------|----------|
| LogEntryForm | Exists | `src/components/logs/LogEntryForm.tsx` |
| Entry Templates | Exists | Morning, Evening, Gratitude, etc. |
| Quick Add FAB | Exists | Floating action button |
| Firebase Auth | Exists | Google sign-in configured |

**Current Entry Flow:**
1. User clicks "Add Entry" or FAB
2. Form opens (modal or page)
3. User writes content
4. User must be signed in to save
5. Entry saved to Airtable via API

### Gaps Identified ❌

| Gap | Description | Priority |
|-----|-------------|----------|
| **No Draft Persistence** | Content lost if user leaves page | P0 |
| **No Sign-In Prompt Modal** | Hard redirect to login page | P0 |
| **No First Entry Page** | Same form for first and subsequent entries | P1 |
| **No Draft Recovery** | No mechanism to recover content post-sign-in | P0 |
| **No Celebration on First Entry** | No confetti, no special message | P2 |
| **Form Blocks Until Auth** | User can't start writing without signing in | P1 |

### Bridge Actions

```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT                         │  TARGET                       │
├─────────────────────────────────┼───────────────────────────────┤
│ Can't write without auth        │  Write first, auth to save    │
│ Content lost on navigation      │  localStorage draft persistence│
│ Hard redirect to /login         │  Modal prompt, keeps context  │
│ Same form for all entries       │  Special first entry page     │
│ No feedback on first save       │  Celebration + guided next    │
└─────────────────────────────────┴───────────────────────────────┘
```

**Effort Estimate:** 5-6 days
- Create draftStorage.ts utility
- Create useDraftPersistence hook
- Modify LogEntryForm for draft handling
- Create SignInPromptModal
- Create FirstEntry.tsx page
- Add celebration animations
- Handle draft recovery in auth callback

---

## 3. Guided Onboarding (First 3 Entries)

### Current State ✅

| Component | Status | Location |
|-----------|--------|----------|
| Entry Templates | Exists | `src/components/logs/LogEntryForm.tsx` |
| Template Picker | Exists | 6 templates available |
| Streak Widget | Exists | Shows streak count |

**Existing Templates:**
- Morning Reflection
- Evening Wind-down
- Gratitude
- Stress Dump
- Goals & Intentions
- Weekly Review

### Gaps Identified ❌

| Gap | Description | Priority |
|-----|-------------|----------|
| **No Progress Tracker** | No "1 of 3" indicator | P1 |
| **No Guided Flow** | Templates available but not prescribed | P1 |
| **No Day 1 Completion** | No concept of "completing" first day | P1 |
| **No Entry Suggestions** | User must choose, not guided | P2 |
| **No Unlock Trigger** | Entries don't trigger unlocks | P0 |

### Bridge Actions

```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT                         │  TARGET                       │
├─────────────────────────────────┼───────────────────────────────┤
│ Templates optional              │  First 3 guided/suggested     │
│ No progress visibility          │  "Entry 2 of 3" progress bar  │
│ No completion concept           │  Day 1 = 3 entries milestone  │
│ Free choice always              │  Suggested templates for 2&3  │
│ All features available          │  Features unlock on Day 1     │
└─────────────────────────────────┴───────────────────────────────┘
```

**Effort Estimate:** 4-5 days
- Create GuidedEntryProgress component
- Create onboarding state tracking
- Modify dashboard to show progress
- Create Day 1 completion celebration
- Wire up unlock triggers

---

## 4. Progressive Unlock System

### Current State ✅

| Component | Status | Location |
|-----------|--------|----------|
| All Charts | Exist | `src/components/charts/*` |
| Stats Hook | Exists | `useStats()` returns entry count |
| Streak Hook | Exists | `useStreak()` returns streak days |

**Currently Visible Charts (All Users):**
- Streak Calendar
- Contradiction Flow (Sankey)
- Energy Patterns
- Energy-Mode Matrix
- Mode Distribution
- Emotional Timeline
- Contradiction Tracker
- Theme Tags
- Insights & Actions
- Daily Rhythm

### Gaps Identified ❌

| Gap | Description | Priority |
|-----|-------------|----------|
| **No Unlock Tiers** | All charts visible to all users | P0 |
| **No useUnlockStatus Hook** | No centralized unlock logic | P0 |
| **No LockedChart Component** | No locked/blurred state | P0 |
| **No Feature Gating** | Dashboard shows everything | P0 |
| **No Unlock Celebrations** | No reward for progression | P2 |
| **No Progress Indicators** | No "X more to unlock Y" | P1 |

### Bridge Actions

```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT                         │  TARGET                       │
├─────────────────────────────────┼───────────────────────────────┤
│ 10 charts, all visible          │  10 charts, tiered unlocks    │
│ No unlock concept               │  4-tier unlock system         │
│ useStats for display            │  useUnlockStatus for gating   │
│ Charts render directly          │  LockedChart wrapper          │
│ No progression feeling          │  Clear unlock milestones      │
└─────────────────────────────────┴───────────────────────────────┘
```

**Chart Unlock Mapping:**

| Chart | Current | Target Tier |
|-------|---------|-------------|
| Streak Calendar | Always | Tier 1 (3 entries) |
| Contradiction Flow | Always | Tier 1 (3 entries) |
| Emotional Timeline | Always | Tier 1 (3 entries) |
| Mode Distribution | Always | Tier 1 (3 entries) |
| Energy Patterns | Always | Tier 2 (10 entries) |
| Energy-Mode Matrix | Always | Tier 2 (10 entries) |
| Contradiction Tracker | Always | Tier 2 (10 entries) |
| Theme Tags | Always | Tier 2 basic / Tier 3 full |
| Daily Rhythm | Always | Tier 3 (20 entries) |
| Insights & Actions | Always | Tier 1 (3 entries) |

**Effort Estimate:** 6-7 days
- Create unlockTiers.ts configuration
- Create useUnlockStatus hook
- Create LockedChart component
- Modify Dashboard.tsx to gate charts
- Create UnlockModal celebration
- Add progress indicators to locked charts

---

## 5. Streak System Enhancement

### Current State ✅

| Component | Status | Location |
|-----------|--------|----------|
| StreakWidget | Exists | `src/components/streak/StreakWidget.tsx` |
| useStreak Hook | Exists | `src/hooks/useStreak.ts` |
| Streak Calendar | Exists | Shows days with entries |
| Milestone Celebrations | Exists | 7, 14, 30, 60, 100, 365 days |

**Current Streak Logic:**
- ANY entry counts toward streak
- 1 entry = successful streak day
- Consecutive days calculation
- Milestone toasts at key intervals

### Gaps Identified ❌

| Gap | Description | Priority |
|-----|-------------|----------|
| **No Daily Goal (3 entries)** | 1 entry = streak success | P1 |
| **No Daily Progress UI** | No "2 of 3 today" indicator | P1 |
| **No Incomplete Day State** | Binary: entry or no entry | P2 |
| **Calendar Doesn't Show Goal** | Just shows entry exists | P2 |

### Bridge Actions

```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT                         │  TARGET                       │
├─────────────────────────────────┼───────────────────────────────┤
│ 1 entry = streak day            │  3 entries = streak day       │
│ No daily goal concept           │  3-entry daily goal           │
│ Binary calendar (yes/no)        │  Complete/incomplete/none     │
│ Streak = consecutive entries    │  Streak = consecutive 3+      │
└─────────────────────────────────┴───────────────────────────────┘
```

**Effort Estimate:** 3-4 days
- Modify useStreak to require 3 entries
- Create DailyGoalProgress component
- Update StreakWidget to show daily progress
- Update calendar visualization for incomplete days
- Recalculate historical streaks

---

## 6. Compare Page Gating

### Current State ✅

| Component | Status | Location |
|-----------|--------|----------|
| Compare Page | Exists | `src/pages/Compare.tsx` |
| Period Selector | Exists | This Week, Last Week, Custom |
| ComparisonPanel | Exists | Side-by-side view |
| All Comparison Features | Exists | Fully functional |

### Gaps Identified ❌

| Gap | Description | Priority |
|-----|-------------|----------|
| **No Access Control** | Anyone can access /compare | P1 |
| **No Locked State** | No preview of what's behind lock | P1 |
| **No Tiered Access** | All or nothing | P1 |

### Bridge Actions

```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT                         │  TARGET                       │
├─────────────────────────────────┼───────────────────────────────┤
│ Fully accessible                │  Tier 3: Basic, Tier 4: Full  │
│ All comparison options          │  Limited options until Tier 4 │
│ No locked preview               │  Blurred preview + unlock CTA │
└─────────────────────────────────┴───────────────────────────────┘
```

**Effort Estimate:** 2-3 days
- Add unlock check to Compare.tsx
- Create LockedPage variant for full-page lock
- Limit period options for Tier 3

---

## 7. Chat Page Gating

### Current State ✅

| Component | Status | Location |
|-----------|--------|----------|
| Chat Page | Exists | `src/pages/Chat.tsx` |
| AI Integration | Exists | OpenRouter API |
| Chat History | Exists | Conversation maintained |

### Gaps Identified ❌

| Gap | Description | Priority |
|-----|-------------|----------|
| **No Access Control** | Anyone can access /chat | P1 |
| **No Entry Minimum** | Works with 0 entries | P1 |
| **No Locked State** | No preview available | P1 |

### Bridge Actions

```
┌─────────────────────────────────────────────────────────────────┐
│ CURRENT                         │  TARGET                       │
├─────────────────────────────────┼───────────────────────────────┤
│ Fully accessible                │  Tier 4 only (30 entries)     │
│ Works without context           │  Requires journal history     │
│ No explanation why locked       │  Clear rationale messaging    │
└─────────────────────────────────┴───────────────────────────────┘
```

**Effort Estimate:** 1-2 days
- Add unlock check to Chat.tsx
- Create locked state with preview
- Add rationale for 30-entry requirement

---

## 8. Analytics & Tracking

### Current State ✅

| Component | Status | Location |
|-----------|--------|----------|
| PostHog Integration | Exists | Basic page views |
| Error Tracking | Exists | Error boundaries |

### Gaps Identified ❌

| Gap | Description | Priority |
|-----|-------------|----------|
| **No Tour Analytics** | Can't track tour completion | P1 |
| **No Unlock Analytics** | Can't track tier progression | P1 |
| **No Onboarding Funnel** | Can't measure conversion | P0 |
| **No Daily Goal Tracking** | Can't track goal completion | P2 |
| **No A/B Testing Setup** | Can't test unlock thresholds | P2 |

### Bridge Actions

**Effort Estimate:** 2-3 days
- Define event schema
- Add analytics calls throughout new features
- Set up funnel tracking
- Configure feature flags for A/B testing

---

## Summary: Total Effort Estimate

| Area | Effort | Priority |
|------|--------|----------|
| Onboarding & Tour | 3-4 days | P0 |
| First Entry Flow | 5-6 days | P0 |
| Guided Onboarding | 4-5 days | P1 |
| Progressive Unlocks | 6-7 days | P0 |
| Streak Enhancement | 3-4 days | P1 |
| Compare Gating | 2-3 days | P1 |
| Chat Gating | 1-2 days | P1 |
| Analytics | 2-3 days | P1 |
| **Total** | **26-34 days** | - |

**Recommended Team:** 2 developers, 5 weeks

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Draft persistence fails | Low | High | Fallback to sessionStorage + warning |
| Unlock thresholds too high | Medium | High | A/B test, start conservative |
| Tour too long/boring | Medium | Medium | User testing, iteration |
| Streak recalculation breaks | Low | Medium | Test thoroughly, migrate carefully |
| Users frustrated by locks | Medium | Medium | Clear progress indicators, fair thresholds |

---

## Dependencies

### External Dependencies
- driver.js (existing) - Tour system
- Firebase Auth (existing) - Authentication
- PostHog (existing) - Analytics
- canvas-confetti (new) - Celebrations

### Internal Dependencies
- `useStats` hook - Entry counts
- `useStreak` hook - Streak calculation
- `LogEntryForm` - Entry creation
- Dashboard layout - Chart placement

---

## Next Steps

1. **Prioritize P0 items** - Draft persistence, unlock system
2. **Create detailed tickets** - Break down into sprint tasks
3. **Design review** - Figma mockups for locked states
4. **Technical spike** - Draft persistence implementation
5. **User testing plan** - Test onboarding flow with beta users

---

*Gap Analysis v1.0 | Milestone 5 | Pratyaksha*

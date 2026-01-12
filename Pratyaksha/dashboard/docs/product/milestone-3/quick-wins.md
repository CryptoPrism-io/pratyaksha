# Pratyaksha: Quick Wins

**Date:** January 9, 2026
**Purpose:** High-impact features that leverage existing infrastructure

---

## Overview

These 15 quick wins can be implemented with minimal effort because the infrastructure already exists. Each leverages existing components, patterns, and data transformations.

---

## Quick Wins List

### 1. Add Chart Headers with Icons
**Effort:** 0.5 hours

- **Files:** `src/components/charts/*.tsx`
- **Why Quick:** Chart component structure already exists. Just add icon + label header above each chart
- **Pattern:** See DailySummaryCard (lines 63-73) - icon + heading pattern fully established
- **Code:** ~15 lines per chart (icon import + div wrapper)

---

### 2. Tooltip Hints on All Filters
**Effort:** 1 hour

- **Files:** `src/components/filters/FilterBar.tsx`
- **Why Quick:** Tooltip component already imported and available (radix-ui). Just wrap existing dropdowns
- **Pattern:** Available in `src/components/ui/tooltip.tsx` - fully configured
- **Code:** Wrap Select components with `<Tooltip>` + add 1-2 line help text per filter

---

### 3. Entry Card Color Coding by Energy Level
**Effort:** 1 hour

- **Files:** `src/components/charts/EntryCard.tsx`
- **Why Quick:** Sentiment badge pattern exists (lines 5-18). Mirror it for energy levels
- **Data Available:** `entry.inferredEnergy` already in Entry type
- **Code:** Copy SENTIMENT_BADGE pattern -> create ENERGY_BADGE with Zap icon colors

---

### 4. Quick Stats Counter Cards
**Effort:** 1.5 hours

- **Files:** Create `src/components/insights/QuickStatsCards.tsx`
- **Why Quick:** Uses existing `calculateStats()` from transforms.ts. Export button already shows summary stats
- **Pattern:** 3-column grid layout matching DailySummaryCard style
- **Data:** Total entries, avg/day, positive ratio already calculated

---

### 5. Theme Tag Display as Badges
**Effort:** 0.5 hours

- **Files:** `src/components/charts/EntryCard.tsx`
- **Why Quick:** Badge component exists. ThemeTagsAI is in Entry type
- **Pattern:** Similar to theme display in DailySummaryCard (lines 209-227)
- **Code:** Loop through `entry.themeTagsAI` array -> render as badge pills

---

### 6. Bookmarks-Only Filter View
**Effort:** 0.5 hours

- **Files:** `src/components/filters/FilterBar.tsx`
- **Why Quick:** Bookmark filter already exists (lines 295-317). Just enhance the UX
- **Pattern:** FilterBar already handles filter state perfectly
- **Code:** Conditional rendering based on `filters.bookmarked`

---

### 7. Entry Type Icon Indicators
**Effort:** 1 hour

- **Files:** `src/components/charts/EntryCard.tsx`, dashboard pages
- **Why Quick:** lucide-react has 600+ icons. Just map ENTRY_TYPES to icons
- **Data Source:** ENTRY_TYPES array already defined in `server/types.ts` (lines 4-20)
- **Code:** Create type-to-icon mapping object, use in card + filter UI

---

### 8. Sentiment Trend Mini Sparkline
**Effort:** 1.5 hours

- **Files:** `src/components/insights/SentimentSparkline.tsx` (new)
- **Why Quick:** Recharts already imported. Use simple `AreaChart` like EmotionalTimeline but compact
- **Pattern:** ModeDistribution and charts show exact Recharts patterns
- **Data:** `toTimelineData()` already transforms entries to sentiment scores

---

### 9. AI Processing Indicator Badge
**Effort:** 0.5 hours

- **Files:** `src/components/charts/EntryCard.tsx`
- **Why Quick:** Only show if `entry.summaryAI` or `entry.actionableInsightsAI` exist
- **Pattern:** Sentiment badge (EntryCard lines 66-70) - exact same pattern
- **Code:** Check field existence -> show "AI Analyzed" badge with Sparkles icon

---

### 10. Keyboard Shortcut Help Modal Expansion
**Effort:** 1 hour

- **Files:** `src/components/ui/keyboard-shortcuts-dialog.tsx`
- **Why Quick:** Dialog already exists. Just add more shortcuts that aren't wired yet
- **Pattern:** Dialog component fully configured. Similar to NotificationSettings structure
- **Code:** Add shortcut entries for filter toggles, export, bookmark, etc.

---

### 11. Energy Shape Legend Component
**Effort:** 0.5 hours

- **Files:** Create `src/components/charts/EnergyShapeLegend.tsx`
- **Why Quick:** ENERGY_SHAPES array already defined in types.ts (lines 62-75)
- **Pattern:** MoodTrendIndicator (lines 9-34) shows exact config pattern needed
- **Code:** Map ENERGY_SHAPES -> styled legend with color coding

---

### 12. Contradiction Frequency Counter
**Effort:** 1 hour

- **Files:** Create `src/components/insights/ContradictionCounter.tsx`
- **Why Quick:** `toContradictionData()` exists in transforms.ts. CONTRADICTIONS array in types.ts
- **Pattern:** ModeDistribution pie chart is perfect template
- **Code:** Show top 3 contradictions with occurrence counts

---

### 13. Daily Entry Streak Milestone Celebration
**Effort:** 1.5 hours

- **Files:** `src/components/streak/StreakWidget.tsx` (expand)
- **Why Quick:** Canvas-confetti already installed (package.json). StreakWidget exists
- **Data:** StreakWidget exists with isLoading state
- **Code:** Detect streak milestones, trigger confetti

---

### 14. Mobile-Optimized Chart Headers with Collapse
**Effort:** 1 hour

- **Files:** `src/components/charts/*.tsx`
- **Why Quick:** Responsive layout already exists. Just add collapse state on mobile
- **Pattern:** FilterBar shows mobile/desktop patterns perfectly (lines 140-152)
- **Code:** `useMediaQuery('(max-width: 640px)')` + conditional collapse button

---

### 15. AI Summary Card in Entry List
**Effort:** 1.5 hours

- **Files:** `src/components/charts/EntryCard.tsx` or new `EntryCardExtended.tsx`
- **Why Quick:** Snapshot and summaryAI already in Entry type
- **Pattern:** DailySummaryCard narrative section (lines 164-168) shows style
- **Code:** Add expandable section showing `entry.snapshot` + `entry.summaryAI` preview

---

## Infrastructure Ready For These Quick Wins

### UI Components Available
- Tooltip, Dialog, Popover, Badge, Button, Select (all installed)
- Skeleton loading states (used everywhere)
- Empty states pattern (ErrorBoundary exists)

### Data Transformation Utilities
- `toTimelineData()`, `toModeDistribution()`, `toEnergyShapeData()`
- `countBy()`, `groupBy()`, `sentimentToScore()` utilities
- Type constants (ENTRY_TYPES, ENERGY_SHAPES, CONTRADICTIONS, INFERRED_MODES)

### Hooks & Query Patterns
- TanStack Query configured (5-min stale time, 30-sec polling)
- Mutation hooks for CRUD (`useCreateEntry`, `useUpdateEntry`, `useDeleteEntry`)
- Filter context (`DateFilterContext`) + custom hooks

### Design System
- Tailwind + shadcn/ui fully configured
- Color palette established (sentiment colors, energy colors)
- Recharts with custom tooltips & styling patterns

### Server Infrastructure
- 4-agent AI pipeline ready (intent, emotion, theme, insight)
- OpenRouter integration for GPT-4o / GPT-4o-mini
- Express routes established (entry processing, summaries, notifications)

---

## Implementation Priority

### Easiest (Start Here - ~2 hours total)
1. Theme Tag Badges (#5)
2. Chart Headers with Icons (#1)
3. Entry Type Icons (#7)
4. Energy Shape Legend (#11)

### Quick Middle Layer (~3 hours)
5. Entry Card Color by Energy (#3)
6. Bookmarks Filter (#6)
7. AI Processing Badge (#9)
8. Sentiment Sparkline (#8)

### High-Value Additions (~4 hours)
9. Quick Stats Cards (#4)
10. Contradiction Counter (#12)
11. Summary Card in Entry (#15)
12. Mobile Collapse Headers (#14)

---

## Total Estimated Time

| Category | Items | Total Hours |
|----------|-------|-------------|
| Easiest | 4 | ~2 hours |
| Middle Layer | 4 | ~3 hours |
| High-Value | 4 | ~4 hours |
| Remaining | 3 | ~3.5 hours |
| **Total** | **15** | **~12.5 hours** |

All of these avoid creating new pages, new database fields, or new complex features - just smart reuse of what exists.

# Feature Backlog v2.4 (ICE Prioritized)

*Last Updated: 2026-01-07 | Version: 2.4*
*Previous: 2026-01-06 v2.3*

## ICE Scoring Framework

- **Impact** (1-10): How much does this improve user experience?
- **Confidence** (1-10): How certain are we about the impact?
- **Ease** (1-10): How easy is implementation?
- **ICE Score** = Impact x Confidence x Ease

---

## Completed Features (v2.4)

| Feature | ICE | Status | Completed |
|---------|-----|--------|-----------|
| Navigation Restructure (Logs→Dashboard→Insights) | - | DONE | 2026-01-07 |
| Insights Page (placeholder with coming soon cards) | - | DONE | 2026-01-07 |
| Profile Page (stats, preferences, data management) | - | DONE | 2026-01-07 |
| Streak Data-Driven (from Airtable, not localStorage) | - | DONE | 2026-01-07 |
| Timezone Fix (local dates for streak calendar) | - | DONE | 2026-01-07 |
| Calendar Date Toggle (click to open/close entries) | - | DONE | 2026-01-07 |
| Removed Entry Count Badge from Nav | - | DONE | 2026-01-07 |
| Full Streak System (calendar, milestones) | 567 | DONE | 2026-01-06 |
| Interactive Streak Calendar (click-to-view entries) | 400 | DONE | 2026-01-06 |
| Consolidated Calendar (removed Activity Calendar) | - | DONE | 2026-01-06 |
| Entry Templates (6 prompts + Create Your Own) | 576 | DONE | 2026-01-06 |
| Date Filter Default (30 days) | 270 | DONE | 2026-01-06 |
| Guided Onboarding Tour (3-phase) | 576 | DONE | 2026-01-06 |
| Restart Tour (Logs + Dashboard options) | 144 | DONE | 2026-01-06 |
| Keyboard Shortcuts (N, T, R, E, ?) | 336 | DONE | 2026-01-05 |
| First Entry Confetti | 288 | DONE | 2026-01-05 |
| Streak Toast Notification | 432 | DONE | 2026-01-05 |
| Rich Empty States | 567 | DONE | 2026-01-05 |
| Fix /log Link Bug | Critical | DONE | 2026-01-05 |
| Glassmorphism UI Theme | - | DONE | 2026-01-05 |
| Chart Tooltips with Info Icons | - | DONE | 2026-01-05 |

---

## Remaining Features (Ranked)

| Rank | Feature | Impact | Conf | Ease | ICE | Category |
|------|---------|--------|------|------|-----|----------|
| 1 | Weekly AI Summary | 9 | 8 | 7 | **504** | Insights |
| 2 | Pattern Detection (AI) | 8 | 7 | 6 | **336** | Insights |
| 3 | Cognitive Analysis (AI) | 8 | 7 | 6 | **336** | Insights |
| 4 | PWA Installation | 7 | 8 | 8 | **448** | Platform |
| 5 | Entry Editing | 7 | 9 | 7 | **441** | Core |
| 6 | Entry Deletion | 6 | 9 | 8 | **432** | Core |
| 7 | Bookmarked Entries | 6 | 8 | 9 | **432** | Feature |
| 8 | Profile Preferences (functional) | 6 | 8 | 7 | **336** | Profile |
| 9 | Export Data (functional) | 6 | 9 | 8 | **432** | Profile |
| 10 | Notification Reminders | 7 | 6 | 5 | **210** | Profile |
| 11 | Week-over-Week Comparison | 8 | 7 | 6 | **336** | Analytics |

---

## Feature Details

### 1. Journaling Streak System - Full Implementation (ICE: 567) - COMPLETED
**Category**: Retention / Gamification
**Status**: DONE (2026-01-06)

**Implemented**:
- [x] `useStreak` hook with full localStorage persistence
- [x] Streak counter with flame icon animation
- [x] Monthly calendar visualization with entry tracking
- [x] Milestone progress bar (7, 14, 30, 60, 100, 365 days)
- [x] Milestone celebrations with confetti
- [x] "Next milestone" countdown
- [x] Today highlight on calendar
- [x] "Logged" / "Missed" legend
- [x] Entry history tracking (last 365 days)
- [x] **Interactive calendar**: Click any date to see entries
- [x] **Entry count badges**: Shows 9+ for multiple entries
- [x] **Entry details panel**: Name, time, type, mode, sentiment
- [x] **Consolidated calendar**: Removed redundant Activity Calendar

**Files created/modified**:
- New: `hooks/useStreak.ts` - Full streak logic
- New: `components/streak/StreakWidget.tsx` - Dashboard widget with interactive calendar
- `components/logs/LogEntryForm.tsx` - Integration with recordEntry()
- `pages/Dashboard.tsx` - Widget placement, removed Activity Calendar

---

### 2. Entry Prompts/Templates (ICE: 576) - COMPLETED
**Category**: Onboarding / Engagement
**Status**: DONE (2026-01-06)

**Description**: Pre-built templates to reduce blank page syndrome.

**Templates created**:
- [x] Morning Check-in (Sun icon)
- [x] Evening Reflection (Moon icon)
- [x] Gratitude Log (Heart icon)
- [x] Stress Dump (Cloud icon)
- [x] Goal Review (Target icon)
- [x] Weekly Reflection (Calendar icon)

**Implemented**:
- [x] Template selector UI in LogEntryForm (pill buttons)
- [x] Pre-fill text area with template structure
- [x] Toggle selection (click again to clear)
- [x] Toast notification on template load

---

### 3. Weekly AI Summary (ICE: 504)
**Category**: Retention / Insights

**Description**: Automated weekly digest of patterns, trends, and suggestions.

**Requirements**:
- [ ] Generate summary from last 7 days of entries
- [ ] Show modal on dashboard (configurable timing)
- [ ] Include: top themes, mood trend, energy pattern, suggestion
- [ ] "View past summaries" archive
- [ ] Option to email summary (future)

**Files to modify**:
- New: `components/WeeklySummary.tsx`
- New: `hooks/useWeeklySummary.ts`
- `server/routes/` - New AI summary endpoint

---

### 4. PWA Installation (ICE: 448)
**Category**: Platform

**Requirements**:
- [ ] Create manifest.json with app icons
- [ ] Add service worker for offline support
- [ ] Add "Install App" prompt
- [ ] Handle offline entry creation (queue)

---

### 5-9. See individual specs as needed

---

## Sprint Progress

### v1.0 → v2.0 Completed Work
- Full 3-phase onboarding tour (Welcome → Logs → Dashboard)
- 15 dashboard tour steps covering all charts
- Driver.js integration with custom theming (#2B2E3A overlay)
- Restart tour menu with dual options
- Glassmorphism UI overhaul
- Keyboard shortcuts system
- First entry confetti celebration
- Rich empty states for all charts

### Next Sprint Focus
- Journaling Streak System (full)
- Entry Prompts/Templates
- PWA groundwork

---

## Changelog

### v2.4 (2026-01-07)
- Navigation restructure: Pratyaksha logo → Logs → Dashboard → Insights | Theme → Profile → Menu
- New: Insights page with coming soon placeholders (Weekly Summary, Pattern Detection, Cognitive Analysis)
- New: Profile page with stats, preferences, notifications, privacy, data management sections
- Fixed: Streak calculation now uses actual Airtable entries (not localStorage)
- Fixed: Timezone issue - calendar dates now use local timezone instead of UTC
- Fixed: Calendar date toggle - clicking same date now closes the entries panel
- Removed: Entry count badge from Logs nav item
- Removed: Home button (Pratyaksha logo now links to home)

### v2.3 (2026-01-06)
- Enhanced: Interactive Streak Calendar with click-to-view entry details
- Entry count badges on calendar dates (9+ for multiple entries)
- Entry details panel showing: name, time, type, mode, sentiment
- Removed: Activity Calendar (consolidated into Streak Widget)
- Dashboard layout: Energy-Mode Matrix now full-width (colSpan 12)
- Sprint 2 complete!

### v2.2 (2026-01-06)
- Completed: Full Streak System with StreakWidget dashboard component
- Includes: calendar visualization, milestone progress, confetti celebrations
- New files: `hooks/useStreak.ts`, `components/streak/StreakWidget.tsx`
- Sprint 2 progress: 3/4 items done

### v2.1 (2026-01-06)
- Completed: Entry Templates (6 prompts with icons + "Create Your Own")
- Completed: Date Filter Default (30 days)
- Sprint 2 progress: 2/4 items done

### v2.0 (2026-01-06)
- Completed: Onboarding tour system
- Completed: Restart tour with Logs/Dashboard options
- Completed: Entry count badge
- Updated ICE scores based on learnings
- Moved completed items to "Completed Features" section

### v1.0 (2026-01-05)
- Initial feature backlog creation
- ICE scoring for all features
- Sprint planning structure

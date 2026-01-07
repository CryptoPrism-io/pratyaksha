# Product Roadmap v2.2

*Last Updated: 2026-01-07 | Version: 2.2*
*Previous: 2026-01-07 v2.1*

---

## Completed (Sprint 1) - DONE

**Focus**: User Onboarding & First-Time Experience

| Feature | Effort | Status | Notes |
|---------|--------|--------|-------|
| Fix `/log` link bug | 15 min | DONE | Routing fixed |
| 3-Phase Onboarding Tour | 2 days | DONE | Welcome → Logs → Dashboard |
| Rich empty states | 1 day | DONE | All chart components |
| First entry confetti | 2 hours | DONE | canvas-confetti |
| Keyboard shortcuts | 3 hours | DONE | N, T, R, E, ? |
| Restart tour (dual options) | 3 hours | DONE | From Logs + From Dashboard |
| Entry count badge | 1 hour | DONE | Shows in nav |
| Glassmorphism UI | 1 day | DONE | Dashboard + Logs pages |
| Chart tooltips | 2 hours | DONE | Info icons on all charts |

**Achievements**:
- Onboarding flow covers entire user journey
- Tour includes all 10+ dashboard visualizations
- Two restart options for flexible re-learning
- Premium glassmorphism aesthetic

---

## Completed (Sprint 2) - DONE
**Focus**: Retention & Engagement Mechanics

| Feature | Effort | Status | Notes |
|---------|--------|--------|-------|
| Full Streak System | 3 days | DONE | Calendar, milestones, entry preview |
| Entry Templates | 2 days | DONE | 6 templates (Morning, Evening, Gratitude, Stress, Goals, Weekly) |
| Date filter default | 30 min | DONE | Last 30 days default |
| Insights page (placeholder) | 1 day | DONE | Weekly Summary, Pattern Detection, Cognitive Analysis cards |
| Profile page | 1 day | DONE | Stats overview + settings placeholders |
| Weekly AI Summary | 3 days | DONE | Full AI-generated weekly insights with caching |

**Success Metric**: 7-day retention > 40%

**Progress**: 6/6 complete (100%)

---

## NEXT (Sprint 3-4)
**Focus**: Core Functionality & Platform

| Feature | Effort | Status | Notes |
|---------|--------|--------|-------|
| Entry editing | 2 days | Pending | Re-trigger AI analysis |
| Entry deletion (soft) | 1 day | Pending | With confirmation |
| Bookmarked entries | 2 days | Pending | Star/flag system |
| PWA installation | 2 days | Pending | manifest.json + SW |
| Offline entry queue | 2 days | Pending | Store locally, sync later |

**Success Metric**: Entry completion rate > 90%, PWA installs > 100

**Total Effort**: ~9 days

---

## LATER (Sprint 5+)
**Focus**: Power Features & Scale

| Feature | Effort | Status | Notes |
|---------|--------|--------|-------|
| User authentication | 5 days | Pending | Multi-user support |
| Week-over-Week comparison | 3 days | Pending | Trend analysis |
| Push notification reminders | 3 days | Pending | Habit support |
| Data import (JSON/CSV) | 2 days | Pending | Migration support |
| AI chat for pattern questions | 5 days | Pending | Conversational insights |
| Custom entry types | 3 days | Pending | User-defined categories |

**Success Metric**: MAU > 1000, DAU/MAU > 30%

---

## Parking Lot
*Ideas to revisit later*

- Social sharing of insights
- Team/group journaling
- Integration with Apple Health / Google Fit
- Therapist/coach sharing mode
- Journal prompts from AI based on patterns
- Meditation/breathing exercise integration
- Export to PDF report
- Dark mode scheduling
- Mobile home screen widget
- Voice-to-text entry

---

## Roadmap Visualization

```
         DONE                              NEXT              LATER
    Sprint 1 + 2 (Complete)            Sprint 3-4         Sprint 5+
├──────────────────────────────────┼─────────────────┼─────────────────
│                                  │                 │
│  COMPLETED                       │  PLANNED        │  FUTURE
│  ──────────                      │  ───────        │  ──────
│  ✓ Onboarding tour               │  • Entry edit   │  • Auth
│  ✓ Empty states                  │  • Entry delete │  • Comparisons
│  ✓ Confetti                      │  • Bookmarks    │  • Notifications
│  ✓ Shortcuts                     │  • PWA support  │  • AI chat
│  ✓ Restart tour                  │  • Offline mode │  • Data import
│  ✓ Glass UI                      │                 │
│  ✓ Streak system                 │                 │
│  ✓ Entry templates               │                 │
│  ✓ Insights page                 │                 │
│  ✓ Profile page                  │                 │
│  ✓ Weekly AI Summary             │                 │
│                                  │                 │
└──────────────────────────────────┴─────────────────┴─────────────────
```

---

## Sprint 1 Summary (Completed)

### What We Built
1. **3-Phase Onboarding Tour**
   - Welcome intro (2 slides)
   - Logs page tour (4 steps)
   - Dashboard tour (15 steps covering all charts)
   - Custom theming with #2B2E3A overlay

2. **Restart Tour System**
   - Dropdown menu in header
   - "From Logs Page" - full tour
   - "From Dashboard" - skip to dashboard
   - Toast notifications on restart

3. **UI/UX Improvements**
   - Glassmorphism cards and backgrounds
   - Rich empty states with CTAs
   - Chart tooltips with info icons
   - Entry count badge in navigation

4. **Quick Wins**
   - First entry confetti celebration
   - Keyboard shortcuts system
   - Fixed routing bugs

### Technical Achievements
- Driver.js library integration
- localStorage state management for tour phases
- Multi-page tour continuation
- React portal for modals

---

## Sprint 2 Progress

### What We Built
1. **Full Streak System**
   - `useStreak` hook - Calculates streak from actual entry data
   - `StreakWidget` component with:
     - Animated flame streak counter
     - Progress bar to next milestone (7, 14, 30, 60, 100, 365 days)
     - Milestone celebration messages
     - Interactive calendar with clickable dates
     - Entry count badges per day
     - Entry preview panel on date click
   - Replaced ActivityCalendar with StreakWidget on Dashboard

2. **Entry Templates**
   - 6 pre-built templates in LogEntryForm:
     - Morning (energy, intentions, goals)
     - Evening (reflection, challenges, learnings)
     - Gratitude (3 gratitudes with reflection)
     - Stress Dump (vent + control identification)
     - Goals (progress, obstacles, next steps)
     - Weekly (week review + planning)

3. **New Pages**
   - **Insights page** - Placeholder with cards for Weekly Summary, Pattern Detection, Cognitive Analysis
   - **Profile page** - Stats overview (entries, days, streak, avg/day) + settings placeholders

4. **Weekly AI Summary**
   - New `weeklyAgent` using gpt-4o for quality insights
   - `GET /api/weekly-summary` endpoint with Airtable caching
   - Week navigation with ISO 8601 week IDs
   - AI-generated narrative, mood trend, recommendations
   - Top themes and contradictions aggregation
   - Regenerate button for fresh analysis

### Technical Achievements
- Real streak calculation from Airtable entry dates
- Calendar grid with proper month navigation
- Template selection UI with icon buttons
- Profile stats computed from useStreak hook
- weekUtils.ts for ISO 8601 week date handling (server + client)
- TanStack Query hooks with 1-hour stale time for summaries
- Airtable caching with `Is Summary? = true` flag

---

## Dependencies

```
Streak System (full) ───────────┐
                                ├──► Weekly Summary
Entry Templates ────────────────┘

Entry Editing ──────────────────┬──► Entry Deletion
                                │
Bookmarks ──────────────────────┘

PWA ────────────────────────────┬──► Offline Mode
                                │
                                └──► Push Notifications

Authentication ─────────────────┬──► Multi-user
                                ├──► Cloud Sync
                                └──► Team Features
```

---

## Risk Register

| Risk | Status | Mitigation |
|------|--------|------------|
| Streak pressure causes anxiety | Monitor | Add "grace days" and positive messaging |
| Weekly summary feels generic | - | Use specific entry references |
| PWA complexity | - | Start with basic manifest, add SW later |
| Tour too long | Monitored | Split into phases, allow skip |
| Glass UI performance | OK | Using CSS only, no JS animations |

---

## Changelog

### v2.2 (2026-01-07)
- SPRINT 2 COMPLETE!
- Added Weekly AI Summary feature with full implementation
- Updated Sprint 2 section to show 100% completion
- Added Weekly AI Summary to Sprint 2 Progress section
- Updated roadmap visualization

### v2.1 (2026-01-07)
- Marked Sprint 2 items as DONE: Streak System, Entry Templates, Date Filter
- Added Insights page and Profile page to Sprint 2 completions
- Added Sprint 2 Progress section with implementation details
- Updated roadmap visualization
- Only Weekly AI Summary remaining in Sprint 2

### v2.0 (2026-01-06)
- Completed Sprint 1 (Onboarding & First-Time Experience)
- Moved completed items to "Completed" section
- Updated roadmap visualization
- Added Sprint 1 Summary section
- Revised Sprint 2 focus

### v1.0 (2026-01-05)
- Initial roadmap creation
- Sprint planning structure
- Dependency mapping

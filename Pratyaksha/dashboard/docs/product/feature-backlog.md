# Feature Backlog (ICE Prioritized)

*Generated: 2026-01-05 | Agent: product-manager*

## ICE Scoring Framework

- **Impact** (1-10): How much does this improve user experience?
- **Confidence** (1-10): How certain are we about the impact?
- **Ease** (1-10): How easy is implementation?
- **ICE Score** = Impact × Confidence × Ease

---

## Ranked Features

| Rank | Feature | Impact | Conf | Ease | ICE | Category |
|------|---------|--------|------|------|-----|----------|
| 1 | Journaling Streak System | 9 | 9 | 8 | **648** | Retention |
| 2 | Guided First Entry Experience | 8 | 9 | 8 | **576** | Onboarding |
| 3 | Entry Prompts/Templates | 8 | 8 | 9 | **576** | Onboarding |
| 4 | Progressive Empty States | 7 | 9 | 9 | **567** | UX |
| 5 | Weekly AI Summary | 9 | 8 | 7 | **504** | Retention |
| 6 | PWA Installation | 7 | 8 | 8 | **448** | Platform |
| 7 | Entry Editing | 7 | 9 | 7 | **441** | Core |
| 8 | Entry Deletion | 6 | 9 | 8 | **432** | Core |
| 9 | Bookmarked Entries | 6 | 8 | 9 | **432** | Feature |
| 10 | Week-over-Week Comparison | 8 | 7 | 6 | **336** | Analytics |

---

## Feature Details

### 1. Journaling Streak System (ICE: 648)
**Category**: Retention / Gamification

**Description**: Track consecutive days of journaling with visual indicators and milestone celebrations.

**Requirements**:
- [ ] Track streak count in user data / localStorage
- [ ] Display current streak on dashboard header
- [ ] Show streak calendar visualization
- [ ] Celebrate milestones (7 days, 30 days, 100 days)
- [ ] Handle streak breaks gracefully (freeze days?)

**Files to modify**:
- `Dashboard.tsx` - Add streak display
- `LogEntryForm.tsx` - Update streak on submission
- New: `hooks/useStreak.ts`
- New: `components/StreakBadge.tsx`

---

### 2. Guided First Entry Experience (ICE: 576)
**Category**: Onboarding

**Description**: After the onboarding tour, guide users to write their first entry with prompts and encouragement.

**Requirements**:
- [ ] Detect first-time user (no entries)
- [ ] Show prominent "Write your first entry" CTA
- [ ] Offer topic suggestions
- [ ] Celebrate first entry completion
- [ ] Transition to regular dashboard experience

**Files to modify**:
- `Dashboard.tsx` - First-time detection
- `Logs.tsx` - Guided entry flow
- New: `components/FirstEntryGuide.tsx`

---

### 3. Entry Prompts/Templates (ICE: 576)
**Category**: Onboarding / Engagement

**Description**: Pre-built templates to reduce blank page syndrome.

**Templates to create**:
- Morning Check-in
- Evening Reflection
- Gratitude Log
- Stress Dump
- Goal Review
- Weekly Reflection

**Requirements**:
- [ ] Template selector UI
- [ ] Pre-fill text area with template structure
- [ ] Allow customization of templates
- [ ] Track which templates are used most

---

### 4. Progressive Empty States (ICE: 567)
**Category**: UX

**Description**: Replace "No data" messages with helpful, actionable empty states.

**Requirements**:
- [ ] Design illustrations for each chart type
- [ ] Add contextual CTAs ("Log an entry to see your mood patterns")
- [ ] Show example/preview of what chart will look like
- [ ] Link directly to entry creation

**Files to modify**:
- All chart components in `src/components/charts/`
- New: `components/ui/EmptyState.tsx`

---

### 5. Weekly AI Summary (ICE: 504)
**Category**: Retention / Insights

**Description**: Automated weekly digest of patterns, trends, and suggestions.

**Requirements**:
- [ ] Generate summary from last 7 days of entries
- [ ] Show modal on dashboard (Monday mornings?)
- [ ] Include: top themes, mood trend, energy pattern, suggestion
- [ ] Option to email summary (future)
- [ ] "View past summaries" archive

**Files to modify**:
- New: `components/WeeklySummary.tsx`
- New: `hooks/useWeeklySummary.ts`
- `lib/transforms.ts` - Add weekly aggregation functions

---

### 6-10. Additional Features

See individual feature specs in `/docs/product/specs/` folder (to be created).

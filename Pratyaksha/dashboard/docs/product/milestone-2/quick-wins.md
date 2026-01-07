# Milestone 2: Quick Wins

## Overview

Quick wins are features that can be implemented in **1-2 days** with high user value and low technical risk. These serve as early momentum builders while larger features are being developed.

---

## Quick Win #1: Session Persistence (Day 1)

### Problem
Users lose their session state on refresh - filters reset, scroll position lost, selected entry closes.

### Solution
```typescript
// Store UI state in localStorage
const [filters, setFilters] = useLocalStorage('pratyaksha-filters', defaultFilters)
const [viewMode, setViewMode] = useLocalStorage('pratyaksha-view', 'cards')
```

### Implementation
1. Create `useLocalStorage` hook (or use existing from react-use)
2. Persist: filter selections, view mode (cards/table), sort preferences
3. Restore on page load

### Effort: 2-3 hours

---

## Quick Win #2: Keyboard Shortcuts (Day 1)

### Problem
Power users want faster navigation without mouse clicks.

### Solution
| Shortcut | Action |
|----------|--------|
| `N` | New entry (open modal) |
| `J/K` | Navigate entries up/down |
| `Enter` | Open selected entry |
| `Esc` | Close modal |
| `F` | Focus filter bar |
| `?` | Show shortcuts help |

### Implementation
1. Add `useHotkeys` hook from react-hotkeys-hook
2. Create shortcut help modal (triggered by `?`)
3. Add visual hints in UI

### Effort: 3-4 hours

---

## Quick Win #3: Entry Templates (Day 1-2)

### Problem
Users often journal about similar topics - morning routines, work updates, gratitude.

### Solution
Pre-built templates that pre-fill the entry textarea:

**Morning Check-in**:
```
How am I feeling this morning?
Energy level (1-10):
What's my intention for today?
```

**Work Update**:
```
What did I accomplish today?
What challenges did I face?
What's blocking me?
```

**Gratitude**:
```
3 things I'm grateful for:
1.
2.
3.
```

### Implementation
1. Create templates array in constants file
2. Add template selector dropdown above textarea
3. Insert template text on selection (confirm if textarea has content)

### Effort: 2-3 hours

---

## Quick Win #4: Export Entry to Image (Day 1)

### Problem
Users want to share insights on social media or save as personal reminders.

### Solution
- "Share as Image" button on entry detail view
- Generates styled card with entry summary and AI insights
- Downloads as PNG

### Implementation
1. Use html2canvas library
2. Create styled export template component
3. Add download button to EntryModal

### Effort: 3-4 hours

---

## Quick Win #5: Streak Counter (Day 1)

### Problem
No gamification or encouragement for consistent journaling.

### Solution
- Display current streak on dashboard
- Show "Longest streak" stat
- Fire emoji for active streak days

### Implementation
1. Calculate streak from entry dates (already have data)
2. Add streak card to dashboard stats section
3. Add celebration toast for streak milestones (7, 14, 30 days)

### Effort: 2-3 hours

---

## Quick Win #6: Dark Mode Enhancement (Day 1)

### Problem
Current dark mode exists but could be better (contrast, readability).

### Solution
- Improve dark mode color palette
- Add toggle shortcut (`D`)
- Remember preference in localStorage

### Implementation
1. Audit and fix dark mode CSS issues
2. Add keyboard shortcut
3. Persist preference

### Effort: 2 hours

---

## Quick Win #7: Entry Count Badge (Day 1)

### Problem
Users don't know how many entries they have at a glance.

### Solution
- Show total entry count in header/nav
- Show count per time period in filter bar

### Implementation
1. Add badge to navigation
2. Show filtered count vs total count

### Effort: 1 hour

---

## Quick Win #8: Copy Entry Text (Day 1)

### Problem
No easy way to copy entry content for sharing elsewhere.

### Solution
- "Copy" button on entry card/modal
- Copies formatted text with AI insights
- Success toast confirmation

### Implementation
1. Add copy button to EntryModal
2. Use Clipboard API
3. Format content nicely for paste

### Effort: 1-2 hours

---

## Implementation Priority

| Priority | Quick Win | Effort | Value | When |
|----------|-----------|--------|-------|------|
| 1 | Streak Counter | 2h | High | Sprint 6 |
| 2 | Keyboard Shortcuts | 4h | High | Sprint 6 |
| 3 | Entry Templates | 3h | High | Sprint 6 |
| 4 | Session Persistence | 3h | Medium | Sprint 6 |
| 5 | Copy Entry Text | 2h | Medium | Sprint 6 |
| 6 | Dark Mode Enhancement | 2h | Medium | Sprint 7 |
| 7 | Entry Count Badge | 1h | Low | Sprint 7 |
| 8 | Export to Image | 4h | Medium | Sprint 8 |

---

## Sprint 6 Quick Wins Bundle

**Target**: 5 quick wins in 1 sprint (1 week)

1. Streak Counter (2h)
2. Keyboard Shortcuts (4h)
3. Entry Templates (3h)
4. Session Persistence (3h)
5. Copy Entry Text (2h)

**Total effort**: ~14 hours

This bundle provides immediate user-visible improvements while bigger features (auth, multi-user) are being architected.

---

## Success Metrics

| Quick Win | Metric | Target |
|-----------|--------|--------|
| Streak Counter | Users with 7+ day streaks | 30% |
| Keyboard Shortcuts | Shortcut usage rate | 20% power users |
| Entry Templates | Template usage rate | 40% of new entries |
| Session Persistence | Reduced filter re-selections | -80% |
| Copy Entry Text | Copy button clicks | 10% of entry views |

---

## Notes

- All quick wins are independent - can be implemented in any order
- No backend changes required for most
- All are additive (don't break existing features)
- Perfect for parallel development while auth is being built

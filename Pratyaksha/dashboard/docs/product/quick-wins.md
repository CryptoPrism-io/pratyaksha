# Quick Wins

*Generated: 2026-01-05 | Agent: product-manager*

Low-effort, high-impact improvements that can be completed in under 1 day each.

---

## Priority Order

### 1. Fix Landing Page Link Bug (15 minutes)
**Impact**: Critical - broken user journey
**File**: `src/pages/Landing.tsx:109`

**Current**:
```tsx
<Link to="/log">Start Logging</Link>
```

**Fix**:
```tsx
<Link to="/logs">Start Logging</Link>
```

---

### 2. Rich Empty States with CTAs (4 hours)
**Impact**: High - improves first-time experience
**Files**: All chart components

**Current**: Plain "No data" text
**Goal**: Illustration + helpful message + action button

Example for ModeDistribution:
```tsx
<EmptyState
  icon={<PieChartIcon />}
  title="No mood data yet"
  description="Log a few entries to see your cognitive mode patterns"
  action={<Link to="/logs">Log Entry</Link>}
/>
```

---

### 3. Keyboard Shortcut for New Entry (1 hour)
**Impact**: Medium - power user convenience
**File**: `src/pages/Dashboard.tsx`

Add to `useKeyboardShortcuts`:
```tsx
{ key: 'n', action: () => navigate('/logs'), description: 'New entry' }
```

Also update shortcuts modal to show the new shortcut.

---

### 4. Streak Toast Notification (3 hours)
**Impact**: High - retention feedback loop
**File**: `src/components/logs/LogEntryForm.tsx`

After successful entry submission:
```tsx
toast({
  title: "Entry saved!",
  description: `Day ${streakCount} streak! Keep it up!`,
})
```

Requires: Basic streak tracking in localStorage.

---

### 5. Confetti on First Entry (2 hours)
**Impact**: High - delight moment
**File**: `src/components/logs/LogEntryForm.tsx`

Install: `npm install canvas-confetti`

```tsx
import confetti from 'canvas-confetti'

// After first entry saved
if (isFirstEntry) {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })
}
```

---

### 6. "Restart Tour" Button in Header (2 hours)
**Impact**: Medium - helps users rediscover features
**File**: `src/components/layout/Header.tsx`

Add to dropdown menu:
```tsx
<DropdownMenuItem onClick={resetOnboardingTour}>
  <HelpCircle className="mr-2 h-4 w-4" />
  Restart Tour
</DropdownMenuItem>
```

Uses existing `resetOnboardingTour()` from onboarding hook.

---

### 7. Pre-populate Date Filter (30 minutes)
**Impact**: Low - better default for users with lots of data
**File**: `src/components/filters/DateFilterBar.tsx`

Change default from "All time" to "Last 30 days" for better performance and relevance.

---

### 8. Entry Count Badge on Nav (2 hours)
**Impact**: Low - subtle engagement indicator
**File**: `src/components/layout/Header.tsx`

Show total entry count as badge:
```tsx
<NavLink to="/logs">
  Logs
  <Badge variant="secondary" className="ml-2">{entryCount}</Badge>
</NavLink>
```

---

## Implementation Checklist

- [x] Fix `/log` → `/logs` link
- [x] Create `EmptyState` component
- [x] Add empty states to all charts
- [x] Add `N` keyboard shortcut
- [x] Install canvas-confetti
- [x] Add first entry confetti
- [x] Add streak localStorage tracking
- [x] Add streak toast
- [x] Add restart tour button
- [ ] Change date filter default
- [ ] Add entry count badge

---

## Completed: 2026-01-06

9 of 11 quick wins implemented. Remaining items are lower priority.

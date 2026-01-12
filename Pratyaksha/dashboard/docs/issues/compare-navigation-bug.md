# Bug: Compare page cannot navigate to weeks before Jan 5

**Status:** Open
**Priority:** Medium
**Created:** 2026-01-12

## Description
Users cannot navigate to weeks before Jan 5 in the Compare page period selector. The left arrow button appears disabled or doesn't respond for earlier periods.

## Steps to Reproduce
1. Go to `/compare`
2. Select "Week" granularity
3. Try to navigate backwards past the week of Jan 5
4. Navigation stops working

## Expected Behavior
Should be able to navigate to all weeks that have journal entries in the database.

## Current Behavior
Navigation is blocked at the week of Jan 5, even though earlier entries exist.

## Technical Investigation Done
- Changed `useEntries()` to `useEntriesRaw()` in Compare.tsx to bypass global date filter
- Added debug logging to show minDate calculation
- The `PeriodSelector` uses `canGoPrev = !minDate || navigatePeriod(date, granularity, -1) >= minDate`

## Files Involved
- `src/pages/Compare.tsx` - calculates minDate from allEntries
- `src/components/compare/PeriodSelector.tsx` - navigation logic
- `src/hooks/useComparisonData.ts` - date range utilities

## Debug Code Added
```typescript
console.log('[Compare] Date range:', {
  minDate: dates[0]?.toISOString(),
  maxDate: new Date().toISOString(),
  totalEntries: dates.length
})
```
Check browser console for output.

## Possible Causes
1. Date comparison issue between `navigatePeriod()` result and minDate
2. Entry timestamp vs date field mismatch
3. Timezone/date parsing issues
4. Global date filter still affecting data somehow

## Workaround
Use the Logs page to view older entries.

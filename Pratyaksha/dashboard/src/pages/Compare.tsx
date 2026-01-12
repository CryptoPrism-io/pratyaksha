import { useState, useMemo } from "react"
import { ComparisonPanel } from "../components/compare/ComparisonPanel"
import { GranularityToggle } from "../components/compare/GranularityToggle"
import { ContentToggle, type ContentType } from "../components/compare/ContentToggle"
import {
  type Granularity,
  navigatePeriod,
} from "../hooks/useComparisonData"
import { useEntriesRaw } from "../hooks/useEntries"
import { useMediaQuery } from "../hooks/useMediaQuery"
import { cn } from "../lib/utils"
import { GitCompareArrows } from "lucide-react"

export function Compare() {
  // Detect landscape orientation on mobile/tablet (below lg breakpoint)
  const isLandscape = useMediaQuery("(orientation: landscape) and (max-width: 1023px)")

  // Use raw entries (without global date filter) for navigation bounds
  const { data: allEntries } = useEntriesRaw()

  // Shared state
  const [granularity, setGranularity] = useState<Granularity>("week")
  const [contentType, setContentType] = useState<ContentType>("summary")

  // Individual panel dates
  const [leftDate, setLeftDate] = useState<Date>(() => {
    // Default: previous period
    return navigatePeriod(new Date(), granularity, -1)
  })
  const [rightDate, setRightDate] = useState<Date>(new Date())

  // Calculate min/max dates from ALL entries (ignoring global date filter)
  const { minDate, maxDate } = useMemo(() => {
    if (!allEntries || allEntries.length === 0) {
      return { minDate: undefined, maxDate: new Date() }
    }

    const dates = allEntries
      .filter(e => !e.isDeleted) // Exclude deleted entries
      .map(e => new Date(e.timestamp))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())

    if (dates.length === 0) {
      return { minDate: undefined, maxDate: new Date() }
    }

    // TODO: Debug navigation issue - see docs/issues/compare-navigation-bug.md
    return {
      minDate: dates[0],
      maxDate: new Date(), // Always allow up to today
    }
  }, [allEntries])

  // Update dates when granularity changes to sensible defaults
  const handleGranularityChange = (newGranularity: Granularity) => {
    setGranularity(newGranularity)
    // Reset to current period on right, previous on left
    setRightDate(new Date())
    setLeftDate(navigatePeriod(new Date(), newGranularity, -1))
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GitCompareArrows className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Compare Periods</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Compare your journal entries across different time periods
        </p>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col items-center gap-4 mb-6">
        {/* Granularity Toggle */}
        <GranularityToggle
          value={granularity}
          onChange={handleGranularityChange}
        />

        {/* Content Toggle */}
        <ContentToggle
          value={contentType}
          onChange={setContentType}
        />
      </div>

      {/* Comparison Grid */}
      <div className={cn(
        "grid gap-4 lg:gap-6",
        isLandscape ? "grid-cols-2" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {/* Left Panel */}
        <ComparisonPanel
          side="left"
          date={leftDate}
          granularity={granularity}
          contentType={contentType}
          onDateChange={setLeftDate}
          minDate={minDate}
          maxDate={maxDate}
        />

        {/* Right Panel */}
        <ComparisonPanel
          side="right"
          date={rightDate}
          granularity={granularity}
          contentType={contentType}
          onDateChange={setRightDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>

      {/* Mobile hint - only show in portrait */}
      {!isLandscape && (
        <p className="text-center text-xs text-muted-foreground mt-6 lg:hidden">
          Rotate to landscape for side-by-side comparison
        </p>
      )}
    </div>
  )
}

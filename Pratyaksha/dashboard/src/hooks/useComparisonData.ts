import { useMemo } from "react"
import { useEntriesRaw } from "./useEntries"
import { isDateInRange, type DateRange } from "../lib/dateFilters"

// Re-export DateRange for use by other components
export type { DateRange }
import {
  toModeDistribution,
  toEnergyShapeData,
  toContradictionData,
  toEnrichedTimelineData,
  calculateStats,
} from "../lib/transforms"
import type { Entry } from "../lib/airtable"

export type Granularity = "day" | "week" | "month"

export interface PeriodSummary {
  entries: number
  avgWordsPerEntry: number
  positivePercent: number
  negativePercent: number
  neutralPercent: number
  dominantMode: string
  dominantEnergy: string
  topContradiction: string
  entryTypes: { type: string; count: number }[]
}

// Get start of day
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get end of day
function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// Get start of week (Monday)
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return startOfDay(d)
}

// Get end of week (Sunday)
function endOfWeek(date: Date): Date {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return endOfDay(end)
}

// Get start of month
function startOfMonth(date: Date): Date {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1))
}

// Get end of month
function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

// Get date range for a given granularity and reference date
export function getDateRangeForPeriod(date: Date, granularity: Granularity): DateRange {
  switch (granularity) {
    case "day":
      return { start: startOfDay(date), end: endOfDay(date) }
    case "week":
      return { start: startOfWeek(date), end: endOfWeek(date) }
    case "month":
      return { start: startOfMonth(date), end: endOfMonth(date) }
  }
}

// Navigate to previous/next period
export function navigatePeriod(date: Date, granularity: Granularity, direction: -1 | 1): Date {
  const newDate = new Date(date)
  switch (granularity) {
    case "day":
      newDate.setDate(newDate.getDate() + direction)
      break
    case "week":
      newDate.setDate(newDate.getDate() + 7 * direction)
      break
    case "month":
      newDate.setMonth(newDate.getMonth() + direction)
      break
  }
  return newDate
}

// Format period label
export function formatPeriodLabel(date: Date, granularity: Granularity): string {
  switch (granularity) {
    case "day":
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      })
    case "week": {
      const range = getDateRangeForPeriod(date, "week")
      const startStr = range.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const endStr = range.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      return `${startStr} - ${endStr}`
    }
    case "month":
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }
}

// Calculate summary from entries
function calculateSummary(entries: Entry[]): PeriodSummary {
  if (entries.length === 0) {
    return {
      entries: 0,
      avgWordsPerEntry: 0,
      positivePercent: 0,
      negativePercent: 0,
      neutralPercent: 0,
      dominantMode: "N/A",
      dominantEnergy: "N/A",
      topContradiction: "N/A",
      entryTypes: [],
    }
  }

  // Word count
  const totalWords = entries.reduce((sum, e) => {
    const text = e.text || ""
    return sum + text.split(/\s+/).filter(Boolean).length
  }, 0)
  const avgWordsPerEntry = Math.round(totalWords / entries.length)

  // Sentiment - convert sentimentAI string to category
  const sentiments = entries.map(e => {
    const sentimentStr = e.sentimentAI?.toLowerCase() || "neutral"
    if (sentimentStr === "positive") return "positive"
    if (sentimentStr === "negative") return "negative"
    return "neutral"
  })
  const positiveCount = sentiments.filter(s => s === "positive").length
  const negativeCount = sentiments.filter(s => s === "negative").length
  const neutralCount = sentiments.filter(s => s === "neutral").length
  const total = entries.length

  // Mode distribution
  const modeCounts: Record<string, number> = {}
  entries.forEach(e => {
    const mode = e.inferredMode || "Unknown"
    modeCounts[mode] = (modeCounts[mode] || 0) + 1
  })
  const dominantMode = Object.entries(modeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

  // Energy shape distribution
  const energyCounts: Record<string, number> = {}
  entries.forEach(e => {
    const shape = e.energyShape || "Unknown"
    energyCounts[shape] = (energyCounts[shape] || 0) + 1
  })
  const dominantEnergy = Object.entries(energyCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

  // Top contradiction
  const contradictionCounts: Record<string, number> = {}
  entries.forEach(e => {
    const contradiction = e.contradiction || ""
    if (contradiction) {
      contradictionCounts[contradiction] = (contradictionCounts[contradiction] || 0) + 1
    }
  })
  const topContradiction = Object.entries(contradictionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

  // Entry types
  const typeCounts: Record<string, number> = {}
  entries.forEach(e => {
    const type = e.type || "Unknown"
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })
  const entryTypes = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  return {
    entries: entries.length,
    avgWordsPerEntry,
    positivePercent: Math.round((positiveCount / total) * 100),
    negativePercent: Math.round((negativeCount / total) * 100),
    neutralPercent: Math.round((neutralCount / total) * 100),
    dominantMode,
    dominantEnergy,
    topContradiction,
    entryTypes,
  }
}

// Main hook for comparison data
export function useComparisonData(dateRange: DateRange | null) {
  const { data: allEntries, isLoading, error } = useEntriesRaw()

  const filteredEntries = useMemo(() => {
    if (!allEntries || !dateRange) return []
    return allEntries
      .filter(e => !e.isDeleted)
      .filter(e => isDateInRange(e.date, dateRange))
  }, [allEntries, dateRange])

  const summary = useMemo(() => calculateSummary(filteredEntries), [filteredEntries])
  const modeData = useMemo(() => toModeDistribution(filteredEntries), [filteredEntries])
  const energyData = useMemo(() => toEnergyShapeData(filteredEntries), [filteredEntries])
  const contradictionData = useMemo(() => toContradictionData(filteredEntries), [filteredEntries])
  const timelineData = useMemo(() => toEnrichedTimelineData(filteredEntries), [filteredEntries])
  const stats = useMemo(() => calculateStats(filteredEntries), [filteredEntries])

  return {
    entries: filteredEntries,
    summary,
    modeData,
    energyData,
    contradictionData,
    timelineData,
    stats,
    isLoading,
    error,
  }
}

// Get available periods for selection
export function useAvailablePeriods(granularity: Granularity) {
  const { data: allEntries } = useEntriesRaw()

  return useMemo(() => {
    if (!allEntries || allEntries.length === 0) return []

    const dates = allEntries
      .filter(e => !e.isDeleted)
      .map(e => new Date(e.date))
      .sort((a, b) => b.getTime() - a.getTime())

    if (dates.length === 0) return []

    const periods: Date[] = []
    const seen = new Set<string>()

    // Start from most recent entry and go back
    const latest = dates[0]
    const earliest = dates[dates.length - 1]

    let current = new Date(latest)
    while (current >= earliest) {
      const range = getDateRangeForPeriod(current, granularity)
      const key = range.start.toISOString()

      if (!seen.has(key)) {
        seen.add(key)
        periods.push(new Date(current))
      }

      current = navigatePeriod(current, granularity, -1)

      // Safety limit
      if (periods.length > 100) break
    }

    return periods
  }, [allEntries, granularity])
}

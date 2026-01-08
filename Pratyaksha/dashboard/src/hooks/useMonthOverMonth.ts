import { useMemo } from "react"
import { useEntriesRaw } from "./useEntries"
import { getMonthDateRange, getCurrentMonthId, getPreviousMonthId } from "../lib/monthUtils"
import type { Entry } from "../lib/airtable"

export interface MonthMetrics {
  monthStart: Date
  monthEnd: Date
  monthId: string
  entryCount: number
  avgEntriesPerWeek: number
  avgWordsPerEntry: number
  dominantMode: string
  dominantModeCount: number
  dominantSentiment: "Positive" | "Negative" | "Neutral"
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
  }
  topThemes: string[]
  activeWeeks: number
  activeDays: number
  contradictionCounts: Record<string, number>
}

export interface MonthComparison {
  current: MonthMetrics | null
  previous: MonthMetrics | null
  changes: {
    entryCount: { value: number; percent: number; trend: "up" | "down" | "same" }
    avgWords: { value: number; percent: number; trend: "up" | "down" | "same" }
    sentiment: {
      current: string
      previous: string
      improved: boolean | null
    }
    modeShift: {
      current: string
      previous: string
      changed: boolean
    }
    newThemes: string[]
    droppedThemes: string[]
    activeDays: { value: number; trend: "up" | "down" | "same" }
  } | null
}

function getSentimentCategory(sentiment: string): "Positive" | "Negative" | "Neutral" {
  const lower = sentiment?.toLowerCase() || ""
  if (lower.includes("positive")) return "Positive"
  if (lower.includes("negative")) return "Negative"
  return "Neutral"
}

function getWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

function calculateMonthMetrics(
  entries: Entry[],
  monthStart: Date,
  monthEnd: Date,
  monthId: string
): MonthMetrics | null {
  const monthEntries = entries.filter((e) => {
    const entryDate = new Date(e.date)
    return entryDate >= monthStart && entryDate <= monthEnd
  })

  if (monthEntries.length === 0) {
    return null
  }

  // Entry count
  const entryCount = monthEntries.length

  // Average words
  const avgWordsPerEntry = Math.round(
    monthEntries.reduce((sum, e) => sum + (e.entryLengthWords || 0), 0) / entryCount
  )

  // Dominant mode
  const modeCounts: Record<string, number> = {}
  monthEntries.forEach((e) => {
    const mode = e.inferredMode || "Unknown"
    modeCounts[mode] = (modeCounts[mode] || 0) + 1
  })
  const sortedModes = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])
  const dominantMode = sortedModes[0]?.[0] || "Unknown"
  const dominantModeCount = sortedModes[0]?.[1] || 0

  // Sentiment breakdown
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 }
  monthEntries.forEach((e) => {
    const category = getSentimentCategory(e.sentimentAI)
    if (category === "Positive") sentimentBreakdown.positive++
    else if (category === "Negative") sentimentBreakdown.negative++
    else sentimentBreakdown.neutral++
  })

  // Dominant sentiment
  let dominantSentiment: "Positive" | "Negative" | "Neutral" = "Neutral"
  if (
    sentimentBreakdown.positive >= sentimentBreakdown.negative &&
    sentimentBreakdown.positive >= sentimentBreakdown.neutral
  ) {
    dominantSentiment = "Positive"
  } else if (
    sentimentBreakdown.negative >= sentimentBreakdown.positive &&
    sentimentBreakdown.negative >= sentimentBreakdown.neutral
  ) {
    dominantSentiment = "Negative"
  }

  // Top themes (aggregate all theme tags)
  const themeCounts: Record<string, number> = {}
  monthEntries.forEach((e) => {
    (e.themeTagsAI || []).forEach((theme) => {
      const normalized = theme.toLowerCase().trim()
      if (normalized) {
        themeCounts[normalized] = (themeCounts[normalized] || 0) + 1
      }
    })
  })
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme)

  // Active days
  const uniqueDays = new Set(monthEntries.map((e) => e.date))
  const activeDays = uniqueDays.size

  // Active weeks (unique week numbers)
  const uniqueWeeks = new Set(monthEntries.map((e) => getWeekNumber(new Date(e.date))))
  const activeWeeks = uniqueWeeks.size

  // Avg entries per week (assuming ~4 weeks per month)
  const avgEntriesPerWeek = Math.round((entryCount / 4) * 10) / 10

  // Contradiction counts
  const contradictionCounts: Record<string, number> = {}
  monthEntries.forEach((e) => {
    const contradiction = e.contradiction
    if (contradiction) {
      const normalized = contradiction.toLowerCase().trim()
      if (normalized) {
        contradictionCounts[normalized] = (contradictionCounts[normalized] || 0) + 1
      }
    }
  })

  return {
    monthStart,
    monthEnd,
    monthId,
    entryCount,
    avgEntriesPerWeek,
    avgWordsPerEntry,
    dominantMode,
    dominantModeCount,
    dominantSentiment,
    sentimentBreakdown,
    topThemes,
    activeWeeks,
    activeDays,
    contradictionCounts,
  }
}

function calculateTrend(current: number, previous: number): "up" | "down" | "same" {
  if (current > previous) return "up"
  if (current < previous) return "down"
  return "same"
}

function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function useMonthOverMonth(): {
  data: MonthComparison
  isLoading: boolean
  error: Error | null
} {
  const { data: entries, isLoading, error } = useEntriesRaw()

  const comparison = useMemo<MonthComparison>(() => {
    if (!entries || entries.length === 0) {
      return { current: null, previous: null, changes: null }
    }

    // Filter out deleted entries
    const activeEntries = entries.filter((e) => !e.isDeleted)

    // Get current and previous month
    const currentMonthId = getCurrentMonthId()
    const previousMonthId = getPreviousMonthId(currentMonthId)

    const { start: currentStart, end: currentEnd } = getMonthDateRange(currentMonthId)
    const { start: previousStart, end: previousEnd } = getMonthDateRange(previousMonthId)

    // Calculate metrics for both months
    const current = calculateMonthMetrics(activeEntries, currentStart, currentEnd, currentMonthId)
    const previous = calculateMonthMetrics(activeEntries, previousStart, previousEnd, previousMonthId)

    // Calculate changes
    if (!current && !previous) {
      return { current: null, previous: null, changes: null }
    }

    if (!current) {
      return {
        current: null,
        previous,
        changes: null,
      }
    }

    if (!previous) {
      return {
        current,
        previous: null,
        changes: {
          entryCount: { value: current.entryCount, percent: 100, trend: "up" },
          avgWords: { value: current.avgWordsPerEntry, percent: 100, trend: "up" },
          sentiment: { current: current.dominantSentiment, previous: "-", improved: null },
          modeShift: { current: current.dominantMode, previous: "-", changed: false },
          newThemes: current.topThemes,
          droppedThemes: [],
          activeDays: { value: current.activeDays, trend: "up" },
        },
      }
    }

    // Both months have data - calculate changes
    const entryCountChange = current.entryCount - previous.entryCount
    const avgWordsChange = current.avgWordsPerEntry - previous.avgWordsPerEntry
    const activeDaysChange = current.activeDays - previous.activeDays

    // Theme changes
    const currentThemeSet = new Set(current.topThemes)
    const previousThemeSet = new Set(previous.topThemes)
    const newThemes = current.topThemes.filter((t) => !previousThemeSet.has(t))
    const droppedThemes = previous.topThemes.filter((t) => !currentThemeSet.has(t))

    // Sentiment improvement
    const sentimentOrder = { Negative: 0, Neutral: 1, Positive: 2 }
    const sentimentImproved =
      sentimentOrder[current.dominantSentiment] > sentimentOrder[previous.dominantSentiment]
        ? true
        : sentimentOrder[current.dominantSentiment] < sentimentOrder[previous.dominantSentiment]
        ? false
        : null

    return {
      current,
      previous,
      changes: {
        entryCount: {
          value: entryCountChange,
          percent: calculatePercentChange(current.entryCount, previous.entryCount),
          trend: calculateTrend(current.entryCount, previous.entryCount),
        },
        avgWords: {
          value: avgWordsChange,
          percent: calculatePercentChange(current.avgWordsPerEntry, previous.avgWordsPerEntry),
          trend: calculateTrend(current.avgWordsPerEntry, previous.avgWordsPerEntry),
        },
        sentiment: {
          current: current.dominantSentiment,
          previous: previous.dominantSentiment,
          improved: sentimentImproved,
        },
        modeShift: {
          current: current.dominantMode,
          previous: previous.dominantMode,
          changed: current.dominantMode !== previous.dominantMode,
        },
        newThemes,
        droppedThemes,
        activeDays: {
          value: activeDaysChange,
          trend: calculateTrend(current.activeDays, previous.activeDays),
        },
      },
    }
  }, [entries])

  return {
    data: comparison,
    isLoading,
    error: error as Error | null,
  }
}

/**
 * Calculate metrics for multiple months (for trends chart)
 */
export function useMultiMonthMetrics(monthCount: number = 6): {
  data: MonthMetrics[]
  isLoading: boolean
  error: Error | null
} {
  const { data: entries, isLoading, error } = useEntriesRaw()

  const metrics = useMemo<MonthMetrics[]>(() => {
    if (!entries || entries.length === 0) {
      return []
    }

    const activeEntries = entries.filter((e) => !e.isDeleted)
    const results: MonthMetrics[] = []

    let currentMonthId = getCurrentMonthId()

    for (let i = 0; i < monthCount; i++) {
      const { start, end } = getMonthDateRange(currentMonthId)
      const monthMetrics = calculateMonthMetrics(activeEntries, start, end, currentMonthId)

      if (monthMetrics) {
        results.unshift(monthMetrics) // Add to front for chronological order
      }

      currentMonthId = getPreviousMonthId(currentMonthId)
    }

    return results
  }, [entries, monthCount])

  return {
    data: metrics,
    isLoading,
    error: error as Error | null,
  }
}

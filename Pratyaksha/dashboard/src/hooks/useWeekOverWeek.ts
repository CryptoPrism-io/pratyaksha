import { useMemo } from "react"
import { useEntriesRaw } from "./useEntries"
import type { Entry } from "../lib/airtable"

export interface WeekMetrics {
  weekStart: Date
  weekEnd: Date
  entryCount: number
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
  avgEntriesPerDay: number
  activeDays: number
}

export interface WeekComparison {
  current: WeekMetrics | null
  previous: WeekMetrics | null
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

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date)
  const day = d.getDay()
  // Sunday = 0, we want Monday as start of week
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(d.setDate(diff))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function getSentimentCategory(sentiment: string): "Positive" | "Negative" | "Neutral" {
  const lower = sentiment?.toLowerCase() || ""
  if (lower.includes("positive")) return "Positive"
  if (lower.includes("negative")) return "Negative"
  return "Neutral"
}

function calculateWeekMetrics(entries: Entry[], weekStart: Date, weekEnd: Date): WeekMetrics | null {
  const weekEntries = entries.filter((e) => {
    const entryDate = new Date(e.date)
    return entryDate >= weekStart && entryDate <= weekEnd
  })

  if (weekEntries.length === 0) {
    return null
  }

  // Entry count
  const entryCount = weekEntries.length

  // Average words
  const avgWordsPerEntry = Math.round(
    weekEntries.reduce((sum, e) => sum + (e.entryLengthWords || 0), 0) / entryCount
  )

  // Dominant mode
  const modeCounts: Record<string, number> = {}
  weekEntries.forEach((e) => {
    const mode = e.inferredMode || "Unknown"
    modeCounts[mode] = (modeCounts[mode] || 0) + 1
  })
  const sortedModes = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])
  const dominantMode = sortedModes[0]?.[0] || "Unknown"
  const dominantModeCount = sortedModes[0]?.[1] || 0

  // Sentiment breakdown
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 }
  weekEntries.forEach((e) => {
    const category = getSentimentCategory(e.sentimentAI)
    if (category === "Positive") sentimentBreakdown.positive++
    else if (category === "Negative") sentimentBreakdown.negative++
    else sentimentBreakdown.neutral++
  })

  // Dominant sentiment
  let dominantSentiment: "Positive" | "Negative" | "Neutral" = "Neutral"
  if (sentimentBreakdown.positive >= sentimentBreakdown.negative &&
      sentimentBreakdown.positive >= sentimentBreakdown.neutral) {
    dominantSentiment = "Positive"
  } else if (sentimentBreakdown.negative >= sentimentBreakdown.positive &&
             sentimentBreakdown.negative >= sentimentBreakdown.neutral) {
    dominantSentiment = "Negative"
  }

  // Top themes (aggregate all theme tags)
  const themeCounts: Record<string, number> = {}
  weekEntries.forEach((e) => {
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
  const uniqueDays = new Set(weekEntries.map((e) => e.date))
  const activeDays = uniqueDays.size

  // Average entries per day (only counting active days)
  const avgEntriesPerDay = Math.round((entryCount / activeDays) * 10) / 10

  return {
    weekStart,
    weekEnd,
    entryCount,
    avgWordsPerEntry,
    dominantMode,
    dominantModeCount,
    dominantSentiment,
    sentimentBreakdown,
    topThemes,
    avgEntriesPerDay,
    activeDays,
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

export function useWeekOverWeek(): {
  data: WeekComparison
  isLoading: boolean
  error: Error | null
} {
  const { data: entries, isLoading, error } = useEntriesRaw()

  const comparison = useMemo<WeekComparison>(() => {
    if (!entries || entries.length === 0) {
      return { current: null, previous: null, changes: null }
    }

    // Filter out deleted entries
    const activeEntries = entries.filter((e) => !e.isDeleted)

    // Get current and previous week bounds
    const now = new Date()
    const { start: currentStart, end: currentEnd } = getWeekBounds(now)

    const previousWeekDate = new Date(currentStart)
    previousWeekDate.setDate(previousWeekDate.getDate() - 7)
    const { start: previousStart, end: previousEnd } = getWeekBounds(previousWeekDate)

    // Calculate metrics for both weeks
    const current = calculateWeekMetrics(activeEntries, currentStart, currentEnd)
    const previous = calculateWeekMetrics(activeEntries, previousStart, previousEnd)

    // Calculate changes
    if (!current && !previous) {
      return { current: null, previous: null, changes: null }
    }

    if (!current) {
      return {
        current: null,
        previous,
        changes: null
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
        }
      }
    }

    // Both weeks have data - calculate changes
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

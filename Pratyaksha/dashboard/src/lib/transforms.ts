// Data transformations for charts
import type { Entry } from "./airtable"
import { countBy, groupBy, sentimentToScore } from "./utils"

// Emotional Timeline data
export interface TimelinePoint {
  date: string
  sentiment: number
  energy: string
  entries: number
}

export function toTimelineData(entries: Entry[]): TimelinePoint[] {
  const grouped = groupBy(entries, "date")

  return Object.entries(grouped)
    .map(([date, dayEntries]) => {
      const avgSentiment =
        dayEntries.reduce((sum, e) => sum + sentimentToScore(e.sentimentAI), 0) /
        dayEntries.length

      return {
        date,
        sentiment: Math.round(avgSentiment * 100) / 100,
        energy: dayEntries[0]?.inferredEnergy || "Unknown",
        entries: dayEntries.length,
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Enriched Timeline Entry (individual dots)
export interface EnrichedTimelineEntry {
  id: string
  date: string
  timestamp: string         // Full timestamp for ordering
  entryIndex: number        // Unique index for x-axis (each entry gets its own position)
  sentiment: number         // -1 to 1 (with jitter applied)
  rawSentiment: number      // Original -1 to 1
  sentimentCategory: "positive" | "negative" | "neutral"
  sentimentLabel: string    // "Positive" | "Negative" | "Neutral"
  mode: string
  snapshot: string
  entryLength: number
  text: string
  name: string
  themeTagsAI: string[]
  actionableInsightsAI: string
  energyShape: string
}

export interface EnrichedTimelineData {
  entries: EnrichedTimelineEntry[]
  trend: TimelinePoint[]
  dateLabels: string[]
}

// Fixed Y positions for each sentiment (discrete, not continuous)
// Positive at top (1), Neutral in middle (0), Negative at bottom (-1)
function getSentimentYPosition(sentiment: string): number {
  const lower = sentiment?.toLowerCase() || "neutral"
  if (lower.includes("positive")) return 1
  if (lower.includes("negative")) return -1
  return 0
}

// Get sentiment category
function getSentimentCategory(sentiment: string): "positive" | "negative" | "neutral" {
  const lower = sentiment?.toLowerCase() || "neutral"
  if (lower.includes("positive")) return "positive"
  if (lower.includes("negative")) return "negative"
  return "neutral"
}

// Apply small vertical jitter for consecutive entries with same sentiment
// Since each entry now has its own x-position, we only jitter if multiple
// consecutive entries have the same sentiment (to make the pattern visible)
function applySmallJitter(entries: EnrichedTimelineEntry[]): EnrichedTimelineEntry[] {
  // Group consecutive entries by sentiment
  const result: EnrichedTimelineEntry[] = []
  let currentGroup: EnrichedTimelineEntry[] = []
  let currentSentiment: string | null = null

  entries.forEach((entry) => {
    if (entry.sentimentCategory === currentSentiment) {
      currentGroup.push(entry)
    } else {
      // Process previous group
      if (currentGroup.length > 0) {
        if (currentGroup.length === 1) {
          result.push(currentGroup[0])
        } else {
          // Apply small jitter for groups of same sentiment
          const jitterStep = 0.2 / currentGroup.length
          currentGroup.forEach((e, j) => {
            result.push({
              ...e,
              sentiment: e.rawSentiment + (j - (currentGroup.length - 1) / 2) * jitterStep,
            })
          })
        }
      }
      // Start new group
      currentGroup = [entry]
      currentSentiment = entry.sentimentCategory
    }
  })

  // Process last group
  if (currentGroup.length === 1) {
    result.push(currentGroup[0])
  } else if (currentGroup.length > 1) {
    const jitterStep = 0.2 / currentGroup.length
    currentGroup.forEach((e, j) => {
      result.push({
        ...e,
        sentiment: e.rawSentiment + (j - (currentGroup.length - 1) / 2) * jitterStep,
      })
    })
  }

  return result
}

export function toEnrichedTimelineData(entries: Entry[]): EnrichedTimelineData {
  // Sort entries by timestamp (or date + createdTime as fallback)
  const sortedEntries = entries
    .filter(e => e.sentimentAI)
    .sort((a, b) => {
      // Use timestamp if available, otherwise fall back to date + createdTime
      const timeA = a.timestamp || a.date || a.createdTime
      const timeB = b.timestamp || b.date || b.createdTime
      return new Date(timeA).getTime() - new Date(timeB).getTime()
    })

  // Each entry gets its own unique x-position (no stacking)
  const enrichedEntries: EnrichedTimelineEntry[] = sortedEntries.map((entry, index) => {
    const yPosition = getSentimentYPosition(entry.sentimentAI)
    return {
      id: entry.id,
      date: entry.date,
      timestamp: entry.timestamp || entry.createdTime || entry.date,
      entryIndex: index,           // Each entry has unique x position
      sentiment: yPosition,        // Fixed position: 1, 0, or -1
      rawSentiment: yPosition,
      sentimentCategory: getSentimentCategory(entry.sentimentAI),
      sentimentLabel: entry.sentimentAI,
      mode: entry.inferredMode || "Unknown",
      snapshot: entry.snapshot || entry.text?.slice(0, 100) || "",
      entryLength: entry.entryLengthWords || 0,
      text: entry.text || "",
      name: entry.name || "Untitled",
      themeTagsAI: entry.themeTagsAI || [],
      actionableInsightsAI: entry.actionableInsightsAI || "",
      energyShape: entry.energyShape || "",
    }
  })

  // Apply small vertical jitter only for entries with same sentiment at similar positions
  const jitteredEntries = applySmallJitter(enrichedEntries)

  // Keep existing trend data for the background area
  const trend = toTimelineData(entries)

  // Get unique dates for x-axis labels
  const uniqueDates = [...new Set(sortedEntries.map(e => e.date))]
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return {
    entries: jitteredEntries,
    trend,
    dateLabels: uniqueDates,
  }
}

// Mode Distribution data
export interface ModeCount {
  mode: string
  count: number
  percentage: number
}

export function toModeDistribution(entries: Entry[]): ModeCount[] {
  const counts = countBy(entries, "inferredMode")
  const total = entries.length

  return Object.entries(counts)
    .map(([mode, count]) => ({
      mode,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
}

// Energy Shape data (for radar)
export interface EnergyShapeData {
  shape: string
  count: number
}

export function toEnergyShapeData(entries: Entry[]): EnergyShapeData[] {
  const shapes = [
    "Flat", "Heavy", "Chaotic", "Rising", "Collapsing", "Expanding",
    "Contracted", "Uneven", "Centered", "Cyclical", "Stabilized", "Pulsing"
  ]

  const counts = countBy(entries, "energyShape")

  return shapes.map((shape) => ({
    shape,
    count: counts[shape] || 0,
  }))
}

// Energy Shape Benchmarks - optimal percentage ranges for each shape
// Growth shapes: want higher percentages
// Stability shapes: want moderate percentages
// Challenge shapes: want lower percentages
export const SHAPE_BENCHMARKS: Record<string, { optimal: number; concern: number; category: "growth" | "stability" | "challenge" }> = {
  // Growth patterns - want these HIGH (optimal: 10-20% each)
  Rising: { optimal: 15, concern: 5, category: "growth" },
  Expanding: { optimal: 10, concern: 3, category: "growth" },
  Pulsing: { optimal: 10, concern: 3, category: "growth" },

  // Stability patterns - want these MODERATE (optimal: 10-25% each)
  Centered: { optimal: 20, concern: 5, category: "stability" },
  Stabilized: { optimal: 15, concern: 5, category: "stability" },
  Flat: { optimal: 10, concern: 3, category: "stability" },
  Cyclical: { optimal: 5, concern: 2, category: "stability" },

  // Challenge patterns - want these LOW (concern if above threshold)
  Chaotic: { optimal: 5, concern: 15, category: "challenge" },
  Heavy: { optimal: 5, concern: 15, category: "challenge" },
  Collapsing: { optimal: 3, concern: 10, category: "challenge" },
  Contracted: { optimal: 2, concern: 8, category: "challenge" },
  Uneven: { optimal: 5, concern: 12, category: "challenge" },
}

// Status indicator for benchmark comparison
export type BenchmarkStatus = "above" | "at" | "below" | "concern"

export interface EnergyShapePercentage {
  shape: string
  count: number
  percentage: number
  benchmark: number
  concernThreshold: number
  status: BenchmarkStatus
  category: "growth" | "stability" | "challenge"
}

/**
 * Convert energy shape counts to percentages of grand total with benchmark status
 */
export function toEnergyShapePercentages(entries: Entry[]): EnergyShapePercentage[] {
  const total = entries.length
  if (total === 0) return []

  const counts = countBy(entries, "energyShape")
  const shapes = Object.keys(SHAPE_BENCHMARKS)

  return shapes.map((shape) => {
    const count = counts[shape] || 0
    const percentage = (count / total) * 100
    const benchmark = SHAPE_BENCHMARKS[shape]

    let status: BenchmarkStatus
    if (benchmark.category === "challenge") {
      // For challenge patterns: above concern threshold is bad
      if (percentage >= benchmark.concern) {
        status = "concern"
      } else if (percentage <= benchmark.optimal) {
        status = "above" // Good - below or at optimal for challenge
      } else {
        status = "at" // Between optimal and concern
      }
    } else {
      // For growth/stability: above optimal is good
      if (percentage >= benchmark.optimal) {
        status = "above"
      } else if (percentage >= benchmark.optimal * 0.5) {
        status = "at"
      } else if (percentage < benchmark.concern) {
        status = "concern"
      } else {
        status = "below"
      }
    }

    return {
      shape,
      count,
      percentage: Math.round(percentage * 10) / 10, // 1 decimal place
      benchmark: benchmark.optimal,
      concernThreshold: benchmark.concern,
      status,
      category: benchmark.category,
    }
  })
}

// Type Distribution data
export interface TypeCount {
  type: string
  count: number
}

export function toTypeDistribution(entries: Entry[]): TypeCount[] {
  const counts = countBy(entries, "type")

  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

// Calendar Heatmap data
export interface CalendarDay {
  date: string
  count: number
  sentiment: "positive" | "negative" | "neutral" | "none"
}

export function toCalendarData(entries: Entry[]): CalendarDay[] {
  const grouped = groupBy(entries, "date")

  return Object.entries(grouped).map(([date, dayEntries]) => {
    const avgSentiment =
      dayEntries.reduce((sum, e) => sum + sentimentToScore(e.sentimentAI), 0) /
      dayEntries.length

    let sentiment: CalendarDay["sentiment"] = "neutral"
    if (avgSentiment > 0.3) sentiment = "positive"
    else if (avgSentiment < -0.3) sentiment = "negative"

    return {
      date,
      count: dayEntries.length,
      sentiment,
    }
  })
}

// Theme Tags data (for word cloud)
export interface TagCount {
  text: string
  value: number
}

export function toTagCloudData(entries: Entry[]): TagCount[] {
  const tagCounts: Record<string, number> = {}

  entries.forEach((entry) => {
    entry.themeTagsAI.forEach((tag) => {
      const normalizedTag = tag.toLowerCase().trim()
      if (normalizedTag) {
        tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1
      }
    })
  })

  return Object.entries(tagCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 30) // Top 30 tags
}

// Enhanced Theme Tags with filtering options
export type TagSortBy = "frequency" | "alphabetical" | "recent"
export type TagSentimentFilter = "all" | "positive" | "neutral" | "negative"
export type TagLimit = 10 | 20 | 30 | "all"

export interface TagCloudOptions {
  sortBy: TagSortBy
  limit: TagLimit
  sentiment: TagSentimentFilter
}

export interface EnrichedTagCount {
  text: string
  value: number
  recentDate: string // Most recent entry date with this tag
}

export function toTagCloudDataEnriched(
  entries: Entry[],
  options: TagCloudOptions
): EnrichedTagCount[] {
  const { sortBy, limit, sentiment } = options

  // Filter entries by sentiment if needed
  let filteredEntries = entries
  if (sentiment !== "all") {
    filteredEntries = entries.filter((entry) => {
      const entrySentiment = entry.sentimentAI?.toLowerCase() || ""
      return entrySentiment.includes(sentiment)
    })
  }

  // Build tag data with counts and most recent date
  const tagData: Record<string, { count: number; recentDate: string }> = {}

  filteredEntries.forEach((entry) => {
    const entryDate = entry.timestamp || entry.date || entry.createdTime
    entry.themeTagsAI?.forEach((tag) => {
      const normalizedTag = tag.toLowerCase().trim()
      if (normalizedTag) {
        if (!tagData[normalizedTag]) {
          tagData[normalizedTag] = { count: 0, recentDate: entryDate }
        }
        tagData[normalizedTag].count += 1
        // Track most recent date
        if (new Date(entryDate) > new Date(tagData[normalizedTag].recentDate)) {
          tagData[normalizedTag].recentDate = entryDate
        }
      }
    })
  })

  // Convert to array
  let result: EnrichedTagCount[] = Object.entries(tagData).map(([text, data]) => ({
    text,
    value: data.count,
    recentDate: data.recentDate,
  }))

  // Sort based on option
  switch (sortBy) {
    case "frequency":
      result.sort((a, b) => b.value - a.value)
      break
    case "alphabetical":
      result.sort((a, b) => a.text.localeCompare(b.text))
      break
    case "recent":
      result.sort((a, b) => new Date(b.recentDate).getTime() - new Date(a.recentDate).getTime())
      break
  }

  // Apply limit
  if (limit !== "all") {
    result = result.slice(0, limit)
  }

  return result
}

// Contradiction data
export interface ContradictionCount {
  contradiction: string
  count: number
  trend: "improving" | "worsening" | "stable"
}

export function toContradictionData(entries: Entry[]): ContradictionCount[] {
  const counts = countBy(entries, "contradiction")

  return Object.entries(counts)
    .map(([contradiction, count]) => ({
      contradiction,
      count,
      trend: "stable" as const, // TODO: Calculate from time series
    }))
    .filter((c) => c.contradiction)
    .sort((a, b) => b.count - a.count)
}

// Sankey Flow data (Type -> Contradiction -> Mode)
export interface SankeyNode {
  name: string
}

export interface SankeyLink {
  source: number
  target: number
  value: number
}

export interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

export function toSankeyData(entries: Entry[]): SankeyData {
  const typeSet = new Set<string>()
  const contradictionSet = new Set<string>()
  const modeSet = new Set<string>()

  entries.forEach((e) => {
    if (e.type) typeSet.add(e.type)
    if (e.contradiction) contradictionSet.add(e.contradiction)
    if (e.inferredMode) modeSet.add(e.inferredMode)
  })

  const types = Array.from(typeSet)
  const contradictions = Array.from(contradictionSet)
  const modes = Array.from(modeSet)

  const nodes: SankeyNode[] = [
    ...types.map((name) => ({ name })),
    ...contradictions.map((name) => ({ name })),
    ...modes.map((name) => ({ name })),
  ]

  const typeToContra: Record<string, Record<string, number>> = {}
  const contraToMode: Record<string, Record<string, number>> = {}

  entries.forEach((e) => {
    if (e.type && e.contradiction) {
      if (!typeToContra[e.type]) typeToContra[e.type] = {}
      typeToContra[e.type][e.contradiction] = (typeToContra[e.type][e.contradiction] || 0) + 1
    }
    if (e.contradiction && e.inferredMode) {
      if (!contraToMode[e.contradiction]) contraToMode[e.contradiction] = {}
      contraToMode[e.contradiction][e.inferredMode] = (contraToMode[e.contradiction][e.inferredMode] || 0) + 1
    }
  })

  const links: SankeyLink[] = []

  // Type -> Contradiction links
  Object.entries(typeToContra).forEach(([type, contras]) => {
    const sourceIdx = types.indexOf(type)
    Object.entries(contras).forEach(([contra, value]) => {
      const targetIdx = types.length + contradictions.indexOf(contra)
      if (sourceIdx >= 0 && targetIdx >= types.length) {
        links.push({ source: sourceIdx, target: targetIdx, value })
      }
    })
  })

  // Contradiction -> Mode links
  Object.entries(contraToMode).forEach(([contra, modeMap]) => {
    const sourceIdx = types.length + contradictions.indexOf(contra)
    Object.entries(modeMap).forEach(([mode, value]) => {
      const targetIdx = types.length + contradictions.length + modes.indexOf(mode)
      if (sourceIdx >= types.length && targetIdx >= types.length + contradictions.length) {
        links.push({ source: sourceIdx, target: targetIdx, value })
      }
    })
  })

  return { nodes, links }
}

// Stats summary
export interface Stats {
  totalEntries: number
  recentEntries: number
  avgWordsPerEntry: number
  mostCommonMode: string
  mostCommonType: string
  positiveRatio: number
  negativeRatio: number
}

export function calculateStats(entries: Entry[]): Stats {
  const total = entries.length
  const recent = entries.filter((e) => e.isRecent).length
  const avgWords = Math.round(
    entries.reduce((sum, e) => sum + e.entryLengthWords, 0) / total
  )

  const modeCounts = countBy(entries, "inferredMode")
  const typeCounts = countBy(entries, "type")

  const mostCommonMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown"
  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown"

  const positive = entries.filter((e) => e.sentimentAI.toLowerCase().includes("positive")).length
  const negative = entries.filter((e) => e.sentimentAI.toLowerCase().includes("negative")).length

  return {
    totalEntries: total,
    recentEntries: recent,
    avgWordsPerEntry: avgWords,
    mostCommonMode,
    mostCommonType,
    positiveRatio: Math.round((positive / total) * 100),
    negativeRatio: Math.round((negative / total) * 100),
  }
}

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

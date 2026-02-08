// Monthly Summary Agent - Generates insights from a month's journal entries
import { callOpenRouter, MODELS } from "../lib/openrouter"
import { MoodTrend, MOOD_TRENDS } from "../types"
import { type EntryRecord } from "../lib/db"

export interface MonthlyAgentOutput {
  narrative: string
  moodTrend: MoodTrend
  monthlyInsight: string
  monthHighlight: string
  recommendations: string[]
  nextMonthFocus: string
}

export interface MonthlySummaryStats {
  entryCount: number
  modeDistribution: Record<string, number>
  themeFrequency: Record<string, number>
  sentimentBreakdown: { positive: number; negative: number; neutral: number }
  contradictions: Record<string, number>
  energyShapes: Record<string, number>
  avgEntriesPerWeek: number
  positiveRatio: number
  activeDays: number
  activeWeeks: number
}

const SYSTEM_PROMPT = `You are an insightful monthly journal analyst who synthesizes patterns across an entire month of journal entries to provide meaningful insights.

You MUST respond with valid JSON only. No other text.

Guidelines:
- "narrative": A 3-4 paragraph summary capturing the month's emotional arc, key themes, breakthroughs, and challenges. Write in second person ("You...") addressing the journal writer directly. Be warm, insightful, and celebratory of growth while gently noting areas for attention.
- "moodTrend": One of: "improving", "declining", "stable", "volatile"
  - "improving": Overall positive trajectory across the month
  - "declining": Overall negative trajectory
  - "stable": Consistent mood throughout
  - "volatile": Frequent ups and downs
- "monthlyInsight": One key observation about patterns this month (2-3 sentences)
- "monthHighlight": The most notable moment, achievement, or theme of the month (1 sentence)
- "recommendations": 3 specific, actionable suggestions based on the month's patterns
- "nextMonthFocus": The single most important priority for next month (1 sentence)`

interface EntrySnapshot {
  date: string
  name: string
  mode: string
  energy: string
  sentiment: string
  snapshot: string
  themes: string[]
  contradiction: string | null
}

function prepareEntrySnapshots(records: EntryRecord[]): EntrySnapshot[] {
  return records.map((record) => ({
    date: record.fields.Date || "",
    name: record.fields.Name || "Untitled",
    mode: record.fields["Inferred Mode"] || "Unknown",
    energy: record.fields["Energy Shape"] || "Unknown",
    sentiment: record.fields["Entry Sentiment (AI)"] || "Neutral",
    snapshot: record.fields.Snapshot || "",
    themes: record.fields["Entry Theme Tags (AI)"]?.split(",").map((t) => t.trim()) || [],
    contradiction: record.fields.Contradiction || null,
  }))
}

function getWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

function calculateStats(records: EntryRecord[]): MonthlySummaryStats {
  const entryCount = records.length

  // Mode distribution
  const modeDistribution: Record<string, number> = {}
  records.forEach((r) => {
    const mode = r.fields["Inferred Mode"] || "Unknown"
    modeDistribution[mode] = (modeDistribution[mode] || 0) + 1
  })

  // Theme frequency
  const themeFrequency: Record<string, number> = {}
  records.forEach((r) => {
    const themes = r.fields["Entry Theme Tags (AI)"]?.split(",").map((t) => t.trim()) || []
    themes.forEach((theme) => {
      if (theme) {
        themeFrequency[theme] = (themeFrequency[theme] || 0) + 1
      }
    })
  })

  // Sentiment breakdown
  let positive = 0, negative = 0, neutral = 0
  records.forEach((r) => {
    const sentiment = r.fields["Entry Sentiment (AI)"]?.toLowerCase() || ""
    if (sentiment.includes("positive")) positive++
    else if (sentiment.includes("negative")) negative++
    else neutral++
  })

  // Contradictions
  const contradictions: Record<string, number> = {}
  records.forEach((r) => {
    const contradiction = r.fields.Contradiction
    if (contradiction) {
      contradictions[contradiction] = (contradictions[contradiction] || 0) + 1
    }
  })

  // Energy shapes
  const energyShapes: Record<string, number> = {}
  records.forEach((r) => {
    const shape = r.fields["Energy Shape"] || "Unknown"
    energyShapes[shape] = (energyShapes[shape] || 0) + 1
  })

  // Calculate unique days
  const uniqueDays = new Set(records.map((r) => r.fields.Date)).size
  const activeDays = uniqueDays

  // Calculate unique weeks
  const uniqueWeeks = new Set(
    records.map((r) => {
      const date = new Date(r.fields.Date || "")
      return getWeekNumber(date)
    })
  ).size
  const activeWeeks = uniqueWeeks

  // Avg entries per week (assuming ~4 weeks per month)
  const avgEntriesPerWeek = entryCount / 4

  // Positive ratio
  const positiveRatio = entryCount > 0 ? (positive / entryCount) * 100 : 0

  return {
    entryCount,
    modeDistribution,
    themeFrequency,
    sentimentBreakdown: { positive, negative, neutral },
    contradictions,
    energyShapes,
    avgEntriesPerWeek,
    positiveRatio,
    activeDays,
    activeWeeks,
  }
}

export async function generateMonthlySummary(
  records: EntryRecord[],
  monthId: string,
  monthRange: string
): Promise<{ output: MonthlyAgentOutput; stats: MonthlySummaryStats }> {
  const entries = prepareEntrySnapshots(records)
  const stats = calculateStats(records)

  // Get top items for summary
  const sortedModes = Object.entries(stats.modeDistribution)
    .sort(([, a], [, b]) => b - a)
  const topMode = sortedModes[0]?.[0] || "Unknown"

  const sortedThemes = Object.entries(stats.themeFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7) // Top 7 for monthly
  const topThemes = sortedThemes.map(([theme]) => theme)

  const sortedContradictions = Object.entries(stats.contradictions)
    .sort(([, a], [, b]) => b - a)
  const topContradiction = sortedContradictions[0]?.[0] || null

  // Group entries by week for the prompt
  const entriesByWeek: Record<string, EntrySnapshot[]> = {}
  entries.forEach((e) => {
    const weekNum = getWeekNumber(new Date(e.date))
    const weekKey = `Week ${weekNum}`
    if (!entriesByWeek[weekKey]) {
      entriesByWeek[weekKey] = []
    }
    entriesByWeek[weekKey].push(e)
  })

  // Build weekly summaries for context
  const weeklySummaries = Object.entries(entriesByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, weekEntries]) => {
      const weekModes: Record<string, number> = {}
      let weekPositive = 0, weekNegative = 0
      weekEntries.forEach((e) => {
        weekModes[e.mode] = (weekModes[e.mode] || 0) + 1
        if (e.sentiment.toLowerCase().includes("positive")) weekPositive++
        else if (e.sentiment.toLowerCase().includes("negative")) weekNegative++
      })
      const dominantMode = Object.entries(weekModes).sort(([, a], [, b]) => b - a)[0]?.[0] || "Unknown"
      return `${week} (${weekEntries.length} entries): Dominant mode: ${dominantMode}, Sentiment: ${weekPositive}+ / ${weekNegative}-`
    })
    .join("\n")

  // Build condensed entry list (just snapshots for context, not full details)
  const entrySnapshots = entries
    .slice(0, 30) // Limit to avoid token overflow
    .map((e) => `- [${e.date}] ${e.name}: ${e.snapshot.substring(0, 100)}...`)
    .join("\n")

  const prompt = `Analyze this month's journal entries and generate a comprehensive monthly summary.

## Month: ${monthRange} (${monthId})
## Total Entries: ${stats.entryCount}
## Active Days: ${stats.activeDays}
## Active Weeks: ${stats.activeWeeks}

## Weekly Overview:
${weeklySummaries}

## Entry Snapshots (sample):
${entrySnapshots}

## Aggregated Statistics:
- Dominant Mode: ${topMode} (${stats.modeDistribution[topMode]} entries)
- Mode Distribution: ${sortedModes.slice(0, 5).map(([m, c]) => `${m}(${c})`).join(", ")}
- Top Themes: ${topThemes.length > 0 ? topThemes.join(", ") : "None identified"}
- Theme Counts: ${sortedThemes.slice(0, 5).map(([t, c]) => `${t}(${c})`).join(", ")}
- Sentiment Breakdown: ${stats.sentimentBreakdown.positive} positive, ${stats.sentimentBreakdown.negative} negative, ${stats.sentimentBreakdown.neutral} neutral
- Positive Ratio: ${stats.positiveRatio.toFixed(1)}%
- Top Contradiction: ${topContradiction || "None recurring"} ${topContradiction ? `(${stats.contradictions[topContradiction]} times)` : ""}
- Avg Entries/Week: ${stats.avgEntriesPerWeek.toFixed(1)}

## Task:
Generate a comprehensive monthly summary with:
1. narrative: 3-4 paragraph summary of the month's emotional arc (write in second person, be warm and insightful)
2. moodTrend: "improving" | "declining" | "stable" | "volatile"
3. monthlyInsight: One key observation about patterns this month (2-3 sentences)
4. monthHighlight: The most notable moment or theme of the month (1 sentence)
5. recommendations: Array of 3 specific, actionable suggestions
6. nextMonthFocus: Single most important priority for next month

Respond with JSON only.`

  // Use balanced model for quality insights with higher token limit for long narratives
  const response = await callOpenRouter<MonthlyAgentOutput>(
    prompt,
    MODELS.BALANCED,
    SYSTEM_PROMPT,
    { maxTokens: 2000 } // Monthly summaries need more tokens for 3-4 paragraph narratives
  )

  // Validate and normalize mood trend
  let moodTrend: MoodTrend = "stable"
  if (MOOD_TRENDS.includes(response.data.moodTrend as MoodTrend)) {
    moodTrend = response.data.moodTrend
  }

  // Ensure recommendations is an array
  let recommendations = response.data.recommendations
  if (!Array.isArray(recommendations)) {
    recommendations = [String(recommendations)]
  }

  return {
    output: {
      narrative: response.data.narrative || "No summary generated.",
      moodTrend,
      monthlyInsight: response.data.monthlyInsight || "Continue journaling to build monthly patterns.",
      monthHighlight: response.data.monthHighlight || "Keep reflecting on your growth.",
      recommendations: recommendations.slice(0, 3),
      nextMonthFocus: response.data.nextMonthFocus || "Maintain your journaling practice.",
    },
    stats,
  }
}

/**
 * Get the dominant mode and energy from stats
 */
export function getDominantValues(stats: MonthlySummaryStats): {
  dominantMode: string
  dominantEnergy: string
  topThemes: string[]
  topContradiction: string | null
} {
  const sortedModes = Object.entries(stats.modeDistribution)
    .sort(([, a], [, b]) => b - a)

  const sortedEnergy = Object.entries(stats.energyShapes)
    .sort(([, a], [, b]) => b - a)

  const sortedThemes = Object.entries(stats.themeFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const sortedContradictions = Object.entries(stats.contradictions)
    .sort(([, a], [, b]) => b - a)

  return {
    dominantMode: sortedModes[0]?.[0] || "Unknown",
    dominantEnergy: sortedEnergy[0]?.[0] || "Unknown",
    topThemes: sortedThemes.map(([theme]) => theme),
    topContradiction: sortedContradictions[0]?.[0] || null,
  }
}

// Weekly Summary Agent - Generates insights from a week's journal entries
import { callOpenRouter, MODELS } from "../lib/openrouter"
import { WeeklyAgentOutput, WeeklySummaryStats, MOOD_TRENDS, MoodTrend } from "../types"
import { type EntryRecord } from "../lib/db"

const SYSTEM_PROMPT = `You are an insightful weekly journal analyst who synthesizes patterns across multiple journal entries to provide meaningful insights.

You MUST respond with valid JSON only. No other text.

Guidelines:
- "narrative": A 2-3 paragraph summary capturing the week's emotional journey, key themes, and patterns. Write in second person ("You...") addressing the journal writer directly. Be warm but insightful.
- "moodTrend": One of: "improving", "declining", "stable", "volatile"
  - "improving": Overall positive trajectory across the week
  - "declining": Overall negative trajectory
  - "stable": Consistent mood throughout
  - "volatile": Frequent ups and downs
- "weeklyInsight": One key observation about patterns this week (1-2 sentences)
- "recommendations": 3 specific, actionable suggestions based on the week's patterns
- "nextWeekFocus": The single most important priority for next week (1 sentence)`

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

function calculateStats(records: EntryRecord[]): WeeklySummaryStats {
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

  // Calculate days with entries
  const uniqueDays = new Set(records.map((r) => r.fields.Date)).size
  const avgEntriesPerDay = uniqueDays > 0 ? entryCount / uniqueDays : 0

  // Positive ratio
  const positiveRatio = entryCount > 0 ? (positive / entryCount) * 100 : 0

  return {
    entryCount,
    modeDistribution,
    themeFrequency,
    sentimentBreakdown: { positive, negative, neutral },
    contradictions,
    energyShapes,
    avgEntriesPerDay,
    positiveRatio,
  }
}

export async function generateWeeklySummary(
  records: EntryRecord[],
  weekId: string,
  weekRange: string
): Promise<{ output: WeeklyAgentOutput; stats: WeeklySummaryStats }> {
  const entries = prepareEntrySnapshots(records)
  const stats = calculateStats(records)

  // Get top items for summary
  const sortedModes = Object.entries(stats.modeDistribution)
    .sort(([, a], [, b]) => b - a)
  const topMode = sortedModes[0]?.[0] || "Unknown"

  const sortedThemes = Object.entries(stats.themeFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  const topThemes = sortedThemes.map(([theme]) => theme)

  const sortedContradictions = Object.entries(stats.contradictions)
    .sort(([, a], [, b]) => b - a)
  const topContradiction = sortedContradictions[0]?.[0] || null

  // Build the prompt
  const entrySummaries = entries
    .map((e) => `- [${e.date}] "${e.name}"
  Mode: ${e.mode} | Energy: ${e.energy} | Sentiment: ${e.sentiment}
  Snapshot: ${e.snapshot}
  Themes: ${e.themes.join(", ") || "None"}${e.contradiction ? `\n  Tension: ${e.contradiction}` : ""}`)
    .join("\n\n")

  const prompt = `Analyze this week's journal entries and generate a weekly summary.

## Week: ${weekRange} (${weekId})
## Total Entries: ${stats.entryCount}

## Entry Summaries:
${entrySummaries}

## Aggregated Statistics:
- Dominant Mode: ${topMode} (${stats.modeDistribution[topMode]} entries)
- Mode Distribution: ${sortedModes.map(([m, c]) => `${m}(${c})`).join(", ")}
- Top Themes: ${topThemes.length > 0 ? topThemes.join(", ") : "None identified"}
- Sentiment Breakdown: ${stats.sentimentBreakdown.positive} positive, ${stats.sentimentBreakdown.negative} negative, ${stats.sentimentBreakdown.neutral} neutral
- Positive Ratio: ${stats.positiveRatio.toFixed(1)}%
- Top Contradiction: ${topContradiction || "None recurring"}
- Avg Entries/Day: ${stats.avgEntriesPerDay.toFixed(1)}

## Task:
Generate a comprehensive weekly summary with:
1. narrative: 2-3 paragraph summary of the week's emotional journey (write in second person)
2. moodTrend: "improving" | "declining" | "stable" | "volatile"
3. weeklyInsight: One key observation about patterns this week
4. recommendations: Array of 3 specific, actionable suggestions
5. nextWeekFocus: Single most important priority for next week

Respond with JSON only.`

  // Use gpt-4o for quality insights with higher token limit for narratives
  const response = await callOpenRouter<WeeklyAgentOutput>(
    prompt,
    MODELS.BALANCED,
    SYSTEM_PROMPT,
    { maxTokens: 1500 } // Weekly summaries need more tokens for narrative + recommendations
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
      weeklyInsight: response.data.weeklyInsight || "Continue journaling to build patterns.",
      recommendations: recommendations.slice(0, 3),
      nextWeekFocus: response.data.nextWeekFocus || "Maintain your journaling practice.",
    },
    stats,
  }
}

/**
 * Get the dominant mode and energy from stats
 */
export function getDominantValues(stats: WeeklySummaryStats): {
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

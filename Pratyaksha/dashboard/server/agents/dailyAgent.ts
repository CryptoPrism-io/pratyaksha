// Daily Summary Agent - Generates insights from a single day's journal entries
import { callOpenRouter, MODELS } from "../lib/openrouter"
import { DailyAgentOutput, MOOD_TRENDS, MoodTrend } from "../types"
import { type EntryRecord } from "../lib/db"

const SYSTEM_PROMPT = `You are an insightful daily journal analyst who synthesizes patterns from a day's journal entries to provide meaningful insights.

You MUST respond with valid JSON only. No other text.

Guidelines:
- "narrative": A 1-2 paragraph summary capturing the day's emotional journey. Write in second person ("You...") addressing the journal writer directly. Be warm but insightful.
- "moodSummary": Brief description of the overall emotional tone (1 sentence)
- "energyPattern": How energy flowed through the day (1 sentence)
- "keyTakeaway": The single most important insight from today (1 sentence)
- "eveningReflection": A thoughtful question or prompt for evening reflection`

interface EntrySnapshot {
  time: string
  name: string
  mode: string
  energy: string
  sentiment: string
  snapshot: string
  themes: string[]
}

function prepareEntrySnapshots(records: EntryRecord[]): EntrySnapshot[] {
  return records.map((record) => ({
    time: record.fields.Timestamp
      ? new Date(record.fields.Timestamp).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "",
    name: record.fields.Name || "Untitled",
    mode: record.fields["Inferred Mode"] || "Unknown",
    energy: record.fields["Energy Shape"] || "Unknown",
    sentiment: record.fields["Entry Sentiment (AI)"] || "Neutral",
    snapshot: record.fields.Snapshot || "",
    themes: record.fields["Entry Theme Tags (AI)"]?.split(",").map((t) => t.trim()) || [],
  }))
}

interface DailyStats {
  entryCount: number
  modeDistribution: Record<string, number>
  themeFrequency: Record<string, number>
  sentimentBreakdown: { positive: number; negative: number; neutral: number }
  dominantMode: string
  dominantSentiment: string
  allThemes: string[]
}

function calculateDailyStats(records: EntryRecord[]): DailyStats {
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

  // Dominant mode
  const sortedModes = Object.entries(modeDistribution).sort(([, a], [, b]) => b - a)
  const dominantMode = sortedModes[0]?.[0] || "Unknown"

  // Dominant sentiment
  const sentimentCounts = { positive, negative, neutral }
  const dominantSentiment = Object.entries(sentimentCounts)
    .sort(([, a], [, b]) => b - a)[0][0]

  // All themes
  const allThemes = Object.keys(themeFrequency)

  return {
    entryCount,
    modeDistribution,
    themeFrequency,
    sentimentBreakdown: { positive, negative, neutral },
    dominantMode,
    dominantSentiment,
    allThemes,
  }
}

export async function generateDailySummary(
  records: EntryRecord[],
  dateStr: string
): Promise<{ output: DailyAgentOutput; stats: DailyStats }> {
  const entries = prepareEntrySnapshots(records)
  const stats = calculateDailyStats(records)

  // Format date for display
  const displayDate = new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  // Build the prompt
  const entrySummaries = entries
    .map((e) => `- [${e.time}] "${e.name}"
  Mode: ${e.mode} | Energy: ${e.energy} | Sentiment: ${e.sentiment}
  Snapshot: ${e.snapshot}
  Themes: ${e.themes.join(", ") || "None"}`)
    .join("\n\n")

  const prompt = `Analyze today's journal entries and generate a daily summary.

## Date: ${displayDate}
## Total Entries: ${stats.entryCount}

## Entries (in chronological order):
${entrySummaries}

## Quick Stats:
- Dominant Mode: ${stats.dominantMode}
- Overall Sentiment: ${stats.dominantSentiment} (${stats.sentimentBreakdown.positive} positive, ${stats.sentimentBreakdown.negative} negative, ${stats.sentimentBreakdown.neutral} neutral)
- Themes: ${stats.allThemes.slice(0, 5).join(", ") || "None identified"}

## Task:
Generate a thoughtful daily summary with:
1. narrative: 1-2 paragraph summary of the day's emotional journey (write in second person)
2. moodSummary: Brief description of overall emotional tone (1 sentence)
3. energyPattern: How energy flowed through the day (1 sentence)
4. keyTakeaway: Single most important insight from today
5. eveningReflection: A thoughtful question or prompt for reflection

Respond with JSON only.`

  // Use gpt-4o-mini for daily summaries (more frequent, keep costs low)
  const response = await callOpenRouter<DailyAgentOutput>(
    prompt,
    MODELS.CHEAP,
    SYSTEM_PROMPT
  )

  return {
    output: {
      narrative: response.data.narrative || "No summary generated.",
      moodSummary: response.data.moodSummary || "Mixed feelings throughout the day.",
      energyPattern: response.data.energyPattern || "Energy varied throughout the day.",
      keyTakeaway: response.data.keyTakeaway || "Every day brings new insights.",
      eveningReflection: response.data.eveningReflection || "What made today meaningful?",
    },
    stats,
  }
}

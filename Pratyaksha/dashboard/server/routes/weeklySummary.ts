// Weekly Summary API Route
import { Request, Response } from "express"
import {
  fetchEntriesByDateRange,
  findSummaryByPeriod,
  upsertSummary,
  type EntryRecord,
} from "../lib/db"
import {
  getWeekDateRange,
  formatWeekRange,
  getCurrentWeekId,
  isWeekInFuture,
  formatDateISO,
  parseWeekId
} from "../lib/weekUtils"
import { generateWeeklySummary, getDominantValues } from "../agents/weeklyAgent"
import { WeeklySummaryResponse, Sentiment } from "../types"

/**
 * Calculate dominant sentiment from breakdown
 */
function getDominantSentiment(breakdown: { positive: number; negative: number; neutral: number }): Sentiment {
  const { positive, negative, neutral } = breakdown
  const total = positive + negative + neutral

  if (total === 0) return "Neutral"

  // If one sentiment has clear majority (>50%), use it
  if (positive > total / 2) return "Positive"
  if (negative > total / 2) return "Negative"
  if (neutral > total / 2) return "Neutral"

  // Otherwise, pick the highest
  if (positive >= negative && positive >= neutral) return "Positive"
  if (negative >= positive && negative >= neutral) return "Negative"
  return "Neutral"
}

/**
 * GET /api/weekly-summary
 * Query params:
 *   - week: ISO week ID (YYYY-Wnn) or "current"
 *   - regenerate: "true" to force regeneration
 */
export async function getWeeklySummary(req: Request, res: Response) {
  try {
    // Parse week parameter
    let weekId = req.query.week as string
    if (!weekId || weekId === "current") {
      weekId = getCurrentWeekId()
    }

    // Validate week format
    try {
      parseWeekId(weekId)
    } catch {
      return res.status(400).json({
        success: false,
        error: "Invalid week format. Use YYYY-Wnn (e.g., 2026-W01)",
      } satisfies WeeklySummaryResponse)
    }

    // Check if week is in the future
    if (isWeekInFuture(weekId)) {
      return res.status(400).json({
        success: false,
        error: "Cannot generate summary for future weeks",
      } satisfies WeeklySummaryResponse)
    }

    const { start, end } = getWeekDateRange(weekId)
    const weekRange = formatWeekRange(weekId)
    const regenerate = req.query.regenerate === "true"

    // Check for cached summary
    const existingCached = await findSummaryByPeriod("weekly", weekId)

    // Return cached if not regenerating and cache exists
    if (!regenerate && existingCached) {
      const c = existingCached.data
      const response: WeeklySummaryResponse = {
        success: true,
        summary: {
          weekId,
          weekStart: formatDateISO(start),
          weekEnd: formatDateISO(end),
          entryCount: c.entryCount || 0,
          narrative: c.narrative || null,
          moodTrend: c.moodTrend as any || null,
          dominantMode: c.dominantMode || null,
          dominantEnergy: c.dominantEnergy || null,
          dominantSentiment: (c.dominantSentiment as Sentiment) || "Neutral",
          topThemes: c.topThemes || [],
          topContradiction: c.topContradiction || null,
          weeklyInsight: c.weeklyInsight || null,
          recommendations: c.recommendations || [],
          nextWeekFocus: c.nextWeekFocus || null,
          positiveRatio: c.positiveRatio || 0,
          avgEntriesPerDay: c.avgEntriesPerDay || 0,
          sentimentBreakdown: (c.sentimentBreakdown as any) || { positive: 0, negative: 0, neutral: 0 },
          generatedAt: c.generatedAt?.toISOString() || null,
          cached: true,
          airtableRecordId: existingCached.id,
        },
      }
      return res.json(response)
    }

    // Fetch entries for the week
    // Use day before start and day after end to capture edge cases with time zones
    const startStr = formatDateISO(new Date(start.getTime() - 86400000))
    const endStr = formatDateISO(new Date(end.getTime() + 86400000))

    const entries = await fetchEntriesByDateRange(startStr, endStr)

    // Filter to exact week (in case date range was too broad)
    const weekEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.fields.Date || "")
      return entryDate >= start && entryDate <= end
    })

    // If no entries, return empty summary
    if (weekEntries.length === 0) {
      const response: WeeklySummaryResponse = {
        success: true,
        summary: {
          weekId,
          weekStart: formatDateISO(start),
          weekEnd: formatDateISO(end),
          entryCount: 0,
          narrative: null,
          moodTrend: null,
          dominantMode: null,
          dominantEnergy: null,
          dominantSentiment: null,
          topThemes: [],
          topContradiction: null,
          weeklyInsight: null,
          recommendations: [],
          nextWeekFocus: null,
          positiveRatio: 0,
          avgEntriesPerDay: 0,
          sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
          generatedAt: null,
          cached: false,
        },
      }
      return res.json(response)
    }

    // Generate the summary with AI
    console.log(`[Weekly Summary] Generating summary for ${weekId} with ${weekEntries.length} entries`)
    const { output, stats } = await generateWeeklySummary(weekEntries, weekId, weekRange)
    const { dominantMode, dominantEnergy, topThemes, topContradiction } = getDominantValues(stats)

    // Cache the summary in PostgreSQL (upsert)
    let summaryRecordId: string | undefined
    try {
      summaryRecordId = await upsertSummary({
        type: "weekly",
        periodStart: formatDateISO(start),
        periodEnd: formatDateISO(end),
        entryCount: stats.entryCount,
        narrative: output.narrative,
        recommendations: output.recommendations,
        nextWeekFocus: output.nextWeekFocus,
        topThemes,
        dominantMode,
        moodTrend: output.moodTrend,
        weeklyInsight: output.weeklyInsight,
        dominantEnergy,
        positiveRatio: stats.positiveRatio,
        avgEntriesPerDay: stats.avgEntriesPerDay,
        sentimentBreakdown: stats.sentimentBreakdown,
      })
      console.log(`[Weekly Summary] Cached summary in PostgreSQL: ${summaryRecordId}`)
    } catch (cacheError) {
      console.error("[Weekly Summary] Failed to cache summary:", cacheError)
    }

    // Calculate dominant sentiment from breakdown
    const dominantSentiment = getDominantSentiment(stats.sentimentBreakdown)

    const response: WeeklySummaryResponse = {
      success: true,
      summary: {
        weekId,
        weekStart: formatDateISO(start),
        weekEnd: formatDateISO(end),
        entryCount: stats.entryCount,
        narrative: output.narrative,
        moodTrend: output.moodTrend,
        dominantMode,
        dominantEnergy,
        dominantSentiment,
        topThemes,
        topContradiction,
        weeklyInsight: output.weeklyInsight,
        recommendations: output.recommendations,
        nextWeekFocus: output.nextWeekFocus,
        positiveRatio: stats.positiveRatio,
        avgEntriesPerDay: stats.avgEntriesPerDay,
        sentimentBreakdown: stats.sentimentBreakdown,
        generatedAt: new Date().toISOString(),
        cached: false,
        airtableRecordId: summaryRecordId,
      },
    }

    return res.json(response)
  } catch (error) {
    console.error("[Weekly Summary] Error:", error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate weekly summary",
    } satisfies WeeklySummaryResponse)
  }
}

// Monthly Summary API Route
import { Request, Response } from "express"
import {
  fetchEntriesByDateRange,
  findSummaryByPeriod,
  upsertSummary,
  type EntryRecord,
} from "../lib/db"
import {
  getMonthDateRange,
  formatMonthRange,
  getCurrentMonthId,
  isMonthInFuture,
  formatDateISO,
  parseMonthId
} from "../lib/monthUtils"
import { generateMonthlySummary, getDominantValues } from "../agents/monthlyAgent"
import { Sentiment } from "../types"

export interface MonthlySummaryResponse {
  success: boolean
  error?: string
  summary?: {
    monthId: string
    monthStart: string
    monthEnd: string
    entryCount: number
    activeDays: number
    activeWeeks: number
    narrative: string | null
    moodTrend: string | null
    dominantMode: string | null
    dominantEnergy: string | null
    dominantSentiment: Sentiment | null
    topThemes: string[]
    topContradiction: string | null
    monthlyInsight: string | null
    monthHighlight: string | null
    recommendations: string[]
    nextMonthFocus: string | null
    positiveRatio: number
    avgEntriesPerWeek: number
    sentimentBreakdown: { positive: number; negative: number; neutral: number }
    generatedAt: string | null
    cached: boolean
    airtableRecordId?: string
  }
}

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
 * GET /api/monthly-summary
 * Query params:
 *   - month: Month ID (YYYY-MM) or "current"
 *   - regenerate: "true" to force regeneration
 */
export async function getMonthlySummary(req: Request, res: Response) {
  try {
    // Parse month parameter
    let monthId = req.query.month as string
    if (!monthId || monthId === "current") {
      monthId = getCurrentMonthId()
    }

    // Validate month format
    try {
      parseMonthId(monthId)
    } catch {
      return res.status(400).json({
        success: false,
        error: "Invalid month format. Use YYYY-MM (e.g., 2026-01)",
      } satisfies MonthlySummaryResponse)
    }

    // Check if month is in the future
    if (isMonthInFuture(monthId)) {
      return res.status(400).json({
        success: false,
        error: "Cannot generate summary for future months",
      } satisfies MonthlySummaryResponse)
    }

    const { start, end } = getMonthDateRange(monthId)
    const monthRange = formatMonthRange(monthId)
    const regenerate = req.query.regenerate === "true"

    // Check for cached summary
    const existingCached = await findSummaryByPeriod("monthly", monthId)

    // Return cached if not regenerating and cache exists
    if (!regenerate && existingCached) {
      const c = existingCached.data
      const response: MonthlySummaryResponse = {
        success: true,
        summary: {
          monthId,
          monthStart: formatDateISO(start),
          monthEnd: formatDateISO(end),
          entryCount: c.entryCount || 0,
          activeDays: 0,
          activeWeeks: 0,
          narrative: c.narrative || null,
          moodTrend: c.moodTrend as any || null,
          dominantMode: c.dominantMode || null,
          dominantEnergy: c.dominantEnergy || null,
          dominantSentiment: (c.dominantSentiment as Sentiment) || "Neutral",
          topThemes: c.topThemes || [],
          topContradiction: c.topContradiction || null,
          monthlyInsight: null,
          monthHighlight: null,
          recommendations: c.recommendations || [],
          nextMonthFocus: c.nextWeekFocus || null,
          positiveRatio: c.positiveRatio || 0,
          avgEntriesPerWeek: 0,
          sentimentBreakdown: (c.sentimentBreakdown as any) || { positive: 0, negative: 0, neutral: 0 },
          generatedAt: c.generatedAt?.toISOString() || null,
          cached: true,
          airtableRecordId: existingCached.id,
        },
      }
      return res.json(response)
    }

    // Fetch entries for the month
    // Use day before start and day after end to capture edge cases with time zones
    const startStr = formatDateISO(new Date(start.getTime() - 86400000))
    const endStr = formatDateISO(new Date(end.getTime() + 86400000))

    const entries = await fetchEntriesByDateRange(startStr, endStr)

    // Filter to exact month (in case date range was too broad)
    const monthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.fields.Date || "")
      return entryDate >= start && entryDate <= end
    })

    // If no entries, return empty summary
    if (monthEntries.length === 0) {
      const response: MonthlySummaryResponse = {
        success: true,
        summary: {
          monthId,
          monthStart: formatDateISO(start),
          monthEnd: formatDateISO(end),
          entryCount: 0,
          activeDays: 0,
          activeWeeks: 0,
          narrative: null,
          moodTrend: null,
          dominantMode: null,
          dominantEnergy: null,
          dominantSentiment: null,
          topThemes: [],
          topContradiction: null,
          monthlyInsight: null,
          monthHighlight: null,
          recommendations: [],
          nextMonthFocus: null,
          positiveRatio: 0,
          avgEntriesPerWeek: 0,
          sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
          generatedAt: null,
          cached: false,
        },
      }
      return res.json(response)
    }

    // Generate the summary with AI
    console.log(`[Monthly Summary] Generating summary for ${monthId} with ${monthEntries.length} entries`)
    const { output, stats } = await generateMonthlySummary(monthEntries, monthId, monthRange)
    const { dominantMode, dominantEnergy, topThemes, topContradiction } = getDominantValues(stats)

    // Cache the summary in PostgreSQL (upsert)
    let summaryRecordId: string | undefined
    try {
      summaryRecordId = await upsertSummary({
        type: "monthly",
        periodStart: formatDateISO(start),
        periodEnd: formatDateISO(end),
        entryCount: stats.entryCount,
        narrative: output.narrative,
        recommendations: output.recommendations,
        nextWeekFocus: output.nextMonthFocus,
        topThemes,
        dominantMode,
        moodTrend: output.moodTrend,
        monthHighlight: output.monthHighlight,
        dominantEnergy,
        positiveRatio: stats.positiveRatio,
        sentimentBreakdown: stats.sentimentBreakdown,
      })
      console.log(`[Monthly Summary] Cached summary in PostgreSQL: ${summaryRecordId}`)
    } catch (cacheError) {
      console.error("[Monthly Summary] Failed to cache summary:", cacheError)
    }

    // Calculate dominant sentiment from breakdown
    const dominantSentiment = getDominantSentiment(stats.sentimentBreakdown)

    const response: MonthlySummaryResponse = {
      success: true,
      summary: {
        monthId,
        monthStart: formatDateISO(start),
        monthEnd: formatDateISO(end),
        entryCount: stats.entryCount,
        activeDays: stats.activeDays,
        activeWeeks: stats.activeWeeks,
        narrative: output.narrative,
        moodTrend: output.moodTrend,
        dominantMode,
        dominantEnergy,
        dominantSentiment,
        topThemes,
        topContradiction,
        monthlyInsight: output.monthlyInsight,
        monthHighlight: output.monthHighlight,
        recommendations: output.recommendations,
        nextMonthFocus: output.nextMonthFocus,
        positiveRatio: stats.positiveRatio,
        avgEntriesPerWeek: stats.avgEntriesPerWeek,
        sentimentBreakdown: stats.sentimentBreakdown,
        generatedAt: new Date().toISOString(),
        cached: false,
        airtableRecordId: summaryRecordId,
      },
    }

    return res.json(response)
  } catch (error) {
    console.error("[Monthly Summary] Error:", error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate monthly summary",
    } satisfies MonthlySummaryResponse)
  }
}

// Weekly Summary API Route
import { Request, Response } from "express"
import {
  fetchEntriesByDateRange,
  findSummaryByWeek,
  createSummaryEntry,
  updateSummaryEntry,
  AirtableRecord
} from "../lib/airtable"
import {
  getWeekDateRange,
  formatWeekRange,
  getCurrentWeekId,
  isWeekInFuture,
  formatDateISO,
  parseWeekId
} from "../lib/weekUtils"
import { generateWeeklySummary, getDominantValues } from "../agents/weeklyAgent"
import { WeeklySummaryResponse } from "../types"

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
    const existingCached = await findSummaryByWeek(weekId)

    // Return cached if not regenerating and cache exists
    if (!regenerate && existingCached) {
      // Parse cached summary - entryCount stored in Entry Length (Words) field
      const cachedEntryCount = existingCached.fields["Entry Length (Words)"] || 0
      const response: WeeklySummaryResponse = {
        success: true,
        summary: {
          weekId,
          weekStart: formatDateISO(start),
          weekEnd: formatDateISO(end),
          entryCount: cachedEntryCount,
          narrative: existingCached.fields["Summary (AI)"] || null,
          moodTrend: null, // Not stored in simple cache
          dominantMode: existingCached.fields["Inferred Mode"] || null,
          dominantEnergy: null,
          topThemes: existingCached.fields["Entry Theme Tags (AI)"]?.split(",").map(t => t.trim()) || [],
          topContradiction: null,
          weeklyInsight: null,
          recommendations: existingCached.fields["Actionable Insights (AI)"]?.split("\n\n") || [],
          nextWeekFocus: existingCached.fields["Next Action"] || null,
          positiveRatio: 0,
          avgEntriesPerDay: 0,
          generatedAt: existingCached.fields.Timestamp || null,
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
          topThemes: [],
          topContradiction: null,
          weeklyInsight: null,
          recommendations: [],
          nextWeekFocus: null,
          positiveRatio: 0,
          avgEntriesPerDay: 0,
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

    // Cache the summary in Airtable (update existing or create new)
    let airtableRecordId: string | undefined
    const summaryData = {
      narrative: output.narrative,
      recommendations: output.recommendations,
      weeklyInsight: output.weeklyInsight,
      nextWeekFocus: output.nextWeekFocus,
      topThemes,
      dominantMode,
      moodTrend: output.moodTrend,
      entryCount: stats.entryCount,
    }

    try {
      if (existingCached) {
        // Update existing record instead of creating duplicate
        const updated = await updateSummaryEntry(existingCached.id, weekId, weekRange, summaryData)
        airtableRecordId = updated.id
        console.log(`[Weekly Summary] Updated existing summary in Airtable: ${updated.id}`)
      } else {
        // Create new record
        const created = await createSummaryEntry(weekId, weekRange, summaryData)
        airtableRecordId = created.id
        console.log(`[Weekly Summary] Created new summary in Airtable: ${created.id}`)
      }
    } catch (cacheError) {
      console.error("[Weekly Summary] Failed to cache summary:", cacheError)
      // Continue without caching - still return the summary
    }

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
        topThemes,
        topContradiction,
        weeklyInsight: output.weeklyInsight,
        recommendations: output.recommendations,
        nextWeekFocus: output.nextWeekFocus,
        positiveRatio: stats.positiveRatio,
        avgEntriesPerDay: stats.avgEntriesPerDay,
        generatedAt: new Date().toISOString(),
        cached: false,
        airtableRecordId,
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

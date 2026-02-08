// Daily Summary API Route
import { Request, Response } from "express"
import { fetchEntriesByDateRange } from "../lib/db"
import { generateDailySummary } from "../agents/dailyAgent"
import { DailySummaryResponse } from "../types"

/**
 * GET /api/daily-summary
 * Query params:
 *   - date: YYYY-MM-DD format or "today"
 */
export async function getDailySummary(req: Request, res: Response) {
  try {
    // Parse date parameter
    let dateStr = req.query.date as string
    if (!dateStr || dateStr === "today") {
      dateStr = new Date().toISOString().split("T")[0]
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD",
      } satisfies DailySummaryResponse)
    }

    // Check if date is in the future
    // Parse as local date to avoid timezone issues
    const [year, month, day] = dateStr.split("-").map(Number)
    const targetDate = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (targetDate > today) {
      return res.status(400).json({
        success: false,
        error: "Cannot generate summary for future dates",
      } satisfies DailySummaryResponse)
    }

    // Format display date
    const displayDate = targetDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    // Fetch entries for the day
    // Use day before and after to handle edge cases
    // Format dates as YYYY-MM-DD in local time (not UTC)
    const formatLocalDate = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const da = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${da}`
    }

    const dayBefore = new Date(targetDate)
    dayBefore.setDate(dayBefore.getDate() - 1)
    const dayAfter = new Date(targetDate)
    dayAfter.setDate(dayAfter.getDate() + 1)

    const startStr = formatLocalDate(dayBefore)
    const endStr = formatLocalDate(dayAfter)

    const entries = await fetchEntriesByDateRange(startStr, endStr)

    // Filter to exact date
    const dayEntries = entries.filter((entry) => {
      return entry.fields.Date === dateStr
    })

    // Sort by timestamp
    dayEntries.sort((a, b) => {
      const timeA = a.fields.Timestamp || ""
      const timeB = b.fields.Timestamp || ""
      return timeA.localeCompare(timeB)
    })

    // If no entries, return empty summary
    if (dayEntries.length === 0) {
      const response: DailySummaryResponse = {
        success: true,
        summary: {
          date: dateStr,
          displayDate,
          entryCount: 0,
          narrative: null,
          moodSummary: null,
          energyPattern: null,
          keyTakeaway: null,
          eveningReflection: null,
          dominantMode: null,
          dominantSentiment: null,
          themes: [],
          generatedAt: null,
        },
      }
      return res.json(response)
    }

    // Generate the summary with AI
    console.log(`[Daily Summary] Generating summary for ${dateStr} with ${dayEntries.length} entries`)
    const { output, stats } = await generateDailySummary(dayEntries, dateStr)

    const response: DailySummaryResponse = {
      success: true,
      summary: {
        date: dateStr,
        displayDate,
        entryCount: stats.entryCount,
        narrative: output.narrative,
        moodSummary: output.moodSummary,
        energyPattern: output.energyPattern,
        keyTakeaway: output.keyTakeaway,
        eveningReflection: output.eveningReflection,
        dominantMode: stats.dominantMode,
        dominantSentiment: stats.dominantSentiment,
        themes: stats.allThemes.slice(0, 5),
        generatedAt: new Date().toISOString(),
      },
    }

    return res.json(response)
  } catch (error) {
    console.error("[Daily Summary] Error:", error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate daily summary",
    } satisfies DailySummaryResponse)
  }
}

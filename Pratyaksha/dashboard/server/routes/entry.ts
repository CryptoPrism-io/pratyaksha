// Entry Processing Route - Orchestrates the 4-agent pipeline
import { Request, Response } from "express"
import { classifyIntent } from "../agents/intentAgent"
import { analyzeEmotion } from "../agents/emotionAgent"
import { extractThemes } from "../agents/themeAgent"
import { generateInsights } from "../agents/insightAgent"
import { createAirtableEntry, updateAirtableEntry, AirtableEntryFields } from "../lib/airtable"
import {
  ProcessEntryRequest,
  ProcessEntryResponse,
  ProcessingResult,
  EntryType,
  ENTRY_TYPES,
} from "../types"

export async function processEntry(
  req: Request<object, object, ProcessEntryRequest>,
  res: Response<ProcessEntryResponse>
) {
  const { text, type: userProvidedType } = req.body

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Text is required",
    })
  }

  const trimmedText = text.trim()
  let totalTokens = 0

  try {
    console.log("[Entry] Starting processing pipeline...")

    // Step 1: Intent Classification
    console.log("[Agent 1] Classifying intent...")
    const intent = await classifyIntent(trimmedText)

    // Use user-provided type if valid, otherwise use AI-classified type
    const finalType: EntryType =
      userProvidedType && ENTRY_TYPES.includes(userProvidedType)
        ? userProvidedType
        : intent.type

    // Step 2: Emotional Analysis
    console.log("[Agent 2] Analyzing emotion...")
    const emotion = await analyzeEmotion(trimmedText, finalType)

    // Step 3: Theme Extraction
    console.log("[Agent 3] Extracting themes...")
    const themes = await extractThemes(trimmedText, finalType, emotion.inferredMode)

    // Step 4: Insight Generation
    console.log("[Agent 4] Generating insights...")
    const insights = await generateInsights(trimmedText, { intent, emotion, themes })

    // Create timestamp
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    const timestampStr = now.toISOString()

    // Calculate word count
    const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length

    // Combine all fields for Airtable
    const entryFields: AirtableEntryFields = {
      Name: intent.name,
      Type: finalType,
      Date: dateStr,
      Timestamp: timestampStr,
      Text: trimmedText,
      "Inferred Mode": emotion.inferredMode,
      "Inferred Energy": emotion.inferredEnergy,
      "Energy Shape": emotion.energyShape,
      Contradiction: themes.contradiction || undefined,
      Snapshot: intent.snapshot,
      Loops: themes.loops || undefined,
      "Next Action": insights.nextAction,
      "Meta Flag": "Web App",
      "Is Summary?": false,
      "Summary (AI)": insights.summaryAI,
      "Actionable Insights (AI)": insights.actionableInsightsAI,
      "Entry Sentiment (AI)": emotion.sentimentAI,
      "Entry Theme Tags (AI)": themes.themeTagsAI.join(", "),
      "Entry Length (Words)": wordCount,
    }

    console.log("[Entry] Pushing to Airtable with fields:", JSON.stringify(entryFields, null, 2))
    const record = await createAirtableEntry(entryFields)

    const processingResult: ProcessingResult = {
      intent,
      emotion,
      themes,
      insights,
      tokensUsed: totalTokens,
    }

    console.log("[Entry] Successfully processed and stored entry:", record.id)

    return res.json({
      success: true,
      entry: {
        id: record.id,
        fields: record.fields as unknown as Record<string, unknown>,
      },
      processing: processingResult,
    })
  } catch (error) {
    console.error("[Entry] Processing failed:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
}

/**
 * Update an existing entry - re-runs the full AI pipeline
 * PATCH /api/entry/:id
 */
export async function updateEntry(
  req: Request<{ id: string }, object, { text: string; type?: EntryType }>,
  res: Response
) {
  const { id: recordId } = req.params
  const { text, type: userProvidedType } = req.body

  if (!recordId) {
    return res.status(400).json({ success: false, error: "Record ID is required" })
  }

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ success: false, error: "Text is required" })
  }

  const trimmedText = text.trim()

  try {
    console.log(`[Entry] Updating entry ${recordId}...`)

    // Run the full 4-agent AI pipeline
    console.log("[Agent 1] Classifying intent...")
    const intent = await classifyIntent(trimmedText)

    const finalType: EntryType =
      userProvidedType && ENTRY_TYPES.includes(userProvidedType)
        ? userProvidedType
        : intent.type

    console.log("[Agent 2] Analyzing emotion...")
    const emotion = await analyzeEmotion(trimmedText, finalType)

    console.log("[Agent 3] Extracting themes...")
    const themes = await extractThemes(trimmedText, finalType, emotion.inferredMode)

    console.log("[Agent 4] Generating insights...")
    const insights = await generateInsights(trimmedText, { intent, emotion, themes })

    // Calculate word count
    const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length

    // Update fields (preserve original Date/Timestamp)
    const updateFields: Partial<AirtableEntryFields> = {
      Name: intent.name,
      Type: finalType,
      Text: trimmedText,
      "Inferred Mode": emotion.inferredMode,
      "Inferred Energy": emotion.inferredEnergy,
      "Energy Shape": emotion.energyShape,
      Contradiction: themes.contradiction || undefined,
      Snapshot: intent.snapshot,
      Loops: themes.loops || undefined,
      "Next Action": insights.nextAction,
      "Summary (AI)": insights.summaryAI,
      "Actionable Insights (AI)": insights.actionableInsightsAI,
      "Entry Sentiment (AI)": emotion.sentimentAI,
      "Entry Theme Tags (AI)": themes.themeTagsAI.join(", "),
      "Entry Length (Words)": wordCount,
    }

    const record = await updateAirtableEntry(recordId, updateFields)
    console.log(`[Entry] Successfully updated entry: ${record.id}`)

    return res.json({
      success: true,
      entry: {
        id: record.id,
        fields: record.fields as unknown as Record<string, unknown>,
      },
    })
  } catch (error) {
    console.error("[Entry] Update failed:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return res.status(500).json({ success: false, error: errorMessage })
  }
}

/**
 * Soft delete an entry - sets Is Deleted? = true
 * DELETE /api/entry/:id
 */
export async function deleteEntry(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id: recordId } = req.params

  if (!recordId) {
    return res.status(400).json({ success: false, error: "Record ID is required" })
  }

  try {
    console.log(`[Entry] Soft deleting entry ${recordId}...`)
    const record = await updateAirtableEntry(recordId, { "Is Deleted?": true })
    console.log(`[Entry] Successfully soft deleted entry: ${record.id}`)

    return res.json({
      success: true,
      entry: {
        id: record.id,
        fields: record.fields as unknown as Record<string, unknown>,
      },
    })
  } catch (error) {
    console.error("[Entry] Delete failed:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return res.status(500).json({ success: false, error: errorMessage })
  }
}

/**
 * Toggle bookmark status on an entry
 * PATCH /api/entry/:id/bookmark
 */
export async function toggleBookmark(
  req: Request<{ id: string }, object, { bookmarked: boolean }>,
  res: Response
) {
  const { id: recordId } = req.params
  const { bookmarked } = req.body

  if (!recordId) {
    return res.status(400).json({ success: false, error: "Record ID is required" })
  }

  if (typeof bookmarked !== "boolean") {
    return res.status(400).json({ success: false, error: "bookmarked (boolean) is required" })
  }

  try {
    console.log(`[Entry] Setting bookmark=${bookmarked} for entry ${recordId}...`)
    const record = await updateAirtableEntry(recordId, { "Is Bookmarked?": bookmarked })
    console.log(`[Entry] Successfully updated bookmark for entry: ${record.id}`)

    return res.json({
      success: true,
      entry: {
        id: record.id,
        fields: record.fields as unknown as Record<string, unknown>,
      },
    })
  } catch (error) {
    console.error("[Entry] Toggle bookmark failed:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return res.status(500).json({ success: false, error: errorMessage })
  }
}

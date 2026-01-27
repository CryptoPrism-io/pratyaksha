// Entry Processing Route - Orchestrates the 4-agent pipeline
import { Request, Response } from "express"
import { classifyIntent } from "../agents/intentAgent"
import { analyzeEmotion } from "../agents/emotionAgent"
import { extractThemes } from "../agents/themeAgent"
import { generateInsights } from "../agents/insightAgent"
import { analyzeForDecomposition } from "../agents/decompositionAgent"
import { createAirtableEntry, updateAirtableEntry, AirtableEntryFields } from "../lib/airtable"
import {
  ProcessEntryRequest,
  ProcessEntryResponse,
  ProcessingResult,
  EntryType,
  EntryFormat,
  ENTRY_TYPES,
  ENTRY_FORMATS,
  ChildEntryResult,
} from "../types"

/**
 * Process a single piece of text through the 4-agent pipeline
 * Returns the processing result and fields for Airtable
 */
async function processTextThroughPipeline(
  text: string,
  userProvidedType?: EntryType,
  userProvidedFormat?: EntryFormat
) {
  // Step 1: Intent Classification
  console.log("[Agent 1] Classifying intent...")
  const intent = await classifyIntent(text)

  // Use user-provided type/format if valid, otherwise use AI-classified
  const finalType: EntryType =
    userProvidedType && ENTRY_TYPES.includes(userProvidedType)
      ? userProvidedType
      : intent.type

  const finalFormat: EntryFormat =
    userProvidedFormat && ENTRY_FORMATS.includes(userProvidedFormat)
      ? userProvidedFormat
      : intent.format

  // Step 2: Emotional Analysis
  console.log("[Agent 2] Analyzing emotion...")
  const emotion = await analyzeEmotion(text, finalType)

  // Step 3: Theme Extraction
  console.log("[Agent 3] Extracting themes...")
  const themes = await extractThemes(text, finalType, emotion.inferredMode)

  // Step 4: Insight Generation
  console.log("[Agent 4] Generating insights...")
  const insights = await generateInsights(text, { intent, emotion, themes })

  return { intent, emotion, themes, insights, finalType, finalFormat }
}

export async function processEntry(
  req: Request<object, object, ProcessEntryRequest & { userId?: string }>,
  res: Response<ProcessEntryResponse>
) {
  const { text, type: userProvidedType, format: userProvidedFormat, autoDecompose = true, userId } = req.body

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

    // Process the main entry through the pipeline
    const { intent, emotion, themes, insights, finalType, finalFormat } =
      await processTextThroughPipeline(trimmedText, userProvidedType, userProvidedFormat)

    // Create timestamp
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    const timestampStr = now.toISOString()

    // Calculate word count
    const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length

    // Check if decomposition is needed and enabled
    let decomposition = undefined
    const childEntries: ChildEntryResult[] = []
    let isDecomposed = false

    if (autoDecompose && (intent.isConsolidated || finalFormat === "Consolidated" || finalFormat === "End of Day")) {
      console.log("[Agent 5] Analyzing for decomposition...")
      decomposition = await analyzeForDecomposition(trimmedText)

      if (decomposition.shouldDecompose && decomposition.events.length > 1) {
        console.log(`[Decomposition] Detected ${decomposition.eventCount} events, creating child entries...`)
        isDecomposed = true
      }
    }

    // Combine all fields for the parent/main Airtable entry
    const entryFields: AirtableEntryFields = {
      Name: intent.name,
      Type: finalType,
      Date: dateStr,
      Timestamp: timestampStr,
      Text: trimmedText,
      User_ID: userId,
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
      // NOTE: Decomposition fields disabled until Airtable schema is updated
      // "Entry Format": finalFormat,
      // "Is Decomposed?": isDecomposed,
      // "Decomposition Count": isDecomposed ? decomposition!.eventCount : undefined,
      // "Overarching Theme": decomposition?.overarchingTheme || undefined,
    }

    console.log("[Entry] Pushing parent entry to Airtable...")
    const parentRecord = await createAirtableEntry(entryFields)

    // If decomposition is needed, process and create child entries
    if (isDecomposed && decomposition) {
      console.log("[Entry] Processing child entries...")

      for (const event of decomposition.events) {
        try {
          console.log(`[Child Entry ${event.sequenceOrder}] Processing: "${event.text.substring(0, 50)}..."`)

          // Process each child event through the full pipeline
          const childProcessing = await processTextThroughPipeline(
            event.text,
            event.suggestedType,
            "Daily Log" // Child entries are always Daily Log format
          )

          const childWordCount = event.text.split(/\s+/).filter(word => word.length > 0).length

          const childFields: AirtableEntryFields = {
            Name: childProcessing.intent.name,
            Type: childProcessing.finalType,
            Date: dateStr,
            Timestamp: timestampStr,
            Text: event.text,
            User_ID: userId,
            "Inferred Mode": childProcessing.emotion.inferredMode,
            "Inferred Energy": childProcessing.emotion.inferredEnergy,
            "Energy Shape": childProcessing.emotion.energyShape,
            Contradiction: childProcessing.themes.contradiction || undefined,
            Snapshot: childProcessing.intent.snapshot,
            Loops: childProcessing.themes.loops || undefined,
            "Next Action": childProcessing.insights.nextAction,
            "Meta Flag": "Decomposed Entry",
            "Is Summary?": false,
            "Summary (AI)": childProcessing.insights.summaryAI,
            "Actionable Insights (AI)": childProcessing.insights.actionableInsightsAI,
            "Entry Sentiment (AI)": childProcessing.emotion.sentimentAI,
            "Entry Theme Tags (AI)": childProcessing.themes.themeTagsAI.join(", "),
            "Entry Length (Words)": childWordCount,
            // NOTE: Child-specific fields disabled until Airtable schema is updated
            // "Entry Format": "Daily Log",
            // "Parent Entry ID": parentRecord.id,
            // "Sequence Order": event.sequenceOrder,
            // "Approximate Time": event.approximateTime || undefined,
          }

          const childRecord = await createAirtableEntry(childFields)

          childEntries.push({
            id: childRecord.id,
            parentId: parentRecord.id,
            sequenceOrder: event.sequenceOrder,
            fields: childRecord.fields as unknown as Record<string, unknown>,
          })

          console.log(`[Child Entry ${event.sequenceOrder}] Created: ${childRecord.id}`)
        } catch (childError) {
          console.error(`[Child Entry ${event.sequenceOrder}] Failed:`, childError)
          // Continue processing other children even if one fails
        }
      }
    }

    const processingResult: ProcessingResult = {
      intent,
      emotion,
      themes,
      insights,
      tokensUsed: totalTokens,
      decomposition,
    }

    console.log("[Entry] Successfully processed and stored entry:", parentRecord.id)
    if (childEntries.length > 0) {
      console.log(`[Entry] Created ${childEntries.length} child entries`)
    }

    return res.json({
      success: true,
      entry: {
        id: parentRecord.id,
        fields: parentRecord.fields as unknown as Record<string, unknown>,
      },
      processing: processingResult,
      childEntries: childEntries.length > 0 ? childEntries : undefined,
      decomposed: isDecomposed,
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
  req: Request<{ id: string }, object, { text: string; type?: EntryType; format?: EntryFormat }>,
  res: Response
) {
  const { id: recordId } = req.params
  const { text, type: userProvidedType, format: userProvidedFormat } = req.body

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
    const { intent, emotion, themes, insights, finalType, finalFormat } =
      await processTextThroughPipeline(trimmedText, userProvidedType, userProvidedFormat)

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
      // NOTE: Decomposition fields disabled until Airtable schema is updated
      // "Entry Format": finalFormat,
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

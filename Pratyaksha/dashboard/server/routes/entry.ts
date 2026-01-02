// Entry Processing Route - Orchestrates the 4-agent pipeline
import { Request, Response } from "express"
import { classifyIntent } from "../agents/intentAgent"
import { analyzeEmotion } from "../agents/emotionAgent"
import { extractThemes } from "../agents/themeAgent"
import { generateInsights } from "../agents/insightAgent"
import { createAirtableEntry, AirtableEntryFields } from "../lib/airtable"
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

    // Combine all fields for Airtable
    // Note: "Entry Length (Words)" is a formula field, so we don't send it
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
      "Is Summary?": false,
      "Summary (AI)": insights.summaryAI,
      "Actionable Insights (AI)": insights.actionableInsightsAI,
      "Entry Sentiment (AI)": emotion.sentimentAI,
      "Entry Theme Tags (AI)": themes.themeTagsAI.join(", "),
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

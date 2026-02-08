// Entry Processing Route - Orchestrates the 4-agent pipeline
import { Request, Response } from "express"
import { classifyIntent } from "../agents/intentAgent"
import { analyzeEmotion } from "../agents/emotionAgent"
import { extractThemes } from "../agents/themeAgent"
import { generateInsights } from "../agents/insightAgent"
import { analyzeForDecomposition } from "../agents/decompositionAgent"
import { createEntry as dbCreateEntry, updateEntry as dbUpdateEntry, getUserProfile, type EntryRecord } from "../lib/db"
import { embedEntry } from "../lib/embeddings"
import {
  type UserContext,
  createEmptyUserContext,
} from "../lib/userContextBuilder"
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
 * Build a UserContext from a user profile fetched from the database.
 * Returns undefined if no profile exists (agents fall back to generic behavior).
 */
async function buildUserContextFromProfile(userId?: string): Promise<UserContext | undefined> {
  if (!userId) return undefined;

  try {
    const profile = await getUserProfile(userId);
    if (!profile) return undefined;

    const ctx: UserContext = createEmptyUserContext();

    // Profile basics
    ctx.profile.displayName = profile.displayName || "";
    ctx.profile.ageRange = profile.personalization?.ageRange || null;
    ctx.profile.profession = profile.personalization?.profession || null;
    ctx.profile.stressLevel = profile.personalization?.stressLevel || null;
    ctx.profile.emotionalOpenness = profile.personalization?.emotionalOpenness || null;
    ctx.profile.personalGoal = profile.personalization?.personalGoal || null;
    ctx.profile.selectedMemoryTopics = profile.personalization?.selectedMemoryTopics || [];

    // Life blueprint
    if (profile.lifeBlueprint) {
      ctx.blueprint.vision = (profile.lifeBlueprint.vision || []).map(v => ({
        text: v.text,
        category: v.category || "other",
      }));
      ctx.blueprint.antiVision = (profile.lifeBlueprint.antiVision || []).map(v => ({
        text: v.text,
        category: v.category || "other",
      }));
      ctx.blueprint.levers = (profile.lifeBlueprint.levers || []).map(l => ({
        name: l.name,
        description: l.description || "",
        pushesToward: l.pushesToward || "vision",
      }));
      ctx.blueprint.completedSections = profile.lifeBlueprint.completedSections || [];

      // Time horizon goals
      const thGoals = profile.lifeBlueprint.timeHorizonGoals || [];
      for (const g of thGoals) {
        if (g.completed) continue;
        const horizon = g.horizon as keyof typeof ctx.blueprint.timeHorizonGoals;
        if (horizon && ctx.blueprint.timeHorizonGoals[horizon]) {
          ctx.blueprint.timeHorizonGoals[horizon].push(g.text);
        }
      }

      // Key reflections
      const responses = profile.lifeBlueprint.responses || [];
      for (const r of responses) {
        ctx.blueprint.keyReflections[r.questionId] = r.answer;
      }
    }

    // Gamification stats (for completeness, though agents skip these)
    if (profile.gamification) {
      ctx.stats.totalEntries = (profile.gamification as any).totalEntriesLogged || 0;
      ctx.stats.streakDays = (profile.gamification as any).streakDays || 0;
      ctx.stats.karmaPoints = (profile.gamification as any).karma || 0;
    }

    // Soul mapping
    if (profile.gamification && (profile.gamification as any).completedSoulMappingTopics) {
      ctx.soulMapping.completedTopics = (profile.gamification as any).completedSoulMappingTopics || [];
      ctx.soulMapping.totalCompleted = ctx.soulMapping.completedTopics.length;
    }

    return ctx;
  } catch (err) {
    console.warn("[Entry] Failed to build user context, proceeding without personalization:", err);
    return undefined;
  }
}

/**
 * Process a single piece of text through the 4-agent pipeline
 * Returns the processing result and fields for Airtable
 */
async function processTextThroughPipeline(
  text: string,
  userProvidedType?: EntryType,
  userProvidedFormat?: EntryFormat,
  userContext?: UserContext
) {
  // Step 1: Intent Classification (light personalization)
  console.log("[Agent 1] Classifying intent...")
  const intent = await classifyIntent(text, userContext)

  // Use user-provided type/format if valid, otherwise use AI-classified
  const finalType: EntryType =
    userProvidedType && ENTRY_TYPES.includes(userProvidedType)
      ? userProvidedType
      : intent.type

  const finalFormat: EntryFormat =
    userProvidedFormat && ENTRY_FORMATS.includes(userProvidedFormat)
      ? userProvidedFormat
      : intent.format

  // Step 2: Emotional Analysis (calibrated to user baselines)
  console.log("[Agent 2] Analyzing emotion...")
  const emotion = await analyzeEmotion(text, finalType, userContext)

  // Step 3: Theme Extraction (goal-aware pattern detection)
  console.log("[Agent 3] Extracting themes...")
  const themes = await extractThemes(text, finalType, emotion.inferredMode, userContext)

  // Step 4: Insight Generation (fully personalized)
  console.log("[Agent 4] Generating insights...")
  const insights = await generateInsights(text, { intent, emotion, themes }, userContext)

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
    // Build user context for personalized pipeline (graceful fallback if unavailable)
    const userContext = await buildUserContextFromProfile(userId)
    if (userContext) {
      console.log("[Entry] User context loaded — pipeline will be personalized")
    }

    console.log("[Entry] Starting processing pipeline...")

    // Process the main entry through the pipeline
    const { intent, emotion, themes, insights, finalType, finalFormat } =
      await processTextThroughPipeline(trimmedText, userProvidedType, userProvidedFormat, userContext)

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

    // Build entry fields for PostgreSQL
    console.log("[Entry] Pushing parent entry to PostgreSQL...")
    const parentRecord = await dbCreateEntry({
      userId: userId || "",
      text: trimmedText,
      name: intent.name,
      type: finalType,
      format: finalFormat,
      date: dateStr,
      snapshot: intent.snapshot,
      inferredMode: emotion.inferredMode,
      inferredEnergy: emotion.inferredEnergy,
      energyShape: emotion.energyShape,
      sentiment: emotion.sentimentAI,
      contradiction: themes.contradiction || undefined,
      themeTags: themes.themeTagsAI,
      loops: themes.loops || undefined,
      summaryAi: insights.summaryAI,
      actionableInsightsAi: insights.actionableInsightsAI,
      nextAction: insights.nextAction,
      entryLengthWords: wordCount,
      metaFlag: "Web App",
      isSummary: false,
      isDecomposed,
      decompositionCount: isDecomposed ? decomposition!.eventCount : 0,
      overarchingTheme: decomposition?.overarchingTheme || undefined,
    })

    // Generate embedding for RAG (non-blocking)
    embedEntry(parentRecord.id, userId || "", trimmedText).catch(() => {})

    // If decomposition is needed, process and create child entries
    if (isDecomposed && decomposition) {
      console.log("[Entry] Processing child entries...")

      for (const event of decomposition.events) {
        try {
          console.log(`[Child Entry ${event.sequenceOrder}] Processing: "${event.text.substring(0, 50)}..."`)

          // Process each child event through the full pipeline (with same user context)
          const childProcessing = await processTextThroughPipeline(
            event.text,
            event.suggestedType,
            "Daily Log", // Child entries are always Daily Log format
            userContext
          )

          const childWordCount = event.text.split(/\s+/).filter(word => word.length > 0).length

          const childRecord = await dbCreateEntry({
            userId: userId || "",
            text: event.text,
            name: childProcessing.intent.name,
            type: childProcessing.finalType,
            format: "Daily Log",
            date: dateStr,
            snapshot: childProcessing.intent.snapshot,
            inferredMode: childProcessing.emotion.inferredMode,
            inferredEnergy: childProcessing.emotion.inferredEnergy,
            energyShape: childProcessing.emotion.energyShape,
            sentiment: childProcessing.emotion.sentimentAI,
            contradiction: childProcessing.themes.contradiction || undefined,
            themeTags: childProcessing.themes.themeTagsAI,
            loops: childProcessing.themes.loops || undefined,
            summaryAi: childProcessing.insights.summaryAI,
            actionableInsightsAi: childProcessing.insights.actionableInsightsAI,
            nextAction: childProcessing.insights.nextAction,
            entryLengthWords: childWordCount,
            metaFlag: "Decomposed Entry",
            isSummary: false,
            parentEntryId: parentRecord.id,
            sequenceOrder: event.sequenceOrder,
            approximateTime: event.approximateTime || undefined,
          })

          // Generate embedding for child entry (non-blocking)
          embedEntry(childRecord.id, userId || "", event.text).catch(() => {})

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
    const record = await dbUpdateEntry(recordId, {
      name: intent.name,
      type: finalType,
      text: trimmedText,
      inferredMode: emotion.inferredMode,
      inferredEnergy: emotion.inferredEnergy,
      energyShape: emotion.energyShape,
      contradiction: themes.contradiction || undefined,
      snapshot: intent.snapshot,
      loops: themes.loops || undefined,
      nextAction: insights.nextAction,
      summaryAi: insights.summaryAI,
      actionableInsightsAi: insights.actionableInsightsAI,
      sentiment: emotion.sentimentAI,
      themeTags: themes.themeTagsAI,
      entryLengthWords: wordCount,
    })
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
    const record = await dbUpdateEntry(recordId, { isDeleted: true })
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
    const record = await dbUpdateEntry(recordId, { isBookmarked: bookmarked })
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

// AI Chat Route - Full historical context chat with personalization + RAG
import { Request, Response } from "express"
import { MODELS, callChat, callOpenRouter, type ChatMessage } from "../lib/openrouter"
import {
  UserContext,
  buildUserContextPrompt,
  hasPersonalContext,
  createEmptyUserContext
} from "../lib/userContextBuilder"
import { findSimilarEntries, buildRAGContext } from "../lib/embeddings"

import {
  fetchAllEntries as dbFetchAllEntries,
  getUserProfile,
  findUserByFirebaseUid,
  type EntryRecord
} from "../lib/db"

interface ChatRequest {
  message: string
  history?: Array<{
    role: "user" | "assistant"
    content: string
  }>
  // NEW: Optional user context for personalization
  userContext?: UserContext
}

interface RelevantContext {
  visionItems: string[]
  antiVisionItems: string[]
  levers: string[]
  goals: string[]
  keyThemes: string[]
}

// PASS 1: Extract relevant context from user profile based on their query
async function extractRelevantContext(
  query: string,
  userContext: UserContext
): Promise<RelevantContext> {
  const extractionPrompt = `You are analyzing a user's question to determine which parts of their personal context are most relevant.

USER'S QUESTION:
"${query}"

USER'S PERSONAL CONTEXT:

Vision (what they want to move toward):
${userContext.blueprint.vision.map(v => `- ${v.text}`).join('\n') || 'None'}

Anti-Vision (what they want to avoid):
${userContext.blueprint.antiVision.map(v => `- ${v.text}`).join('\n') || 'None'}

Levers (actions that push toward their vision):
${userContext.blueprint.levers.map(l => `- ${l.name}: ${l.description}`).join('\n') || 'None'}

Goals:
${userContext.profile.personalGoal ? `- Primary: ${userContext.profile.personalGoal}` : ''}
${userContext.blueprint.timeHorizonGoals.sixMonths.length > 0 ? `- 6-month: ${userContext.blueprint.timeHorizonGoals.sixMonths.join('; ')}` : ''}

TASK: Identify which context items are MOST relevant to answering their question.

Respond with JSON:
{
  "visionItems": ["exact vision text if relevant", ...],
  "antiVisionItems": ["exact anti-vision text if relevant", ...],
  "levers": ["exact lever name if relevant", ...],
  "goals": ["exact goal text if relevant", ...],
  "keyThemes": ["key themes from their question: imposter syndrome, work-life balance, etc."]
}`

  try {
    const response = await callOpenRouter<RelevantContext>(
      extractionPrompt,
      MODELS.CHEAP,
      "You extract relevant personal context for personalized advice. Respond only with valid JSON."
    )

    return {
      visionItems: response.data.visionItems || [],
      antiVisionItems: response.data.antiVisionItems || [],
      levers: response.data.levers || [],
      goals: response.data.goals || [],
      keyThemes: response.data.keyThemes || []
    }
  } catch (error) {
    console.log("[Chat] Context extraction failed, using fallback", error)
    // Fallback: include everything
    return {
      visionItems: userContext.blueprint.vision.map(v => v.text),
      antiVisionItems: userContext.blueprint.antiVision.map(v => v.text),
      levers: userContext.blueprint.levers.map(l => l.name),
      goals: userContext.profile.personalGoal ? [userContext.profile.personalGoal] : [],
      keyThemes: []
    }
  }
}

// Build explicit requirements for Pass 2
function buildExplicitRequirements(context: RelevantContext, userContext?: UserContext): string {
  const requirements: string[] = []

  requirements.push("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  requirements.push("🎯 CRITICAL PERSONALIZATION REQUIREMENTS")
  requirements.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

  if (context.keyThemes.length > 0) {
    requirements.push(`📌 REQUIRED: Explicitly address these themes: ${context.keyThemes.join(', ')}`)
  }

  if (context.goals.length > 0) {
    requirements.push(`\n🎯 REQUIRED: Reference at least ONE of these exact goals:`)
    context.goals.forEach(g => requirements.push(`   - "${g}"`))
  }

  if (context.visionItems.length > 0) {
    requirements.push(`\n✨ REQUIRED: Reference at least ONE of these vision items:`)
    context.visionItems.forEach(v => requirements.push(`   - "${v}"`))
  }

  if (context.antiVisionItems.length > 0) {
    requirements.push(`\n⚠️ REQUIRED: If relevant, warn about these anti-vision patterns:`)
    context.antiVisionItems.forEach(av => requirements.push(`   - "${av}"`))
  }

  if (context.levers.length > 0) {
    requirements.push(`\n🎚️ CRITICAL REQUIREMENT - LEVERS:`)
    requirements.push(`You MUST suggest at least ONE of these SPECIFIC levers by name.`)
    requirements.push(`Do NOT use generic advice - use the EXACT lever name and action:`)
    context.levers.forEach(leverName => {
      // Find full lever details from userContext if available
      if (userContext) {
        const lever = userContext.blueprint.levers.find(l => l.name === leverName)
        if (lever) {
          requirements.push(`   ✓ LEVER: "${lever.name}" → ACTION: ${lever.description}`)
        } else {
          requirements.push(`   ✓ ${leverName}`)
        }
      } else {
        requirements.push(`   ✓ ${leverName}`)
      }
    })
    requirements.push(`EXAMPLE: "Consider ${context.levers[0]}" or "Try ${context.levers[0]} this week"`)
  }

  requirements.push("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  requirements.push("⚡ MANDATORY COMPLIANCE:")
  requirements.push("   • Use EXACT terminology from above (copy-paste the quoted text)")
  requirements.push("   • Reference items by their SPECIFIC names (not generic equivalents)")
  requirements.push("   • If levers are listed, you MUST suggest at least one BY NAME")
  requirements.push("   • Do NOT paraphrase - use the exact words the user wrote\n")

  return requirements.join('\n')
}

// fetchAllEntries is now imported from lib/db

// Create a compressed context summary from entries
function createContextSummary(entries: EntryRecord[]): string {
  if (entries.length === 0) {
    return "No journal entries found."
  }

  // Basic stats
  const totalEntries = entries.length
  const dates = entries.map(e => e.fields.Date).filter(Boolean) as string[]
  const firstDate = dates[dates.length - 1]
  const lastDate = dates[0]

  // Count modes
  const modeCounts: Record<string, number> = {}
  entries.forEach(e => {
    const mode = e.fields["Inferred Mode"]
    if (mode) modeCounts[mode] = (modeCounts[mode] || 0) + 1
  })
  const topModes = Object.entries(modeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([mode, count]) => `${mode} (${count})`)

  // Count energy shapes
  const energyCounts: Record<string, number> = {}
  entries.forEach(e => {
    const shape = e.fields["Energy Shape"]
    if (shape) energyCounts[shape] = (energyCounts[shape] || 0) + 1
  })
  const topEnergy = Object.entries(energyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([shape, count]) => `${shape} (${count})`)

  // Count contradictions
  const contradictionCounts: Record<string, number> = {}
  entries.forEach(e => {
    const contradiction = e.fields.Contradiction
    if (contradiction) contradictionCounts[contradiction] = (contradictionCounts[contradiction] || 0) + 1
  })
  const topContradictions = Object.entries(contradictionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c, count]) => `${c} (${count})`)

  // Count sentiments
  const sentimentCounts: Record<string, number> = { positive: 0, negative: 0, neutral: 0 }
  entries.forEach(e => {
    const sentiment = e.fields["Entry Sentiment (AI)"]?.toLowerCase() || "neutral"
    if (sentiment.includes("positive")) sentimentCounts.positive++
    else if (sentiment.includes("negative")) sentimentCounts.negative++
    else sentimentCounts.neutral++
  })

  // Count entry types
  const typeCounts: Record<string, number> = {}
  entries.forEach(e => {
    const type = e.fields.Type
    if (type) typeCounts[type] = (typeCounts[type] || 0) + 1
  })
  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => `${type} (${count})`)

  // Collect all themes
  const themeCounts: Record<string, number> = {}
  entries.forEach(e => {
    const themes = e.fields["Entry Theme Tags (AI)"]
    if (themes) {
      themes.split(",").forEach(t => {
        const theme = t.trim()
        if (theme) themeCounts[theme] = (themeCounts[theme] || 0) + 1
      })
    }
  })
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([theme, count]) => `${theme} (${count})`)

  // Get recent entries (last 10) with snapshots for context
  const recentEntries = entries.slice(0, 10).map(e => ({
    date: e.fields.Date,
    type: e.fields.Type,
    mode: e.fields["Inferred Mode"],
    energy: e.fields["Energy Shape"],
    sentiment: e.fields["Entry Sentiment (AI)"],
    snapshot: e.fields.Snapshot || e.fields.Text?.slice(0, 100),
  }))

  return `
JOURNAL OVERVIEW:
- Total entries: ${totalEntries}
- Date range: ${firstDate} to ${lastDate}

EMOTIONAL PATTERNS:
- Top moods: ${topModes.join(", ") || "None recorded"}
- Sentiment breakdown: Positive ${sentimentCounts.positive}, Neutral ${sentimentCounts.neutral}, Negative ${sentimentCounts.negative}

ENERGY PATTERNS:
- Top energy shapes: ${topEnergy.join(", ") || "None recorded"}

INNER CONTRADICTIONS:
- Most common: ${topContradictions.join(", ") || "None recorded"}

ENTRY TYPES:
- Distribution: ${topTypes.join(", ") || "Unknown"}

RECURRING THEMES:
${topThemes.join(", ") || "None identified"}

RECENT ENTRIES (last 10):
${recentEntries.map((e, i) => `${i + 1}. [${e.date}] ${e.type} - ${e.mode} / ${e.energy} / ${e.sentiment}\n   "${e.snapshot}..."`).join("\n")}
`.trim()
}

const SYSTEM_PROMPT_BASE = `You are Pratyaksha AI, a thoughtful and insightful companion for cognitive journaling. You have access to the user's complete journal history and can help them understand patterns, emotions, and growth opportunities.

Your role is to:
1. Provide warm, empathetic responses that feel personal and supportive
2. Identify patterns and insights from their journaling data
3. Offer gentle observations without being preachy or prescriptive
4. Ask clarifying questions when helpful
5. Celebrate growth and progress when you notice it
6. Suggest actionable next steps when appropriate
7. When the user has shared their vision/goals, reference them when discussing direction or progress
8. Gently alert when patterns seem to drift toward their stated anti-vision

Guidelines:
- Be conversational and natural, not clinical
- Reference specific data when relevant (e.g., "I notice you've mentioned X in several entries...")
- Acknowledge the emotional weight of what the user shares
- Keep responses focused and digestible (2-4 paragraphs typically)
- If asked about something not in their data, be honest about limitations
- When the user has defined goals, connect patterns to those goals
- Adjust your tone based on user's stated stress level and emotional openness

IMPORTANT: Return your response as plain text, NOT as JSON. Just write naturally.`

export async function chat(
  req: Request<object, object, ChatRequest>,
  res: Response
) {
  let { message, history = [], userContext } = req.body

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: "Message is required",
    })
  }

  try {
    console.log("[Chat] Processing message...")

    // Load user context from database if not provided or empty
    if (!userContext || Object.keys(userContext).length === 0) {
      const firebaseUid = req.headers['x-firebase-uid'] as string
      if (firebaseUid) {
        console.log(`[Chat] Loading user context from database for ${firebaseUid}`)
        try {
          const user = await findUserByFirebaseUid(firebaseUid)
          if (user) {
            const profile = await getUserProfile(firebaseUid)
            if (profile) {
              // Build context exactly as debug route does
              const ctx: UserContext = createEmptyUserContext()

              // Profile basics
              ctx.profile.displayName = profile.displayName || ""
              ctx.profile.ageRange = profile.personalization?.ageRange || null
              ctx.profile.profession = profile.personalization?.profession || null
              ctx.profile.stressLevel = profile.personalization?.stressLevel || null
              ctx.profile.emotionalOpenness = profile.personalization?.emotionalOpenness || null
              ctx.profile.personalGoal = profile.personalization?.personalGoal || null
              ctx.profile.selectedMemoryTopics = profile.personalization?.selectedMemoryTopics || []

              // Life blueprint
              if (profile.lifeBlueprint) {
                ctx.blueprint.vision = (profile.lifeBlueprint.vision || []).map(v => ({
                  text: v.text,
                  category: v.category || "other",
                }))
                ctx.blueprint.antiVision = (profile.lifeBlueprint.antiVision || []).map(v => ({
                  text: v.text,
                  category: v.category || "other",
                }))
                ctx.blueprint.levers = (profile.lifeBlueprint.levers || []).map(l => ({
                  name: l.name,
                  description: l.description || "",
                  pushesToward: l.pushesToward || "vision",
                }))
                ctx.blueprint.completedSections = profile.lifeBlueprint.completedSections || []

                // Time horizon goals
                const thGoals = profile.lifeBlueprint.timeHorizonGoals || []
                for (const g of thGoals) {
                  if (g.completed) continue
                  const horizon = g.horizon as keyof typeof ctx.blueprint.timeHorizonGoals
                  if (horizon && ctx.blueprint.timeHorizonGoals[horizon]) {
                    ctx.blueprint.timeHorizonGoals[horizon].push(g.text)
                  }
                }

                // Key reflections
                const responses = profile.lifeBlueprint.responses || []
                for (const r of responses) {
                  ctx.blueprint.keyReflections[r.questionId] = r.answer
                }
              }

              // Gamification stats
              if (profile.gamification) {
                ctx.stats.totalEntries = (profile.gamification as any).totalEntriesLogged || 0
                ctx.stats.streakDays = (profile.gamification as any).streakDays || 0
                ctx.stats.karmaPoints = (profile.gamification as any).karma || 0
              }

              // Soul mapping
              if (profile.gamification && (profile.gamification as any).completedSoulMappingTopics) {
                ctx.soulMapping.completedTopics = (profile.gamification as any).completedSoulMappingTopics || []
                ctx.soulMapping.totalCompleted = ctx.soulMapping.completedTopics.length
              }

              userContext = ctx
              console.log("[Chat] User context loaded from database")
            }
          }
        } catch (err) {
          console.log(`[Chat] Could not load user context: ${err}`)
          // Continue without user context
        }
      }
    }

    // Fetch all entries from PostgreSQL and create context
    const entries = await dbFetchAllEntries()
    const contextSummary = createContextSummary(entries)

    console.log(`[Chat] Loaded ${entries.length} entries for context`)

    // Two-Pass Generation for Better Personalization
    let personalContextSection = ""
    let explicitRequirements = ""

    if (userContext && hasPersonalContext(userContext)) {
      // PASS 1: Extract relevant context based on user's query
      const relevantContext = await extractRelevantContext(message, userContext)
      console.log("[Chat] Pass 1: Extracted relevant context", relevantContext)

      // PASS 2: Build explicit requirements for response generation
      explicitRequirements = buildExplicitRequirements(relevantContext, userContext)
      personalContextSection = buildUserContextPrompt(userContext)
      console.log("[Chat] Pass 2: Built explicit requirements for response generation")
    }

    // RAG: Find semantically similar entries to the user's message
    let ragContext = ""
    try {
      const similarEntries = await findSimilarEntries(message, 5)
      if (similarEntries.length > 0) {
        ragContext = buildRAGContext(similarEntries)
        console.log(`[Chat] RAG: Found ${similarEntries.length} similar entries`)
      }
    } catch (ragError) {
      // RAG is best-effort — don't block chat if embeddings aren't available
      console.log("[Chat] RAG unavailable (embeddings may not be indexed yet)")
    }

    // Build messages array with optional personalization + RAG + explicit requirements
    const chatMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT_BASE },
      // Inject personal context if available (before journal data)
      ...(personalContextSection ? [{ role: "system" as const, content: personalContextSection }] : []),
      { role: "system", content: `Here is the user's journal data:\n\n${contextSummary}${ragContext}` },
      // Inject explicit requirements from Pass 1
      ...(explicitRequirements ? [{ role: "system" as const, content: explicitRequirements }] : []),
      // Include recent history (last 10 exchanges)
      ...history.slice(-10).map(h => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ]

    // Call LangChain chat (plain text, not JSON)
    const { text: aiResponse, tokens } = await callChat(
      chatMessages,
      MODELS.CHEAP,
      { maxTokens: 800, temperature: 0.7 }
    )

    console.log(`[Chat] Response generated (${tokens} tokens)`)

    return res.json({
      success: true,
      response: aiResponse,
      tokensUsed: tokens,
    })

  } catch (error) {
    console.error("[Chat] Error:", error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Chat request failed",
    })
  }
}

// AI Chat Route - Full historical context chat with personalization
import { Request, Response } from "express"
import { MODELS, callChat, type ChatMessage } from "../lib/openrouter"
import {
  UserContext,
  buildUserContextPrompt,
  hasPersonalContext
} from "../lib/userContextBuilder"

import { fetchAllEntries as dbFetchAllEntries, type EntryRecord } from "../lib/db"

interface ChatRequest {
  message: string
  history?: Array<{
    role: "user" | "assistant"
    content: string
  }>
  // NEW: Optional user context for personalization
  userContext?: UserContext
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
  const { message, history = [], userContext } = req.body

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: "Message is required",
    })
  }

  try {
    console.log("[Chat] Processing message...")

    // Fetch all entries from PostgreSQL and create context
    const entries = await dbFetchAllEntries()
    const contextSummary = createContextSummary(entries)

    console.log(`[Chat] Loaded ${entries.length} entries for context`)

    // Build personalized context if available
    let personalContextSection = ""
    if (userContext && hasPersonalContext(userContext)) {
      personalContextSection = buildUserContextPrompt(userContext)
      console.log("[Chat] User context included for personalization")
    }

    // Build messages array with optional personalization
    const chatMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT_BASE },
      // Inject personal context if available (before journal data)
      ...(personalContextSection ? [{ role: "system" as const, content: personalContextSection }] : []),
      { role: "system", content: `Here is the user's journal data:\n\n${contextSummary}` },
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

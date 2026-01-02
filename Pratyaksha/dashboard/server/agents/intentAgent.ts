// Intent Agent - Step 1: Classify intent, type, name, and snapshot
import { callOpenRouter, MODELS } from "../lib/openrouter"
import { IntentAgentOutput, ENTRY_TYPES, EntryType } from "../types"

const SYSTEM_PROMPT = `You are an expert journal entry classifier. Your job is to analyze journal entries and classify them accurately.

You MUST respond with valid JSON only. No other text.

Available entry types:
${ENTRY_TYPES.join(", ")}

Guidelines:
- "type": Choose the most fitting category based on the entry's primary focus
- "name": Create a concise, descriptive title (3-6 words) that captures the essence
- "snapshot": Write a 1-2 sentence summary of the key point or insight`

export async function classifyIntent(text: string): Promise<IntentAgentOutput> {
  const prompt = `Analyze this journal entry and classify it.

Entry:
"""
${text}
"""

Respond with JSON:
{
  "type": "<one of the available types>",
  "name": "<creative 3-6 word title>",
  "snapshot": "<1-2 sentence summary>"
}`

  const response = await callOpenRouter<IntentAgentOutput>(
    prompt,
    MODELS.CHEAP,
    SYSTEM_PROMPT
  )

  // Validate the type is in our allowed list
  const validType = ENTRY_TYPES.includes(response.data.type as EntryType)
    ? response.data.type
    : "Reflection" // Default fallback

  return {
    type: validType as EntryType,
    name: response.data.name || "Untitled Entry",
    snapshot: response.data.snapshot || text.substring(0, 100),
  }
}

// Intent Agent - Step 1: Classify intent, type, format, name, and snapshot
import { callOpenRouter, MODELS } from "../lib/openrouter"
import { IntentAgentOutput, ENTRY_TYPES, ENTRY_FORMATS, EntryType, EntryFormat } from "../types"
import { type UserContext } from "../lib/userContextBuilder"

const SYSTEM_PROMPT = `You are an expert journal entry classifier. Your job is to analyze journal entries and classify them accurately.

You MUST respond with valid JSON only. No other text.

Available entry types (content classification):
${ENTRY_TYPES.join(", ")}

Available entry formats (structure classification):
- "Quick Log": Brief, single moment capture (1-2 sentences about one thing)
- "Daily Log": Individual event during the day (one distinct experience/moment)
- "End of Day": Comprehensive day reflection (may reference multiple moments but as a unified reflection)
- "Consolidated": Multiple distinct events/moments bundled together (clearly separate experiences in one entry)

Guidelines:
- "type": Choose the most fitting category based on the entry's PRIMARY focus
- "format": Identify the structural format of the entry
- "isConsolidated": Set to true ONLY if the entry contains 2+ clearly distinct events/moments that could each be their own entry
- "name": Create a concise, descriptive title (3-6 words) that captures the essence
- "snapshot": Write a 1-2 sentence summary of the key point or insight

Indicators of consolidated entries:
- Multiple time markers: "this morning... later... tonight..."
- Distinct context switches: different locations, people, or activities
- Emotional shifts between sections
- List-like structure of separate events
- Clear narrative breaks between unrelated moments`

export async function classifyIntent(text: string, userContext?: UserContext): Promise<IntentAgentOutput> {
  // Light personalization: profession + goal help generate relevant names/snapshots
  let contextHint = "";
  if (userContext) {
    const parts: string[] = [];
    if (userContext.profile.profession) parts.push(`The writer's profession: ${userContext.profile.profession}.`);
    if (userContext.profile.personalGoal) parts.push(`Their primary goal: ${userContext.profile.personalGoal}.`);
    if (parts.length > 0) {
      contextHint = `\nWriter context (use this to create a more relevant name and snapshot):\n${parts.join(" ")}\n`;
    }
  }

  const prompt = `Analyze this journal entry and classify it.
${contextHint}
Entry:
"""
${text}
"""

Respond with JSON:
{
  "type": "<one of the available types>",
  "format": "<Quick Log | Daily Log | End of Day | Consolidated>",
  "isConsolidated": <true if contains 2+ distinct events that could be separate entries, false otherwise>,
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

  // Validate the format is in our allowed list
  const validFormat = ENTRY_FORMATS.includes(response.data.format as EntryFormat)
    ? response.data.format
    : "Quick Log" // Default fallback

  return {
    type: validType as EntryType,
    format: validFormat as EntryFormat,
    isConsolidated: response.data.isConsolidated === true,
    name: response.data.name || "Untitled Entry",
    snapshot: response.data.snapshot || text.substring(0, 100),
  }
}

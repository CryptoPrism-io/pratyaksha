// Decomposition Agent - Splits consolidated logs into individual events
import { callOpenRouter, MODELS } from "../lib/openrouter"
import { DecompositionAgentOutput, DecomposedEvent, ENTRY_TYPES, EntryType } from "../types"

const SYSTEM_PROMPT = `You are an expert journal entry analyzer specializing in identifying and separating distinct events, moments, or experiences within consolidated journal entries.

Your job is to:
1. Detect if a journal entry contains MULTIPLE distinct events/moments/experiences
2. If so, extract each event as a separate, self-contained piece of text
3. Preserve the emotional context and details of each event
4. Identify the approximate time or sequence of each event

Guidelines for detection:
- Look for temporal markers: "this morning", "later", "at work", "when I got home", "then", "after that"
- Look for context switches: different locations, different people, different activities
- Look for emotional shifts: mood changes between parts of the entry
- End-of-day entries often contain 3-5 distinct moments
- Quick logs or single-event entries should NOT be decomposed

Guidelines for extraction:
- Each extracted event should be complete and standalone
- Include relevant emotional context from the original
- Preserve the writer's voice and style
- Each event should be at least 1-2 sentences
- Don't artificially split what is clearly a single narrative

Available entry types for suggestions:
${ENTRY_TYPES.join(", ")}

You MUST respond with valid JSON only. No other text.`

export async function analyzeForDecomposition(text: string): Promise<DecompositionAgentOutput> {
  const prompt = `Analyze this journal entry and determine if it contains multiple distinct events that should be separated into individual entries.

Entry:
"""
${text}
"""

Respond with JSON:
{
  "shouldDecompose": <true if entry contains 2+ distinct events, false otherwise>,
  "eventCount": <number of distinct events detected, 1 if single event>,
  "events": [
    {
      "text": "<extracted event text, complete and standalone>",
      "approximateTime": "<when this happened: 'morning', 'afternoon', 'evening', 'night', or specific time if mentioned>",
      "sequenceOrder": <1, 2, 3... order of occurrence>,
      "suggestedType": "<most fitting entry type from the list>"
    }
  ],
  "overarchingTheme": "<if decomposing, what theme connects all events? null if not decomposing>",
  "decompositionRationale": "<brief explanation of your decision>"
}

Important:
- If shouldDecompose is false, events array should contain just one event with the original text
- Each event text should be self-contained and make sense on its own
- Preserve emotional nuances and details in each extracted event`

  const response = await callOpenRouter<DecompositionAgentOutput>(
    prompt,
    MODELS.CHEAP,
    SYSTEM_PROMPT
  )

  // Validate and sanitize the response
  const events: DecomposedEvent[] = (response.data.events || []).map((event, index) => ({
    text: event.text || "",
    approximateTime: event.approximateTime || undefined,
    sequenceOrder: event.sequenceOrder || index + 1,
    suggestedType: ENTRY_TYPES.includes(event.suggestedType as EntryType)
      ? event.suggestedType
      : undefined,
  }))

  return {
    shouldDecompose: response.data.shouldDecompose === true && events.length > 1,
    eventCount: Math.max(1, response.data.eventCount || events.length),
    events: events.length > 0 ? events : [{ text, sequenceOrder: 1 }],
    overarchingTheme: response.data.overarchingTheme || undefined,
    decompositionRationale: response.data.decompositionRationale || "No rationale provided",
  }
}

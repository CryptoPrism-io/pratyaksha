// Theme Agent - Step 3: Extract themes, contradictions, and loops
import { callOpenRouter, MODELS } from "../lib/openrouter"
import {
  ThemeAgentOutput,
  CONTRADICTIONS,
  Contradiction,
  EntryType,
  InferredMode,
} from "../types"
import { type UserContext } from "../lib/userContextBuilder"

const SYSTEM_PROMPT = `You are an expert at identifying themes and patterns in journal entries.

You MUST respond with valid JSON only. No other text.

Available contradictions (internal tensions):
${CONTRADICTIONS.join(", ")}

Guidelines:
- "themeTagsAI": Extract 3-5 relevant theme tags that capture key topics
- "contradiction": Identify any internal tension present, or null if none is evident
- "loops": Describe any repetitive thought patterns or recurring themes, or null if none`

export async function extractThemes(
  text: string,
  type: EntryType,
  mode: InferredMode,
  userContext?: UserContext
): Promise<ThemeAgentOutput> {
  // Build goal-aware context for pattern detection
  let goalContext = "";
  if (userContext) {
    const parts: string[] = [];
    if (userContext.profile.personalGoal) {
      parts.push(`The writer's primary goal: ${userContext.profile.personalGoal}.`);
    }
    if (userContext.blueprint.vision.length > 0) {
      const visions = userContext.blueprint.vision.slice(0, 3).map(v => v.text).join("; ");
      parts.push(`Vision (what they want): ${visions}.`);
    }
    if (userContext.blueprint.antiVision.length > 0) {
      const avoids = userContext.blueprint.antiVision.slice(0, 3).map(v => v.text).join("; ");
      parts.push(`Anti-vision (what they want to avoid): ${avoids}.`);
    }
    if (parts.length > 0) {
      goalContext = `\nWriter's direction:\n${parts.join("\n")}\nFlag themes that align with or oppose these stated goals.\n`;
    }
  }

  const prompt = `Extract themes and patterns from this ${type} journal entry. The writer appears to be in a ${mode} state.
${goalContext}
Entry:
"""
${text}
"""

Respond with JSON:
{
  "themeTagsAI": ["tag1", "tag2", "tag3"],
  "contradiction": "<internal tension or null>",
  "loops": "<repetitive patterns or null>"
}`

  const response = await callOpenRouter<{
    themeTagsAI: string[]
    contradiction: string | null
    loops: string | null
  }>(prompt, MODELS.CHEAP, SYSTEM_PROMPT)

  // Validate contradiction is in our list
  const validContradiction =
    response.data.contradiction &&
    CONTRADICTIONS.includes(response.data.contradiction as Contradiction)
      ? (response.data.contradiction as Contradiction)
      : null

  // Ensure themeTagsAI is an array
  const tags = Array.isArray(response.data.themeTagsAI)
    ? response.data.themeTagsAI.slice(0, 5)
    : []

  return {
    themeTagsAI: tags,
    contradiction: validContradiction,
    loops: response.data.loops || null,
  }
}

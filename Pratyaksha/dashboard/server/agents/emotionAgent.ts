// Emotion Agent - Step 2: Analyze mode, energy, and sentiment
import { callOpenRouter, MODELS } from "../lib/openrouter"
import {
  EmotionAgentOutput,
  INFERRED_MODES,
  ENERGY_LEVELS,
  ENERGY_SHAPES,
  SENTIMENTS,
  InferredMode,
  EnergyLevel,
  EnergyShape,
  Sentiment,
  EntryType,
} from "../types"

const SYSTEM_PROMPT = `You are an expert at analyzing emotional and psychological states in journal entries.

You MUST respond with valid JSON only. No other text.

Available inferred modes (psychological states):
${INFERRED_MODES.join(", ")}

Available energy levels:
${ENERGY_LEVELS.join(", ")}

Available energy shapes (how energy feels/moves):
${ENERGY_SHAPES.join(", ")}

Available sentiments:
${SENTIMENTS.join(", ")}

Guidelines:
- "inferredMode": The dominant psychological state evident in the writing
- "inferredEnergy": The overall energy level conveyed
- "energyShape": How the energy feels - its quality and movement pattern
- "sentimentAI": Overall emotional valence of the entry`

export async function analyzeEmotion(
  text: string,
  type: EntryType
): Promise<EmotionAgentOutput> {
  const prompt = `Analyze the emotional and psychological state in this ${type} journal entry.

Entry:
"""
${text}
"""

Respond with JSON:
{
  "inferredMode": "<psychological state>",
  "inferredEnergy": "<energy level>",
  "energyShape": "<energy shape/pattern>",
  "sentimentAI": "<overall sentiment>"
}`

  const response = await callOpenRouter<EmotionAgentOutput>(
    prompt,
    MODELS.CHEAP,
    SYSTEM_PROMPT
  )

  // Validate and provide fallbacks
  const validMode = INFERRED_MODES.includes(response.data.inferredMode as InferredMode)
    ? response.data.inferredMode
    : "Reflective"

  const validEnergy = ENERGY_LEVELS.includes(response.data.inferredEnergy as EnergyLevel)
    ? response.data.inferredEnergy
    : "Moderate"

  const validShape = ENERGY_SHAPES.includes(response.data.energyShape as EnergyShape)
    ? response.data.energyShape
    : "Centered"

  const validSentiment = SENTIMENTS.includes(response.data.sentimentAI as Sentiment)
    ? response.data.sentimentAI
    : "Neutral"

  return {
    inferredMode: validMode as InferredMode,
    inferredEnergy: validEnergy as EnergyLevel,
    energyShape: validShape as EnergyShape,
    sentimentAI: validSentiment as Sentiment,
  }
}

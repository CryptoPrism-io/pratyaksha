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
import { type UserContext } from "../lib/userContextBuilder"

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
  type: EntryType,
  userContext?: UserContext
): Promise<EmotionAgentOutput> {
  // Build calibrated system prompt with user baselines
  let calibratedSystemPrompt = SYSTEM_PROMPT;
  if (userContext) {
    const calibrations: string[] = [];
    if (userContext.profile.profession) {
      calibrations.push(`The writer's profession is: ${userContext.profile.profession}.`);
    }
    if (userContext.profile.stressLevel) {
      calibrations.push(`Baseline stress level: ${userContext.profile.stressLevel}/5. Calibrate emotional intensity relative to this — a high-baseline person expressing "overwhelm" may indicate chronic strain, not acute crisis.`);
    }
    if (userContext.profile.emotionalOpenness) {
      calibrations.push(`Emotional openness: ${userContext.profile.emotionalOpenness}/5. ${userContext.profile.emotionalOpenness >= 4 ? "This person tends to express emotions openly — take their language at face value." : userContext.profile.emotionalOpenness <= 2 ? "This person is emotionally reserved — subtle language may mask deeper feelings." : "Moderate expressiveness."}`);
    }
    if (calibrations.length > 0) {
      calibratedSystemPrompt += `\n\nWriter Calibration Context:\n${calibrations.join("\n")}`;
    }
  }

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
    calibratedSystemPrompt
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

  // Map "Mixed" to "Neutral" since Airtable doesn't have Mixed as an option
  // Cast to string since AI might return values outside the type
  let sentimentValue: string = response.data.sentimentAI as string
  if (sentimentValue === "Mixed") {
    sentimentValue = "Neutral"
  }
  const validSentiment = SENTIMENTS.includes(sentimentValue as Sentiment)
    ? sentimentValue
    : "Neutral"

  return {
    inferredMode: validMode as InferredMode,
    inferredEnergy: validEnergy as EnergyLevel,
    energyShape: validShape as EnergyShape,
    sentimentAI: validSentiment as Sentiment,
  }
}

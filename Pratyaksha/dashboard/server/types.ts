// Shared types for the AI processing pipeline

// Entry Types (from GPT system prompt)
export const ENTRY_TYPES = [
  "Emotional",
  "Cognitive",
  "Family",
  "Work",
  "Relationship",
  "Health",
  "Creativity",
  "Social",
  "Reflection",
  "Decision",
  "Avoidance",
  "Growth",
  "Stress",
  "Communication",
  "Routine",
] as const

export type EntryType = (typeof ENTRY_TYPES)[number]

// Inferred Modes (psychological states)
export const INFERRED_MODES = [
  "Hopeful",
  "Calm",
  "Grounded",
  "Compassionate",
  "Curious",
  "Reflective",
  "Conflicted",
  "Withdrawn",
  "Overthinking",
  "Numb",
  "Anxious",
  "Agitated",
  "Disconnected",
  "Self-critical",
  "Defensive",
] as const

export type InferredMode = (typeof INFERRED_MODES)[number]

// Energy Levels
export const ENERGY_LEVELS = [
  "Very Low",
  "Low",
  "Moderate",
  "Balanced",
  "High",
  "Elevated",
  "Scattered",
  "Drained",
  "Flat",
  "Restorative",
] as const

export type EnergyLevel = (typeof ENERGY_LEVELS)[number]

// Energy Shapes
export const ENERGY_SHAPES = [
  "Flat",
  "Heavy",
  "Chaotic",
  "Rising",
  "Collapsing",
  "Expanding",
  "Contracted",
  "Uneven",
  "Centered",
  "Cyclical",
  "Stabilized",
  "Pulsing",
] as const

export type EnergyShape = (typeof ENERGY_SHAPES)[number]

// Contradictions (internal tensions)
export const CONTRADICTIONS = [
  "Connection vs. Avoidance",
  "Hope vs. Hopelessness",
  "Anger vs. Shame",
  "Control vs. Surrender",
  "Confidence vs. Doubt",
  "Independence vs. Belonging",
  "Closeness vs. Distance",
  "Expression vs. Silence",
  "Self-care vs. Obligation",
  "Ideal vs. Reality",
  "Action vs. Fear",
  "Growth vs. Comfort",
] as const

export type Contradiction = (typeof CONTRADICTIONS)[number]

// Sentiment (Note: Airtable only has these 3 options - "Mixed" is NOT supported)
export const SENTIMENTS = ["Positive", "Negative", "Neutral"] as const
export type Sentiment = (typeof SENTIMENTS)[number]

// Agent Output Types
export interface IntentAgentOutput {
  type: EntryType
  name: string
  snapshot: string
}

export interface EmotionAgentOutput {
  inferredMode: InferredMode
  inferredEnergy: EnergyLevel
  energyShape: EnergyShape
  sentimentAI: Sentiment
}

export interface ThemeAgentOutput {
  themeTagsAI: string[]
  contradiction: Contradiction | null
  loops: string | null
}

export interface InsightAgentOutput {
  summaryAI: string
  actionableInsightsAI: string
  nextAction: string
}

// Combined Processing Result
export interface ProcessingResult {
  intent: IntentAgentOutput
  emotion: EmotionAgentOutput
  themes: ThemeAgentOutput
  insights: InsightAgentOutput
  tokensUsed: number
}

// API Request/Response types
export interface ProcessEntryRequest {
  text: string
  type?: EntryType
}

export interface ProcessEntryResponse {
  success: boolean
  entry?: {
    id: string
    fields: Record<string, unknown>
  }
  processing?: ProcessingResult
  error?: string
}

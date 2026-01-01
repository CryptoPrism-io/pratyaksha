// Airtable API Client for Pratyaksha Dashboard

const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || "appMzFpUZLuZs9VGc"
const TABLE_ID = import.meta.env.VITE_AIRTABLE_TABLE_ID || "tblhKYssgHtjpmbni"

const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`

export interface AirtableRecord {
  id: string
  createdTime: string
  fields: EntryFields
}

export interface EntryFields {
  Name?: string
  Type?: string
  Date?: string
  Timestamp?: string
  Text?: string
  "Inferred Mode"?: string
  "Inferred Energy"?: string
  "Energy Shape"?: string
  Contradiction?: string
  Snapshot?: string
  Loops?: string
  "Next Action"?: string
  "Meta Flag"?: string
  "Is Summary?"?: boolean
  "Summary (AI)"?: string
  "Actionable Insights (AI)"?: string
  "Entry Length (Words)"?: number
  "Days Since Entry"?: number
  "Is Recent?"?: string
  "Entry Sentiment (AI)"?: string | { value: string; state: string }
  "Entry Theme Tags (AI)"?: string | { value: string; state: string }
}

export interface Entry {
  id: string
  name: string
  type: string
  date: string
  timestamp: string
  text: string
  inferredMode: string
  inferredEnergy: string
  energyShape: string
  contradiction: string
  snapshot: string
  loops: string
  nextAction: string
  metaFlag: string
  isSummary: boolean
  summaryAI: string
  actionableInsightsAI: string
  entryLengthWords: number
  daysSinceEntry: number
  isRecent: boolean
  sentimentAI: string
  themeTagsAI: string[]
  createdTime: string
}

function extractAIField(value: string | { value: string; state: string } | undefined): string {
  if (!value) return ""
  if (typeof value === "string") return value
  return value.value || ""
}

function transformRecord(record: AirtableRecord): Entry {
  const fields = record.fields
  const sentimentRaw = extractAIField(fields["Entry Sentiment (AI)"])
  const tagsRaw = extractAIField(fields["Entry Theme Tags (AI)"])

  return {
    id: record.id,
    name: fields.Name || "",
    type: fields.Type || "",
    date: fields.Date || "",
    timestamp: fields.Timestamp || "",
    text: fields.Text || "",
    inferredMode: fields["Inferred Mode"] || "",
    inferredEnergy: fields["Inferred Energy"] || "",
    energyShape: fields["Energy Shape"] || "",
    contradiction: fields.Contradiction || "",
    snapshot: fields.Snapshot || "",
    loops: fields.Loops || "",
    nextAction: fields["Next Action"] || "",
    metaFlag: fields["Meta Flag"] || "",
    isSummary: fields["Is Summary?"] || false,
    summaryAI: fields["Summary (AI)"] || "",
    actionableInsightsAI: fields["Actionable Insights (AI)"] || "",
    entryLengthWords: fields["Entry Length (Words)"] || 0,
    daysSinceEntry: fields["Days Since Entry"] || 0,
    isRecent: fields["Is Recent?"] === "Yes",
    sentimentAI: sentimentRaw,
    themeTagsAI: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()) : [],
    createdTime: record.createdTime,
  }
}

export async function fetchEntries(): Promise<Entry[]> {
  if (!API_KEY) {
    console.warn("No Airtable API key found, using demo data")
    return getDemoData()
  }

  const response = await fetch(`${BASE_URL}?sort[0][field]=Date&sort[0][direction]=desc`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status}`)
  }

  const data = await response.json()
  return data.records.map(transformRecord)
}

// Demo data for development/showcase
function getDemoData(): Entry[] {
  return [
    {
      id: "rec1",
      name: "Morning Anxiety Spike",
      type: "Emotional",
      date: "2026-01-01",
      timestamp: "2026-01-01T08:30:00Z",
      text: "Woke up feeling a surge of anxiety about returning to work...",
      inferredMode: "Anxious",
      inferredEnergy: "High",
      energyShape: "Chaotic",
      contradiction: "Action vs. Fear",
      snapshot: "Anxious morning",
      loops: "Work stress patterns",
      nextAction: "Practice breathing",
      metaFlag: "Auto-Generated",
      isSummary: false,
      summaryAI: "Morning anxiety about work return",
      actionableInsightsAI: "Try grounding exercises",
      entryLengthWords: 45,
      daysSinceEntry: 0,
      isRecent: true,
      sentimentAI: "Negative",
      themeTagsAI: ["anxiety", "work stress", "coping"],
      createdTime: "2026-01-01T08:30:00Z",
    },
    {
      id: "rec2",
      name: "Lost in Debugging Loops",
      type: "Work",
      date: "2026-01-01",
      timestamp: "2026-01-01T14:00:00Z",
      text: "Some stupid bugs and small naming convention errors...",
      inferredMode: "Overthinking",
      inferredEnergy: "Drained",
      energyShape: "Uneven",
      contradiction: "Action vs. Fear",
      snapshot: "Debugging frustration",
      loops: "Perfectionism patterns",
      nextAction: "Take a break",
      metaFlag: "Auto-Generated",
      isSummary: false,
      summaryAI: "Frustration with debugging",
      actionableInsightsAI: "Step away, return fresh",
      entryLengthWords: 38,
      daysSinceEntry: 0,
      isRecent: true,
      sentimentAI: "Negative",
      themeTagsAI: ["debugging", "frustration", "software"],
      createdTime: "2026-01-01T14:00:00Z",
    },
    {
      id: "rec3",
      name: "Small Victory Celebration",
      type: "Creativity",
      date: "2026-01-01",
      timestamp: "2026-01-01T16:30:00Z",
      text: "My custom GPT worked! I was able to send the record to Airtable...",
      inferredMode: "Hopeful",
      inferredEnergy: "Elevated",
      energyShape: "Rising",
      contradiction: "Growth vs. Comfort",
      snapshot: "Victory moment",
      loops: "",
      nextAction: "Build on momentum",
      metaFlag: "Auto-Generated",
      isSummary: false,
      summaryAI: "Celebrated a coding win",
      actionableInsightsAI: "Document what worked",
      entryLengthWords: 32,
      daysSinceEntry: 0,
      isRecent: true,
      sentimentAI: "Positive",
      themeTagsAI: ["achievement", "excitement", "technology"],
      createdTime: "2026-01-01T16:30:00Z",
    },
    {
      id: "rec4",
      name: "Pure Joy and Relief",
      type: "Reflection",
      date: "2026-01-01",
      timestamp: "2026-01-01T18:00:00Z",
      text: "Wow, this is insane! It did not even ask me for confirmation...",
      inferredMode: "Grounded",
      inferredEnergy: "High",
      energyShape: "Expanding",
      contradiction: "Confidence vs. Doubt",
      snapshot: "Pure joy",
      loops: "",
      nextAction: "Rest and recharge",
      metaFlag: "Auto-Generated",
      isSummary: false,
      summaryAI: "Feeling accomplished and happy",
      actionableInsightsAI: "Celebrate wins more often",
      entryLengthWords: 28,
      daysSinceEntry: 0,
      isRecent: true,
      sentimentAI: "Positive",
      themeTagsAI: ["excitement", "spontaneity", "happiness"],
      createdTime: "2026-01-01T18:00:00Z",
    },
    {
      id: "rec5",
      name: "Weekly Reflection",
      type: "Reflection",
      date: "2025-12-31",
      timestamp: "2025-12-31T20:00:00Z",
      text: "Looking back at this week, I notice a pattern of ups and downs...",
      inferredMode: "Reflective",
      inferredEnergy: "Balanced",
      energyShape: "Centered",
      contradiction: "Growth vs. Comfort",
      snapshot: "Week in review",
      loops: "Self-analysis patterns",
      nextAction: "Set intentions for next week",
      metaFlag: "Auto-Generated",
      isSummary: true,
      summaryAI: "End of week reflection",
      actionableInsightsAI: "Continue journaling practice",
      entryLengthWords: 52,
      daysSinceEntry: 1,
      isRecent: true,
      sentimentAI: "Neutral",
      themeTagsAI: ["reflection", "self-awareness", "growth"],
      createdTime: "2025-12-31T20:00:00Z",
    },
    {
      id: "rec6",
      name: "Health Check-in",
      type: "Health",
      date: "2025-12-30",
      timestamp: "2025-12-30T10:00:00Z",
      text: "Went for a morning run today. Felt good to move my body...",
      inferredMode: "Calm",
      inferredEnergy: "Moderate",
      energyShape: "Stabilized",
      contradiction: "Self-care vs. Obligation",
      snapshot: "Morning exercise",
      loops: "",
      nextAction: "Maintain routine",
      metaFlag: "Auto-Generated",
      isSummary: false,
      summaryAI: "Positive health activity",
      actionableInsightsAI: "Keep exercise consistent",
      entryLengthWords: 24,
      daysSinceEntry: 2,
      isRecent: true,
      sentimentAI: "Positive",
      themeTagsAI: ["health", "exercise", "self-care"],
      createdTime: "2025-12-30T10:00:00Z",
    },
    {
      id: "rec7",
      name: "Family Dinner Thoughts",
      type: "Family",
      date: "2025-12-29",
      timestamp: "2025-12-29T19:00:00Z",
      text: "Had dinner with family. Mixed feelings about some conversations...",
      inferredMode: "Conflicted",
      inferredEnergy: "Low",
      energyShape: "Heavy",
      contradiction: "Closeness vs. Distance",
      snapshot: "Family dynamics",
      loops: "Family pattern recognition",
      nextAction: "Process emotions",
      metaFlag: "Auto-Generated",
      isSummary: false,
      summaryAI: "Complex family interaction",
      actionableInsightsAI: "Set boundaries gently",
      entryLengthWords: 41,
      daysSinceEntry: 3,
      isRecent: true,
      sentimentAI: "Negative",
      themeTagsAI: ["family", "emotions", "boundaries"],
      createdTime: "2025-12-29T19:00:00Z",
    },
  ]
}

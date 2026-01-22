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
  User_ID?: string
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
  "Is Deleted?"?: boolean
  "Is Bookmarked?"?: boolean
  // Entry format and decomposition fields
  "Entry Format"?: string
  "Parent Entry ID"?: string
  "Is Decomposed?"?: boolean
  "Decomposition Count"?: number
  "Sequence Order"?: number
  "Approximate Time"?: string
  "Overarching Theme"?: string
}

// Entry format types
export type EntryFormat = "Quick Log" | "Daily Log" | "End of Day" | "Consolidated"

export interface Entry {
  id: string
  name: string
  type: string
  date: string
  timestamp: string
  text: string
  userId: string
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
  isDeleted: boolean
  isBookmarked: boolean
  // Entry format and decomposition fields
  entryFormat: EntryFormat | string
  parentEntryId: string | null
  isDecomposed: boolean
  decompositionCount: number
  sequenceOrder: number | null
  approximateTime: string | null
  overarchingTheme: string | null
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
    timestamp: record.createdTime || fields.Timestamp || "",
    text: fields.Text || "",
    userId: fields.User_ID || "",
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
    isDeleted: fields["Is Deleted?"] || false,
    isBookmarked: fields["Is Bookmarked?"] || false,
    // Entry format and decomposition fields
    entryFormat: (fields["Entry Format"] as EntryFormat) || "Quick Log",
    parentEntryId: fields["Parent Entry ID"] || null,
    isDecomposed: fields["Is Decomposed?"] || false,
    decompositionCount: fields["Decomposition Count"] || 0,
    sequenceOrder: fields["Sequence Order"] || null,
    approximateTime: fields["Approximate Time"] || null,
    overarchingTheme: fields["Overarching Theme"] || null,
  }
}

export interface CreateEntryInput {
  text: string
  type?: string
  name?: string
  userId?: string
  format?: EntryFormat
  autoDecompose?: boolean // Whether to auto-decompose consolidated entries (default: true)
}

// Response type for entry creation with potential decomposition
export interface CreateEntryResponse {
  success: boolean
  entry?: {
    id: string
    fields: Record<string, unknown>
  }
  processing?: {
    intent: { type: string; name: string; snapshot: string; format: string; isConsolidated: boolean }
    emotion: { inferredMode: string; inferredEnergy: string; energyShape: string; sentimentAI: string }
    themes: { themeTagsAI: string[]; contradiction: string | null; loops: string | null }
    insights: { summaryAI: string; actionableInsightsAI: string; nextAction: string }
    decomposition?: {
      shouldDecompose: boolean
      eventCount: number
      events: Array<{
        text: string
        approximateTime?: string
        sequenceOrder: number
        suggestedType?: string
      }>
      overarchingTheme?: string
      decompositionRationale: string
    }
  }
  childEntries?: Array<{
    id: string
    parentId: string
    sequenceOrder: number
    fields: Record<string, unknown>
  }>
  decomposed?: boolean
  error?: string
}

/**
 * Create a new entry using the backend AI processing pipeline
 * This routes through /api/process-entry which handles:
 * - AI classification and analysis
 * - Automatic decomposition of consolidated entries
 * - Creating parent and child entries in Airtable
 */
export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  // Use the backend API for full AI processing
  const response = await fetch("/api/process-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: input.text,
      type: input.type,
      format: input.format,
      autoDecompose: input.autoDecompose ?? true,
      userId: input.userId,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(errorData.error || `API error: ${response.status}`)
  }

  const result: CreateEntryResponse = await response.json()

  if (!result.success || !result.entry) {
    throw new Error(result.error || "Failed to create entry")
  }

  // Transform the response to Entry format
  return transformRecord({
    id: result.entry.id,
    createdTime: new Date().toISOString(),
    fields: result.entry.fields as EntryFields,
  })
}

/**
 * Create entry directly to Airtable (bypasses AI processing)
 * Use this for quick entries that don't need analysis
 */
export async function createEntryDirect(input: CreateEntryInput): Promise<Entry> {
  if (!API_KEY) {
    throw new Error("No Airtable API key configured")
  }

  const now = new Date()
  const dateStr = now.toISOString().split("T")[0]
  const timestampStr = now.toISOString()

  // Calculate word count
  const wordCount = input.text.trim().split(/\s+/).filter(Boolean).length

  // Generate a name from the text (first 50 chars or first sentence)
  const generatedName = input.name ||
    input.text.slice(0, 50).split(/[.!?]/)[0].trim() ||
    "New Entry"

  const fields: Record<string, unknown> = {
    Name: generatedName,
    Text: input.text,
    Type: input.type || "Reflection",
    Date: dateStr,
    Timestamp: timestampStr,
    "Entry Length (Words)": wordCount,
    "Entry Format": input.format || "Quick Log",
  }

  // Add User_ID if provided
  if (input.userId) {
    fields.User_ID = input.userId
  }

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Airtable API error: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  return transformRecord(data)
}

export async function fetchEntries(userId?: string, demoPersona?: string): Promise<Entry[]> {
  // If no userId (not logged in), show demo data for selected persona
  if (!userId) {
    // Dynamic import to avoid circular dependencies
    const { getDemoData } = await import("./demoPersonas")
    const persona = (demoPersona || "mario") as "mario" | "kratos" | "sherlock" | "nova"
    console.log(`No user logged in, showing ${persona} demo data`)
    return getDemoData(persona)
  }

  if (!API_KEY) {
    console.warn("No Airtable API key found, using demo data")
    const { getDemoData } = await import("./demoPersonas")
    return getDemoData("mario")
  }

  // Build URL with user filter - only show entries for logged-in user
  let url = `${BASE_URL}?sort[0][field]=Date&sort[0][direction]=desc`
  const formula = encodeURIComponent(`{User_ID} = '${userId}'`)
  url += `&filterByFormula=${formula}`

  const response = await fetch(url, {
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

// Weekly Summary Types
export interface WeeklySummary {
  weekId: string
  weekStart: string
  weekEnd: string
  entryCount: number
  narrative: string | null
  moodTrend: "improving" | "declining" | "stable" | "volatile" | null
  dominantMode: string | null
  dominantEnergy: string | null
  dominantSentiment: "Positive" | "Negative" | "Neutral" | null
  topThemes: string[]
  topContradiction: string | null
  weeklyInsight: string | null
  recommendations: string[]
  nextWeekFocus: string | null
  positiveRatio: number
  avgEntriesPerDay: number
  sentimentBreakdown: { positive: number; negative: number; neutral: number }
  generatedAt: string | null
  cached: boolean
  airtableRecordId?: string
}

export interface WeeklySummaryResponse {
  success: boolean
  summary?: WeeklySummary
  error?: string
}

/**
 * Fetch weekly summary from the backend API
 * @param weekId - ISO week ID (YYYY-Wnn) or "current"
 * @param regenerate - Force regeneration even if cached
 */
export async function fetchWeeklySummary(
  weekId: string = "current",
  regenerate: boolean = false
): Promise<WeeklySummaryResponse> {
  const params = new URLSearchParams({ week: weekId })
  if (regenerate) {
    params.append("regenerate", "true")
  }

  const response = await fetch(`/api/weekly-summary?${params}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    return {
      success: false,
      error: error.error || `HTTP ${response.status}`,
    }
  }

  return response.json()
}

// Daily Summary Types
export interface DailySummary {
  date: string
  displayDate: string
  entryCount: number
  narrative: string | null
  moodSummary: string | null
  energyPattern: string | null
  keyTakeaway: string | null
  eveningReflection: string | null
  dominantMode: string | null
  dominantSentiment: string | null
  themes: string[]
  generatedAt: string | null
}

export interface DailySummaryResponse {
  success: boolean
  summary?: DailySummary
  error?: string
}

/**
 * Fetch daily summary from the backend API
 * @param date - YYYY-MM-DD format or "today"
 */
export async function fetchDailySummary(
  date: string = "today"
): Promise<DailySummaryResponse> {
  const params = new URLSearchParams({ date })

  const response = await fetch(`/api/daily-summary?${params}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    return {
      success: false,
      error: error.error || `HTTP ${response.status}`,
    }
  }

  return response.json()
}

// Monthly Summary Types
export interface MonthlySummary {
  monthId: string
  monthStart: string
  monthEnd: string
  entryCount: number
  activeDays: number
  activeWeeks: number
  narrative: string | null
  moodTrend: "improving" | "declining" | "stable" | "volatile" | null
  dominantMode: string | null
  dominantEnergy: string | null
  dominantSentiment: "Positive" | "Negative" | "Neutral" | null
  topThemes: string[]
  topContradiction: string | null
  monthlyInsight: string | null
  monthHighlight: string | null
  recommendations: string[]
  nextMonthFocus: string | null
  positiveRatio: number
  avgEntriesPerWeek: number
  sentimentBreakdown: { positive: number; negative: number; neutral: number }
  generatedAt: string | null
  cached: boolean
  airtableRecordId?: string
}

export interface MonthlySummaryResponse {
  success: boolean
  summary?: MonthlySummary
  error?: string
}

/**
 * Fetch monthly summary from the backend API
 * @param monthId - Month ID (YYYY-MM) or "current"
 * @param regenerate - Force regeneration even if cached
 */
export async function fetchMonthlySummary(
  monthId: string = "current",
  regenerate: boolean = false
): Promise<MonthlySummaryResponse> {
  const params = new URLSearchParams({ month: monthId })
  if (regenerate) {
    params.append("regenerate", "true")
  }

  const response = await fetch(`/api/monthly-summary?${params}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    return {
      success: false,
      error: error.error || `HTTP ${response.status}`,
    }
  }

  return response.json()
}

// Entry Update/Delete/Bookmark API Functions

export interface UpdateEntryInput {
  recordId: string
  text: string
  type?: string
  format?: EntryFormat
}

export interface UpdateEntryResponse {
  success: boolean
  entry?: {
    id: string
    fields: Record<string, unknown>
  }
  error?: string
}

/**
 * Update an existing entry - triggers AI re-analysis
 */
export async function updateEntry(input: UpdateEntryInput): Promise<UpdateEntryResponse> {
  const response = await fetch(`/api/entry/${input.recordId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.text, type: input.type, format: input.format }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    return { success: false, error: error.error || `HTTP ${response.status}` }
  }

  return response.json()
}

/**
 * Soft delete an entry
 */
export async function deleteEntry(recordId: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/entry/${recordId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || "Failed to delete entry")
  }
  return result
}

/**
 * Toggle bookmark status on an entry
 */
export async function toggleBookmark(
  recordId: string,
  bookmarked: boolean
): Promise<{ success: boolean; entry?: { id: string } }> {
  const response = await fetch(`/api/entry/${recordId}/bookmark`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookmarked }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || "Failed to toggle bookmark")
  }
  return result
}

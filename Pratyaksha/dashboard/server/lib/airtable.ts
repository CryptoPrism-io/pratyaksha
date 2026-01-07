// Server-side Airtable API Client

const AIRTABLE_API_KEY = process.env.VITE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY
const BASE_ID = process.env.VITE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || "appMzFpUZLuZs9VGc"
const TABLE_ID = process.env.VITE_AIRTABLE_TABLE_ID || process.env.AIRTABLE_TABLE_ID || "tblhKYssgHtjpmbni"

const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`

export interface AirtableEntryFields {
  Name: string
  Type: string
  Date: string
  Timestamp: string
  Text: string
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
  "Entry Sentiment (AI)"?: string
  "Entry Theme Tags (AI)"?: string
  "Is Deleted?"?: boolean
  "Is Bookmarked?"?: boolean
}

export interface AirtableRecord {
  id: string
  createdTime: string
  fields: AirtableEntryFields
}

export async function createAirtableEntry(fields: AirtableEntryFields): Promise<AirtableRecord> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Airtable API error: ${response.status} - ${JSON.stringify(error)}`)
  }

  return response.json()
}

export async function updateAirtableEntry(recordId: string, fields: Partial<AirtableEntryFields>): Promise<AirtableRecord> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  const response = await fetch(`${BASE_URL}/${recordId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Airtable API error: ${response.status} - ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Fetch all entries within a date range (YYYY-MM-DD format)
 * Excludes summary entries (Is Summary? = false or not set)
 */
export async function fetchEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<AirtableRecord[]> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  // Airtable formula: Date >= start AND Date <= end AND (Is Summary? = FALSE OR Is Summary? = BLANK())
  const formula = encodeURIComponent(
    `AND(IS_AFTER({Date}, '${startDate}'), IS_BEFORE({Date}, '${endDate}'), OR({Is Summary?} = FALSE(), {Is Summary?} = BLANK()))`
  )

  const allRecords: AirtableRecord[] = []
  let offset: string | undefined

  // Paginate through all results
  do {
    const url = `${BASE_URL}?filterByFormula=${formula}&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=asc${offset ? `&offset=${offset}` : ""}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(`Airtable API error: ${response.status} - ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    allRecords.push(...(data.records || []))
    offset = data.offset
  } while (offset)

  return allRecords
}

/**
 * Find a cached weekly summary by week ID
 * Looks for entries with Is Summary? = true and Name containing the week ID
 * Returns the most recently created one if multiple exist
 */
export async function findSummaryByWeek(weekId: string): Promise<AirtableRecord | null> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  // Look for summary entries containing the week ID in the name
  // Sort by Timestamp descending to get the most recent one
  const formula = encodeURIComponent(
    `AND({Is Summary?} = TRUE(), FIND('${weekId}', {Name}) > 0)`
  )

  const url = `${BASE_URL}?filterByFormula=${formula}&sort[0][field]=Timestamp&sort[0][direction]=desc&maxRecords=1`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Airtable API error: ${response.status} - ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.records?.[0] || null
}

/**
 * Update an existing Airtable record
 */
export async function updateAirtableRecord(
  recordId: string,
  fields: Partial<AirtableEntryFields>
): Promise<AirtableRecord> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  const response = await fetch(`${BASE_URL}/${recordId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Airtable API error: ${response.status} - ${JSON.stringify(error)}`)
  }

  return response.json()
}

export interface WeeklySummaryData {
  narrative: string
  recommendations: string[]
  weeklyInsight: string
  nextWeekFocus: string
  topThemes: string[]
  dominantMode: string
  moodTrend: string
  entryCount: number
}

/**
 * Build the fields object for a weekly summary entry
 */
function buildSummaryFields(
  weekId: string,
  weekRange: string,
  summary: WeeklySummaryData
): AirtableEntryFields {
  return {
    Name: `Weekly Summary: ${weekRange} (${weekId})`,
    Type: "Reflection",
    Date: new Date().toISOString().split("T")[0],
    Timestamp: new Date().toISOString(),
    Text: `Weekly Summary for ${weekRange}\n\nEntries analyzed: ${summary.entryCount}\nDominant mood: ${summary.dominantMode}\nMood trend: ${summary.moodTrend}`,
    "Is Summary?": true,
    "Summary (AI)": summary.narrative,
    "Actionable Insights (AI)": summary.recommendations.join("\n\n"),
    "Next Action": summary.nextWeekFocus,
    "Entry Theme Tags (AI)": summary.topThemes.join(", "),
    "Inferred Mode": summary.dominantMode,
    "Meta Flag": "Weekly Summary",
    // Store entryCount in Entry Length field for retrieval
    "Entry Length (Words)": summary.entryCount,
  }
}

/**
 * Create a weekly summary entry in Airtable
 */
export async function createSummaryEntry(
  weekId: string,
  weekRange: string,
  summary: WeeklySummaryData
): Promise<AirtableRecord> {
  const fields = buildSummaryFields(weekId, weekRange, summary)
  return createAirtableEntry(fields)
}

/**
 * Update an existing weekly summary entry in Airtable
 */
export async function updateSummaryEntry(
  recordId: string,
  weekId: string,
  weekRange: string,
  summary: WeeklySummaryData
): Promise<AirtableRecord> {
  const fields = buildSummaryFields(weekId, weekRange, summary)
  return updateAirtableRecord(recordId, fields)
}

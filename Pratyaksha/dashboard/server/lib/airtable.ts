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

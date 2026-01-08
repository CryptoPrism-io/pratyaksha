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

// ========== Monthly Summary Functions ==========

export interface MonthlySummaryData {
  narrative: string
  recommendations: string[]
  monthlyInsight: string
  monthHighlight: string
  nextMonthFocus: string
  topThemes: string[]
  dominantMode: string
  moodTrend: string
  entryCount: number
  activeDays: number
  activeWeeks: number
}

/**
 * Find a cached monthly summary by month ID
 * Looks for entries with Is Summary? = true and Name containing "Monthly Summary" and the month ID
 */
export async function findSummaryByMonth(monthId: string): Promise<AirtableRecord | null> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  // Look for summary entries containing the month ID in the name
  // Sort by Timestamp descending to get the most recent one
  const formula = encodeURIComponent(
    `AND({Is Summary?} = TRUE(), FIND('Monthly Summary', {Name}) > 0, FIND('${monthId}', {Name}) > 0)`
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
 * Build the fields object for a monthly summary entry
 */
function buildMonthlySummaryFields(
  monthId: string,
  monthRange: string,
  summary: MonthlySummaryData
): AirtableEntryFields {
  return {
    Name: `Monthly Summary: ${monthRange} (${monthId})`,
    Type: "Reflection",
    Date: new Date().toISOString().split("T")[0],
    Timestamp: new Date().toISOString(),
    Text: `Monthly Summary for ${monthRange}\n\nEntries analyzed: ${summary.entryCount}\nActive days: ${summary.activeDays}\nActive weeks: ${summary.activeWeeks}\nDominant mood: ${summary.dominantMode}\nMood trend: ${summary.moodTrend}\n\nHighlight: ${summary.monthHighlight}`,
    "Is Summary?": true,
    "Summary (AI)": summary.narrative,
    "Actionable Insights (AI)": summary.recommendations.join("\n\n"),
    "Next Action": summary.nextMonthFocus,
    "Entry Theme Tags (AI)": summary.topThemes.join(", "),
    "Inferred Mode": summary.dominantMode,
    "Meta Flag": "Monthly Summary",
    // Store entryCount in Entry Length field for retrieval
    "Entry Length (Words)": summary.entryCount,
    // Store monthHighlight in Snapshot field
    Snapshot: summary.monthHighlight,
  }
}

/**
 * Create a monthly summary entry in Airtable
 */
export async function createMonthlySummaryEntry(
  monthId: string,
  monthRange: string,
  summary: MonthlySummaryData
): Promise<AirtableRecord> {
  const fields = buildMonthlySummaryFields(monthId, monthRange, summary)
  return createAirtableEntry(fields)
}

/**
 * Update an existing monthly summary entry in Airtable
 */
export async function updateMonthlySummaryEntry(
  recordId: string,
  monthId: string,
  monthRange: string,
  summary: MonthlySummaryData
): Promise<AirtableRecord> {
  const fields = buildMonthlySummaryFields(monthId, monthRange, summary)
  return updateAirtableRecord(recordId, fields)
}

// ========== Notification Settings Functions ==========

// Notification settings table - separate from entries
const NOTIFICATIONS_TABLE_ID = process.env.AIRTABLE_NOTIFICATIONS_TABLE_ID || "Notification_Settings"
const NOTIFICATIONS_URL = `https://api.airtable.com/v0/${BASE_ID}/${NOTIFICATIONS_TABLE_ID}`

export interface NotificationSettingsFields {
  "User ID": string
  "FCM Token": string
  "Enabled": boolean
  "Daily Reminder": boolean
  "Daily Reminder Time": string
  "Streak At Risk": boolean
  "Weekly Summary": boolean
  "Updated At": string
}

export interface NotificationSettingsRecord {
  id: string
  createdTime: string
  fields: NotificationSettingsFields
}

export interface NotificationSettingsData {
  userId: string
  fcmToken: string
  enabled: boolean
  dailyReminder: boolean
  dailyReminderTime: string
  streakAtRisk: boolean
  weeklySummary: boolean
}

/**
 * Find notification settings for a user
 */
export async function findNotificationSettings(userId: string): Promise<NotificationSettingsRecord | null> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  const formula = encodeURIComponent(`{User ID} = '${userId}'`)
  const url = `${NOTIFICATIONS_URL}?filterByFormula=${formula}&maxRecords=1`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      // Table might not exist yet - return null instead of throwing
      if (response.status === 404) {
        console.warn("[Airtable] Notification_Settings table not found")
        return null
      }
      const error = await response.json().catch(() => ({}))
      throw new Error(`Airtable API error: ${response.status} - ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return data.records?.[0] || null
  } catch (error) {
    console.error("[Airtable] findNotificationSettings error:", error)
    return null
  }
}

/**
 * Create notification settings for a user
 */
export async function createNotificationSettings(data: NotificationSettingsData): Promise<NotificationSettingsRecord> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  const fields: NotificationSettingsFields = {
    "User ID": data.userId,
    "FCM Token": data.fcmToken,
    "Enabled": data.enabled,
    "Daily Reminder": data.dailyReminder,
    "Daily Reminder Time": data.dailyReminderTime,
    "Streak At Risk": data.streakAtRisk,
    "Weekly Summary": data.weeklySummary,
    "Updated At": new Date().toISOString(),
  }

  const response = await fetch(NOTIFICATIONS_URL, {
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

/**
 * Update notification settings for a user
 */
export async function updateNotificationSettings(
  recordId: string,
  data: NotificationSettingsData
): Promise<NotificationSettingsRecord> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  const fields: Partial<NotificationSettingsFields> = {
    "FCM Token": data.fcmToken,
    "Enabled": data.enabled,
    "Daily Reminder": data.dailyReminder,
    "Daily Reminder Time": data.dailyReminderTime,
    "Streak At Risk": data.streakAtRisk,
    "Weekly Summary": data.weeklySummary,
    "Updated At": new Date().toISOString(),
  }

  const response = await fetch(`${NOTIFICATIONS_URL}/${recordId}`, {
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
 * Get all users with notifications enabled (for scheduled notifications)
 */
export async function getUsersForNotification(
  notificationType: "dailyReminder" | "streakAtRisk" | "weeklySummary"
): Promise<NotificationSettingsRecord[]> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("Airtable API key is not configured")
  }

  let fieldName: string
  switch (notificationType) {
    case "dailyReminder":
      fieldName = "Daily Reminder"
      break
    case "streakAtRisk":
      fieldName = "Streak At Risk"
      break
    case "weeklySummary":
      fieldName = "Weekly Summary"
      break
  }

  const formula = encodeURIComponent(`AND({Enabled} = TRUE(), {${fieldName}} = TRUE())`)
  const url = `${NOTIFICATIONS_URL}?filterByFormula=${formula}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const data = await response.json()
    return data.records || []
  } catch (error) {
    console.error("[Airtable] getUsersForNotification error:", error)
    return []
  }
}

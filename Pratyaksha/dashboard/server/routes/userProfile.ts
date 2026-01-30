// User Profile routes for syncing with Airtable
import { Request, Response } from "express"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const USER_PROFILES_TABLE_ID = process.env.AIRTABLE_USER_PROFILES_TABLE_ID

interface PersonalizationData {
  // Demographics
  ageRange?: string | null
  sex?: string | null
  location?: string | null
  profession?: string | null
  // Psychological Context
  stressLevel?: number | null
  emotionalOpenness?: number | null
  reflectionFrequency?: number | null
  lifeSatisfaction?: number | null
  personalGoal?: string | null
  // Memory Topics
  selectedMemoryTopics?: string[]
  seedMemory?: string | null
  // Preferences
  defaultEntryMode?: string | null
  showFeatureTour?: boolean
}

interface GamificationData {
  karma?: number
  completedSoulMappingTopics?: string[]
  streakDays?: number
  lastEntryDate?: string | null
  lastDailyDashboardBonus?: string | null
  totalEntriesLogged?: number
}

interface UserProfileData {
  firebaseUid: string
  email?: string
  displayName?: string
  dailyReminderEnabled?: boolean
  reminderTime?: string
  onboardingCompleted?: boolean
  badges?: string[]
  fcmToken?: string
  personalization?: PersonalizationData
  gamification?: GamificationData
}

/**
 * Get user profile by Firebase UID
 */
export async function getUserProfile(req: Request, res: Response) {
  try {
    const { uid } = req.params

    if (!uid) {
      return res.status(400).json({ success: false, error: "Firebase UID is required" })
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !USER_PROFILES_TABLE_ID) {
      return res.status(500).json({ success: false, error: "Airtable not configured" })
    }

    // Search for user by Firebase UID
    const filterFormula = encodeURIComponent(`{Firebase UID} = "${uid}"`)
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USER_PROFILES_TABLE_ID}?filterByFormula=${filterFormula}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[UserProfile] Airtable error:", error)
      return res.status(response.status).json({ success: false, error: "Failed to fetch profile" })
    }

    const data = await response.json()

    if (data.records && data.records.length > 0) {
      const record = data.records[0]

      // Parse personalization data from Settings field (stored as JSON string)
      let personalization: PersonalizationData = {}
      if (record.fields["Settings"]) {
        try {
          personalization = JSON.parse(record.fields["Settings"])
        } catch (e) {
          console.error("[UserProfile] Failed to parse settings JSON:", e)
        }
      }

      // Parse gamification data from Gamification field (stored as JSON string)
      let gamification: GamificationData = {}
      if (record.fields["Gamification"]) {
        try {
          gamification = JSON.parse(record.fields["Gamification"])
        } catch (e) {
          console.error("[UserProfile] Failed to parse gamification JSON:", e)
        }
      }

      return res.json({
        success: true,
        profile: {
          id: record.id,
          firebaseUid: record.fields["Firebase UID"],
          email: record.fields["Email"],
          displayName: record.fields["Display Name"],
          dailyReminderEnabled: record.fields["Daily Reminder Enabled"] || false,
          reminderTime: record.fields["Reminder Time"],
          onboardingCompleted: record.fields["Onboarding Completed"] || false,
          badges: record.fields["Badges"] || [],
          fcmToken: record.fields["FCM Token"],
          createdAt: record.fields["Created At"],
          lastActive: record.fields["Last Active"],
          personalization,
          gamification,
        },
      })
    }

    return res.json({ success: true, profile: null })
  } catch (error) {
    console.error("[UserProfile] Error fetching profile:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(req: Request, res: Response) {
  try {
    const profileData: UserProfileData = req.body

    if (!profileData.firebaseUid) {
      return res.status(400).json({ success: false, error: "Firebase UID is required" })
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !USER_PROFILES_TABLE_ID) {
      return res.status(500).json({ success: false, error: "Airtable not configured" })
    }

    // Check if profile already exists
    const filterFormula = encodeURIComponent(`{Firebase UID} = "${profileData.firebaseUid}"`)
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USER_PROFILES_TABLE_ID}?filterByFormula=${filterFormula}`

    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    const searchData = await searchResponse.json()
    const existingRecord = searchData.records?.[0]

    // Build fields object
    const fields: Record<string, unknown> = {
      "Firebase UID": profileData.firebaseUid,
      "Last Active": new Date().toISOString(),
    }

    if (profileData.email !== undefined) fields["Email"] = profileData.email
    if (profileData.displayName !== undefined) fields["Display Name"] = profileData.displayName
    if (profileData.dailyReminderEnabled !== undefined) fields["Daily Reminder Enabled"] = profileData.dailyReminderEnabled
    if (profileData.reminderTime !== undefined) fields["Reminder Time"] = profileData.reminderTime
    if (profileData.onboardingCompleted !== undefined) fields["Onboarding Completed"] = profileData.onboardingCompleted
    if (profileData.badges !== undefined) fields["Badges"] = profileData.badges
    if (profileData.fcmToken !== undefined) fields["FCM Token"] = profileData.fcmToken
    if (profileData.personalization !== undefined) fields["Settings"] = JSON.stringify(profileData.personalization)
    if (profileData.gamification !== undefined) fields["Gamification"] = JSON.stringify(profileData.gamification)

    let response: Response
    let url: string

    if (existingRecord) {
      // Update existing record
      url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USER_PROFILES_TABLE_ID}/${existingRecord.id}`
      response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }) as unknown as Response
    } else {
      // Create new record
      fields["Created At"] = new Date().toISOString()
      url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USER_PROFILES_TABLE_ID}`
      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }) as unknown as Response
    }

    if (!response.ok) {
      const error = await (response as unknown as globalThis.Response).text()
      console.error("[UserProfile] Airtable error:", error)
      return res.status(500).json({ success: false, error: "Failed to save profile" })
    }

    const data = await (response as unknown as globalThis.Response).json()

    console.log(`[UserProfile] ${existingRecord ? "Updated" : "Created"} profile for ${profileData.firebaseUid}`)

    // Parse personalization data from response
    let personalization: PersonalizationData = {}
    if (data.fields["Settings"]) {
      try {
        personalization = JSON.parse(data.fields["Settings"])
      } catch (e) {
        console.error("[UserProfile] Failed to parse settings JSON:", e)
      }
    }

    // Parse gamification data from response
    let gamification: GamificationData = {}
    if (data.fields["Gamification"]) {
      try {
        gamification = JSON.parse(data.fields["Gamification"])
      } catch (e) {
        console.error("[UserProfile] Failed to parse gamification JSON:", e)
      }
    }

    return res.json({
      success: true,
      profile: {
        id: data.id,
        firebaseUid: data.fields["Firebase UID"],
        email: data.fields["Email"],
        displayName: data.fields["Display Name"],
        dailyReminderEnabled: data.fields["Daily Reminder Enabled"] || false,
        reminderTime: data.fields["Reminder Time"],
        onboardingCompleted: data.fields["Onboarding Completed"] || false,
        badges: data.fields["Badges"] || [],
        fcmToken: data.fields["FCM Token"],
        createdAt: data.fields["Created At"],
        lastActive: data.fields["Last Active"],
        personalization,
        gamification,
      },
    })
  } catch (error) {
    console.error("[UserProfile] Error saving profile:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

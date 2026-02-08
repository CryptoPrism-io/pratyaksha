// User Profile routes - PostgreSQL via Drizzle ORM
import { Request, Response } from "express"
import { getUserProfile as dbGetUserProfile, upsertUser } from "../lib/db"

/**
 * Get user profile by Firebase UID
 */
export async function getUserProfile(req: Request, res: Response) {
  try {
    const { uid } = req.params

    if (!uid) {
      return res.status(400).json({ success: false, error: "Firebase UID is required" })
    }

    const profile = await dbGetUserProfile(uid)

    if (profile) {
      return res.json({ success: true, profile })
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
    const profileData = req.body

    if (!profileData.firebaseUid) {
      return res.status(400).json({ success: false, error: "Firebase UID is required" })
    }

    await upsertUser({
      firebaseUid: profileData.firebaseUid,
      email: profileData.email,
      displayName: profileData.displayName,
      personalization: profileData.personalization,
      gamification: profileData.gamification,
      lifeBlueprint: profileData.lifeBlueprint,
      onboardingCompleted: profileData.onboardingCompleted,
      dailyReminderEnabled: profileData.dailyReminderEnabled,
      reminderTime: profileData.reminderTime,
      badges: profileData.badges,
      fcmToken: profileData.fcmToken,
    })

    // Fetch back the full profile to return
    const profile = await dbGetUserProfile(profileData.firebaseUid)

    console.log(`[UserProfile] Upserted profile for ${profileData.firebaseUid}`)

    return res.json({ success: true, profile })
  } catch (error) {
    console.error("[UserProfile] Error saving profile:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

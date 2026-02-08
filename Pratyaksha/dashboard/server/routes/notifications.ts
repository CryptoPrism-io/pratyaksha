// Notification Routes - FCM token registration and sending
import { Request, Response } from "express"
import admin from "firebase-admin"
import {
  findNotificationSettings as dbFindNotificationSettings,
  upsertNotificationSettings,
  getAllEnabledNotificationUsers as dbGetAllEnabledUsers,
  updateLastNotified as dbUpdateLastNotified,
  findUserByFirebaseUid,
} from "../lib/db"
import {
  isWithinQuietHours,
  shouldNotifyNow,
  getNotificationMessage,
  getUserLocalTimeInfo,
  type NotificationFrequency,
} from "../lib/notificationScheduler"

// Initialize Firebase Admin with Application Default Credentials (ADC)
// This works automatically on Cloud Run without needing a service account key file
let firebaseInitialized = false

function initFirebaseAdmin() {
  if (firebaseInitialized) return true

  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      firebaseInitialized = true
      return true
    }

    // Initialize with ADC - works on Cloud Run automatically
    // Locally, set GOOGLE_APPLICATION_CREDENTIALS env var to a service account JSON file
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || "pratyaksha-3f089",
    })

    firebaseInitialized = true
    console.log("[Notifications] Firebase Admin initialized with ADC")
    return true
  } catch (error) {
    console.error("[Notifications] Firebase Admin init failed:", error)
    return false
  }
}

export interface NotificationPreferences {
  enabled: boolean
  timezone: string
  frequency: NotificationFrequency
  customTimes: string[]
  quietHoursStart: string
  quietHoursEnd: string
  streakAtRisk: boolean
  weeklySummary: boolean
}

// CRON_SECRET for authenticating Cloud Scheduler requests
const CRON_SECRET = process.env.CRON_SECRET || ""

/**
 * POST /api/notifications/register
 * Register or update FCM token for a user
 */
export async function registerToken(req: Request, res: Response) {
  try {
    const { userId, fcmToken, preferences } = req.body

    if (!userId || !fcmToken) {
      return res.status(400).json({
        success: false,
        error: "userId and fcmToken are required",
      })
    }

    console.log(`[Notifications] Registering token for user ${userId}`)

    // Upsert notification settings
    await upsertNotificationSettings({
      firebaseUid: userId,
      fcmToken,
      enabled: preferences?.enabled ?? true,
      timezone: preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      frequency: preferences?.frequency || "2x_daily",
      customTimes: preferences?.customTimes || ["09:00", "20:00"],
      quietHoursStart: preferences?.quietHoursStart || "22:00",
      quietHoursEnd: preferences?.quietHoursEnd || "07:00",
      streakAtRisk: preferences?.streakAtRisk ?? true,
      weeklySummary: preferences?.weeklySummary ?? false,
    })
    console.log(`[Notifications] Upserted settings for user ${userId}`)

    res.json({ success: true })
  } catch (error) {
    console.error("[Notifications] Register token error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to register notification token",
    })
  }
}

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for a user
 */
export async function updatePreferences(req: Request, res: Response) {
  try {
    const { userId, preferences } = req.body

    if (!userId || !preferences) {
      return res.status(400).json({
        success: false,
        error: "userId and preferences are required",
      })
    }

    console.log(`[Notifications] Updating preferences for user ${userId}`)

    // Find existing settings
    const existing = await dbFindNotificationSettings(userId)

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "User notification settings not found",
      })
    }

    // Find user's FCM token
    const user = await findUserByFirebaseUid(userId)

    // Update preferences
    await upsertNotificationSettings({
      firebaseUid: userId,
      fcmToken: user?.fcmToken || "",
      enabled: preferences.enabled ?? existing.enabled,
      timezone: preferences.timezone ?? existing.timezone ?? "UTC",
      frequency: preferences.frequency ?? existing.frequency ?? "2x_daily",
      customTimes: preferences.customTimes ?? existing.customTimes ?? ["09:00", "20:00"],
      quietHoursStart: preferences.quietHoursStart ?? existing.quietHoursStart ?? "22:00",
      quietHoursEnd: preferences.quietHoursEnd ?? existing.quietHoursEnd ?? "07:00",
      streakAtRisk: preferences.streakAtRisk ?? existing.streakAtRisk,
      weeklySummary: preferences.weeklySummary ?? existing.weeklySummary,
    })

    res.json({ success: true })
  } catch (error) {
    console.error("[Notifications] Update preferences error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update notification preferences",
    })
  }
}

/**
 * POST /api/notifications/send
 * Send a notification to a specific user (admin/internal use)
 */
export async function sendNotification(req: Request, res: Response) {
  try {
    const { userId, title, body, type, data } = req.body

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        error: "userId, title, and body are required",
      })
    }

    // Get user's FCM token
    const user = await findUserByFirebaseUid(userId)

    if (!user || !user.fcmToken) {
      return res.status(404).json({
        success: false,
        error: "User FCM token not found",
      })
    }

    const settings = await dbFindNotificationSettings(userId)
    if (settings && !settings.enabled) {
      return res.json({
        success: false,
        error: "User has notifications disabled",
      })
    }

    const fcmToken = user.fcmToken

    // Send via FCM
    const success = await sendFCMNotification(fcmToken, {
      title,
      body,
      type: type || "general",
      data,
    })

    if (success) {
      res.json({ success: true })
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send notification",
      })
    }
  } catch (error) {
    console.error("[Notifications] Send error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to send notification",
    })
  }
}

/**
 * Send FCM notification using Firebase Admin SDK (V1 API)
 * Uses Application Default Credentials - works on Cloud Run without key file
 */
async function sendFCMNotification(
  token: string,
  notification: {
    title: string
    body: string
    type: string
    data?: Record<string, string>
  }
): Promise<boolean> {
  // Initialize Firebase Admin if not already done
  if (!initFirebaseAdmin()) {
    console.error("[Notifications] Firebase Admin not available")
    return false
  }

  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        type: notification.type,
        ...(notification.data || {}),
      },
      webpush: {
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
        },
        fcmOptions: {
          link: "/dashboard",
        },
      },
    }

    const response = await admin.messaging().send(message)
    console.log("[Notifications] FCM send success:", response)
    return true
  } catch (error) {
    console.error("[Notifications] FCM send error:", error)
    return false
  }
}

/**
 * GET /api/notifications/settings/:userId
 * Get notification settings for a user
 */
export async function getSettings(req: Request, res: Response) {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      })
    }

    const settings = await dbFindNotificationSettings(userId)

    if (!settings) {
      return res.json({
        success: true,
        settings: null,
      })
    }

    const user = await findUserByFirebaseUid(userId)

    res.json({
      success: true,
      settings: {
        enabled: settings.enabled,
        timezone: settings.timezone || "UTC",
        frequency: settings.frequency || "2x_daily",
        customTimes: settings.customTimes || ["09:00", "20:00"],
        quietHoursStart: settings.quietHoursStart || "22:00",
        quietHoursEnd: settings.quietHoursEnd || "07:00",
        streakAtRisk: settings.streakAtRisk,
        weeklySummary: settings.weeklySummary,
        hasToken: !!user?.fcmToken,
      },
    })
  } catch (error) {
    console.error("[Notifications] Get settings error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to get notification settings",
    })
  }
}

/**
 * POST /api/notifications/test
 * Test endpoint to verify FCM is working
 */
export async function testNotification(req: Request, res: Response) {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "FCM token is required",
      })
    }

    const success = await sendFCMNotification(token, {
      title: "Test Notification",
      body: "Push notifications are working!",
      type: "test",
    })

    res.json({ success })
  } catch (error) {
    console.error("[Notifications] Test error:", error)
    res.status(500).json({
      success: false,
      error: "Test notification failed",
    })
  }
}

/**
 * POST /api/cron/notifications
 * Called by Cloud Scheduler every hour to send scheduled notifications
 * Protected by CRON_SECRET header
 */
export async function cronNotifications(req: Request, res: Response) {
  try {
    // Verify request is from Cloud Scheduler
    const cronSecret = req.headers["x-cron-secret"] as string
    if (CRON_SECRET && cronSecret !== CRON_SECRET) {
      console.warn("[Cron] Unauthorized cron request")
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      })
    }

    console.log("[Cron] Starting notification cron job...")

    // Get all users with notifications enabled
    const notifUsers = await dbGetAllEnabledUsers()
    console.log(`[Cron] Found ${notifUsers.length} users with notifications enabled`)

    const results = {
      total: notifUsers.length,
      sent: 0,
      skipped: 0,
      errors: 0,
      details: [] as { userId: string; status: string; reason?: string }[],
    }

    for (const user of notifUsers) {

      // Skip if no FCM token
      if (!user.fcmToken) {
        results.skipped++
        results.details.push({ userId: user.userId, status: "skipped", reason: "No FCM token" })
        continue
      }

      const timezone = user.timezone || "UTC"
      const frequency = (user.frequency || "2x_daily") as NotificationFrequency
      const quietStart = user.quietHoursStart || "22:00"
      const quietEnd = user.quietHoursEnd || "07:00"
      const customTimes = user.customTimes || ["09:00", "20:00"]
      const lastNotified = user.lastNotified

      // Log user's local time for debugging
      const localInfo = getUserLocalTimeInfo(timezone)
      console.log(`[Cron] User ${user.userId}: localTime=${localInfo.localTime}, freq=${frequency}`)

      // Check if within quiet hours
      if (isWithinQuietHours(timezone, quietStart, quietEnd)) {
        results.skipped++
        results.details.push({ userId: user.userId, status: "skipped", reason: "Quiet hours" })
        continue
      }

      // Check if notification should be sent now based on frequency and last notified
      if (!shouldNotifyNow(timezone, frequency, customTimes, lastNotified)) {
        results.skipped++
        results.details.push({ userId: user.userId, status: "skipped", reason: "Not time yet" })
        continue
      }

      // Get notification message based on time of day
      const message = getNotificationMessage(timezone, frequency)

      // Send notification
      try {
        const success = await sendFCMNotification(user.fcmToken, {
          title: message.title,
          body: message.body,
          type: "reminder",
        })

        if (success) {
          // Update lastNotified timestamp
          await dbUpdateLastNotified(user.recordId)
          results.sent++
          results.details.push({ userId: user.userId, status: "sent" })
        } else {
          results.errors++
          results.details.push({ userId: user.userId, status: "error", reason: "FCM send failed" })
        }
      } catch (error) {
        results.errors++
        results.details.push({ userId: user.userId, status: "error", reason: String(error) })
      }
    }

    console.log(`[Cron] Completed: sent=${results.sent}, skipped=${results.skipped}, errors=${results.errors}`)

    res.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error("[Cron] Notification cron error:", error)
    res.status(500).json({
      success: false,
      error: "Cron job failed",
    })
  }
}

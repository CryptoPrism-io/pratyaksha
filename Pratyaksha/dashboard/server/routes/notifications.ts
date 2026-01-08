// Notification Routes - FCM token registration and sending
import { Request, Response } from "express"
import {
  findNotificationSettings,
  createNotificationSettings,
  updateNotificationSettings,
  type NotificationSettingsData,
} from "../lib/airtable"

export interface NotificationPreferences {
  enabled: boolean
  dailyReminder: boolean
  dailyReminderTime: string
  streakAtRisk: boolean
  weeklySummary: boolean
}

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

    // Check if user already has notification settings
    const existing = await findNotificationSettings(userId)

    const settingsData: NotificationSettingsData = {
      userId,
      fcmToken,
      enabled: preferences?.enabled ?? true,
      dailyReminder: preferences?.dailyReminder ?? true,
      dailyReminderTime: preferences?.dailyReminderTime ?? "20:00",
      streakAtRisk: preferences?.streakAtRisk ?? true,
      weeklySummary: preferences?.weeklySummary ?? false,
    }

    if (existing) {
      // Update existing record
      await updateNotificationSettings(existing.id, settingsData)
      console.log(`[Notifications] Updated settings for user ${userId}`)
    } else {
      // Create new record
      await createNotificationSettings(settingsData)
      console.log(`[Notifications] Created settings for user ${userId}`)
    }

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
    const existing = await findNotificationSettings(userId)

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "User notification settings not found",
      })
    }

    // Update preferences
    await updateNotificationSettings(existing.id, {
      userId,
      fcmToken: existing.fields["FCM Token"] || "",
      enabled: preferences.enabled ?? existing.fields["Enabled"],
      dailyReminder: preferences.dailyReminder ?? existing.fields["Daily Reminder"],
      dailyReminderTime: preferences.dailyReminderTime ?? existing.fields["Daily Reminder Time"],
      streakAtRisk: preferences.streakAtRisk ?? existing.fields["Streak At Risk"],
      weeklySummary: preferences.weeklySummary ?? existing.fields["Weekly Summary"],
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
    const settings = await findNotificationSettings(userId)

    if (!settings || !settings.fields["FCM Token"]) {
      return res.status(404).json({
        success: false,
        error: "User FCM token not found",
      })
    }

    if (!settings.fields["Enabled"]) {
      return res.json({
        success: false,
        error: "User has notifications disabled",
      })
    }

    const fcmToken = settings.fields["FCM Token"]

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
 * Send FCM notification using Firebase Admin SDK or HTTP v1 API
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
  const serverKey = process.env.FIREBASE_SERVER_KEY

  if (!serverKey) {
    console.warn("[Notifications] FIREBASE_SERVER_KEY not configured")
    return false
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: `key=${serverKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: notification.title,
          body: notification.body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
        },
        data: {
          type: notification.type,
          ...notification.data,
        },
        webpush: {
          fcm_options: {
            link: "/dashboard",
          },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[Notifications] FCM send error:", error)
      return false
    }

    const result = await response.json()
    console.log("[Notifications] FCM send result:", result)

    return result.success === 1
  } catch (error) {
    console.error("[Notifications] FCM request failed:", error)
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

    const settings = await findNotificationSettings(userId)

    if (!settings) {
      return res.json({
        success: true,
        settings: null,
      })
    }

    res.json({
      success: true,
      settings: {
        enabled: settings.fields["Enabled"],
        dailyReminder: settings.fields["Daily Reminder"],
        dailyReminderTime: settings.fields["Daily Reminder Time"],
        streakAtRisk: settings.fields["Streak At Risk"],
        weeklySummary: settings.fields["Weekly Summary"],
        hasToken: !!settings.fields["FCM Token"],
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

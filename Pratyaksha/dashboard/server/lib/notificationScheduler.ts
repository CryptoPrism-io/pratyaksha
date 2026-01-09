// Notification Scheduler Logic
// Handles timezone-aware scheduling, quiet hours, and frequency-based notifications

import { DateTime } from "luxon"

export type NotificationFrequency = "hourly" | "3x_daily" | "2x_daily" | "1x_daily"

export interface UserNotificationSettings {
  userId: string
  fcmToken: string
  enabled: boolean
  timezone: string
  frequency: NotificationFrequency
  customTimes: string[] // ["09:00", "13:00", "20:00"]
  quietHoursStart: string // "22:00"
  quietHoursEnd: string // "07:00"
  lastNotified: string | null // ISO timestamp
  streakAtRisk: boolean
  weeklySummary: boolean
}

/**
 * Check if the current time is within quiet hours for a user
 */
export function isWithinQuietHours(
  timezone: string,
  quietStart: string,
  quietEnd: string
): boolean {
  try {
    const now = DateTime.now().setZone(timezone)
    const currentTime = now.toFormat("HH:mm")

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (quietStart > quietEnd) {
      // Quiet hours span midnight
      return currentTime >= quietStart || currentTime < quietEnd
    }
    // Same-day quiet hours (e.g., 14:00 - 16:00)
    return currentTime >= quietStart && currentTime < quietEnd
  } catch (error) {
    console.error(`[Scheduler] Invalid timezone: ${timezone}`, error)
    return false // Default to not in quiet hours if timezone is invalid
  }
}

/**
 * Check if a notification should be sent now based on user preferences
 */
export function shouldNotifyNow(
  timezone: string,
  frequency: NotificationFrequency,
  customTimes: string[],
  lastNotified: string | null
): boolean {
  try {
    const now = DateTime.now().setZone(timezone)
    const currentHour = now.hour

    // Check if already notified this hour (prevent duplicates)
    if (lastNotified) {
      const lastTime = DateTime.fromISO(lastNotified).setZone(timezone)
      if (lastTime.hour === currentHour && lastTime.hasSame(now, "day")) {
        return false // Already notified this hour today
      }
    }

    switch (frequency) {
      case "hourly":
        // Notify every hour (quiet hours checked separately)
        return true

      case "3x_daily":
      case "2x_daily":
      case "1x_daily":
        // Check if current hour matches any custom time
        return customTimes.some(time => {
          const [h] = time.split(":").map(Number)
          // Match if we're in the same hour and within first 30 minutes
          // This gives a 30-minute window for the cron to run
          return currentHour === h && now.minute < 30
        })

      default:
        return false
    }
  } catch (error) {
    console.error(`[Scheduler] Error checking notification time:`, error)
    return false
  }
}

/**
 * Get the user's current local time info for logging
 */
export function getUserLocalTimeInfo(timezone: string): {
  localTime: string
  localHour: number
  dayOfWeek: string
} {
  try {
    const now = DateTime.now().setZone(timezone)
    return {
      localTime: now.toFormat("HH:mm"),
      localHour: now.hour,
      dayOfWeek: now.weekdayLong || now.toFormat("cccc"),
    }
  } catch {
    return {
      localTime: "unknown",
      localHour: -1,
      dayOfWeek: "unknown",
    }
  }
}

/**
 * Check if today is Sunday (for weekly summary)
 */
export function isSunday(timezone: string): boolean {
  try {
    const now = DateTime.now().setZone(timezone)
    return now.weekday === 7 // Luxon: 7 = Sunday
  } catch {
    return false
  }
}

/**
 * Determine which users should receive notifications right now
 */
export function filterUsersForNotification(
  users: UserNotificationSettings[],
  notificationType: "reminder" | "streakAtRisk" | "weeklySummary"
): UserNotificationSettings[] {
  return users.filter(user => {
    // Skip if notifications are disabled
    if (!user.enabled || !user.fcmToken) {
      return false
    }

    const timezone = user.timezone || "UTC"

    // Check quiet hours (applies to all notification types)
    if (isWithinQuietHours(timezone, user.quietHoursStart, user.quietHoursEnd)) {
      console.log(`[Scheduler] User ${user.userId} is in quiet hours, skipping`)
      return false
    }

    switch (notificationType) {
      case "reminder":
        // Check if it's time to send based on frequency
        return shouldNotifyNow(
          timezone,
          user.frequency,
          user.customTimes,
          user.lastNotified
        )

      case "streakAtRisk":
        // Only send if user has streak alerts enabled
        // This would typically be called at a specific time (e.g., 9 PM)
        return user.streakAtRisk

      case "weeklySummary":
        // Only send on Sundays if user has weekly summary enabled
        return user.weeklySummary && isSunday(timezone)

      default:
        return false
    }
  })
}

/**
 * Get notification message based on type and time of day
 */
export function getNotificationMessage(
  timezone: string,
  frequency: NotificationFrequency
): { title: string; body: string } {
  const { localHour } = getUserLocalTimeInfo(timezone)

  // Time-of-day greeting
  let greeting: string
  if (localHour >= 5 && localHour < 12) {
    greeting = "Good morning"
  } else if (localHour >= 12 && localHour < 17) {
    greeting = "Good afternoon"
  } else if (localHour >= 17 && localHour < 21) {
    greeting = "Good evening"
  } else {
    greeting = "Hey there"
  }

  // Message varies by frequency
  if (frequency === "hourly") {
    return {
      title: "Time to micro-log",
      body: "Quick check-in: How are you feeling right now?",
    }
  }

  return {
    title: `${greeting}!`,
    body: "Take a moment to capture your thoughts in Pratyaksha.",
  }
}

/**
 * Parse custom times string from Airtable (comma-separated)
 */
export function parseCustomTimes(timesString: string | null): string[] {
  if (!timesString) return ["09:00", "20:00"] // Default times
  return timesString.split(",").map(t => t.trim()).filter(t => /^\d{2}:\d{2}$/.test(t))
}

/**
 * Validate timezone string
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    DateTime.now().setZone(timezone)
    return true
  } catch {
    return false
  }
}

/**
 * Get list of common timezones for UI dropdown
 */
export function getCommonTimezones(): { value: string; label: string }[] {
  return [
    { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT/BST)" },
    { value: "Europe/Paris", label: "Central European (CET)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "Asia/Dubai", label: "Dubai (GST, UTC+4)" },
    { value: "Asia/Singapore", label: "Singapore (SGT, UTC+8)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST, UTC+9)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
    { value: "Pacific/Auckland", label: "Auckland (NZST)" },
    { value: "UTC", label: "UTC" },
  ]
}

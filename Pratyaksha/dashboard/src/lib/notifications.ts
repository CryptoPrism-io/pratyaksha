// Push Notifications Service using Firebase Cloud Messaging
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging"
import { initializeApp, getApp, getApps } from "firebase/app"

// Firebase configuration (same as auth)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId

// Get or initialize Firebase app
function getFirebaseApp() {
  if (!hasConfig) return null
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
}

let messaging: Messaging | null = null

function getMessagingInstance(): Messaging | null {
  if (!hasConfig) return null
  if (messaging) return messaging

  const app = getFirebaseApp()
  if (!app) return null

  try {
    messaging = getMessaging(app)
    return messaging
  } catch (error) {
    console.error("[Notifications] Failed to initialize messaging:", error)
    return null
  }
}

// Notification frequency options
export type NotificationFrequency = "hourly" | "3x_daily" | "2x_daily" | "1x_daily"

export interface NotificationPreferences {
  enabled: boolean
  timezone: string // IANA timezone e.g. "Asia/Kolkata"
  frequency: NotificationFrequency
  customTimes: string[] // ["09:00", "13:00", "20:00"] for scheduled notifications
  quietHoursStart: string // "22:00" - when to stop notifications
  quietHoursEnd: string // "07:00" - when to resume notifications
  streakAtRisk: boolean
  weeklySummary: boolean
}

// Auto-detect timezone from browser
function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "UTC"
  }
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  timezone: getDefaultTimezone(),
  frequency: "2x_daily",
  customTimes: ["09:00", "20:00"], // Morning and evening
  quietHoursStart: "22:00", // 10 PM
  quietHoursEnd: "07:00", // 7 AM
  streakAtRisk: true,
  weeklySummary: false,
}

// Get default times based on frequency
export function getDefaultTimesForFrequency(frequency: NotificationFrequency): string[] {
  switch (frequency) {
    case "hourly":
      return [] // No specific times, runs every hour
    case "3x_daily":
      return ["09:00", "13:00", "20:00"] // Morning, afternoon, evening
    case "2x_daily":
      return ["09:00", "20:00"] // Morning and evening
    case "1x_daily":
      return ["20:00"] // Evening only
  }
}

// Get friendly label for frequency
export function getFrequencyLabel(frequency: NotificationFrequency): string {
  switch (frequency) {
    case "hourly":
      return "Every hour (during active hours)"
    case "3x_daily":
      return "3 times daily (Morning, Afternoon, Evening)"
    case "2x_daily":
      return "Twice daily (Morning & Evening)"
    case "1x_daily":
      return "Once daily"
  }
}

// Storage key for preferences
const PREFS_KEY = "pratyaksha_notification_prefs"
const FCM_TOKEN_KEY = "pratyaksha_fcm_token"

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  )
}

/**
 * Get the current notification permission status
 */
export function getPermissionStatus(): NotificationPermission {
  if (!isPushSupported()) return "denied"
  return Notification.permission
}

/**
 * Request notification permission from the user
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn("[Notifications] Push notifications not supported")
    return "denied"
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error("[Notifications] Permission request failed:", error)
    return "denied"
  }
}

/**
 * Register the Firebase messaging service worker
 */
async function registerFirebaseServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  try {
    // Check if already registered
    const existingReg = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")
    if (existingReg) {
      console.log("[Notifications] Firebase SW already registered")
      return existingReg
    }

    // Register the Firebase messaging service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    })

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready
    console.log("[Notifications] Firebase SW registered successfully")
    return registration
  } catch (error) {
    console.error("[Notifications] Failed to register Firebase SW:", error)
    return null
  }
}

/**
 * Get the FCM token for this device
 */
export async function getFCMToken(): Promise<string | null> {
  if (!hasConfig) {
    console.warn("[Notifications] Firebase not configured")
    return null
  }

  const permission = getPermissionStatus()
  if (permission !== "granted") {
    console.warn("[Notifications] Permission not granted")
    return null
  }

  const msg = getMessagingInstance()
  if (!msg) return null

  try {
    // Get VAPID key from environment
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.warn("[Notifications] VAPID key not configured")
      return null
    }

    // Register Firebase service worker first
    const swRegistration = await registerFirebaseServiceWorker()
    if (!swRegistration) {
      console.warn("[Notifications] Service worker registration failed")
      return null
    }

    // Get token with service worker registration
    const token = await getToken(msg, {
      vapidKey,
      serviceWorkerRegistration: swRegistration
    })

    if (token) {
      // Store token locally
      localStorage.setItem(FCM_TOKEN_KEY, token)
      return token
    }

    return null
  } catch (error) {
    // Only log as warning since this commonly fails when:
    // - Push service is unavailable (browser/network issue)
    // - User hasn't granted permission yet
    // - Running in incognito mode
    // - Service worker registration timing issues
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("Registration failed") || errorMessage.includes("AbortError")) {
      console.warn("[Notifications] Push service unavailable - notifications will be disabled")
    } else {
      console.warn("[Notifications] FCM token unavailable:", errorMessage)
    }
    return null
  }
}

/**
 * Get stored FCM token (without requesting new one)
 */
export function getStoredFCMToken(): string | null {
  return localStorage.getItem(FCM_TOKEN_KEY)
}

/**
 * Setup foreground message handler
 */
export function setupForegroundListener(
  callback: (payload: { title: string; body: string; data?: Record<string, string> }) => void
): () => void {
  const msg = getMessagingInstance()
  if (!msg) return () => {}

  return onMessage(msg, (payload) => {
    console.log("[Notifications] Foreground message received:", payload)

    callback({
      title: payload.notification?.title || "Pratyaksha",
      body: payload.notification?.body || "",
      data: payload.data,
    })
  })
}

/**
 * Save notification preferences locally
 */
export function savePreferences(prefs: NotificationPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

/**
 * Load notification preferences
 */
export function loadPreferences(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(PREFS_KEY)
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error("[Notifications] Failed to load preferences:", error)
  }
  return DEFAULT_PREFERENCES
}

/**
 * Show a local notification (for foreground messages)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (getPermissionStatus() !== "granted") return

  // Use service worker to show notification
  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(title, {
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    ...options,
  })
}

/**
 * Register the FCM token with the backend
 */
export async function registerTokenWithBackend(
  userId: string,
  token: string,
  preferences: NotificationPreferences
): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        fcmToken: token,
        preferences,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("[Notifications] Failed to register token:", error)
    return false
  }
}

/**
 * Update notification preferences on the backend
 */
export async function updatePreferencesOnBackend(
  userId: string,
  preferences: NotificationPreferences
): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        preferences,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("[Notifications] Failed to update preferences:", error)
    return false
  }
}

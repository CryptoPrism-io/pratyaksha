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

export interface NotificationPreferences {
  enabled: boolean
  dailyReminder: boolean
  dailyReminderTime: string // HH:MM format
  streakAtRisk: boolean
  weeklySummary: boolean
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  dailyReminder: true,
  dailyReminderTime: "20:00", // 8 PM default
  streakAtRisk: true,
  weeklySummary: false,
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

    const token = await getToken(msg, { vapidKey })

    if (token) {
      // Store token locally
      localStorage.setItem(FCM_TOKEN_KEY, token)
      return token
    }

    return null
  } catch (error) {
    console.error("[Notifications] Failed to get FCM token:", error)
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

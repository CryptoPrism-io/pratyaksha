// Hook for managing push notifications
import { useState, useEffect, useCallback } from "react"
import {
  isPushSupported,
  getPermissionStatus,
  requestPermission,
  getFCMToken,
  setupForegroundListener,
  savePreferences,
  loadPreferences,
  registerTokenWithBackend,
  updatePreferencesOnBackend,
  showLocalNotification,
  type NotificationPreferences,
} from "../lib/notifications"
import { useAuth } from "../contexts/AuthContext"

export interface UseNotificationsReturn {
  // State
  isSupported: boolean
  permission: NotificationPermission
  isEnabled: boolean
  isLoading: boolean
  preferences: NotificationPreferences
  error: string | null

  // Actions
  enableNotifications: () => Promise<boolean>
  disableNotifications: () => Promise<void>
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth()

  const [isSupported] = useState(() => isPushSupported())
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    getPermissionStatus()
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    loadPreferences()
  )

  // Check permission on mount
  useEffect(() => {
    setPermission(getPermissionStatus())
  }, [])

  // Setup foreground listener when enabled
  useEffect(() => {
    if (!isSupported || permission !== "granted" || !preferences.enabled) {
      return
    }

    const unsubscribe = setupForegroundListener((payload) => {
      // Show native notification if app is not focused
      if (document.hidden) {
        showLocalNotification(payload.title, {
          body: payload.body,
          data: payload.data,
        })
      }
    })

    return unsubscribe
  }, [isSupported, permission, preferences.enabled])

  // Pass Firebase config to service worker
  useEffect(() => {
    if (!isSupported || permission !== "granted") return

    const sendConfigToSW = async () => {
      const registration = await navigator.serviceWorker.ready
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      }

      registration.active?.postMessage({
        type: "FIREBASE_CONFIG",
        config: firebaseConfig,
      })
    }

    sendConfigToSW()
  }, [isSupported, permission])

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications are not supported in this browser.")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request permission
      const perm = await requestPermission()
      setPermission(perm)

      if (perm !== "granted") {
        setError("Please enable notifications in your browser settings.")
        return false
      }

      // Get FCM token
      const token = await getFCMToken()
      if (!token) {
        setError("Could not setup push notifications. Please try again.")
        return false
      }

      // Update preferences
      const newPrefs = { ...preferences, enabled: true }
      setPreferences(newPrefs)
      savePreferences(newPrefs)

      // Register with backend if user is logged in
      if (user?.uid) {
        await registerTokenWithBackend(user.uid, token, newPrefs)
      }

      return true
    } catch (err) {
      console.error("[useNotifications] Enable failed:", err)
      setError("Failed to enable notifications. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, preferences, user])

  const disableNotifications = useCallback(async (): Promise<void> => {
    const newPrefs = { ...preferences, enabled: false }
    setPreferences(newPrefs)
    savePreferences(newPrefs)

    // Update backend
    if (user?.uid) {
      await updatePreferencesOnBackend(user.uid, newPrefs)
    }
  }, [preferences, user])

  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>): Promise<void> => {
      const newPrefs = { ...preferences, ...updates }
      setPreferences(newPrefs)
      savePreferences(newPrefs)

      // Update backend
      if (user?.uid) {
        await updatePreferencesOnBackend(user.uid, newPrefs)
      }
    },
    [preferences, user]
  )

  return {
    isSupported,
    permission,
    isEnabled: preferences.enabled && permission === "granted",
    isLoading,
    error,
    preferences,
    enableNotifications,
    disableNotifications,
    updatePreferences,
  }
}

import { useState, useEffect, useCallback } from "react"

export type MicrophonePermissionState = "granted" | "denied" | "prompt" | "unknown"

interface UseMicrophonePermissionReturn {
  permission: MicrophonePermissionState
  isSupported: boolean
  requestPermission: () => Promise<boolean>
  checkPermission: () => Promise<MicrophonePermissionState>
}

/**
 * Hook to manage microphone permissions persistently.
 *
 * This hook:
 * 1. Checks permission status on mount using the Permissions API
 * 2. Provides a way to request permission proactively
 * 3. Listens for permission changes
 *
 * Usage:
 * - Call requestPermission() once when user first tries to use voice
 * - Permission will be remembered by browser for future sessions
 */
export function useMicrophonePermission(): UseMicrophonePermissionReturn {
  const [permission, setPermission] = useState<MicrophonePermissionState>("unknown")

  const isSupported = typeof navigator !== "undefined" &&
    "mediaDevices" in navigator &&
    "getUserMedia" in navigator.mediaDevices

  // Check current permission status
  const checkPermission = useCallback(async (): Promise<MicrophonePermissionState> => {
    if (!isSupported) {
      setPermission("denied")
      return "denied"
    }

    try {
      // Use Permissions API if available (Chrome, Edge)
      if ("permissions" in navigator) {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
        const state = result.state as MicrophonePermissionState
        setPermission(state)
        return state
      }

      // Fallback: we don't know the state
      return "unknown"
    } catch (error) {
      // Permissions API not supported (Safari, Firefox)
      // We'll find out when we try to use it
      console.log("[Microphone] Permissions API not available, will check on use")
      return "unknown"
    }
  }, [isSupported])

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("[Microphone] MediaDevices API not supported")
      return false
    }

    try {
      // Request microphone access - this will prompt user if not already granted
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      })

      // Permission granted - stop the stream immediately
      // We just wanted to trigger the permission prompt
      stream.getTracks().forEach(track => track.stop())

      setPermission("granted")
      console.log("[Microphone] Permission granted")
      return true
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setPermission("denied")
          console.warn("[Microphone] Permission denied by user")
        } else if (error.name === "NotFoundError") {
          setPermission("denied")
          console.warn("[Microphone] No microphone found")
        } else {
          console.error("[Microphone] Error requesting permission:", error)
        }
      }
      return false
    }
  }, [isSupported])

  // Check permission on mount and listen for changes
  useEffect(() => {
    if (!isSupported) return

    // Initial check
    checkPermission()

    // Listen for permission changes (Chrome/Edge)
    let permissionStatus: PermissionStatus | null = null

    const setupListener = async () => {
      try {
        if ("permissions" in navigator) {
          permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName })

          const handleChange = () => {
            setPermission(permissionStatus?.state as MicrophonePermissionState || "unknown")
          }

          permissionStatus.addEventListener("change", handleChange)

          return () => {
            permissionStatus?.removeEventListener("change", handleChange)
          }
        }
      } catch {
        // Permissions API not supported
      }
    }

    setupListener()
  }, [isSupported, checkPermission])

  return {
    permission,
    isSupported,
    requestPermission,
    checkPermission,
  }
}

// Storage key for tracking if we've asked for permission
const MIC_PERMISSION_ASKED_KEY = "pratyaksha_mic_permission_asked"

/**
 * Check if we've already asked for microphone permission in this session
 */
export function hasMicrophonePermissionBeenAsked(): boolean {
  try {
    return sessionStorage.getItem(MIC_PERMISSION_ASKED_KEY) === "true"
  } catch {
    return false
  }
}

/**
 * Mark that we've asked for microphone permission
 */
export function markMicrophonePermissionAsked(): void {
  try {
    sessionStorage.setItem(MIC_PERMISSION_ASKED_KEY, "true")
  } catch {
    // Ignore storage errors
  }
}

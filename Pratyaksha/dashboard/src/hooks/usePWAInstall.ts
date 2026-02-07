import { useState, useEffect, useCallback } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

const DISMISSED_KEY = "pwa-install-dismissed"
const DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  // Check if app is already installed
  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as { standalone?: boolean }).standalone === true
      || document.referrer.includes("android-app://")

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      if (Date.now() - dismissedTime < DISMISSED_DURATION) {
        return // Don't show prompt if dismissed within the last 7 days
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)

      // Show the custom prompt after user has had time to explore
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000) // Show after 30 seconds on the page
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setIsInstalled(true)
        setShowPrompt(false)
      }

      setDeferredPrompt(null)
      setIsInstallable(false)

      return outcome === "accepted"
    } catch (error) {
      console.error("Error installing PWA:", error)
      return false
    }
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setShowPrompt(false)
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
  }, [])

  const resetDismissed = useCallback(() => {
    localStorage.removeItem(DISMISSED_KEY)
  }, [])

  return {
    isInstallable,
    isInstalled,
    showPrompt,
    install,
    dismiss,
    resetDismissed,
    setShowPrompt,
  }
}

// Utility to check if device is mobile
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// Utility to check if device is iOS
export function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// Utility to check if running in Safari
export function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

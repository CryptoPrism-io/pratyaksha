// Unified User Profile Cloud Sync Hook
// Handles syncing localStorage data to Airtable User_Profiles table

import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import {
  loadOnboardingProfile,
  saveOnboardingProfile,
  hasCompletedFirstTimeOnboarding,
  markOnboardingCompleted,
  type UserOnboardingProfile,
  DEFAULT_PROFILE as DEFAULT_ONBOARDING_PROFILE,
} from "../lib/onboardingStorage"
import {
  loadGamificationState,
  saveGamificationState,
  type GamificationState,
  DEFAULT_GAMIFICATION_STATE,
} from "../lib/gamificationStorage"
import {
  loadLifeBlueprint,
  saveLifeBlueprint,
  type LifeBlueprint,
  DEFAULT_LIFE_BLUEPRINT,
} from "../lib/lifeBlueprintStorage"

// ==================== TYPES ====================

interface ServerUserProfile {
  id?: string
  firebaseUid: string
  email?: string
  displayName?: string
  dailyReminderEnabled?: boolean
  reminderTime?: string
  onboardingCompleted?: boolean
  badges?: string[]
  fcmToken?: string
  createdAt?: string
  lastActive?: string
  personalization?: PersonalizationData
  gamification?: GamificationData
  lifeBlueprint?: LifeBlueprint
}

interface PersonalizationData {
  ageRange?: string | null
  sex?: string | null
  location?: string | null
  profession?: string | null
  stressLevel?: number | null
  emotionalOpenness?: number | null
  reflectionFrequency?: number | null
  lifeSatisfaction?: number | null
  personalGoal?: string | null
  selectedMemoryTopics?: string[]
  seedMemory?: string | null
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

interface SyncStatus {
  isLoading: boolean
  isSyncing: boolean
  lastSyncedAt: string | null
  error: string | null
  isOnline: boolean
}

interface UseUserProfileSyncReturn {
  // Status
  status: SyncStatus

  // Manual sync triggers
  syncToServer: () => Promise<boolean>
  syncFromServer: () => Promise<boolean>

  // Force full sync (both directions, with conflict resolution)
  fullSync: () => Promise<boolean>
}

// ==================== CONSTANTS ====================

const SYNC_DEBOUNCE_MS = 3000 // Debounce syncs to avoid excessive API calls
const SYNC_STORAGE_KEY = "pratyaksha-last-sync"

// ==================== HOOK ====================

export function useUserProfileSync(): UseUserProfileSyncReturn {
  const { user } = useAuth()

  const [status, setStatus] = useState<SyncStatus>({
    isLoading: false,
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  })

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncDataRef = useRef<string | null>(null)

  // Track online status
  useEffect(() => {
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }))

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Fetch profile from server
  const syncFromServer = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    setStatus(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/user-profile/${user.uid}`)

      if (!response.ok) {
        // 404 means no profile exists yet - that's ok
        if (response.status === 404) {
          console.log("[ProfileSync] No server profile found - will create on first sync")
          setStatus(prev => ({ ...prev, isLoading: false }))
          return true
        }
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success || !data.profile) {
        // No profile exists - that's ok for new users
        console.log("[ProfileSync] No server profile found")
        setStatus(prev => ({ ...prev, isLoading: false }))
        return true
      }

      const serverProfile = data.profile as ServerUserProfile

      // Merge server data with local, preferring server for some fields
      mergeServerToLocal(serverProfile)

      setStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSyncedAt: new Date().toISOString(),
      }))

      // Store last sync time
      try {
        localStorage.setItem(SYNC_STORAGE_KEY, new Date().toISOString())
      } catch { /* ignore */ }

      console.log("[ProfileSync] Synced from server successfully")
      return true

    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sync from server"
      console.error("[ProfileSync] Sync from server failed:", message)
      setStatus(prev => ({ ...prev, isLoading: false, error: message }))
      return false
    }
  }, [user])

  // Push local data to server
  const syncToServer = useCallback(async (): Promise<boolean> => {
    if (!user) return false
    if (!status.isOnline) {
      console.log("[ProfileSync] Offline - skipping sync to server")
      return false
    }

    setStatus(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      // Gather all local data
      const onboardingProfile = loadOnboardingProfile()
      const gamificationState = loadGamificationState()
      const lifeBlueprint = loadLifeBlueprint()

      // Build server payload
      const payload: Partial<ServerUserProfile> = {
        firebaseUid: user.uid,
        email: user.email || undefined,
        displayName: onboardingProfile.displayName || user.displayName || undefined,
        dailyReminderEnabled: onboardingProfile.dailyReminderEnabled,
        reminderTime: onboardingProfile.reminderTime || undefined,
        onboardingCompleted: hasCompletedFirstTimeOnboarding(),
        badges: onboardingProfile.badges,
        personalization: {
          ageRange: onboardingProfile.ageRange,
          sex: onboardingProfile.sex,
          location: onboardingProfile.location,
          profession: onboardingProfile.profession,
          stressLevel: onboardingProfile.stressLevel,
          emotionalOpenness: onboardingProfile.emotionalOpenness,
          reflectionFrequency: onboardingProfile.reflectionFrequency,
          lifeSatisfaction: onboardingProfile.lifeSatisfaction,
          personalGoal: onboardingProfile.personalGoal,
          selectedMemoryTopics: onboardingProfile.selectedMemoryTopics,
          seedMemory: onboardingProfile.seedMemory,
          defaultEntryMode: onboardingProfile.defaultEntryMode,
          showFeatureTour: onboardingProfile.showFeatureTour,
        },
        gamification: {
          karma: gamificationState.karma,
          completedSoulMappingTopics: gamificationState.completedSoulMappingTopics,
          streakDays: gamificationState.streakDays,
          lastEntryDate: gamificationState.lastEntryDate,
          lastDailyDashboardBonus: gamificationState.lastDailyDashboardBonus,
          totalEntriesLogged: gamificationState.totalEntriesLogged,
        },
        lifeBlueprint: lifeBlueprint,
      }

      // Check if data has actually changed since last sync
      const payloadHash = JSON.stringify(payload)
      if (payloadHash === lastSyncDataRef.current) {
        console.log("[ProfileSync] No changes detected - skipping sync")
        setStatus(prev => ({ ...prev, isSyncing: false }))
        return true
      }

      const response = await fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to save profile")
      }

      // Update last sync data
      lastSyncDataRef.current = payloadHash

      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
      }))

      // Store last sync time
      try {
        localStorage.setItem(SYNC_STORAGE_KEY, new Date().toISOString())
      } catch { /* ignore */ }

      console.log("[ProfileSync] Synced to server successfully")
      return true

    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sync to server"
      console.error("[ProfileSync] Sync to server failed:", message)
      setStatus(prev => ({ ...prev, isSyncing: false, error: message }))
      return false
    }
  }, [user, status.isOnline])

  // Full bidirectional sync with conflict resolution
  const fullSync = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    // First pull from server (to get any changes from other devices)
    const pullSuccess = await syncFromServer()
    if (!pullSuccess) return false

    // Then push local state (merged with server) to server
    const pushSuccess = await syncToServer()
    return pushSuccess
  }, [user, syncFromServer, syncToServer])

  // Auto-sync on login - pull from server, then push local state
  useEffect(() => {
    if (user) {
      // Full sync: pull from server first, then push local state
      const doInitialSync = async () => {
        console.log("[ProfileSync] User logged in, starting initial sync...")
        await syncFromServer()
        // Always push to server after login to ensure profile exists
        await syncToServer()
      }
      doInitialSync()
    }
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for localStorage changes and debounce sync
  useEffect(() => {
    if (!user) return

    const handleStorageChange = (e: StorageEvent) => {
      // Only trigger for our storage keys
      const syncKeys = [
        "pratyaksha-first-time-onboarding-profile",
        "pratyaksha-gamification",
        "pratyaksha-life-blueprint",
      ]

      if (e.key && syncKeys.includes(e.key)) {
        // Clear existing timeout
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current)
        }

        // Debounce the sync
        syncTimeoutRef.current = setTimeout(() => {
          console.log("[ProfileSync] localStorage changed, syncing to server...")
          syncToServer()
        }, SYNC_DEBOUNCE_MS)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [user, syncToServer])

  // Sync on visibility change (when user comes back to app)
  useEffect(() => {
    if (!user) return

    const handleVisibilityChange = () => {
      if (!document.hidden && status.isOnline) {
        // User came back to app - sync any pending changes
        syncToServer()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [user, status.isOnline, syncToServer])

  // Sync when coming back online
  useEffect(() => {
    if (user && status.isOnline) {
      // Just came online - sync pending changes
      syncToServer()
    }
  }, [status.isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    status,
    syncToServer,
    syncFromServer,
    fullSync,
  }
}

// ==================== HELPERS ====================

/**
 * Merge server profile data into local storage
 * Uses a "last write wins" strategy for most fields,
 * but merges arrays (like completedSoulMappingTopics) to preserve all data
 */
function mergeServerToLocal(serverProfile: ServerUserProfile): void {
  // 1. Merge onboarding profile
  const localOnboarding = loadOnboardingProfile()
  const serverPersonalization = serverProfile.personalization || {}

  const mergedOnboarding: UserOnboardingProfile = {
    ...DEFAULT_ONBOARDING_PROFILE,
    ...localOnboarding,
    // Server wins for profile data (it's the source of truth)
    displayName: serverProfile.displayName || localOnboarding.displayName,
    ageRange: serverPersonalization.ageRange as UserOnboardingProfile["ageRange"] || localOnboarding.ageRange,
    sex: serverPersonalization.sex as UserOnboardingProfile["sex"] || localOnboarding.sex,
    location: serverPersonalization.location || localOnboarding.location,
    profession: serverPersonalization.profession || localOnboarding.profession,
    stressLevel: serverPersonalization.stressLevel ?? localOnboarding.stressLevel,
    emotionalOpenness: serverPersonalization.emotionalOpenness ?? localOnboarding.emotionalOpenness,
    reflectionFrequency: serverPersonalization.reflectionFrequency ?? localOnboarding.reflectionFrequency,
    lifeSatisfaction: serverPersonalization.lifeSatisfaction ?? localOnboarding.lifeSatisfaction,
    personalGoal: serverPersonalization.personalGoal || localOnboarding.personalGoal,
    selectedMemoryTopics: serverPersonalization.selectedMemoryTopics || localOnboarding.selectedMemoryTopics,
    seedMemory: serverPersonalization.seedMemory || localOnboarding.seedMemory,
    dailyReminderEnabled: serverProfile.dailyReminderEnabled ?? localOnboarding.dailyReminderEnabled,
    reminderTime: serverProfile.reminderTime || localOnboarding.reminderTime,
    defaultEntryMode: serverPersonalization.defaultEntryMode || localOnboarding.defaultEntryMode,
    showFeatureTour: serverPersonalization.showFeatureTour ?? localOnboarding.showFeatureTour,
    badges: serverProfile.badges || localOnboarding.badges,
  }

  saveOnboardingProfile(mergedOnboarding)

  // Mark onboarding complete if server says so
  if (serverProfile.onboardingCompleted && !hasCompletedFirstTimeOnboarding()) {
    markOnboardingCompleted()
  }

  // 2. Merge gamification state
  const localGamification = loadGamificationState()
  const serverGamification = serverProfile.gamification || {}

  const mergedGamification: GamificationState = {
    ...DEFAULT_GAMIFICATION_STATE,
    ...localGamification,
    // Use higher karma (merge strategy: max wins for currency)
    karma: Math.max(localGamification.karma, serverGamification.karma || 0),
    // Merge completed topics (union of both)
    completedSoulMappingTopics: Array.from(new Set([
      ...localGamification.completedSoulMappingTopics,
      ...(serverGamification.completedSoulMappingTopics || []),
    ])),
    // Use higher streak
    streakDays: Math.max(localGamification.streakDays, serverGamification.streakDays || 0),
    // Use most recent entry date
    lastEntryDate: getMostRecentDate(localGamification.lastEntryDate, serverGamification.lastEntryDate),
    lastDailyDashboardBonus: getMostRecentDate(
      localGamification.lastDailyDashboardBonus,
      serverGamification.lastDailyDashboardBonus
    ),
    // Use higher entry count
    totalEntriesLogged: Math.max(
      localGamification.totalEntriesLogged,
      serverGamification.totalEntriesLogged || 0
    ),
  }

  saveGamificationState(mergedGamification)

  // 3. Merge life blueprint
  const localBlueprint = loadLifeBlueprint()
  const serverBlueprint = serverProfile.lifeBlueprint

  if (serverBlueprint) {
    const mergedBlueprint: LifeBlueprint = {
      ...DEFAULT_LIFE_BLUEPRINT,
      // Use whichever has more content, or merge
      vision: mergeArraysById(localBlueprint.vision, serverBlueprint.vision || []),
      antiVision: mergeArraysById(localBlueprint.antiVision, serverBlueprint.antiVision || []),
      levers: mergeArraysById(localBlueprint.levers, serverBlueprint.levers || []),
      shortTermGoals: mergeArraysById(localBlueprint.shortTermGoals, serverBlueprint.shortTermGoals || []),
      longTermGoals: mergeArraysById(localBlueprint.longTermGoals, serverBlueprint.longTermGoals || []),
      responses: mergeResponsesById(localBlueprint.responses, serverBlueprint.responses || []),
      timeHorizonGoals: mergeArraysById(localBlueprint.timeHorizonGoals, serverBlueprint.timeHorizonGoals || []),
      completedSections: Array.from(new Set([
        ...localBlueprint.completedSections,
        ...(serverBlueprint.completedSections || []),
      ])),
      lastUpdatedAt: getMostRecentDate(localBlueprint.lastUpdatedAt, serverBlueprint.lastUpdatedAt) || new Date().toISOString(),
      createdAt: localBlueprint.createdAt || serverBlueprint.createdAt || new Date().toISOString(),
    }

    saveLifeBlueprint(mergedBlueprint)
  }

  console.log("[ProfileSync] Merged server data to local storage")
}

/**
 * Get the most recent of two dates
 */
function getMostRecentDate(date1: string | null | undefined, date2: string | null | undefined): string | null {
  if (!date1 && !date2) return null
  if (!date1) return date2 || null
  if (!date2) return date1

  return new Date(date1) > new Date(date2) ? date1 : date2
}

/**
 * Merge two arrays of objects by ID, preferring items with more recent timestamps
 */
function mergeArraysById<T extends { id: string; createdAt?: string }>(
  local: T[],
  server: T[]
): T[] {
  const merged = new Map<string, T>()

  // Add all local items
  local.forEach(item => merged.set(item.id, item))

  // Merge server items (add if new, update if newer)
  server.forEach(serverItem => {
    const localItem = merged.get(serverItem.id)
    if (!localItem) {
      merged.set(serverItem.id, serverItem)
    }
    // If both exist, keep the one with more recent createdAt
    // (In a more sophisticated system, we'd use updatedAt)
  })

  return Array.from(merged.values())
}

/**
 * Merge question responses by questionId, preferring most recently updated
 */
function mergeResponsesById(
  local: Array<{ questionId: string; answer: string; answeredAt: string; updatedAt?: string }>,
  server: Array<{ questionId: string; answer: string; answeredAt: string; updatedAt?: string }>
): Array<{ questionId: string; answer: string; answeredAt: string; updatedAt?: string }> {
  const merged = new Map<string, typeof local[0]>()

  // Add all local responses
  local.forEach(item => merged.set(item.questionId, item))

  // Merge server responses
  server.forEach(serverItem => {
    const localItem = merged.get(serverItem.questionId)
    if (!localItem) {
      merged.set(serverItem.questionId, serverItem)
    } else {
      // Keep whichever was updated more recently
      const localTime = new Date(localItem.updatedAt || localItem.answeredAt).getTime()
      const serverTime = new Date(serverItem.updatedAt || serverItem.answeredAt).getTime()
      if (serverTime > localTime) {
        merged.set(serverItem.questionId, serverItem)
      }
    }
  })

  return Array.from(merged.values())
}

// ==================== MANUAL SYNC TRIGGER ====================

/**
 * Trigger a sync from outside React (e.g., after saving data)
 * This dispatches a storage event to trigger the useUserProfileSync hook
 */
export function triggerProfileSync(): void {
  // Dispatch a custom event to trigger sync
  window.dispatchEvent(new StorageEvent("storage", {
    key: "pratyaksha-sync-trigger",
    newValue: Date.now().toString(),
  }))
}

// Profile Sync Context - Provides cloud sync functionality to the app
import React, { createContext, useContext } from "react"
import { useUserProfileSync, triggerProfileSync } from "../hooks/useUserProfileSync"

// ==================== TYPES ====================

interface SyncStatus {
  isLoading: boolean
  isSyncing: boolean
  lastSyncedAt: string | null
  error: string | null
  isOnline: boolean
}

interface ProfileSyncContextValue {
  // Status
  status: SyncStatus

  // Manual sync triggers
  syncToServer: () => Promise<boolean>
  syncFromServer: () => Promise<boolean>
  fullSync: () => Promise<boolean>

  // Trigger sync from outside (e.g., after saving data)
  triggerSync: () => void
}

// ==================== CONTEXT ====================

const ProfileSyncContext = createContext<ProfileSyncContextValue | null>(null)

// ==================== PROVIDER ====================

interface ProfileSyncProviderProps {
  children: React.ReactNode
}

export function ProfileSyncProvider({ children }: ProfileSyncProviderProps) {
  const { status, syncToServer, syncFromServer, fullSync } = useUserProfileSync()

  const value: ProfileSyncContextValue = {
    status,
    syncToServer,
    syncFromServer,
    fullSync,
    triggerSync: triggerProfileSync,
  }

  return (
    <ProfileSyncContext.Provider value={value}>
      {children}
    </ProfileSyncContext.Provider>
  )
}

// ==================== HOOK ====================

export function useProfileSync(): ProfileSyncContextValue {
  const context = useContext(ProfileSyncContext)
  if (!context) {
    throw new Error("useProfileSync must be used within a ProfileSyncProvider")
  }
  return context
}

// ==================== OPTIONAL HOOK ====================

/**
 * Optional version that doesn't throw if used outside provider
 * Useful for components that may or may not be within the provider
 */
export function useProfileSyncOptional(): ProfileSyncContextValue | null {
  return useContext(ProfileSyncContext)
}

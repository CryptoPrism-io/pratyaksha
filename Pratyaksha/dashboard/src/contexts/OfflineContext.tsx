/**
 * Offline Context Provider
 * Provides offline sync state and methods throughout the app
 */

import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import { useOfflineSync } from "../hooks/useOfflineSync"
import type { PendingEntry } from "../lib/offlineDb"

interface OfflineContextValue {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  pendingEntries: PendingEntry[]
  submitEntry: (text: string) => Promise<{ success: boolean; offline: boolean }>
  syncPendingEntries: () => Promise<void>
  retryFailedEntries: () => Promise<void>
  clearFailedEntry: (id: string) => Promise<void>
  refreshPendingEntries: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextValue | null>(null)

export function OfflineProvider({ children }: { children: ReactNode }) {
  const offlineSync = useOfflineSync()

  return (
    <OfflineContext.Provider value={offlineSync}>
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider")
  }
  return context
}

/**
 * Offline Sync Hook
 * Manages online/offline status and syncs pending entries
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  initOfflineDb,
  addPendingEntry,
  getPendingEntries,
  updatePendingEntry,
  removePendingEntry,
} from "../lib/offlineDb"
import type { PendingEntry } from "../lib/offlineDb"

const MAX_RETRIES = 3
const SYNC_INTERVAL = 30000 // 30 seconds

export interface OfflineSyncState {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  pendingEntries: PendingEntry[]
}

export function useOfflineSync() {
  const queryClient = useQueryClient()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([])
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize IndexedDB on mount
  useEffect(() => {
    initOfflineDb().catch(console.error)
    refreshPendingEntries()
  }, [])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success("You're back online!")
      // Trigger sync when coming back online
      syncPendingEntries()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning("You're offline. Entries will be saved locally.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Set up periodic sync when online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncIntervalRef.current = setInterval(() => {
        syncPendingEntries()
      }, SYNC_INTERVAL)
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
    }
  }, [isOnline, pendingCount])

  /**
   * Refresh the pending entries list
   */
  const refreshPendingEntries = useCallback(async () => {
    try {
      const entries = await getPendingEntries()
      setPendingEntries(entries)
      setPendingCount(entries.length)
    } catch (error) {
      console.error("[OfflineSync] Failed to refresh pending entries:", error)
    }
  }, [])

  /**
   * Queue an entry for later sync (when offline)
   */
  const queueEntry = useCallback(async (text: string): Promise<PendingEntry> => {
    const entry = await addPendingEntry(text)
    await refreshPendingEntries()
    return entry
  }, [refreshPendingEntries])

  /**
   * Sync a single entry to the server
   */
  const syncEntry = useCallback(async (entry: PendingEntry): Promise<boolean> => {
    try {
      // Mark as syncing
      await updatePendingEntry(entry.id, { status: "syncing" })

      // Send to server
      const response = await fetch("/api/process-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: entry.text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Remove from pending queue
        await removePendingEntry(entry.id)
        console.log("[OfflineSync] Entry synced successfully:", entry.id)
        return true
      } else {
        throw new Error(result.error || "Unknown error")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("[OfflineSync] Failed to sync entry:", entry.id, errorMessage)

      // Update retry count and status
      const newRetryCount = entry.retryCount + 1
      await updatePendingEntry(entry.id, {
        status: newRetryCount >= MAX_RETRIES ? "failed" : "pending",
        retryCount: newRetryCount,
        lastError: errorMessage,
      })

      return false
    }
  }, [])

  /**
   * Sync all pending entries
   */
  const syncPendingEntries = useCallback(async () => {
    if (!isOnline || isSyncing) return

    const entries = await getPendingEntries()
    const pendingToSync = entries.filter(
      (e) => e.status === "pending" && e.retryCount < MAX_RETRIES
    )

    if (pendingToSync.length === 0) return

    setIsSyncing(true)
    console.log(`[OfflineSync] Syncing ${pendingToSync.length} entries...`)

    let successCount = 0
    let failCount = 0

    for (const entry of pendingToSync) {
      const success = await syncEntry(entry)
      if (success) {
        successCount++
      } else {
        failCount++
      }
    }

    setIsSyncing(false)
    await refreshPendingEntries()

    // Invalidate entries query to refresh the list
    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["entries"] })
      toast.success(`Synced ${successCount} offline ${successCount === 1 ? "entry" : "entries"}`)
    }

    if (failCount > 0) {
      toast.error(`Failed to sync ${failCount} ${failCount === 1 ? "entry" : "entries"}`)
    }
  }, [isOnline, isSyncing, syncEntry, refreshPendingEntries, queryClient])

  /**
   * Submit entry - queues if offline, sends directly if online
   */
  const submitEntry = useCallback(async (text: string): Promise<{ success: boolean; offline: boolean }> => {
    if (!isOnline) {
      // Queue for later
      await queueEntry(text)
      return { success: true, offline: true }
    }

    // Try to send directly
    try {
      const response = await fetch("/api/process-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["entries"] })
        return { success: true, offline: false }
      } else {
        throw new Error(result.error || "Unknown error")
      }
    } catch (error) {
      // If network error, queue for later
      if (!navigator.onLine) {
        await queueEntry(text)
        setIsOnline(false)
        return { success: true, offline: true }
      }
      throw error
    }
  }, [isOnline, queueEntry, queryClient])

  /**
   * Retry failed entries
   */
  const retryFailedEntries = useCallback(async () => {
    const entries = await getPendingEntries()
    const failed = entries.filter((e) => e.status === "failed")

    for (const entry of failed) {
      await updatePendingEntry(entry.id, {
        status: "pending",
        retryCount: 0,
        lastError: undefined,
      })
    }

    await refreshPendingEntries()

    if (isOnline && failed.length > 0) {
      syncPendingEntries()
    }
  }, [isOnline, refreshPendingEntries, syncPendingEntries])

  /**
   * Clear a specific failed entry
   */
  const clearFailedEntry = useCallback(async (id: string) => {
    await removePendingEntry(id)
    await refreshPendingEntries()
  }, [refreshPendingEntries])

  return {
    isOnline,
    isSyncing,
    pendingCount,
    pendingEntries,
    submitEntry,
    syncPendingEntries,
    retryFailedEntries,
    clearFailedEntry,
    refreshPendingEntries,
  }
}

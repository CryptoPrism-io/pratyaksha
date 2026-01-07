/**
 * Offline Indicator Component
 * Shows online/offline status and pending entry count
 */

import { Wifi, WifiOff, CloudUpload, AlertCircle, RefreshCw, X } from "lucide-react"
import { useOfflineSync } from "../../hooks/useOfflineSync"
import { cn } from "../../lib/utils"
import { useState } from "react"

export function OfflineIndicator() {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    pendingEntries,
    syncPendingEntries,
    retryFailedEntries,
    clearFailedEntry,
  } = useOfflineSync()

  const [showDetails, setShowDetails] = useState(false)

  const failedCount = pendingEntries.filter((e) => e.status === "failed").length

  // Don't show if online with no pending entries
  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main indicator pill */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all",
          "border backdrop-blur-sm",
          isOnline
            ? pendingCount > 0
              ? "bg-amber-500/90 text-white border-amber-600"
              : "bg-green-500/90 text-white border-green-600"
            : "bg-red-500/90 text-white border-red-600"
        )}
      >
        {isOnline ? (
          isSyncing ? (
            <CloudUpload className="h-4 w-4 animate-pulse" />
          ) : pendingCount > 0 ? (
            <CloudUpload className="h-4 w-4" />
          ) : (
            <Wifi className="h-4 w-4" />
          )
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isOnline
            ? isSyncing
              ? "Syncing..."
              : pendingCount > 0
                ? `${pendingCount} pending`
                : "Online"
            : "Offline"}
        </span>
        {failedCount > 0 && (
          <span className="flex items-center gap-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
            <AlertCircle className="h-3 w-3" />
            {failedCount}
          </span>
        )}
      </button>

      {/* Details panel */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 w-72 rounded-xl bg-card border shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Sync Status</h4>
            <button
              onClick={() => setShowDetails(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b">
            {isOnline ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Connected</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm">Offline - entries will sync when connected</span>
              </>
            )}
          </div>

          {/* Pending entries */}
          {pendingCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending entries</span>
                <span className="font-medium">{pendingCount}</span>
              </div>

              {/* Entry list */}
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {pendingEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg text-xs",
                      entry.status === "failed"
                        ? "bg-red-500/10"
                        : entry.status === "syncing"
                          ? "bg-amber-500/10"
                          : "bg-secondary"
                    )}
                  >
                    <div className="flex-1 truncate mr-2">
                      <p className="truncate text-foreground">
                        {entry.text.slice(0, 50)}...
                      </p>
                      <p className="text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleTimeString()}
                        {entry.status === "failed" && (
                          <span className="ml-1 text-red-500">Failed</span>
                        )}
                        {entry.status === "syncing" && (
                          <span className="ml-1 text-amber-500">Syncing...</span>
                        )}
                      </p>
                    </div>
                    {entry.status === "failed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          clearFailedEntry(entry.id)
                        }}
                        className="text-muted-foreground hover:text-red-500"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {isOnline && pendingCount > 0 && (
                  <button
                    onClick={syncPendingEntries}
                    disabled={isSyncing}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      isSyncing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </button>
                )}
                {failedCount > 0 && (
                  <button
                    onClick={retryFailedEntries}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-secondary hover:bg-secondary/80"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Failed
                  </button>
                )}
              </div>
            </div>
          )}

          {pendingCount === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              All entries synced
            </p>
          )}
        </div>
      )}
    </div>
  )
}

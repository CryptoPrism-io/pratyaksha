import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { useEntries, useDeleteEntry, useToggleBookmark } from "../../hooks/useEntries"
import { Eye, X, AlertCircle, RefreshCw, Star, Pencil, Trash2 } from "lucide-react"
import type { Entry } from "../../lib/airtable"
import { EntryCards } from "./EntryCard"
import { Skeleton } from "../ui/skeleton"
import { ConfirmDialog } from "../ui/confirm-dialog"
import { EditEntryModal } from "../entries/EditEntryModal"
import { cn } from "../../lib/utils"
import { toast } from "sonner"
import type { FilterState } from "../filters/FilterBar"
import { getDateRangeFromPreset, isDateInRange } from "../../lib/dateFilters"

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b pb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

const SENTIMENT_BADGE = {
  positive: "bg-positive/20 text-positive",
  negative: "bg-negative/20 text-negative",
  neutral: "bg-neutral/20 text-neutral",
  mixed: "bg-secondary/20 text-secondary",
}

function getSentimentType(sentiment: string): keyof typeof SENTIMENT_BADGE {
  const lower = sentiment.toLowerCase()
  if (lower.includes("positive")) return "positive"
  if (lower.includes("negative")) return "negative"
  if (lower.includes("mixed")) return "mixed"
  return "neutral"
}

function groupEntriesByDate(entries: Entry[]): { label: string; entries: Entry[] }[] {
  const now = new Date()
  const todayStr = now.toDateString()
  const yesterday = new Date(now.getTime() - 86400000)
  const yesterdayStr = yesterday.toDateString()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const groups: { label: string; entries: Entry[] }[] = [
    { label: "Today", entries: [] },
    { label: "Yesterday", entries: [] },
    { label: "This Week", entries: [] },
    { label: "This Month", entries: [] },
    { label: "Older", entries: [] },
  ]

  for (const entry of entries) {
    const d = new Date(entry.date)
    const dStr = d.toDateString()
    if (dStr === todayStr) {
      groups[0].entries.push(entry)
    } else if (dStr === yesterdayStr) {
      groups[1].entries.push(entry)
    } else if (d >= weekAgo) {
      groups[2].entries.push(entry)
    } else if (d >= monthStart) {
      groups[3].entries.push(entry)
    } else {
      groups[4].entries.push(entry)
    }
  }

  return groups.filter(g => g.entries.length > 0)
}

interface EntryModalProps {
  entry: Entry
  onClose: () => void
  onEdit?: (entry: Entry) => void
  onDelete?: (entry: Entry) => void
  onToggleBookmark?: (entry: Entry) => void
}

function EntryModal({ entry, onClose, onEdit, onDelete, onToggleBookmark }: EntryModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl rounded-xl p-4 sm:p-6 shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{entry.name || "Untitled Entry"}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(entry.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Bookmark */}
              {onToggleBookmark && (
                <button
                  onClick={() => onToggleBookmark(entry)}
                  aria-label={entry.isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  className="rounded-full p-2 hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Star
                    className={cn(
                      "h-5 w-5 transition-colors",
                      entry.isBookmarked
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground hover:text-yellow-400"
                    )}
                  />
                </button>
              )}
              {/* Edit */}
              {onEdit && (
                <button
                  onClick={() => {
                    onClose()
                    onEdit(entry)
                  }}
                  aria-label="Edit entry"
                  className="rounded-full p-2 hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Pencil className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
              {/* Delete */}
              {onDelete && (
                <button
                  onClick={() => {
                    onClose()
                    onDelete(entry)
                  }}
                  aria-label="Delete entry"
                  className="rounded-full p-2 hover:bg-destructive/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </button>
              )}
              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close entry details"
                className="rounded-full p-2 hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Entry Text */}
          <div className="mb-6 rounded-lg bg-slate-100 dark:bg-slate-800 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {entry.text || "No content"}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Type</p>
              <p className="font-medium text-slate-900 dark:text-white">{entry.type || "—"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mode</p>
              <p className="font-medium text-slate-900 dark:text-white">{entry.inferredMode || "—"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Energy</p>
              <p className="font-medium text-slate-900 dark:text-white">{entry.inferredEnergy || "—"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Energy Shape</p>
              <p className="font-medium text-slate-900 dark:text-white">{entry.energyShape || "—"}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sentiment</p>
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${SENTIMENT_BADGE[getSentimentType(entry.sentimentAI)]}`}>
                {entry.sentimentAI || "—"}
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Contradiction</p>
              <p className="font-medium text-slate-900 dark:text-white">{entry.contradiction || "—"}</p>
            </div>
          </div>

          {/* Tags */}
          {entry.themeTagsAI.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Theme Tags</p>
              <div className="flex flex-wrap gap-2">
                {entry.themeTagsAI.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Snapshot & Insights */}
          {entry.snapshot && (
            <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Snapshot</p>
              <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{entry.snapshot}</p>
            </div>
          )}

          {entry.actionableInsightsAI && (
            <div className="mt-4 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 p-3">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Actionable Insights</p>
              <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{entry.actionableInsightsAI}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

interface EntriesTableProps {
  filters?: FilterState
  selectedIndex?: number
  onSelectedIndexChange?: (index: number) => void
}

export function EntriesTable({ filters, selectedIndex: externalSelectedIndex, onSelectedIndexChange }: EntriesTableProps) {
  const { data: entries, isLoading, error, refetch } = useEntries()
  const deleteEntryMutation = useDeleteEntry()
  const toggleBookmarkMutation = useToggleBookmark()
  
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null)
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(-1)
  const isMobile = useIsMobile()

  // Handlers
  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry)
  }

  const handleDelete = (entry: Entry) => {
    setDeletingEntry(entry)
  }

  const handleConfirmDelete = async () => {
    if (!deletingEntry) return
    try {
      await deleteEntryMutation.mutateAsync(deletingEntry.id)
      toast.success("Entry deleted")
      setDeletingEntry(null)
    } catch (error) {
      toast.error("Failed to delete entry")
    }
  }

  const handleToggleBookmark = async (entry: Entry) => {
    try {
      await toggleBookmarkMutation.mutateAsync({
        recordId: entry.id,
        bookmarked: !entry.isBookmarked,
      })
      toast.success(entry.isBookmarked ? "Bookmark removed" : "Bookmark added")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("[Bookmark] Error:", errorMessage)
      // Check for common Airtable field-not-found error
      if (errorMessage.includes("UNKNOWN_FIELD_NAME") || errorMessage.includes("Is Bookmarked")) {
        toast.error("Bookmark field not configured", {
          description: "Add 'Is Bookmarked?' checkbox field to Airtable"
        })
      } else {
        toast.error("Failed to update bookmark", { description: errorMessage })
      }
    }
  }

  // Use external or internal selected index
  const selectedRowIndex = externalSelectedIndex ?? internalSelectedIndex
  const setSelectedRowIndex = onSelectedIndexChange ?? setInternalSelectedIndex

  // Filter entries based on filter state
  const filteredEntries = useMemo(() => {
    if (!entries) return []

    return entries.filter((entry) => {
      // Search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          entry.name?.toLowerCase().includes(searchLower) ||
          entry.text?.toLowerCase().includes(searchLower) ||
          entry.type?.toLowerCase().includes(searchLower) ||
          entry.contradiction?.toLowerCase().includes(searchLower) ||
          entry.themeTagsAI?.some((tag) => tag.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Date range filter
      if (filters?.dateRange && filters.dateRange !== "all") {
        const range = getDateRangeFromPreset(filters.dateRange as Parameters<typeof getDateRangeFromPreset>[0])
        if (range && !isDateInRange(entry.date, range)) return false
      }

      // Type filter
      if (filters?.type && filters.type !== "all") {
        if (entry.type !== filters.type) return false
      }

      // Sentiment filter
      if (filters?.sentiment && filters.sentiment !== "all") {
        if (!entry.sentimentAI?.toLowerCase().includes(filters.sentiment.toLowerCase())) return false
      }

      // Mode filter
      if (filters?.mode && filters.mode !== "all") {
        if (entry.inferredMode !== filters.mode) return false
      }

      // Energy filter
      if (filters?.energy && filters.energy !== "all") {
        if (entry.inferredEnergy !== filters.energy) return false
      }

      // Bookmark filter
      if (filters?.bookmarked && filters.bookmarked !== "all") {
        if (filters.bookmarked === "bookmarked" && !entry.isBookmarked) return false
        if (filters.bookmarked === "not-bookmarked" && entry.isBookmarked) return false
      }

      return true
    })
  }, [entries, filters])

  if (isLoading) {
    return isMobile ? <CardsSkeleton /> : <TableSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Failed to load entries</p>
        <button
          onClick={() => refetch?.()}
          className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">No entries yet</p>
        <p className="text-xs">Your journal entries will appear here</p>
      </div>
    )
  }

  // Show no results message if filters exclude all entries
  if (filteredEntries.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">No entries match your filters</p>
        <p className="text-xs">Try adjusting your search or filter criteria</p>
      </div>
    )
  }

  // Sort entries by date descending (newest first)
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Show cards on mobile, grouped rows on desktop
  if (isMobile) {
    return (
      <>
        <EntryCards
          entries={sortedEntries}
          onView={setSelectedEntry}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleBookmark={handleToggleBookmark}
        />
        {selectedEntry && (
          <EntryModal
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
        {/* Edit Modal */}
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingEntry}
          onOpenChange={(open) => !open && setDeletingEntry(null)}
          title="Delete Entry"
          description="Are you sure you want to delete this entry? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          isLoading={deleteEntryMutation.isPending}
        />
      </>
    )
  }

  // Desktop: date-grouped card rows
  const groups = groupEntriesByDate(sortedEntries)

  return (
    <>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            {/* Group header */}
            <div className="mb-1.5 flex items-center gap-2 px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
              <span className="text-xs text-muted-foreground">
                · {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {/* Entry rows */}
            <div className="space-y-0.5">
              {group.entries.map((entry) => {
                const flatIndex = sortedEntries.indexOf(entry)
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors",
                      "hover:bg-muted/50",
                      selectedRowIndex === flatIndex && "bg-primary/10 ring-1 ring-inset ring-primary/20"
                    )}
                    onClick={() => setSelectedRowIndex(flatIndex)}
                    onDoubleClick={() => setSelectedEntry(entry)}
                    tabIndex={0}
                    role="row"
                    aria-selected={selectedRowIndex === flatIndex}
                  >
                    {/* Date */}
                    <span className="w-12 shrink-0 text-right text-xs font-medium text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>

                    {/* Type tag */}
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {entry.type || "—"}
                    </span>

                    {/* Sentiment tag */}
                    <span
                      className={cn(
                        "hidden sm:inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        SENTIMENT_BADGE[getSentimentType(entry.sentimentAI)]
                      )}
                    >
                      {entry.sentimentAI?.split(" ")[0] || "—"}
                    </span>

                    {/* Name / preview */}
                    <span className="flex-1 min-w-0">
                      {entry.name && (
                        <span className="block truncate text-sm font-medium leading-tight">{entry.name}</span>
                      )}
                      <span className="block truncate text-xs text-muted-foreground leading-tight">
                        {entry.text?.slice(0, 90) || "—"}
                      </span>
                    </span>

                    {/* Bookmark */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleBookmark(entry) }}
                      aria-label={entry.isBookmarked ? "Remove bookmark" : "Add bookmark"}
                      className="shrink-0 rounded-full p-1.5 hover:bg-muted transition-colors"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 transition-colors",
                          entry.isBookmarked
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground hover:text-yellow-400"
                        )}
                      />
                    </button>

                    {/* Hover actions */}
                    <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedEntry(entry) }}
                        aria-label={`View entry from ${new Date(entry.date).toLocaleDateString()}`}
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(entry) }}
                        aria-label="Edit entry"
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(entry) }}
                        aria-label="Delete entry"
                        className="rounded-full p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Entry Modal */}
      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* Edit Modal */}
      <EditEntryModal
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingEntry}
        onOpenChange={(open) => !open && setDeletingEntry(null)}
        title="Delete Entry"
        description="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteEntryMutation.isPending}
      />
    </>
  )
}

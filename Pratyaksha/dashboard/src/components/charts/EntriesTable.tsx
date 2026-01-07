import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { useEntries, useDeleteEntry, useToggleBookmark } from "../../hooks/useEntries"
import { ChevronDown, ChevronUp, Eye, X, AlertCircle, RefreshCw, Star, Pencil, Trash2 } from "lucide-react"
import type { Entry } from "../../lib/airtable"
import { EntryCards } from "./EntryCard"
import { Skeleton } from "../ui/skeleton"
import { ConfirmDialog } from "../ui/confirm-dialog"
import { EditEntryModal } from "../entries/EditEntryModal"
import { cn } from "../../lib/utils"
import { toast } from "sonner"
import type { FilterState } from "../filters/FilterBar"

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
        <div className="w-full max-w-2xl rounded-xl glass-card p-6 shadow-2xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{entry.name || "Untitled Entry"}</h3>
              <p className="text-sm text-muted-foreground">
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
          <div className="mb-6 rounded-lg bg-muted/50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {entry.text || "No content"}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Type</p>
              <p className="font-medium">{entry.type || "—"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Mode</p>
              <p className="font-medium">{entry.inferredMode || "—"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Energy</p>
              <p className="font-medium">{entry.inferredEnergy || "—"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Energy Shape</p>
              <p className="font-medium">{entry.energyShape || "—"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Sentiment</p>
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${SENTIMENT_BADGE[getSentimentType(entry.sentimentAI)]}`}>
                {entry.sentimentAI || "—"}
              </span>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Contradiction</p>
              <p className="font-medium">{entry.contradiction || "—"}</p>
            </div>
          </div>

          {/* Tags */}
          {entry.themeTagsAI.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Theme Tags</p>
              <div className="flex flex-wrap gap-2">
                {entry.themeTagsAI.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Snapshot & Insights */}
          {entry.snapshot && (
            <div className="mt-4 rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Snapshot</p>
              <p className="mt-1 text-sm">{entry.snapshot}</p>
            </div>
          )}

          {entry.actionableInsightsAI && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
              <p className="text-xs font-medium text-primary">Actionable Insights</p>
              <p className="mt-1 text-sm text-foreground">{entry.actionableInsightsAI}</p>
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
  
  const [sortField, setSortField] = useState<"date" | "type" | "sentiment">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
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
      toast.error("Failed to update bookmark")
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
        const entryDate = new Date(entry.date)
        const now = new Date()
        const daysAgo = parseInt(filters.dateRange)
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
        if (entryDate < cutoffDate) return false
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

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case "type":
        comparison = (a.type || "").localeCompare(b.type || "")
        break
      case "sentiment":
        comparison = (a.sentimentAI || "").localeCompare(b.sentimentAI || "")
        break
    }
    return sortOrder === "asc" ? comparison : -comparison
  })

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  // Show cards on mobile, table on desktop
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

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th
                className="cursor-pointer px-3 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Date <SortIcon field="date" />
                </div>
              </th>
              <th
                className="cursor-pointer px-3 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort("type")}
              >
                <div className="flex items-center gap-1">
                  Type <SortIcon field="type" />
                </div>
              </th>
              <th className="hidden px-3 py-3 text-left font-medium text-muted-foreground md:table-cell">
                Mode
              </th>
              <th
                className="cursor-pointer px-3 py-3 text-left font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleSort("sentiment")}
              >
                <div className="flex items-center gap-1">
                  Sentiment <SortIcon field="sentiment" />
                </div>
              </th>
              <th className="hidden px-3 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                Preview
              </th>
              <th className="px-3 py-3 text-center font-medium text-muted-foreground w-12">
                <Star className="h-4 w-4 mx-auto" />
              </th>
              <th className="px-3 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry, index) => (
              <tr
                key={entry.id}
                className={`border-b transition-colors hover:bg-muted/50 cursor-pointer ${
                  selectedRowIndex === index ? "bg-primary/10 ring-1 ring-primary/20" : ""
                }`}
                onClick={() => setSelectedRowIndex(index)}
                onDoubleClick={() => setSelectedEntry(entry)}
                tabIndex={0}
                role="row"
                aria-selected={selectedRowIndex === index}
              >
                <td className="px-3 py-3">
                  <div className="font-medium">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.date).getFullYear()}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                    {entry.type || "—"}
                  </span>
                </td>
                <td className="hidden px-3 py-3 md:table-cell">
                  {entry.inferredMode || "—"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${SENTIMENT_BADGE[getSentimentType(entry.sentimentAI)]}`}
                  >
                    {entry.sentimentAI?.split(" ")[0] || "—"}
                  </span>
                </td>
                <td className="hidden max-w-[200px] truncate px-3 py-3 text-muted-foreground lg:table-cell">
                  {entry.text?.slice(0, 60) || "—"}...
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleBookmark(entry)
                    }}
                    aria-label={entry.isBookmarked ? "Remove bookmark" : "Add bookmark"}
                    className="rounded-full p-1.5 hover:bg-muted transition-colors"
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
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEntry(entry)
                      }}
                      aria-label={`View entry from ${new Date(entry.date).toLocaleDateString()}`}
                      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(entry)
                      }}
                      aria-label="Edit entry"
                      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(entry)
                      }}
                      aria-label="Delete entry"
                      className="rounded-full p-2 text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

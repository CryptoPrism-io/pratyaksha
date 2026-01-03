import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { useEntries } from "../../hooks/useEntries"
import { ChevronDown, ChevronUp, Eye, X, AlertCircle, RefreshCw } from "lucide-react"
import type { Entry } from "../../lib/airtable"
import { EntryCards } from "./EntryCard"
import { Skeleton } from "../ui/skeleton"
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
}

function EntryModal({ entry, onClose }: EntryModalProps) {
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
            <button
              onClick={onClose}
              aria-label="Close entry details"
              className="rounded-full p-2 hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
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
  const [sortField, setSortField] = useState<"date" | "type" | "sentiment">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(-1)
  const isMobile = useIsMobile()

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
        <EntryCards entries={sortedEntries} onView={setSelectedEntry} />
        {selectedEntry && (
          <EntryModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
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
              <th className="px-3 py-3 text-right font-medium text-muted-foreground">
                View
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
                <td className="px-3 py-3 text-right">
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    aria-label={`View entry from ${new Date(entry.date).toLocaleDateString()}`}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Entry Modal */}
      {selectedEntry && (
        <EntryModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </>
  )
}

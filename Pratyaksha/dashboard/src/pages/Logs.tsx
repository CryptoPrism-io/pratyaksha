import { useState, useMemo, useRef } from "react"
import { LogEntryForm } from "../components/logs/LogEntryForm"
import { EntriesTable } from "../components/charts/EntriesTable"
import { FilterBar, type FilterState } from "../components/filters/FilterBar"
import { useEntries } from "../hooks/useEntries"

const DEFAULT_FILTERS: FilterState = {
  search: "",
  dateRange: "all",
  type: "all",
  sentiment: "all",
  mode: "all",
}

export function Logs() {
  const { data: entries } = useEntries()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Extract unique types and modes from entries
  const { availableTypes, availableModes } = useMemo(() => {
    if (!entries) return { availableTypes: [], availableModes: [] }

    const types = [...new Set(entries.map((e) => e.type).filter(Boolean))]
    const modes = [...new Set(entries.map((e) => e.inferredMode).filter(Boolean))]

    return { availableTypes: types, availableModes: modes }
  }, [entries])

  // Calculate filtered entries count
  const filteredEntriesCount = useMemo(() => {
    if (!entries) return 0
    return entries.filter((entry) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          entry.name?.toLowerCase().includes(searchLower) ||
          entry.text?.toLowerCase().includes(searchLower) ||
          entry.type?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      if (filters.dateRange !== "all") {
        const entryDate = new Date(entry.date)
        const now = new Date()
        const daysAgo = parseInt(filters.dateRange)
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
        if (entryDate < cutoffDate) return false
      }
      if (filters.type !== "all" && entry.type !== filters.type) return false
      if (filters.sentiment !== "all" && !entry.sentimentAI?.toLowerCase().includes(filters.sentiment.toLowerCase())) return false
      if (filters.mode !== "all" && entry.inferredMode !== filters.mode) return false
      return true
    }).length
  }, [entries, filters])

  return (
    <div className="min-h-screen bg-background">
      {/* Screen reader only H1 */}
      <h1 className="sr-only">Pratyaksha Logs - Journal Entries</h1>

      <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
        {/* Log Entry Form - Above the fold */}
        <LogEntryForm />

        {/* Historical Entries Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Entries</h2>
            <span className="text-sm text-muted-foreground">
              {entries?.length || 0} total entries
            </span>
          </div>

          {/* Filters */}
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            availableTypes={availableTypes}
            availableModes={availableModes}
            searchInputRef={searchInputRef}
            entries={entries || []}
            filteredCount={filteredEntriesCount}
          />

          {/* Entries Table */}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <EntriesTable filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}

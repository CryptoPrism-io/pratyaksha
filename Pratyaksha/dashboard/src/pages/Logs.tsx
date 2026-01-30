import { useState, useMemo, useRef, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { GuidedEntryForm } from "../components/logs/GuidedEntryForm"
import { SmartPromptCard } from "../components/logs/SmartPromptCard"
import { EntriesTable } from "../components/charts/EntriesTable"
import { FilterBar, type FilterState } from "../components/filters/FilterBar"
import { useEntries } from "../hooks/useEntries"
import { OnboardingTour } from "../components/onboarding/OnboardingTour"

const DEFAULT_FILTERS: FilterState = {
  search: "",
  dateRange: "all",
  type: "all",
  sentiment: "all",
  mode: "all",
  energy: "all",
  bookmarked: "all",
}

export function Logs() {
  const { data: entries, refetch, isFetching } = useEntries()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [urlFiltersApplied, setUrlFiltersApplied] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(undefined)

  // Read URL params on mount and apply filters
  useEffect(() => {
    if (urlFiltersApplied) return

    const typeParam = searchParams.get("type")
    const modeParam = searchParams.get("mode")
    const energyParam = searchParams.get("energy")
    const contradictionParam = searchParams.get("contradiction")
    const tagParam = searchParams.get("tag")

    if (typeParam || modeParam || energyParam || contradictionParam || tagParam) {
      setFilters(prev => ({
        ...prev,
        type: typeParam || "all",
        mode: modeParam || "all",
        energy: energyParam || "all",
        // Use search for contradiction or tag since there's no dedicated filter
        search: tagParam || contradictionParam || prev.search,
      }))
      // Clear URL params after applying
      setSearchParams({}, { replace: true })
    }
    setUrlFiltersApplied(true)
  }, [searchParams, setSearchParams, urlFiltersApplied])

  // Extract unique types, modes, and energies from entries
  const { availableTypes, availableModes, availableEnergies } = useMemo(() => {
    if (!entries) return { availableTypes: [], availableModes: [], availableEnergies: [] }

    const types = [...new Set(entries.map((e) => e.type).filter(Boolean))]
    const modes = [...new Set(entries.map((e) => e.inferredMode).filter(Boolean))]
    const energies = [...new Set(entries.map((e) => e.inferredEnergy).filter(Boolean))]

    return { availableTypes: types, availableModes: modes, availableEnergies: energies }
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
          entry.type?.toLowerCase().includes(searchLower) ||
          entry.contradiction?.toLowerCase().includes(searchLower) ||
          entry.themeTagsAI?.some(tag => tag.toLowerCase().includes(searchLower))
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
      if (filters.energy !== "all" && entry.inferredEnergy !== filters.energy) return false
      return true
    }).length
  }, [entries, filters])

  return (
    <div className="min-h-screen dashboard-glass-bg">
      {/* Screen reader only H1 */}
      <h1 className="sr-only">Pratyaksha Logs - Journal Entries</h1>

      {/* Onboarding Tour - continues from Dashboard */}
      <OnboardingTour />

      <div className="container mx-auto space-y-6 px-4 py-6 md:px-6">
        {/* Smart Prompts - Personalized suggestions based on user's blueprint */}
        <SmartPromptCard
          onSelectPrompt={(text) => {
            setSelectedPrompt(text)
            // Scroll to form
            document.querySelector('[data-tour="log-entry-form"]')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
          }}
        />

        {/* Guided Entry Form - Above the fold */}
        <div data-tour="log-entry-form">
          <GuidedEntryForm
            initialPrompt={selectedPrompt}
            onSuccess={() => setSelectedPrompt(undefined)}
          />
        </div>

        {/* Historical Entries Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Entries</h2>
            <span className="text-sm text-muted-foreground">
              {entries?.length || 0} total entries
            </span>
          </div>

          {/* Filters */}
          <div data-tour="logs-filters">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            availableTypes={availableTypes}
            availableModes={availableModes}
            availableEnergies={availableEnergies}
            searchInputRef={searchInputRef}
            entries={entries || []}
            filteredCount={filteredEntriesCount}
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
          />
          </div>

          {/* Entries Table */}
          <div data-tour="entries-table" className="rounded-xl glass-card p-4">
            <EntriesTable filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}

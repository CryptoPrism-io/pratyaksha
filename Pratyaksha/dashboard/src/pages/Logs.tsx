import { useState, useMemo, useRef, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { GuidedEntryForm } from "../components/logs/GuidedEntryForm"
import { SmartPromptCard } from "../components/logs/SmartPromptCard"
import { DailyReflectionCard } from "../components/logs/DailyReflectionCard"
import { LifeBlueprintGuided } from "../components/gamification/LifeBlueprintGuided"
import { EntriesTable } from "../components/charts/EntriesTable"
import { FilterBar, type FilterState } from "../components/filters/FilterBar"
import { useEntries } from "../hooks/useEntries"
import { OnboardingTour } from "../components/onboarding/OnboardingTour"
import { DemoBanner } from "../components/layout/DemoBanner"
import {
  useMicrophonePermission,
  hasMicrophonePermissionBeenAsked,
  markMicrophonePermissionAsked
} from "../hooks/useMicrophonePermission"
import { getDateRangeFromPreset, isDateInRange } from "../lib/dateFilters"

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
  const [selectedSoulMappingTopic, setSelectedSoulMappingTopic] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<"log" | "entries">("log")

  // Listen for tab-switch requests from the OnboardingTour
  useEffect(() => {
    const handler = (e: CustomEvent<"log" | "entries">) => setActiveTab(e.detail)
    window.addEventListener("pratyaksha-switch-tab" as string, handler as EventListener)
    return () => window.removeEventListener("pratyaksha-switch-tab" as string, handler as EventListener)
  }, [])

  // Pre-request microphone permission for voice logging
  const { permission, requestPermission, isSupported } = useMicrophonePermission()

  // Proactively request microphone permission on first visit to Logs page
  useEffect(() => {
    // Only request if:
    // 1. MediaDevices API is supported
    // 2. Permission hasn't been granted yet
    // 3. We haven't asked in this session
    if (isSupported && permission === "prompt" && !hasMicrophonePermissionBeenAsked()) {
      // Small delay to not be intrusive on page load
      const timer = setTimeout(() => {
        markMicrophonePermissionAsked()
        requestPermission()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSupported, permission, requestPermission])

  // Read URL params on mount and apply filters
  useEffect(() => {
    if (urlFiltersApplied) return

    // Simple tab-switch param (used by PatternWarningBanner "View related entries")
    const viewParam = searchParams.get("view")
    if (viewParam === "entries") {
      setActiveTab("entries")
      setSearchParams({}, { replace: true })
      setUrlFiltersApplied(true)
      return
    }

    // Soul mapping topic pre-select (from Profile page topic click)
    const topicParam = searchParams.get("topic")
    if (topicParam) {
      setSelectedSoulMappingTopic(topicParam)
      setActiveTab("log")
      setSearchParams({}, { replace: true })
      setUrlFiltersApplied(true)
      return
    }

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
      // Switch to Entries tab so filtered results are immediately visible
      setActiveTab("entries")
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
        const range = getDateRangeFromPreset(filters.dateRange as Parameters<typeof getDateRangeFromPreset>[0])
        if (range && !isDateInRange(entry.date, range)) return false
      }
      if (filters.type !== "all" && entry.type !== filters.type) return false
      if (filters.sentiment !== "all" && !entry.sentimentAI?.toLowerCase().includes(filters.sentiment.toLowerCase())) return false
      if (filters.mode !== "all" && entry.inferredMode !== filters.mode) return false
      if (filters.energy !== "all" && entry.inferredEnergy !== filters.energy) return false
      return true
    }).length
  }, [entries, filters])

  return (
    <div className="min-h-screen bg-background">
      {/* Screen reader only H1 */}
      <h1 className="sr-only">Becoming Logs - Journal Entries</h1>

      {/* Demo Mode Banner - guides users to sign in */}
      <DemoBanner showPersonaSelector={false} />

      {/* Onboarding Tour - continues from Dashboard */}
      <OnboardingTour />

      {/* Tab bar */}
      <div className="border-b border-border/50 bg-background sticky top-12 z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("log")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "log"
                  ? "border-[hsl(168_70%_48%)] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Log
            </button>
            <button
              onClick={() => setActiveTab("entries")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "entries"
                  ? "border-[hsl(168_70%_48%)] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Entries
              {entries?.length ? (
                <span className="text-xs font-mono text-muted-foreground signal-data">
                  {entries.length}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:px-6">
        {/* ── Tab: Log ── */}
        {activeTab === "log" && (
          <div className="space-y-4" data-tour="log-entry-form">
            <SmartPromptCard
              onSelectPrompt={(text) => {
                setSelectedPrompt(text)
                setSelectedSoulMappingTopic(undefined)
              }}
            />
            <GuidedEntryForm
              initialPrompt={selectedPrompt}
              initialSoulMappingTopicId={selectedSoulMappingTopic}
              onSuccess={() => {
                setSelectedPrompt(undefined)
                setSelectedSoulMappingTopic(undefined)
                setActiveTab("entries")
              }}
            />
            <DailyReflectionCard
              onSelectItem={(prompt, topicId) => {
                setSelectedPrompt(prompt)
                setSelectedSoulMappingTopic(topicId)
              }}
            />
            <LifeBlueprintGuided />
          </div>
        )}

        {/* ── Tab: Entries ── */}
        {activeTab === "entries" && (
          <div className="space-y-4">
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

            <div data-tour="entries-table" className="rounded-md signal-card p-4">
              <EntriesTable filters={filters} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

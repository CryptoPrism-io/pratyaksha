import { useState, useMemo, useRef, useCallback } from "react"
import { DashboardGrid, ChartCard, StatCard } from "../components/layout/DashboardGrid"
import { useStats, useEntries } from "../hooks/useEntries"
import { Brain, FileText, TrendingUp, Activity, Keyboard } from "lucide-react"
import { useTheme } from "next-themes"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { exportAsCSV } from "../lib/export"

// Chart imports (stubs for now)
import { EmotionalTimeline } from "../components/charts/EmotionalTimeline"
import { ModeDistribution } from "../components/charts/ModeDistribution"
import { EnergyRadar } from "../components/charts/EnergyRadar"
import { ContradictionFlow } from "../components/charts/ContradictionFlow"
import { CalendarHeatmap } from "../components/charts/CalendarHeatmap"
import { ThemeCloud } from "../components/charts/ThemeCloud"
import { EnergyModeMatrix } from "../components/charts/EnergyModeMatrix"
import { DailyRhythm } from "../components/charts/DailyRhythm"
import { ContradictionTracker } from "../components/charts/ContradictionTracker"
import { InsightActions } from "../components/charts/InsightActions"
import { EntriesTable } from "../components/charts/EntriesTable"
import { FilterBar, type FilterState } from "../components/filters/FilterBar"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"
import { KeyboardShortcutsDialog } from "../components/ui/keyboard-shortcuts-dialog"

const DEFAULT_FILTERS: FilterState = {
  search: "",
  dateRange: "all",
  type: "all",
  sentiment: "all",
  mode: "all",
}

export function Dashboard() {
  const { data: stats, isLoading } = useStats()
  const { data: entries, refetch } = useEntries()
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()

  // Calculate filtered entries count for keyboard navigation bounds
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

  // Keyboard shortcut handlers
  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus()
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
    toast.success(`Switched to ${theme === "dark" ? "light" : "dark"} mode`)
  }, [theme, setTheme])

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["entries"] })
    refetch()
    toast.success("Data refreshed")
  }, [queryClient, refetch])

  const quickExport = useCallback(() => {
    if (entries && entries.length > 0) {
      exportAsCSV(entries)
      toast.success(`Exported ${entries.length} entries as CSV`)
    } else {
      toast.error("No entries to export")
    }
  }, [entries])

  const selectNextEntry = useCallback(() => {
    setSelectedEntryIndex((prev) => Math.min(prev + 1, filteredEntriesCount - 1))
  }, [filteredEntriesCount])

  const selectPrevEntry = useCallback(() => {
    setSelectedEntryIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    { key: "/", handler: focusSearch, description: "Focus search" },
    { key: "t", handler: toggleTheme, description: "Toggle theme" },
    { key: "?", shift: true, handler: () => setShowShortcuts(true), description: "Show shortcuts" },
    { key: "Escape", handler: () => setShowShortcuts(false), description: "Close dialogs" },
    { key: "j", handler: selectNextEntry, description: "Next entry" },
    { key: "k", handler: selectPrevEntry, description: "Previous entry" },
    { key: "r", handler: refreshData, description: "Refresh data" },
    { key: "e", ctrl: true, handler: quickExport, description: "Quick export (CSV)" },
  ])

  // Extract unique types and modes from entries
  const { availableTypes, availableModes } = useMemo(() => {
    if (!entries) return { availableTypes: [], availableModes: [] }

    const types = [...new Set(entries.map((e) => e.type).filter(Boolean))]
    const modes = [...new Set(entries.map((e) => e.inferredMode).filter(Boolean))]

    return { availableTypes: types, availableModes: modes }
  }, [entries])

  return (
    <div className="min-h-screen bg-background">
      {/* Screen reader only H1 */}
      <h1 className="sr-only">Pratyaksha Dashboard - Cognitive Analytics</h1>

      {/* Stats Row */}
      <div className="container mx-auto px-4 pt-6 md:px-6">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard
            title="Total Entries"
            value={isLoading ? "..." : stats?.totalEntries ?? 0}
            description="All time"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="Recent Entries"
            value={isLoading ? "..." : stats?.recentEntries ?? 0}
            description="Last 7 days"
            trend="up"
            trendValue="+12%"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            title="Avg Words"
            value={isLoading ? "..." : stats?.avgWordsPerEntry ?? 0}
            description="Per entry"
            icon={<Brain className="h-4 w-4" />}
          />
          <StatCard
            title="Positive Ratio"
            value={isLoading ? "..." : `${stats?.positiveRatio ?? 0}%`}
            description={`${stats?.negativeRatio ?? 0}% negative`}
            trend={stats && stats.positiveRatio > 50 ? "up" : "down"}
            icon={<Activity className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <DashboardGrid>
        {/* Row 1: Timeline + Mode Distribution */}
        <ChartCard
          title="Emotional Timeline"
          description="Sentiment trends over time"
          colSpan={8}
        >
          <EmotionalTimeline />
        </ChartCard>

        <ChartCard
          title="Mode Distribution"
          description="Cognitive modes breakdown"
          colSpan={4}
        >
          <ModeDistribution />
        </ChartCard>

        {/* Row 2: Energy Radar + Contradiction Flow */}
        <ChartCard
          title="Energy Patterns"
          description="Energy shape distribution"
          colSpan={4}
        >
          <EnergyRadar />
        </ChartCard>

        <ChartCard
          title="Contradiction Flow"
          description="Type → Contradiction → Mode"
          colSpan={8}
        >
          <ContradictionFlow />
        </ChartCard>

        {/* Row 3: Calendar Heatmap (full width) */}
        <ChartCard
          title="Activity Calendar"
          description="Journaling frequency and sentiment"
          colSpan={12}
        >
          <CalendarHeatmap />
        </ChartCard>

        {/* Row 4: Theme Cloud + Energy-Mode Matrix */}
        <ChartCard
          title="Theme Tags"
          description="Most frequent themes"
          colSpan={6}
        >
          <ThemeCloud />
        </ChartCard>

        <ChartCard
          title="Energy-Mode Matrix"
          description="Correlation analysis"
          colSpan={6}
        >
          <EnergyModeMatrix />
        </ChartCard>

        {/* Row 5: Daily Rhythm + Contradiction Tracker */}
        <ChartCard
          title="Daily Rhythm"
          description="Entry patterns by time"
          colSpan={4}
        >
          <DailyRhythm />
        </ChartCard>

        <ChartCard
          title="Contradiction Tracker"
          description="Monitor recurring patterns"
          colSpan={4}
        >
          <ContradictionTracker />
        </ChartCard>

        <ChartCard
          title="Insights & Actions"
          description="AI-generated recommendations"
          colSpan={4}
        >
          <InsightActions />
        </ChartCard>

        {/* Row 6: Entries Table (full width) with Filters */}
        <ChartCard
          title="All Entries"
          description="Browse and view all journal entries"
          colSpan={12}
        >
          <div className="space-y-4">
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              availableTypes={availableTypes}
              availableModes={availableModes}
              searchInputRef={searchInputRef}
              entries={entries || []}
              filteredCount={filteredEntriesCount}
            />
            <EntriesTable
              filters={filters}
              selectedIndex={selectedEntryIndex}
              onSelectedIndexChange={setSelectedEntryIndex}
            />
          </div>
        </ChartCard>
      </DashboardGrid>

      {/* Keyboard shortcuts button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-card border px-4 py-2 shadow-lg hover:bg-muted transition-colors"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
        <span className="text-sm hidden sm:inline">Press ? for shortcuts</span>
      </button>

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutsDialog isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

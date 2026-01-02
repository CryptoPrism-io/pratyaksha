import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardGrid, ChartCard, StatCard } from "../components/layout/DashboardGrid"
import { useStats, useEntries } from "../hooks/useEntries"
import { Brain, FileText, TrendingUp, Activity, Keyboard, Plus } from "lucide-react"
import { useTheme } from "next-themes"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { exportAsCSV } from "../lib/export"

// Chart imports
import { EmotionalTimeline } from "../components/charts/EmotionalTimeline"
import { ModeDistribution } from "../components/charts/ModeDistribution"
import { EnergyRadar } from "../components/charts/EnergyRadar"
import { ContradictionFlow } from "../components/charts/ContradictionFlow"
import { ActivityCalendar } from "../components/charts/ActivityCalendar"
import { ThemeCloud } from "../components/charts/ThemeCloud"
import { EnergyModeMatrix } from "../components/charts/EnergyModeMatrix"
import { DailyRhythm } from "../components/charts/DailyRhythm"
import { ContradictionTracker } from "../components/charts/ContradictionTracker"
import { InsightActions } from "../components/charts/InsightActions"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"
import { KeyboardShortcutsDialog } from "../components/ui/keyboard-shortcuts-dialog"

export function Dashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading } = useStats()
  const { data: entries, refetch } = useEntries()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()

  // Keyboard shortcut handlers
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

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    { key: "t", handler: toggleTheme, description: "Toggle theme" },
    { key: "?", shift: true, handler: () => setShowShortcuts(true), description: "Show shortcuts" },
    { key: "Escape", handler: () => setShowShortcuts(false), description: "Close dialogs" },
    { key: "r", handler: refreshData, description: "Refresh data" },
    { key: "e", ctrl: true, handler: quickExport, description: "Quick export (CSV)" },
  ])

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

        {/* Row 2: Contradiction Flow + Activity Calendar + Energy Radar */}
        <ChartCard
          title="Contradiction Flow"
          description="Type → Contradiction → Mode"
          colSpan={4}
        >
          <ContradictionFlow />
        </ChartCard>

        <ChartCard
          title="Activity Calendar"
          description="Monthly entry overview"
          colSpan={4}
        >
          <ActivityCalendar />
        </ChartCard>

        <ChartCard
          title="Energy Patterns"
          description="Energy shape distribution"
          colSpan={4}
        >
          <EnergyRadar />
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
      </DashboardGrid>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-3">
        {/* Add Entry FAB - Primary action */}
        <button
          onClick={() => navigate("/logs")}
          className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          aria-label="Add new entry"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium">Add Entry</span>
        </button>

        {/* Keyboard shortcuts button */}
        <button
          onClick={() => setShowShortcuts(true)}
          className="flex items-center gap-2 rounded-full bg-card border px-4 py-2 shadow-lg hover:bg-muted transition-colors"
          aria-label="Show keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">Press ?</span>
        </button>
      </div>

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutsDialog isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

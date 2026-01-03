import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardGrid, ChartCard } from "../components/layout/DashboardGrid"
import { useStats, useEntries } from "../hooks/useEntries"
import { Brain, FileText, TrendingUp, Activity, Keyboard, Plus } from "lucide-react"
import { useTheme } from "next-themes"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { exportAsCSV } from "../lib/export"

// Chart imports
import { EmotionalTimeline } from "../components/charts/EmotionalTimeline"
import { ModeDistribution } from "../components/charts/ModeDistribution"
import { EnergyRadarGroup } from "../components/charts/EnergyRadarGroup"
import { ContradictionFlow } from "../components/charts/ContradictionFlow"
import { ActivityCalendar } from "../components/charts/ActivityCalendar"
import { ThemeCloud } from "../components/charts/ThemeCloud"
import { EnergyModeBubble } from "../components/charts/EnergyModeBubble"
import { DailyRhythm } from "../components/charts/DailyRhythm"
import { ContradictionTracker } from "../components/charts/ContradictionTracker"
import { InsightActions } from "../components/charts/InsightActions"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"
import { KeyboardShortcutsDialog } from "../components/ui/keyboard-shortcuts-dialog"
import { DateFilterBar } from "../components/filters/DateFilterBar"

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
    <div className="min-h-screen dashboard-glass-bg">
      {/* Screen reader only H1 */}
      <h1 className="sr-only">Pratyaksha Dashboard - Cognitive Analytics</h1>

      {/* Combined Stats + Filter Row */}
      <div className="container mx-auto px-4 pt-6 md:px-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Compact Stats - Left side */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 flex-shrink-0">
            <div className="flex items-center gap-3 glass-stat rounded-lg px-4 py-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Entries</p>
                <p className="text-xl font-semibold">{isLoading ? "..." : stats?.totalEntries ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 glass-stat rounded-lg px-4 py-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Recent</p>
                <p className="text-xl font-semibold">{isLoading ? "..." : stats?.recentEntries ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 glass-stat rounded-lg px-4 py-3">
              <Brain className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Words</p>
                <p className="text-xl font-semibold">{isLoading ? "..." : stats?.avgWordsPerEntry ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 glass-stat rounded-lg px-4 py-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Positive</p>
                <p className="text-xl font-semibold">{isLoading ? "..." : `${stats?.positiveRatio ?? 0}%`}</p>
              </div>
            </div>
          </div>

          {/* Date Filter - Right side */}
          <div className="flex-1 flex justify-end">
            <DateFilterBar compact />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <DashboardGrid>
        {/* Row 1: Energy Patterns - Full width overview */}
        <ChartCard
          title="Energy Patterns"
          description="Growth, Stability & Challenge patterns with benchmarks"
          colSpan={12}
        >
          <EnergyRadarGroup />
        </ChartCard>

        {/* Row 2: Energy-Mode Matrix + Activity Calendar */}
        <ChartCard
          title="Energy-Mode Matrix"
          description="Click a bubble to filter logs"
          colSpan={6}
        >
          <EnergyModeBubble />
        </ChartCard>

        <ChartCard
          title="Activity Calendar"
          description="Monthly entry overview"
          colSpan={6}
        >
          <ActivityCalendar />
        </ChartCard>

        {/* Row 3: Emotional Timeline + Mode Distribution */}
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

        {/* Row 4: Theme Cloud + Contradiction Tracker */}
        <ChartCard
          title="Theme Tags"
          description="Most frequent themes"
          colSpan={6}
        >
          <ThemeCloud />
        </ChartCard>

        <ChartCard
          title="Contradiction Tracker"
          description="Monitor recurring patterns"
          colSpan={6}
        >
          <ContradictionTracker />
        </ChartCard>

        {/* Row 5: Daily Rhythm + Contradiction Flow + Insights */}
        <ChartCard
          title="Daily Rhythm"
          description="Entry patterns by time"
          colSpan={4}
        >
          <DailyRhythm />
        </ChartCard>

        <ChartCard
          title="Contradiction Flow"
          description="Type → Contradiction → Mode"
          colSpan={4}
        >
          <ContradictionFlow />
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

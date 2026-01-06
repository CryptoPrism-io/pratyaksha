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
import { EnergyModeResponsive } from "../components/charts/EnergyModeResponsive"
import { DailyRhythm } from "../components/charts/DailyRhythm"
import { ContradictionTracker } from "../components/charts/ContradictionTracker"
import { InsightActions } from "../components/charts/InsightActions"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"
import { KeyboardShortcutsDialog } from "../components/ui/keyboard-shortcuts-dialog"
import { DateFilterBar } from "../components/filters/DateFilterBar"
import { OnboardingTour } from "../components/onboarding/OnboardingTour"

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

  // Navigate to logs for new entry
  const newEntry = useCallback(() => {
    navigate("/logs")
    toast.success("Ready for new entry", { duration: 2000 })
  }, [navigate])

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    { key: "n", handler: newEntry, description: "New entry" },
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

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Stats + Filter Row - Same line on desktop */}
      <div className="container mx-auto px-2 pt-4 md:px-6 md:pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Stats cards */}
          <div data-tour="stats-bar" className="grid grid-cols-4 gap-1.5 md:gap-3 flex-shrink-0">
            <div className="flex flex-col md:flex-row items-center md:gap-3 glass-stat rounded-lg px-1.5 py-2 md:px-4 md:py-3">
              <FileText className="h-3.5 w-3.5 md:h-5 md:w-5 text-muted-foreground mb-0.5 md:mb-0" />
              <div className="text-center md:text-left">
                <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">Entries</p>
                <p className="text-sm md:text-xl font-semibold">{isLoading ? "..." : stats?.totalEntries ?? 0}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:gap-3 glass-stat rounded-lg px-1.5 py-2 md:px-4 md:py-3">
              <TrendingUp className="h-3.5 w-3.5 md:h-5 md:w-5 text-muted-foreground mb-0.5 md:mb-0" />
              <div className="text-center md:text-left">
                <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">Recent</p>
                <p className="text-sm md:text-xl font-semibold">{isLoading ? "..." : stats?.recentEntries ?? 0}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:gap-3 glass-stat rounded-lg px-1.5 py-2 md:px-4 md:py-3">
              <Brain className="h-3.5 w-3.5 md:h-5 md:w-5 text-muted-foreground mb-0.5 md:mb-0" />
              <div className="text-center md:text-left">
                <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">Words</p>
                <p className="text-sm md:text-xl font-semibold">{isLoading ? "..." : stats?.avgWordsPerEntry ?? 0}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:gap-3 glass-stat rounded-lg px-1.5 py-2 md:px-4 md:py-3">
              <Activity className="h-3.5 w-3.5 md:h-5 md:w-5 text-muted-foreground mb-0.5 md:mb-0" />
              <div className="text-center md:text-left">
                <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">Positive</p>
                <p className="text-sm md:text-xl font-semibold">{isLoading ? "..." : `${stats?.positiveRatio ?? 0}%`}</p>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div data-tour="date-filter" className="flex-shrink-0">
            <DateFilterBar compact fullWidthMobile />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <DashboardGrid>
        {/* Row 1: Eye-catching visuals first - Pie chart + Sankey diagram */}
        <ChartCard
          data-tour="mode-distribution"
          title="Mode Distribution"
          description="Cognitive modes breakdown"
          tooltip="Pie chart showing the distribution of your cognitive modes (Reflective, Calm, Hopeful, etc.). Understand your dominant mental patterns."
          colSpan={4}
        >
          <ModeDistribution />
        </ChartCard>

        <ChartCard
          data-tour="contradiction-flow"
          title="Contradiction Flow"
          description="Type → Contradiction → Mode"
          tooltip="Sankey diagram showing how entry types flow through contradictions to cognitive modes. Reveals hidden connections in your thought patterns."
          colSpan={8}
        >
          <ContradictionFlow />
        </ChartCard>

        {/* Row 2: Energy Patterns - Full width overview */}
        <ChartCard
          data-tour="energy-patterns"
          title="Energy Patterns"
          description="Growth, Stability & Challenge patterns with benchmarks"
          tooltip="Shows your energy distribution across Growth, Stability, and Challenge categories compared to optimal ranges. Helps identify which areas need attention."
          colSpan={12}
        >
          <EnergyRadarGroup />
        </ChartCard>

        {/* Row 3: Energy-Mode Matrix + Activity Calendar */}
        <ChartCard
          data-tour="energy-matrix"
          title="Energy-Mode Matrix"
          description="Click to filter logs"
          tooltip="Visualizes the relationship between your energy levels and cognitive modes. Click any bar or bubble to see related entries."
          colSpan={6}
        >
          <EnergyModeResponsive />
        </ChartCard>

        <ChartCard
          data-tour="activity-calendar"
          title="Activity Calendar"
          description="Monthly entry overview"
          tooltip="GitHub-style heatmap showing your journaling activity. Darker colors indicate more entries. Helps you maintain consistency."
          colSpan={6}
        >
          <ActivityCalendar />
        </ChartCard>

        {/* Row 4: Emotional Timeline + Contradiction Tracker */}
        <ChartCard
          data-tour="emotional-timeline"
          title="Emotional Timeline"
          description="Sentiment trends over time"
          tooltip="Track how your emotions evolve over time. The line shows sentiment score trends, helping you identify patterns and cycles in your mental states."
          colSpan={8}
        >
          <EmotionalTimeline />
        </ChartCard>

        <ChartCard
          data-tour="contradiction-tracker"
          title="Contradiction Tracker"
          description="Monitor recurring patterns"
          tooltip="Tracks internal conflicts like Hope vs. Hopelessness, Control vs. Surrender. High counts may indicate areas needing attention or integration."
          colSpan={4}
        >
          <ContradictionTracker />
        </ChartCard>

        {/* Row 5: Theme Tags + Insights & Actions + Daily Rhythm */}
        <ChartCard
          data-tour="theme-tags"
          title="Theme Tags"
          description="Most frequent themes"
          tooltip="Word cloud of AI-extracted themes from your entries. Larger words appear more frequently. Helps identify recurring topics in your thoughts."
          colSpan={4}
        >
          <ThemeCloud />
        </ChartCard>

        <ChartCard
          data-tour="insights-actions"
          title="Insights & Actions"
          description="AI-generated recommendations"
          tooltip="Personalized suggestions based on your recent entries. AI analyzes patterns and provides actionable next steps for growth."
          colSpan={4}
        >
          <InsightActions />
        </ChartCard>

        <ChartCard
          data-tour="daily-rhythm"
          title="Daily Rhythm"
          description="Entry patterns by time"
          tooltip="Shows when you typically journal during the week. Identify your most productive reflection times and build better habits."
          colSpan={4}
        >
          <DailyRhythm />
        </ChartCard>
      </DashboardGrid>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 group/fab opacity-70 hover:opacity-100 transition-opacity">
        {/* Add Entry FAB - Primary action */}
        <button
          data-tour="add-entry-fab"
          onClick={() => navigate("/logs")}
          className="flex items-center gap-0 group-hover/fab:gap-2 h-11 rounded-full bg-primary text-primary-foreground px-3 group-hover/fab:px-4 shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          aria-label="Add new entry"
        >
          <Plus className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium max-w-0 overflow-hidden whitespace-nowrap group-hover/fab:max-w-[100px] transition-all duration-200">Add Entry</span>
        </button>

        {/* Keyboard shortcuts button - hidden on mobile (no keyboard) */}
        <button
          data-tour="shortcuts-fab"
          onClick={() => setShowShortcuts(true)}
          className="hidden md:flex items-center gap-0 group-hover/fab:gap-2 h-10 rounded-full bg-card border px-2.5 group-hover/fab:px-3 shadow-lg hover:bg-muted transition-all"
          aria-label="Show keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm max-w-0 overflow-hidden whitespace-nowrap group-hover/fab:max-w-[60px] transition-all duration-200">Press ?</span>
        </button>
      </div>

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutsDialog isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

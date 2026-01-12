import React, { useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardGrid, ChartCard } from "../components/layout/DashboardGrid"
import { useStats, useEntries } from "../hooks/useEntries"
import { useAuth } from "../contexts/AuthContext"
import { useDemoPersona, type DemoPersona } from "../contexts/DemoPersonaContext"
import { Brain, FileText, TrendingUp, Activity, Keyboard, Plus, Gamepad2, Sword, Search, Rocket, GitBranch, Zap, BarChart3, LineChart, AlertTriangle, Hash, Lightbulb, Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { useTheme } from "next-themes"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { exportAsCSV } from "../lib/export"

// Chart imports
import { EmotionalTimeline } from "../components/charts/EmotionalTimeline"
import { ModeDistribution } from "../components/charts/ModeDistribution"
import { EnergyRadarGroup } from "../components/charts/EnergyRadarGroup"
import { ContradictionFlow } from "../components/charts/ContradictionFlow"
import { ThemeCloud } from "../components/charts/ThemeCloud"
import { EnergyModeResponsive } from "../components/charts/EnergyModeResponsive"
import { DailyRhythm } from "../components/charts/DailyRhythm"
import { ContradictionTracker } from "../components/charts/ContradictionTracker"
import { InsightActions } from "../components/charts/InsightActions"
import { StreakWidget } from "../components/streak/StreakWidget"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"
import { KeyboardShortcutsDialog } from "../components/ui/keyboard-shortcuts-dialog"
import { DateFilterBar } from "../components/filters/DateFilterBar"
import { OnboardingTour } from "../components/onboarding/OnboardingTour"
import { MobileChartCarousel } from "../components/mobile/MobileChartCarousel"
import { useIsMobile } from "../hooks/useMediaQuery"

// Icon map for personas
const PERSONA_ICONS: Record<DemoPersona, React.ReactNode> = {
  mario: <Gamepad2 className="h-4 w-4" />,
  kratos: <Sword className="h-4 w-4" />,
  sherlock: <Search className="h-4 w-4" />,
  nova: <Rocket className="h-4 w-4" />,
}

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { persona, personaConfig, changePersona, allPersonas } = useDemoPersona()
  const { data: stats, isLoading } = useStats()
  const { data: entries, refetch } = useEntries()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const isDemoMode = !user

  // Charts array for mobile carousel
  const mobileCharts = useMemo(() => [
    { id: "streak", name: "Streak", component: <StreakWidget /> },
    { id: "flow", name: "Flow", component: <ContradictionFlow /> },
    { id: "energy", name: "Energy", component: <EnergyRadarGroup /> },
    { id: "matrix", name: "Matrix", component: <EnergyModeResponsive /> },
    { id: "modes", name: "Modes", component: <ModeDistribution /> },
    { id: "timeline", name: "Timeline", component: <EmotionalTimeline /> },
    { id: "contradictions", name: "Conflicts", component: <ContradictionTracker /> },
    { id: "themes", name: "Themes", component: <ThemeCloud /> },
    { id: "insights", name: "Insights", component: <InsightActions /> },
    { id: "rhythm", name: "Rhythm", component: <DailyRhythm /> },
  ], [])

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

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className={`bg-gradient-to-r ${personaConfig.bgGradient} border-b border-${personaConfig.color}-500/20 px-4 py-2.5 text-center`}>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className={`text-${personaConfig.color}-500`}>
              {PERSONA_ICONS[persona]}
            </span>
            <span className="text-sm text-muted-foreground">Viewing demo journal of</span>
            <Select value={persona} onValueChange={(value) => changePersona(value as DemoPersona)}>
              <SelectTrigger className="w-auto h-7 px-2 py-1 text-sm font-bold border-0 bg-transparent hover:bg-muted/50 focus:ring-0 gap-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allPersonas.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      {PERSONA_ICONS[p.id]}
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground text-xs">- {p.subtitle}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground hidden sm:inline">from {personaConfig.subtitle}</span>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-primary hover:underline font-medium"
            >
              Sign in to start your journal
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Stats + Filter Row - Same line on desktop */}
      <div className="container mx-auto px-2 pt-4 md:px-6 md:pt-6 overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Stats cards - 4 columns on all screens */}
          <div data-tour="stats-bar" className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 flex-shrink-0 w-full md:w-auto">
            <div className="flex flex-col items-center glass-stat rounded-lg px-1 py-1.5 sm:px-4 sm:py-3">
              <FileText className="h-3 w-3 sm:h-5 sm:w-5 text-muted-foreground mb-0.5 sm:mb-1" />
              <p className="text-sm sm:text-xl font-semibold">{isLoading ? "..." : stats?.totalEntries ?? 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Entries</p>
            </div>
            <div className="flex flex-col items-center glass-stat rounded-lg px-1 py-1.5 sm:px-4 sm:py-3">
              <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 text-muted-foreground mb-0.5 sm:mb-1" />
              <p className="text-sm sm:text-xl font-semibold">{isLoading ? "..." : stats?.recentEntries ?? 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Recent</p>
            </div>
            <div className="flex flex-col items-center glass-stat rounded-lg px-1 py-1.5 sm:px-4 sm:py-3">
              <Brain className="h-3 w-3 sm:h-5 sm:w-5 text-muted-foreground mb-0.5 sm:mb-1" />
              <p className="text-sm sm:text-xl font-semibold">{isLoading ? "..." : stats?.avgWordsPerEntry ?? 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Words</p>
            </div>
            <div className="flex flex-col items-center glass-stat rounded-lg px-1 py-1.5 sm:px-4 sm:py-3">
              <Activity className="h-3 w-3 sm:h-5 sm:w-5 text-muted-foreground mb-0.5 sm:mb-1" />
              <p className="text-sm sm:text-xl font-semibold">{isLoading ? "..." : `${stats?.positiveRatio ?? 0}%`}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight"><span className="sm:hidden">Pos</span><span className="hidden sm:inline">Positive</span></p>
            </div>
          </div>

          {/* Date Filter */}
          <div data-tour="date-filter" className="flex-shrink-0">
            <DateFilterBar compact fullWidthMobile />
          </div>
        </div>
      </div>

      {/* Charts - Mobile Carousel or Desktop Grid */}
      {isMobile ? (
        <div className="flex-1 h-[calc(100vh-180px)]">
          <MobileChartCarousel charts={mobileCharts} />
        </div>
      ) : (
        <DashboardGrid>
          {/* Row 1: Streak Calendar + Contradiction Flow */}
          <div data-tour="streak-widget" className="col-span-1 lg:col-span-4">
            <StreakWidget />
          </div>

          <ChartCard
            data-tour="contradiction-flow"
            title="Contradiction Flow"
            description="Type → Contradiction → Mode"
            tooltip="Sankey diagram showing how entry types flow through contradictions to cognitive modes. Reveals hidden connections in your thought patterns."
            colSpan={8}
            icon={GitBranch}
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
            icon={Zap}
          >
            <EnergyRadarGroup />
          </ChartCard>

          {/* Row 3: Energy-Mode Matrix + Mode Distribution */}
          <ChartCard
            data-tour="energy-matrix"
            title="Energy-Mode Matrix"
            description="Click to filter logs"
            tooltip="Visualizes the relationship between your energy levels and cognitive modes. Click any bar or bubble to see related entries."
            colSpan={8}
            icon={BarChart3}
          >
            <EnergyModeResponsive />
          </ChartCard>

          <ChartCard
            data-tour="mode-distribution"
            title="Mode Distribution"
            description="Cognitive modes breakdown"
            tooltip="Pie chart showing the distribution of your cognitive modes (Reflective, Calm, Hopeful, etc.). Understand your dominant mental patterns."
            colSpan={4}
            icon={Brain}
          >
            <ModeDistribution />
          </ChartCard>

          {/* Row 4: Emotional Timeline + Contradiction Tracker */}
          <ChartCard
            data-tour="emotional-timeline"
            title="Emotional Timeline"
            description="Sentiment trends over time"
            tooltip="Track how your emotions evolve over time. The line shows sentiment score trends, helping you identify patterns and cycles in your mental states."
            colSpan={8}
            icon={LineChart}
          >
            <EmotionalTimeline />
          </ChartCard>

          <ChartCard
            data-tour="contradiction-tracker"
            title="Contradiction Tracker"
            description="Monitor recurring patterns"
            tooltip="Tracks internal conflicts like Hope vs. Hopelessness, Control vs. Surrender. High counts may indicate areas needing attention or integration."
            colSpan={4}
            icon={AlertTriangle}
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
            icon={Hash}
          >
            <ThemeCloud />
          </ChartCard>

          <ChartCard
            data-tour="insights-actions"
            title="Insights & Actions"
            description="AI-generated recommendations"
            tooltip="Personalized suggestions based on your recent entries. AI analyzes patterns and provides actionable next steps for growth."
            colSpan={4}
            icon={Lightbulb}
          >
            <InsightActions />
          </ChartCard>

          <ChartCard
            data-tour="daily-rhythm"
            title="Daily Rhythm"
            description="Entry patterns by time"
            tooltip="Shows when you typically journal during the week. Identify your most productive reflection times and build better habits."
            colSpan={4}
            icon={Clock}
          >
            <DailyRhythm />
          </ChartCard>
        </DashboardGrid>
      )}

      {/* Floating Action Buttons */}
      {/* Mobile: Circular FAB at very bottom center (thumb zone) */}
      {isMobile ? (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pb-safe">
          <button
            data-tour="add-entry-fab"
            onClick={() => navigate("/logs")}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-all active:scale-95"
            aria-label="Add new entry"
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>
      ) : (
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

          {/* Keyboard shortcuts button */}
          <button
            data-tour="shortcuts-fab"
            onClick={() => setShowShortcuts(true)}
            className="flex items-center gap-0 group-hover/fab:gap-2 h-10 rounded-full bg-card border px-2.5 group-hover/fab:px-3 shadow-lg hover:bg-muted transition-all"
            aria-label="Show keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm max-w-0 overflow-hidden whitespace-nowrap group-hover/fab:max-w-[60px] transition-all duration-200">Press ?</span>
          </button>
        </div>
      )}

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutsDialog isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

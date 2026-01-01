import { DashboardGrid, ChartCard, StatCard } from "../components/layout/DashboardGrid"
import { useStats } from "../hooks/useEntries"
import { Brain, FileText, TrendingUp, Activity } from "lucide-react"

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

export function Dashboard() {
  const { data: stats, isLoading } = useStats()

  return (
    <div className="min-h-screen bg-background">
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
      </DashboardGrid>
    </div>
  )
}

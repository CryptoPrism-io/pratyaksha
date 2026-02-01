import { Activity } from "lucide-react"
import { WeeklySummaryCard } from "../components/insights/WeeklySummaryCard"
import { DailySummaryCard } from "../components/insights/DailySummaryCard"
import { WeekOverWeekCard } from "../components/insights/WeekOverWeekCard"
import { MonthlySummaryCard } from "../components/insights/MonthlySummaryCard"
import { MonthlyTrendsChart } from "../components/insights/MonthlyTrendsChart"
import { EnergyShapeLegend } from "../components/charts/EnergyShapeLegend"
import { DemoBanner } from "../components/layout/DemoBanner"

export function Insights() {
  return (
    <div className="min-h-screen dashboard-glass-bg">
      {/* Demo Mode Banner */}
      <DemoBanner compact />

      <div className="container mx-auto px-4 py-8 md:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Insights</h1>
          <p className="text-muted-foreground">
            AI-powered analysis of your journaling patterns and personalized recommendations
          </p>
        </div>

        {/* Row 1: Daily and Weekly Summaries */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <DailySummaryCard />
          <WeeklySummaryCard />
        </div>

        {/* Row 2: Monthly Summary and Week-over-Week */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <MonthlySummaryCard />
          <WeekOverWeekCard />
        </div>

        {/* Row 3: Long-term Trends and Cognitive Analysis */}
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyTrendsChart />

          {/* Energy Shape Legend */}
          <div className="rounded-xl glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Energy Shape Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Understanding your energy patterns
                </p>
              </div>
            </div>
            <EnergyShapeLegend showDescriptions className="flex-col items-start gap-2" />
          </div>
        </div>
      </div>
    </div>
  )
}

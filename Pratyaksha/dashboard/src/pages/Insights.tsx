import { DemoBanner } from "../components/layout/DemoBanner"
import { AnalyticsTabBar } from "../components/layout/AnalyticsTabBar"
import { PremiumGate } from "../components/ui/PremiumGate"

export function Insights() {
  return (
    <div className="min-h-screen bg-background">
      <DemoBanner compact />
      <AnalyticsTabBar />
      <PremiumGate
        title="Insights & Analytics"
        description="Deep summaries, weekly patterns, and long-term trends across your journal — powered by AI."
        features={[
          "Daily & weekly AI-written summaries",
          "Month-over-month mood and energy trends",
          "Week-over-week comparison charts",
          "Cognitive pattern detection",
          "Energy shape analysis over time",
        ]}
      />
    </div>
  )
}

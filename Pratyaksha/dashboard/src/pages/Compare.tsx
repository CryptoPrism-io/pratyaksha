import { AnalyticsTabBar } from "../components/layout/AnalyticsTabBar"
import { PremiumGate } from "../components/ui/PremiumGate"
import { GitCompareArrows } from "lucide-react"

export function Compare() {
  return (
    <div className="min-h-screen bg-background">
      <AnalyticsTabBar />
      <PremiumGate
        title="Period Comparison"
        description="Compare any two time periods side-by-side to see how your mental patterns, energy, and moods have shifted."
        features={[
          "Compare any two weeks, months, or custom ranges",
          "Side-by-side sentiment & energy breakdowns",
          "Mood trajectory over time",
          "Entry volume and consistency tracking",
          "Theme & contradiction drift detection",
        ]}
        icon={<GitCompareArrows className="h-8 w-8 text-amber-500" />}
      />
    </div>
  )
}

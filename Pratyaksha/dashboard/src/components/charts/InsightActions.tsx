import { useEntries, useStats } from "../../hooks/useEntries"
import { useFilterAwareEmptyState } from "../../hooks/useFilterAwareEmptyState"
import { Lightbulb, Target, AlertCircle, CheckCircle, Sparkles } from "lucide-react"
import { EmptyState } from "../ui/empty-state"

interface Insight {
  type: "suggestion" | "warning" | "achievement" | "action"
  message: string
  icon: typeof Lightbulb
}

export function InsightActions() {
  const { data: entries, isLoading: entriesLoading } = useEntries()
  const { data: stats, isLoading: statsLoading } = useStats()
  const { getEmptyStateProps } = useFilterAwareEmptyState()

  const isLoading = entriesLoading || statsLoading

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!entries || !stats) {
    const emptyProps = getEmptyStateProps({
      noDataTitle: "No insights yet",
      noDataDescription: "Log a few entries to unlock personalized AI insights",
      filteredTitle: "No insights in selected range",
      filteredDescription: "Try a different date range or log a new entry",
    })
    return <EmptyState icon={Sparkles} height="h-full" {...emptyProps} />
  }

  // Generate insights based on data
  const insights: Insight[] = []

  // Check journaling streak
  if (stats.recentEntries >= 5) {
    insights.push({
      type: "achievement",
      message: `Great consistency! ${stats.recentEntries} entries this week.`,
      icon: CheckCircle,
    })
  } else if (stats.recentEntries < 2) {
    insights.push({
      type: "warning",
      message: "Consider journaling more frequently for better insights.",
      icon: AlertCircle,
    })
  }

  // Check sentiment balance
  if (stats.negativeRatio > 60) {
    insights.push({
      type: "suggestion",
      message: "High negative sentiment detected. Try gratitude journaling.",
      icon: Lightbulb,
    })
  } else if (stats.positiveRatio > 70) {
    insights.push({
      type: "achievement",
      message: "Positive mindset maintained! Keep it up.",
      icon: CheckCircle,
    })
  }

  // Add action items
  insights.push({
    type: "action",
    message: `Focus on ${stats.mostCommonMode} mode activities today.`,
    icon: Target,
  })

  const iconColors = {
    suggestion: "text-primary bg-primary/10",
    warning: "text-negative bg-negative/10",
    achievement: "text-positive bg-positive/10",
    action: "text-secondary bg-secondary/10",
  }

  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight, index) => {
        const Icon = insight.icon
        return (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <div className={`rounded-full p-2 ${iconColors[insight.type]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm leading-relaxed">{insight.message}</p>
          </div>
        )
      })}
    </div>
  )
}

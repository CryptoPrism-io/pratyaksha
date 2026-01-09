import { cn } from "../../lib/utils"
import { FileText, MessageSquare, Smile, Frown, Meh, Zap, Brain, AlertTriangle } from "lucide-react"
import type { PeriodSummary } from "../../hooks/useComparisonData"

interface ComparisonSummaryProps {
  summary: PeriodSummary
  isLoading?: boolean
  className?: string
}

export function ComparisonSummary({ summary, isLoading, className }: ComparisonSummaryProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4 animate-pulse", className)}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg" />
        ))}
      </div>
    )
  }

  if (summary.entries === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full py-8 text-center", className)}>
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No entries in this period</p>
      </div>
    )
  }

  const metrics = [
    {
      label: "Entries",
      value: summary.entries,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Avg Words",
      value: summary.avgWordsPerEntry,
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Positive",
      value: `${summary.positivePercent}%`,
      icon: Smile,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Negative",
      value: `${summary.negativePercent}%`,
      icon: Frown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Neutral",
      value: `${summary.neutralPercent}%`,
      icon: Meh,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
    },
  ]

  const insights = [
    {
      label: "Dominant Mode",
      value: summary.dominantMode,
      icon: Brain,
      color: "text-indigo-500",
    },
    {
      label: "Dominant Energy",
      value: summary.dominantEnergy,
      icon: Zap,
      color: "text-amber-500",
    },
    {
      label: "Top Contradiction",
      value: summary.topContradiction,
      icon: AlertTriangle,
      color: "text-orange-500",
    },
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {metrics.map(({ label, value, icon: Icon, color, bgColor }) => (
          <div
            key={label}
            className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
          >
            <div className={cn("p-1.5 rounded-md", bgColor)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="space-y-2">
        {insights.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", color)} />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <span className="text-sm font-medium truncate max-w-[120px]" title={value}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Entry Types Breakdown */}
      {summary.entryTypes.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Entry Types</p>
          <div className="flex flex-wrap gap-1.5">
            {summary.entryTypes.slice(0, 5).map(({ type, count }) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted"
              >
                {type}
                <span className="text-muted-foreground">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { cn } from "../../lib/utils"
import { FileText, MessageSquare, Smile, Frown, Meh, Zap, Brain, AlertTriangle, Lightbulb, Target, HelpCircle } from "lucide-react"
import type { PeriodSummary } from "../../hooks/useComparisonData"

interface Recommendation {
  what: string
  why: string
  how: string
}

// Generate recommendation based on summary patterns
function generateRecommendation(summary: PeriodSummary): Recommendation | null {
  if (summary.entries === 0) return null

  // Priority 1: High negative sentiment
  if (summary.negativePercent >= 40) {
    return {
      what: "Shift focus to positive anchors",
      why: `${summary.negativePercent}% of entries were negative - sustained negativity impacts clarity`,
      how: "Start each entry with one thing you're grateful for before processing challenges"
    }
  }

  // Priority 2: Concerning contradiction pattern
  if (summary.topContradiction !== "N/A") {
    const contradictionMap: Record<string, Recommendation> = {
      "Action vs. Fear": {
        what: "Take one small action today",
        why: "Fear shrinks when met with movement, even tiny steps",
        how: "Pick the smallest possible action toward your goal and do it within 2 hours"
      },
      "Growth vs. Comfort": {
        what: "Schedule discomfort intentionally",
        why: "Growth happens at the edge of comfort, not beyond capacity",
        how: "Block 30 mins this week for one uncomfortable but meaningful task"
      },
      "Control vs. Surrender": {
        what: "Identify what's within your control",
        why: "Energy spent on uncontrollables drains capacity for real impact",
        how: "List 3 things you can control about the situation, focus only on those"
      },
      "Hope vs. Hopelessness": {
        what: "Document small wins daily",
        why: "Hope is rebuilt through evidence, not affirmation",
        how: "End each day noting one thing that went slightly better than expected"
      }
    }
    if (contradictionMap[summary.topContradiction]) {
      return contradictionMap[summary.topContradiction]
    }
  }

  // Priority 3: Challenge energy patterns
  const challengeEnergies = ["Chaotic", "Heavy", "Collapsing", "Contracted"]
  if (challengeEnergies.includes(summary.dominantEnergy)) {
    return {
      what: "Regulate before you reflect",
      why: `${summary.dominantEnergy} energy patterns suggest nervous system dysregulation`,
      how: "Before journaling, do 5 slow breaths (4-7-8 pattern) to shift state"
    }
  }

  // Priority 4: Low entry count
  if (summary.entries < 3) {
    return {
      what: "Increase journaling frequency",
      why: "Sparse entries miss patterns - consistency reveals insights",
      how: "Set a daily 2-minute timer at the same time to build the habit"
    }
  }

  // Default: Positive reinforcement
  if (summary.positivePercent >= 50) {
    return {
      what: "Capture what's working",
      why: `${summary.positivePercent}% positive entries - identify the conditions creating this`,
      how: "Note the time, place, and context of your best entries to replicate"
    }
  }

  return null
}

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

      {/* Weekly Recommendation */}
      {(() => {
        const rec = generateRecommendation(summary)
        if (!rec) return null
        return (
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium text-muted-foreground">Recommendation</span>
            </div>
            <div className="space-y-1.5 pl-5">
              <div className="flex items-start gap-2">
                <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{rec.what}</p>
              </div>
              <div className="flex items-start gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{rec.why}</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs">{rec.how}</p>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

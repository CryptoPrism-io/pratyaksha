import { useMemo } from "react"
import { useEntries } from "../../hooks/useEntries"
import { toContradictionData } from "../../lib/transforms"
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "../../lib/utils"

// Contradiction colors for visual distinction
const CONTRADICTION_COLORS: Record<string, string> = {
  "Connection vs. Avoidance": "bg-blue-500",
  "Hope vs. Hopelessness": "bg-amber-500",
  "Anger vs. Shame": "bg-red-500",
  "Control vs. Surrender": "bg-purple-500",
  "Confidence vs. Doubt": "bg-green-500",
  "Independence vs. Belonging": "bg-cyan-500",
  "Closeness vs. Distance": "bg-pink-500",
  "Expression vs. Silence": "bg-orange-500",
  "Self-care vs. Obligation": "bg-teal-500",
  "Ideal vs. Reality": "bg-indigo-500",
  "Action vs. Fear": "bg-yellow-500",
  "Growth vs. Comfort": "bg-emerald-500",
}

interface ContradictionCounterProps {
  /** Number of top contradictions to show */
  limit?: number
  /** Show percentage bar */
  showBar?: boolean
  /** Compact mode */
  compact?: boolean
  /** Additional class names */
  className?: string
}

/**
 * Top contradictions counter with occurrence counts (#12 Quick Win)
 */
export function ContradictionCounter({
  limit = 3,
  showBar = true,
  compact = false,
  className
}: ContradictionCounterProps) {
  const { data: entries = [], isLoading } = useEntries()

  const { topContradictions, total, maxCount } = useMemo(() => {
    if (!entries.length) {
      return { topContradictions: [], total: 0, maxCount: 0 }
    }

    const contradictionData = toContradictionData(entries)
    const top = contradictionData.slice(0, limit)
    const total = entries.filter(e => e.contradiction).length
    const maxCount = top[0]?.count || 1

    return { topContradictions: top, total, maxCount }
  }, [entries, limit])

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded h-8" />
        ))}
      </div>
    )
  }

  if (topContradictions.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-6 text-muted-foreground", className)}>
        <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No contradictions detected yet</p>
        <p className="text-xs">Keep journaling to reveal patterns</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with total */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Top Internal Tensions</span>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>

      {/* Contradiction list */}
      {topContradictions.map((item, index) => {
        const percentage = Math.round((item.count / maxCount) * 100)
        const barColor = CONTRADICTION_COLORS[item.contradiction] || "bg-primary"
        const TrendIcon = item.trend === "stable" ? Minus : item.trend === "worsening" ? TrendingUp : TrendingDown

        return (
          <div key={item.contradiction} className={cn("space-y-1", compact && "space-y-0.5")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "flex items-center justify-center rounded-full text-white font-bold",
                  compact ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-xs",
                  barColor
                )}>
                  {index + 1}
                </span>
                <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
                  {item.contradiction}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
                  {item.count}
                </span>
                <TrendIcon className={cn(
                  "h-3 w-3",
                  item.trend === "worsening" ? "text-amber-500" : "text-muted-foreground"
                )} />
              </div>
            </div>
            {showBar && (
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", barColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Insight */}
      {topContradictions.length > 0 && (
        <div className="pt-2 border-t text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{topContradictions[0].contradiction}</span>
          {" "}is your most frequent internal tension. Consider journaling about how both sides serve you.
        </div>
      )}
    </div>
  )
}

/**
 * Compact card version for dashboard use
 */
export function ContradictionCounterCard() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <h3 className="font-semibold text-sm">Contradiction Patterns</h3>
      </div>
      <ContradictionCounter limit={3} showBar compact />
    </div>
  )
}

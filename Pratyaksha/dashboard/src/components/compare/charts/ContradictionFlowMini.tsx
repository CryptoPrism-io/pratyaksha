import { useMemo } from "react"
import { GitBranch } from "lucide-react"
import { useComparisonData, type DateRange } from "../../../hooks/useComparisonData"

interface ContradictionFlowMiniProps {
  dateRange: DateRange
  isLoading?: boolean
}

export function ContradictionFlowMini({ dateRange, isLoading: externalLoading }: ContradictionFlowMiniProps) {
  const { entries, isLoading: dataLoading } = useComparisonData(dateRange)

  const isLoading = externalLoading || dataLoading

  // Calculate contradiction counts
  const contradictionData = useMemo(() => {
    if (!entries || entries.length === 0) return []

    const counts: Record<string, number> = {}
    entries.forEach((entry) => {
      const contradiction = entry.contradiction
      if (contradiction) {
        counts[contradiction] = (counts[contradiction] || 0) + 1
      }
    })

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [entries])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (contradictionData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <GitBranch className="h-10 w-10 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No contradictions found</p>
      </div>
    )
  }

  const maxCount = Math.max(...contradictionData.map((d) => d.count))

  return (
    <div className="h-full flex flex-col">
      <p className="text-xs text-muted-foreground mb-3 text-center">
        Top Inner Contradictions
      </p>

      <div className="space-y-2 flex-1">
        {contradictionData.map(({ name, count }) => {
          const percentage = (count / maxCount) * 100

          return (
            <div key={name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[150px] text-muted-foreground" title={name}>
                  {name}
                </span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-2 border-t text-center">
        <p className="text-xs text-muted-foreground">
          {entries.length} entries with {contradictionData.length} unique patterns
        </p>
      </div>
    </div>
  )
}

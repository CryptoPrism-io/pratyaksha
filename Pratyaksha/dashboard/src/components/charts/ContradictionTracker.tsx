import { useContradictionData } from "../../hooks/useEntries"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function ContradictionTracker() {
  const { data, isLoading, error } = useContradictionData()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Failed to load data
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No contradictions found
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count))
  const topContradictions = data.slice(0, 5)

  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case "improving":
        return <TrendingDown className="h-4 w-4 text-positive" />
      case "worsening":
        return <TrendingUp className="h-4 w-4 text-negative" />
      default:
        return <Minus className="h-4 w-4 text-neutral" />
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {topContradictions.map((item) => (
        <div key={item.contradiction} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate max-w-[150px]">
              {item.contradiction}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.count}</span>
              <TrendIcon trend={item.trend} />
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

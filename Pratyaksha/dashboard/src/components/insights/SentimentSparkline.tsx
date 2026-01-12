import { useMemo } from "react"
import { AreaChart, Area, YAxis } from "recharts"
import { SafeResponsiveContainer } from "../ui/safe-responsive-container"
import { useEntries } from "../../hooks/useEntries"
import { toTimelineData } from "../../lib/transforms"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "../../lib/utils"

interface SentimentSparklineProps {
  /** Height of the sparkline in pixels */
  height?: number
  /** Show trend indicator */
  showTrend?: boolean
  /** Additional class names */
  className?: string
  /** Number of days to show (default: 7) */
  days?: number
}

/**
 * Compact sentiment sparkline for quick trend visualization (#8 Quick Win)
 */
export function SentimentSparkline({
  height = 40,
  showTrend = true,
  className,
  days = 7
}: SentimentSparklineProps) {
  const { data: entries = [], isLoading } = useEntries()

  const { chartData, trend, trendPercent } = useMemo(() => {
    if (!entries.length) {
      return { chartData: [], trend: "neutral" as const, trendPercent: 0 }
    }

    const timelineData = toTimelineData(entries)
    // Get last N days of data
    const recentData = timelineData.slice(-days)

    if (recentData.length < 2) {
      return { chartData: recentData, trend: "neutral" as const, trendPercent: 0 }
    }

    // Calculate trend from first half vs second half
    const mid = Math.floor(recentData.length / 2)
    const firstHalf = recentData.slice(0, mid)
    const secondHalf = recentData.slice(mid)

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.sentiment, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.sentiment, 0) / secondHalf.length

    const diff = secondAvg - firstAvg
    let trend: "up" | "down" | "neutral" = "neutral"
    if (diff > 0.1) trend = "up"
    else if (diff < -0.1) trend = "down"

    const trendPercent = Math.round(Math.abs(diff) * 100)

    return { chartData: recentData, trend, trendPercent }
  }, [entries, days])

  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded h-10", className)} style={{ height }} />
    )
  }

  if (chartData.length === 0) {
    return (
      <div className={cn("flex items-center justify-center text-muted-foreground text-xs", className)} style={{ height }}>
        No data
      </div>
    )
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-positive" : trend === "down" ? "text-negative" : "text-muted-foreground"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1" style={{ height }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[-1, 1]} hide />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#sentimentGradient)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      {showTrend && (
        <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
          <TrendIcon className="h-3 w-3" />
          {trendPercent > 0 && <span>{trendPercent}%</span>}
        </div>
      )}
    </div>
  )
}

/**
 * Compact stat card with sparkline for dashboard use
 */
export function SentimentSparklineCard() {
  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">Sentiment Trend</span>
        <span className="text-xs text-muted-foreground">7 days</span>
      </div>
      <SentimentSparkline height={32} showTrend days={7} />
    </div>
  )
}

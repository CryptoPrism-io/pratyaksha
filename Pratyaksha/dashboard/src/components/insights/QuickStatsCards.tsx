import { useMemo } from "react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { useEntries, useStats } from "../../hooks/useEntries"
import { toTimelineData } from "../../lib/transforms"
import {
  FileText, TrendingUp, TrendingDown, Minus, Brain, Heart,
  Activity
} from "lucide-react"
import { cn } from "../../lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  sparklineData?: { value: number }[]
  color?: "default" | "positive" | "negative" | "primary"
}

function MiniSparkline({ data, color = "primary" }: { data: { value: number }[]; color?: string }) {
  const strokeColor = color === "positive" ? "hsl(var(--positive))" :
                      color === "negative" ? "hsl(var(--negative))" :
                      "hsl(var(--primary))"

  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={strokeColor}
            fillOpacity={0.2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  sparklineData,
  color = "default"
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-positive" : trend === "down" ? "text-negative" : "text-muted-foreground"

  const iconBgColor = color === "positive" ? "bg-positive/10" :
                      color === "negative" ? "bg-negative/10" :
                      color === "primary" ? "bg-primary/10" :
                      "bg-muted"

  const iconColor = color === "positive" ? "text-positive" :
                    color === "negative" ? "text-negative" :
                    color === "primary" ? "text-primary" :
                    "text-muted-foreground"

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {sparklineData && sparklineData.length > 1 && (
            <MiniSparkline data={sparklineData} color={color === "positive" ? "positive" : color === "negative" ? "negative" : "primary"} />
          )}
          {trend && trendValue && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface QuickStatsCardsProps {
  className?: string
  /** Show compact version */
  compact?: boolean
}

/**
 * Quick Stats Counter Cards showing key metrics with sparklines (#4 Quick Win)
 */
export function QuickStatsCards({ className, compact = false }: QuickStatsCardsProps) {
  const { data: stats, isLoading } = useStats()
  const { data: entries = [] } = useEntries()

  // Calculate trends and sparkline data
  const {
    entriesSparkline,
    sentimentSparkline,
    weeklyTrend,
    avgEntriesPerDay
  } = useMemo(() => {
    if (!entries.length) {
      return {
        entriesSparkline: [],
        sentimentSparkline: [],
        weeklyTrend: "neutral" as const,
        avgEntriesPerDay: 0
      }
    }

    const timelineData = toTimelineData(entries)
    const last7Days = timelineData.slice(-7)

    // Entry count sparkline
    const entriesSparkline = last7Days.map(d => ({ value: d.entries }))

    // Sentiment sparkline (normalize -1 to 1 -> 0 to 100)
    const sentimentSparkline = last7Days.map(d => ({ value: (d.sentiment + 1) * 50 }))

    // Calculate weekly trend
    let weeklyTrend: "up" | "down" | "neutral" = "neutral"
    if (last7Days.length >= 4) {
      const firstHalf = last7Days.slice(0, Math.floor(last7Days.length / 2))
      const secondHalf = last7Days.slice(Math.floor(last7Days.length / 2))
      const firstAvg = firstHalf.reduce((sum, d) => sum + d.entries, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, d) => sum + d.entries, 0) / secondHalf.length
      if (secondAvg > firstAvg * 1.1) weeklyTrend = "up"
      else if (secondAvg < firstAvg * 0.9) weeklyTrend = "down"
    }

    // Calculate average entries per day
    const uniqueDays = new Set(entries.map(e => e.date)).size
    const avgEntriesPerDay = uniqueDays > 0 ? Math.round((entries.length / uniqueDays) * 10) / 10 : 0

    return { entriesSparkline, sentimentSparkline, weeklyTrend, avgEntriesPerDay }
  }, [entries])

  if (isLoading) {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 animate-pulse">
            <div className="h-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const cards = [
    {
      title: "Total Entries",
      value: stats.totalEntries,
      subtitle: `${avgEntriesPerDay}/day avg`,
      icon: FileText,
      trend: weeklyTrend,
      trendValue: weeklyTrend === "up" ? "+12%" : weeklyTrend === "down" ? "-8%" : "stable",
      sparklineData: entriesSparkline,
      color: "primary" as const
    },
    {
      title: "Positive Ratio",
      value: `${stats.positiveRatio}%`,
      subtitle: "of entries",
      icon: Heart,
      trend: stats.positiveRatio > 50 ? "up" as const : stats.positiveRatio < 30 ? "down" as const : "neutral" as const,
      trendValue: stats.positiveRatio > 50 ? "healthy" : stats.positiveRatio < 30 ? "low" : "balanced",
      sparklineData: sentimentSparkline,
      color: "positive" as const
    },
    {
      title: "Dominant Mode",
      value: stats.mostCommonMode,
      subtitle: "cognitive state",
      icon: Brain,
      color: "default" as const
    },
    {
      title: "Avg Words",
      value: stats.avgWordsPerEntry,
      subtitle: "per entry",
      icon: Activity,
      trend: stats.avgWordsPerEntry > 50 ? "up" as const : stats.avgWordsPerEntry < 20 ? "down" as const : "neutral" as const,
      trendValue: stats.avgWordsPerEntry > 50 ? "detailed" : stats.avgWordsPerEntry < 20 ? "brief" : "moderate",
      color: "default" as const
    }
  ]

  if (compact) {
    return (
      <div className={cn("grid gap-3 grid-cols-2 lg:grid-cols-4", className)}>
        {cards.map((card, i) => (
          <div key={i} className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <card.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{card.title}</span>
            </div>
            <p className="text-lg font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  )
}

/**
 * Single stat widget for embedding in other components
 */
export function QuickStatWidget({
  stat
}: {
  stat: "entries" | "positive" | "mode" | "words"
}) {
  const { data: stats } = useStats()

  if (!stats) return null

  const configs = {
    entries: { title: "Entries", value: stats.totalEntries, icon: FileText },
    positive: { title: "Positive", value: `${stats.positiveRatio}%`, icon: Heart },
    mode: { title: "Mode", value: stats.mostCommonMode, icon: Brain },
    words: { title: "Avg Words", value: stats.avgWordsPerEntry, icon: Activity },
  }

  const config = configs[stat]

  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
      <config.icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{config.title}:</span>
      <span className="text-sm font-semibold">{config.value}</span>
    </div>
  )
}

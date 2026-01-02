import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceLine } from "recharts"
import { useTimelineData } from "../../hooks/useEntries"
import { Skeleton } from "../ui/skeleton"
import { AlertCircle, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"

// Custom tooltip component
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null

  const sentiment = payload[0].value
  const sentimentLabel = sentiment > 0.3 ? "Positive" : sentiment < -0.3 ? "Negative" : "Neutral"
  const Icon = sentiment > 0.3 ? TrendingUp : sentiment < -0.3 ? TrendingDown : Minus
  const colorClass = sentiment > 0.3 ? "text-positive" : sentiment < -0.3 ? "text-negative" : "text-neutral"

  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground">
        {label ? new Date(label).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : ""}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <span className={`font-semibold ${colorClass}`}>{sentimentLabel}</span>
        <span className="text-muted-foreground">({sentiment.toFixed(2)})</span>
      </div>
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="h-[250px] w-full space-y-4 p-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-[180px] w-full rounded-lg" />
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3 w-12" />
        ))}
      </div>
    </div>
  )
}

export function EmotionalTimeline() {
  const { data, isLoading, error, refetch } = useTimelineData()

  if (isLoading) {
    return <TimelineSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Failed to load timeline</p>
        <button
          onClick={() => refetch?.()}
          className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">No timeline data yet</p>
        <p className="text-xs">Start logging entries to see your emotional trends</p>
      </div>
    )
  }

  // Calculate average sentiment for reference
  const avgSentiment = data.reduce((sum, d) => sum + (d.sentiment || 0), 0) / data.length

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
        <defs>
          <linearGradient id="sentimentGradientPositive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--positive))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--positive))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="sentimentGradientNegative" x1="0" y1="1" x2="0" y2="0">
            <stop offset="5%" stopColor="hsl(var(--negative))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--negative))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          domain={[-1, 1]}
          tickFormatter={(value) => value.toFixed(1)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "5 5" }} />
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
        <ReferenceLine
          y={avgSentiment}
          stroke="hsl(var(--primary))"
          strokeDasharray="5 5"
          label={{ value: `Avg: ${avgSentiment.toFixed(2)}`, fill: "hsl(var(--muted-foreground))", fontSize: 10, position: "right" }}
        />
        <Area
          type="monotone"
          dataKey="sentiment"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#sentimentGradientPositive)"
          animationDuration={1000}
          animationEasing="ease-out"
          activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
        />
        {data.length > 7 && (
          <Brush
            dataKey="date"
            height={20}
            stroke="hsl(var(--border))"
            fill="hsl(var(--muted))"
            tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}

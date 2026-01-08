import { useState } from "react"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useMultiMonthMetrics } from "../../hooks/useMonthOverMonth"
import { formatMonthLabelShort } from "../../lib/monthUtils"
import { Skeleton } from "../ui/skeleton"
import { AlertCircle, TrendingUp, BarChart3 } from "lucide-react"
import { cn } from "../../lib/utils"

type ViewMode = "3M" | "6M"

interface TrendDataPoint {
  monthId: string
  label: string
  entries: number
  positivePercent: number
  activeDays: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
      <p className="text-sm font-medium mb-1">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-medium">
            {item.name.includes("%") ? `${item.value}%` : item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function MonthlyTrendsChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("3M")
  const monthCount = viewMode === "3M" ? 3 : 6
  const { data, isLoading, error } = useMultiMonthMetrics(monthCount)

  // Transform data for chart
  const chartData: TrendDataPoint[] = data.map((m) => ({
    monthId: m.monthId,
    label: formatMonthLabelShort(m.monthId),
    entries: m.entryCount,
    positivePercent: m.entryCount > 0
      ? Math.round((m.sentimentBreakdown.positive / m.entryCount) * 100)
      : 0,
    activeDays: m.activeDays,
  }))

  // Calculate overall trend
  const getTrend = () => {
    if (chartData.length < 2) return null
    const first = chartData[0]?.positivePercent || 0
    const last = chartData[chartData.length - 1]?.positivePercent || 0
    if (last > first + 5) return "improving"
    if (last < first - 5) return "declining"
    return "stable"
  }

  const trend = getTrend()

  return (
    <div className="rounded-xl glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold">Long-Term Trends</h3>
            <p className="text-xs text-muted-foreground">
              Track your progress over time
            </p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setViewMode("3M")}
            className={cn(
              "px-3 py-1 rounded text-sm transition-colors",
              viewMode === "3M"
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            3M
          </button>
          <button
            onClick={() => setViewMode("6M")}
            className={cn(
              "px-3 py-1 rounded text-sm transition-colors",
              viewMode === "6M"
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            6M
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground">
            Failed to load trend data
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && chartData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm font-medium mb-1">Not enough data yet</p>
          <p className="text-xs text-muted-foreground">
            Keep journaling to see your long-term trends
          </p>
        </div>
      )}

      {/* Chart content */}
      {!isLoading && !error && chartData.length > 0 && (
        <div className="space-y-4">
          {/* Trend indicator */}
          {trend && (
            <div className="flex justify-center">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                trend === "improving" && "bg-green-500/10 text-green-600",
                trend === "declining" && "bg-red-500/10 text-red-600",
                trend === "stable" && "bg-slate-500/10 text-slate-600"
              )}>
                <TrendingUp className={cn(
                  "h-4 w-4",
                  trend === "declining" && "rotate-180"
                )} />
                <span className="font-medium capitalize">
                  {trend === "improving" ? "Mood Improving" :
                   trend === "declining" ? "Needs Attention" :
                   "Holding Steady"}
                </span>
              </div>
            </div>
          )}

          {/* Main chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  yAxisId="left"
                  dataKey="entries"
                  name="Entries"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="positivePercent"
                  name="Positive %"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t">
            <div className="text-center">
              <p className="text-lg font-bold">
                {chartData.reduce((sum, d) => sum + d.entries, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Entries</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {Math.round(chartData.reduce((sum, d) => sum + d.positivePercent, 0) / chartData.length)}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Positive</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {Math.round(chartData.reduce((sum, d) => sum + d.activeDays, 0) / chartData.length)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Active Days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { SafeResponsiveContainer } from "../../ui/safe-responsive-container"
import { TrendingUp } from "lucide-react"

interface TimelineEntry {
  date: string
  sentiment: number
  sentimentCategory: "positive" | "negative" | "neutral"
}

interface TimelineData {
  entries: TimelineEntry[]
}

interface TimelineMiniProps {
  data: TimelineData
  isLoading?: boolean
}

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#6b7280",
}

export function TimelineMini({ data, isLoading }: TimelineMiniProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data?.entries || data.entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <TrendingUp className="h-10 w-10 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No timeline data</p>
      </div>
    )
  }

  // Prepare chart data with index for x-axis
  const chartData = data.entries.map((entry, index) => ({
    ...entry,
    index,
    displayDate: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }))

  // Calculate average sentiment
  const avgSentiment =
    chartData.reduce((sum, e) => sum + e.sentiment, 0) / chartData.length

  const sentimentLabel =
    avgSentiment > 0.2
      ? "Positive"
      : avgSentiment < -0.2
      ? "Negative"
      : "Neutral"

  return (
    <div className="h-full flex flex-col">
      {/* Summary */}
      <div className="flex justify-between items-center mb-3 px-2">
        <div>
          <p className="text-xs text-muted-foreground">Avg Sentiment</p>
          <p
            className="text-sm font-semibold"
            style={{
              color:
                avgSentiment > 0.2
                  ? SENTIMENT_COLORS.positive
                  : avgSentiment < -0.2
                  ? SENTIMENT_COLORS.negative
                  : SENTIMENT_COLORS.neutral,
            }}
          >
            {sentimentLabel} ({avgSentiment.toFixed(2)})
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Entries</p>
          <p className="text-sm font-semibold">{chartData.length}</p>
        </div>
      </div>

      {/* Chart */}
      <SafeResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[-1, 1]}
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={30}
            tickFormatter={(v) => (v === 1 ? "+" : v === -1 ? "-" : "0")}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [value.toFixed(2), "Sentiment"]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.displayDate || ""
            }
          />
          <ReferenceLine
            y={0}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            opacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="sentiment"
            stroke="hsl(var(--primary))"
            fill="url(#sentimentGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </SafeResponsiveContainer>
    </div>
  )
}

import { useCalendarData } from "../../hooks/useEntries"

const SENTIMENT_COLORS = {
  positive: "bg-positive/70",
  negative: "bg-negative/70",
  neutral: "bg-neutral/50",
  none: "bg-muted",
}

export function CalendarHeatmap() {
  const { data, isLoading, error } = useCalendarData()

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
        No data available
      </div>
    )
  }

  // Group by month for display
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Get last 90 days
  const recentData = sortedData.slice(-90)

  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      <div className="flex items-center justify-end gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className={`h-3 w-3 rounded ${SENTIMENT_COLORS.positive}`} />
          <span>Positive</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`h-3 w-3 rounded ${SENTIMENT_COLORS.neutral}`} />
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`h-3 w-3 rounded ${SENTIMENT_COLORS.negative}`} />
          <span>Negative</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-wrap gap-1 overflow-x-auto pb-2">
        {recentData.map((day) => (
          <div
            key={day.date}
            className={`h-4 w-4 rounded-sm ${SENTIMENT_COLORS[day.sentiment]} transition-all hover:scale-125`}
            title={`${new Date(day.date).toLocaleDateString()}: ${day.count} entries (${day.sentiment})`}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Last 90 days</span>
        <span>{recentData.length} active days</span>
      </div>
    </div>
  )
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { SafeResponsiveContainer } from "../ui/safe-responsive-container"
import { useEntries } from "../../hooks/useEntries"
import { useFilterAwareEmptyState } from "../../hooks/useFilterAwareEmptyState"
import { EmptyState } from "../ui/empty-state"
import { Calendar } from "lucide-react"

export function DailyRhythm() {
  const { data: entries, isLoading, error } = useEntries()
  const { getEmptyStateProps } = useFilterAwareEmptyState()

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

  if (!entries || entries.length === 0) {
    const emptyProps = getEmptyStateProps({
      noDataTitle: "No rhythm data yet",
      noDataDescription: "Log entries throughout the week to see your daily patterns",
      filteredTitle: "No entries in selected range",
      filteredDescription: "Try a different date range or log a new entry",
    })
    return <EmptyState icon={Calendar} height="h-full" {...emptyProps} />
  }

  // Group entries by day of week
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dayCounts = dayNames.map((day) => ({ day, count: 0 }))

  entries.forEach((entry) => {
    const dayIndex = new Date(entry.date).getDay()
    dayCounts[dayIndex].count++
  })

  return (
    <SafeResponsiveContainer width="100%" height={250}>
      <BarChart data={dayCounts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="day"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar
          dataKey="count"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          name="Entries"
        />
      </BarChart>
    </SafeResponsiveContainer>
  )
}

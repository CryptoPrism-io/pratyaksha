import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { useEnergyShapeData } from "../../hooks/useEntries"
import { useFilterAwareEmptyState } from "../../hooks/useFilterAwareEmptyState"
import { EmptyState } from "../ui/empty-state"
import { Activity } from "lucide-react"

export function EnergyRadar() {
  const { data, isLoading, error } = useEnergyShapeData()
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

  const hasData = data.some((d) => d.count > 0)
  if (!hasData) {
    const emptyProps = getEmptyStateProps({
      noDataTitle: "No energy data yet",
      noDataDescription: "Log entries to visualize your energy shapes and patterns",
      filteredTitle: "No energy data in selected range",
      filteredDescription: "Try a different date range or log a new entry",
    })
    return <EmptyState icon={Activity} {...emptyProps} />
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="shape"
          tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickCount={5}
        />
        <Radar
          name="Count"
          dataKey="count"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.4}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

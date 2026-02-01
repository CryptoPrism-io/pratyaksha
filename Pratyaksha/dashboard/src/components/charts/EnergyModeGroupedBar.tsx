import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import { SafeResponsiveContainer } from "../ui/safe-responsive-container"
import { useNavigate } from "react-router-dom"
import { useEntries } from "../../hooks/useEntries"
import { useState } from "react"

// All actual modes from the data
const MODES = [
  "Hopeful",
  "Calm",
  "Grounded",
  "Curious",
  "Reflective",
  "Conflicted",
  "Agitated",
  "Overthinking",
  "Self-critical",
]

// Energy levels grouped for simplicity
const ENERGY_GROUPS = {
  "Low": ["Drained", "Low", "Scattered"],
  "Medium": ["Moderate", "Balanced"],
  "High": ["Elevated", "High"],
}

// Energy colors - Teal, Rose, Amber brand palette
const ENERGY_COLORS = {
  "Low": "hsl(347, 77%, 64%)",     // Rose-400 (low energy)
  "Medium": "hsl(38, 92%, 50%)",   // Amber-500 (medium)
  "High": "hsl(166, 76%, 47%)",    // Teal-500 (high energy)
}

// Custom tooltip component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-lg shadow-lg p-2 text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((p: { name: string; value: number; color: string }) => (
          <p key={p.name} style={{ color: p.color }} className="text-xs">
            {p.name} Energy: {p.value}
          </p>
        ))}
        <p className="text-xs text-muted-foreground mt-1">Click to view in logs</p>
      </div>
    )
  }
  return null
}

export function EnergyModeGroupedBar() {
  const navigate = useNavigate()
  const { data: entries, isLoading, error } = useEntries()
  const [activeMode, setActiveMode] = useState<string | null>(null)

  // Handle bar click - navigate to logs with mode filter
  const handleBarClick = (data: { mode: string }) => {
    const params = new URLSearchParams()
    params.set("mode", data.mode)
    navigate(`/logs?${params.toString()}`)
  }

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
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  // Build data: for each mode, count low/medium/high energy
  const chartData = MODES.map((mode) => {
    const modeEntries = entries.filter((e) => e.inferredMode === mode)

    const counts = {
      mode,
      Low: 0,
      Medium: 0,
      High: 0,
      total: modeEntries.length,
    }

    modeEntries.forEach((entry) => {
      const energy = entry.inferredEnergy
      if (ENERGY_GROUPS["Low"].includes(energy)) counts.Low++
      else if (ENERGY_GROUPS["Medium"].includes(energy)) counts.Medium++
      else if (ENERGY_GROUPS["High"].includes(energy)) counts.High++
    })

    return counts
  }).filter(d => d.total > 0) // Only show modes that have entries

  // Sort by total count descending
  chartData.sort((a, b) => b.total - a.total)

  return (
    <div className="flex flex-col h-full min-h-[300px] -mx-2">
      <SafeResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 8, left: 0, bottom: 10 }}
          onMouseLeave={() => setActiveMode(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis
            type="number"
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="mode"
            stroke="hsl(var(--muted-foreground))"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            width={58}
            tickFormatter={(value) => value.length > 10 ? value.slice(0, 9) + '…' : value}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted)/0.3)" }}
            content={<CustomTooltip />}
          />
          <Legend
            wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
            formatter={(value) => `${value}`}
          />
          <Bar
            dataKey="Low"
            stackId="a"
            fill={ENERGY_COLORS.Low}
            radius={[0, 0, 0, 0]}
            cursor="pointer"
            onClick={(data) => handleBarClick(data)}
            onMouseEnter={(data) => setActiveMode(data.mode)}
          >
            {chartData.map((entry) => (
              <Cell
                key={`low-${entry.mode}`}
                fillOpacity={activeMode === null || activeMode === entry.mode ? 1 : 0.4}
              />
            ))}
          </Bar>
          <Bar
            dataKey="Medium"
            stackId="a"
            fill={ENERGY_COLORS.Medium}
            radius={[0, 0, 0, 0]}
            cursor="pointer"
            onClick={(data) => handleBarClick(data)}
            onMouseEnter={(data) => setActiveMode(data.mode)}
          >
            {chartData.map((entry) => (
              <Cell
                key={`med-${entry.mode}`}
                fillOpacity={activeMode === null || activeMode === entry.mode ? 1 : 0.4}
              />
            ))}
          </Bar>
          <Bar
            dataKey="High"
            stackId="a"
            fill={ENERGY_COLORS.High}
            radius={[4, 4, 4, 4]}
            cursor="pointer"
            onClick={(data) => handleBarClick(data)}
            onMouseEnter={(data) => setActiveMode(data.mode)}
          >
            {chartData.map((entry) => (
              <Cell
                key={`high-${entry.mode}`}
                fillOpacity={activeMode === null || activeMode === entry.mode ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </SafeResponsiveContainer>

      {/* Insight text */}
      <div className="text-center text-xs text-muted-foreground pt-1">
        {chartData.length > 0 && (
          <span>
            Top: <span className="font-medium text-foreground">{chartData[0].mode}</span>
            {" "}({chartData[0].total})
          </span>
        )}
      </div>
    </div>
  )
}

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts"
import { useEntries } from "../../hooks/useEntries"

// Map modes to numeric values for scatter plot
const MODE_VALUES: Record<string, number> = {
  "Reflective": 1,
  "Analytical": 2,
  "Emotional": 3,
  "Creative": 4,
  "Practical": 5,
}

// Map energy levels to numeric values
const ENERGY_VALUES: Record<string, number> = {
  "Low": 1,
  "Medium": 2,
  "High": 3,
}

export function EnergyModeMatrix() {
  const { data: entries, isLoading, error } = useEntries()

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

  // Transform entries to scatter data
  const scatterData = entries
    .filter((e) => e.inferredMode && e.inferredEnergy)
    .map((e) => ({
      x: MODE_VALUES[e.inferredMode] || 3,
      y: ENERGY_VALUES[e.inferredEnergy] || 2,
      z: e.entryLengthWords,
      mode: e.inferredMode,
      energy: e.inferredEnergy,
    }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          dataKey="x"
          name="Mode"
          domain={[0.5, 5.5]}
          tickFormatter={(v) =>
            Object.entries(MODE_VALUES).find(([, val]) => val === v)?.[0] || ""
          }
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Energy"
          domain={[0.5, 3.5]}
          tickFormatter={(v) =>
            Object.entries(ENERGY_VALUES).find(([, val]) => val === v)?.[0] || ""
          }
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
        />
        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Words" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value, name) => {
            if (name === "x") return [scatterData[0]?.mode, "Mode"]
            if (name === "y") return [scatterData[0]?.energy, "Energy"]
            return [value, name]
          }}
        />
        <Scatter
          name="Entries"
          data={scatterData}
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

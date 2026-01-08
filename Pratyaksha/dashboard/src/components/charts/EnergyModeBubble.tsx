import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { useNavigate } from "react-router-dom"
import { useEntries } from "../../hooks/useEntries"
import { useIsMobile } from "../../hooks/useMediaQuery"

// All actual modes from the data (ordered by positivity)
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

// All actual energy levels from the data (ordered low to high)
const ENERGY_LEVELS = [
  "Drained",
  "Low",
  "Scattered",
  "Moderate",
  "Balanced",
  "Elevated",
  "High",
]

// Color by mode category
const MODE_COLORS: Record<string, string> = {
  "Hopeful": "hsl(142, 76%, 36%)",      // Green - positive
  "Calm": "hsl(142, 60%, 45%)",
  "Grounded": "hsl(160, 60%, 40%)",
  "Curious": "hsl(221, 83%, 53%)",       // Blue - neutral/exploratory
  "Reflective": "hsl(240, 60%, 55%)",
  "Conflicted": "hsl(25, 95%, 53%)",     // Orange - challenging
  "Agitated": "hsl(0, 72%, 51%)",        // Red - stress
  "Overthinking": "hsl(280, 60%, 50%)",  // Purple
  "Self-critical": "hsl(350, 70%, 45%)",
}

export function EnergyModeBubble() {
  const navigate = useNavigate()
  const { data: entries, isLoading, error } = useEntries()
  const isMobile = useIsMobile()

  // Handle bubble click - navigate to logs with filters
  const handleBubbleClick = (data: { mode: string; energy: string; z: number }) => {
    const params = new URLSearchParams()
    params.set("mode", data.mode)
    params.set("energy", data.energy)
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

  // Aggregate: count entries per mode+energy combination
  const countMap: Record<string, { mode: string; energy: string; count: number }> = {}

  entries.forEach((entry) => {
    const mode = entry.inferredMode
    const energy = entry.inferredEnergy
    if (mode && energy && MODES.includes(mode) && ENERGY_LEVELS.includes(energy)) {
      const key = `${mode}-${energy}`
      if (!countMap[key]) {
        countMap[key] = { mode, energy, count: 0 }
      }
      countMap[key].count++
    }
  })

  // Convert to scatter data with x/y coordinates
  const scatterData = Object.values(countMap).map((item) => ({
    x: MODES.indexOf(item.mode) + 1,
    y: ENERGY_LEVELS.indexOf(item.energy) + 1,
    z: item.count,
    mode: item.mode,
    energy: item.energy,
    color: MODE_COLORS[item.mode] || "hsl(var(--primary))",
  }))

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="x"
            name="Mode"
            domain={[0.5, MODES.length + 0.5]}
            ticks={MODES.map((_, i) => i + 1)}
            tickFormatter={(v) => MODES[v - 1] || ""}
            stroke="hsl(var(--muted-foreground))"
            fontSize={isMobile ? 8 : 10}
            angle={-45}
            textAnchor="end"
            height={isMobile ? 50 : 60}
            interval={isMobile ? 1 : 0}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Energy"
            domain={[0.5, ENERGY_LEVELS.length + 0.5]}
            ticks={ENERGY_LEVELS.map((_, i) => i + 1)}
            tickFormatter={(v) => ENERGY_LEVELS[v - 1] || ""}
            stroke="hsl(var(--muted-foreground))"
            fontSize={isMobile ? 8 : 10}
            width={isMobile ? 55 : 70}
            interval={isMobile ? 1 : 0}
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[100, 1000]}
            name="Count"
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-card border rounded-lg shadow-lg p-2 text-sm">
                    <p className="font-medium">{data.mode}</p>
                    <p className="text-muted-foreground">Energy: {data.energy}</p>
                    <p className="text-primary font-bold">{data.z} {data.z === 1 ? "entry" : "entries"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to view in logs</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Scatter
            name="Entries"
            data={scatterData}
            onClick={(data) => {
              if (data && data.payload) {
                handleBubbleClick(data.payload)
              }
            }}
            cursor="pointer"
          >
            {scatterData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                fillOpacity={0.7}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="flex flex-wrap gap-2 justify-center pt-2 text-[10px]">
        {MODES.slice(0, 5).map((mode) => (
          <div key={mode} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: MODE_COLORS[mode] }}
            />
            <span className="text-muted-foreground">{mode}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

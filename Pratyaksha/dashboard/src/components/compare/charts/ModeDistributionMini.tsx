import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Brain } from "lucide-react"

interface ModeData {
  mode: string
  count: number
  percentage: number
}

interface ModeDistributionMiniProps {
  data: ModeData[]
  isLoading?: boolean
}

// Color palette for modes
const MODE_COLORS: Record<string, string> = {
  Hopeful: "#22c55e",
  Calm: "#3b82f6",
  Joyful: "#eab308",
  Reflective: "#8b5cf6",
  Grateful: "#14b8a6",
  Determined: "#f97316",
  Curious: "#06b6d4",
  Anxious: "#ef4444",
  Stressed: "#dc2626",
  Frustrated: "#f59e0b",
  Sad: "#6366f1",
  Confused: "#a855f7",
  Angry: "#b91c1c",
  Overthinking: "#7c3aed",
  Neutral: "#6b7280",
}

const DEFAULT_COLOR = "#94a3b8"

export function ModeDistributionMini({ data, isLoading }: ModeDistributionMiniProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <Brain className="h-10 w-10 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No mode data</p>
      </div>
    )
  }

  // Take top 6 modes for cleaner display
  const topModes = data.slice(0, 6)

  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={topModes}
            dataKey="count"
            nameKey="mode"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
          >
            {topModes.map((entry) => (
              <Cell
                key={entry.mode}
                fill={MODE_COLORS[entry.mode] || DEFAULT_COLOR}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [`${value} entries`, name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {topModes.slice(0, 4).map((entry) => (
          <div key={entry.mode} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: MODE_COLORS[entry.mode] || DEFAULT_COLOR }}
            />
            <span className="text-xs text-muted-foreground">{entry.mode}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

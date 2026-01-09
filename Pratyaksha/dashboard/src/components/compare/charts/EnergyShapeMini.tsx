import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts"
import { Zap } from "lucide-react"

interface EnergyData {
  shape: string
  count: number
}

interface EnergyShapeMiniProps {
  data: EnergyData[]
  isLoading?: boolean
}

// Categorize shapes
const ENERGY_CATEGORIES: Record<string, { color: string; category: string }> = {
  Rising: { color: "#22c55e", category: "growth" },
  Expanding: { color: "#22c55e", category: "growth" },
  Pulsing: { color: "#22c55e", category: "growth" },
  Centered: { color: "#3b82f6", category: "stability" },
  Stabilized: { color: "#3b82f6", category: "stability" },
  Flat: { color: "#3b82f6", category: "stability" },
  Cyclical: { color: "#3b82f6", category: "stability" },
  Chaotic: { color: "#f59e0b", category: "challenge" },
  Heavy: { color: "#f59e0b", category: "challenge" },
  Collapsing: { color: "#f59e0b", category: "challenge" },
  Contracted: { color: "#f59e0b", category: "challenge" },
  Uneven: { color: "#f59e0b", category: "challenge" },
}

const DEFAULT_COLOR = "#94a3b8"

export function EnergyShapeMini({ data, isLoading }: EnergyShapeMiniProps) {
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
        <Zap className="h-10 w-10 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No energy data</p>
      </div>
    )
  }

  // Take top 8 energy shapes
  const topShapes = data.filter(d => d.count > 0).slice(0, 8)

  // Calculate category totals
  const categoryTotals = data.reduce(
    (acc, item) => {
      const cat = ENERGY_CATEGORIES[item.shape]?.category || "other"
      acc[cat] = (acc[cat] || 0) + item.count
      return acc
    },
    {} as Record<string, number>
  )

  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0)

  return (
    <div className="h-full flex flex-col">
      {/* Category Summary */}
      <div className="flex justify-center gap-4 mb-3">
        <div className="text-center">
          <p className="text-lg font-semibold text-green-500">
            {total > 0 ? Math.round(((categoryTotals.growth || 0) / total) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground">Growth</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-blue-500">
            {total > 0 ? Math.round(((categoryTotals.stability || 0) / total) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground">Stability</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-amber-500">
            {total > 0 ? Math.round(((categoryTotals.challenge || 0) / total) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground">Challenge</p>
        </div>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={topShapes} layout="vertical">
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="shape"
            width={70}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value} entries`]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {topShapes.map((entry) => (
              <Cell
                key={entry.shape}
                fill={ENERGY_CATEGORIES[entry.shape]?.color || DEFAULT_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

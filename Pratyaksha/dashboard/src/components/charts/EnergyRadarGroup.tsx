import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { useEnergyShapeData } from "../../hooks/useEntries"
import { cn } from "../../lib/utils"

// Categorize energy shapes into meaningful groups
const ENERGY_CATEGORIES = {
  growth: {
    name: "Growth & Momentum",
    description: "Positive energy patterns indicating progress",
    shapes: ["Rising", "Expanding", "Pulsing"],
    color: "hsl(142, 76%, 36%)", // Green
    fillColor: "hsl(142, 76%, 36%)",
    benchmark: 3, // Optimal count per shape
  },
  stability: {
    name: "Stability & Balance",
    description: "Grounded and consistent energy states",
    shapes: ["Centered", "Stabilized", "Flat", "Cyclical"],
    color: "hsl(221, 83%, 53%)", // Blue
    fillColor: "hsl(221, 83%, 53%)",
    benchmark: 4,
  },
  challenge: {
    name: "Stress & Challenge",
    description: "Patterns that may need attention",
    shapes: ["Chaotic", "Heavy", "Collapsing", "Contracted", "Uneven"],
    color: "hsl(25, 95%, 53%)", // Amber/Orange
    fillColor: "hsl(25, 95%, 53%)",
    benchmark: 2, // Lower is better for challenging patterns
  },
}

type CategoryKey = keyof typeof ENERGY_CATEGORIES

interface CategoryRadarProps {
  categoryKey: CategoryKey
  data: { shape: string; count: number; benchmark: number }[]
  maxValue: number
}

function CategoryRadar({ categoryKey, data, maxValue }: CategoryRadarProps) {
  const category = ENERGY_CATEGORIES[categoryKey]

  // Calculate health score (0-100)
  const totalCount = data.reduce((sum, d) => sum + d.count, 0)
  const avgCount = totalCount / data.length

  let healthScore: number
  let healthLabel: string
  let healthColor: string

  if (categoryKey === "challenge") {
    // For challenge patterns, lower is better
    healthScore = Math.max(0, 100 - (avgCount / category.benchmark) * 50)
    healthLabel = avgCount <= category.benchmark ? "Healthy" : avgCount <= category.benchmark * 2 ? "Monitor" : "High"
    healthColor = avgCount <= category.benchmark ? "text-green-600" : avgCount <= category.benchmark * 2 ? "text-amber-600" : "text-red-600"
  } else {
    // For growth and stability, higher is better (up to benchmark)
    healthScore = Math.min(100, (avgCount / category.benchmark) * 100)
    healthLabel = avgCount >= category.benchmark ? "Strong" : avgCount >= category.benchmark * 0.5 ? "Developing" : "Low"
    healthColor = avgCount >= category.benchmark ? "text-green-600" : avgCount >= category.benchmark * 0.5 ? "text-amber-600" : "text-red-600"
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold">{category.name}</h4>
          <p className="text-xs text-muted-foreground">{category.description}</p>
        </div>
        <div className="text-right">
          <span className={cn("text-sm font-bold", healthColor)}>{healthLabel}</span>
          <p className="text-xs text-muted-foreground">{Math.round(healthScore)}%</p>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="shape"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 10, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxValue]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              tickCount={4}
            />
            {/* Benchmark reference area */}
            <Radar
              name="Optimal Range"
              dataKey="benchmark"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted))"
              fillOpacity={0.2}
              strokeDasharray="4 4"
            />
            {/* Actual data */}
            <Radar
              name="Your Pattern"
              dataKey="count"
              stroke={category.color}
              fill={category.fillColor}
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                value,
                name === "benchmark" ? "Optimal" : "Count"
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "10px" }}
              iconSize={8}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function EnergyRadarGroup() {
  const { data: rawData, isLoading, error } = useEnergyShapeData()

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

  const hasData = rawData.some((d) => d.count > 0)
  if (!hasData) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  // Create data for each category
  const dataByShape = new Map(rawData.map(d => [d.shape, d.count]))

  // Find max value across all data for consistent scaling
  const maxValue = Math.max(...rawData.map(d => d.count), 8)

  const categoryData: Record<CategoryKey, { shape: string; count: number; benchmark: number }[]> = {
    growth: ENERGY_CATEGORIES.growth.shapes.map(shape => ({
      shape,
      count: dataByShape.get(shape) || 0,
      benchmark: ENERGY_CATEGORIES.growth.benchmark,
    })),
    stability: ENERGY_CATEGORIES.stability.shapes.map(shape => ({
      shape,
      count: dataByShape.get(shape) || 0,
      benchmark: ENERGY_CATEGORIES.stability.benchmark,
    })),
    challenge: ENERGY_CATEGORIES.challenge.shapes.map(shape => ({
      shape,
      count: dataByShape.get(shape) || 0,
      benchmark: ENERGY_CATEGORIES.challenge.benchmark,
    })),
  }

  // Calculate overall energy health
  const growthScore = categoryData.growth.reduce((s, d) => s + d.count, 0)
  const stabilityScore = categoryData.stability.reduce((s, d) => s + d.count, 0)
  const challengeScore = categoryData.challenge.reduce((s, d) => s + d.count, 0)

  const totalEntries = growthScore + stabilityScore + challengeScore
  const positiveRatio = totalEntries > 0 ? ((growthScore + stabilityScore) / totalEntries * 100) : 0

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-amber-500"
                style={{ width: `${positiveRatio}%` }}
              />
            </div>
            <span className="text-xs font-medium">{Math.round(positiveRatio)}% positive</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Growth: {growthScore}</span>
            <span>Stability: {stabilityScore}</span>
            <span>Challenge: {challengeScore}</span>
          </div>
        </div>
      </div>

      {/* Three radar charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="p-3 rounded-lg border border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
          <CategoryRadar
            categoryKey="growth"
            data={categoryData.growth}
            maxValue={maxValue}
          />
        </div>
        <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
          <CategoryRadar
            categoryKey="stability"
            data={categoryData.stability}
            maxValue={maxValue}
          />
        </div>
        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
          <CategoryRadar
            categoryKey="challenge"
            data={categoryData.challenge}
            maxValue={maxValue}
          />
        </div>
      </div>
    </div>
  )
}

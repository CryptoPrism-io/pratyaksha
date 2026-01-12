import { useState, useMemo } from "react"
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
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"
import { useEnergyShapePercentages, useStats } from "../../hooks/useEntries"
import { useDateFilter } from "../../contexts/DateFilterContext"
import { useIsMobile } from "../../hooks/useMediaQuery"
import { cn } from "../../lib/utils"
import { ChartExplainer } from "./ChartExplainer"
import type { BenchmarkStatus } from "../../lib/transforms"

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

// Benchmark status indicator component
function StatusIndicator({ status, isChallenge }: { status: BenchmarkStatus; isChallenge: boolean }) {
  if (status === "concern") {
    return <AlertTriangle className="h-3 w-3 text-red-500" />
  }
  if (status === "above") {
    return isChallenge
      ? <TrendingDown className="h-3 w-3 text-green-500" /> // Low challenge is good
      : <TrendingUp className="h-3 w-3 text-green-500" />
  }
  if (status === "below") {
    return isChallenge
      ? <TrendingUp className="h-3 w-3 text-amber-500" /> // Rising challenge needs attention
      : <TrendingDown className="h-3 w-3 text-amber-500" />
  }
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

interface CategoryRadarProps {
  categoryKey: CategoryKey
  data: { shape: string; count: number; percentage: number; benchmark: number; status: BenchmarkStatus }[]
  maxValue: number
  totalEntries: number
}

function CategoryRadar({ categoryKey, data, maxValue, totalEntries }: CategoryRadarProps) {
  const category = ENERGY_CATEGORIES[categoryKey]

  // Calculate health score based on percentage vs benchmarks
  const totalPercentage = data.reduce((sum, d) => sum + d.percentage, 0)
  const avgPercentage = totalPercentage / data.length

  let healthScore: number
  let healthLabel: string
  let healthColor: string

  if (categoryKey === "challenge") {
    // For challenge patterns, lower percentage is better
    const avgBenchmark = data.reduce((sum, d) => sum + d.benchmark, 0) / data.length
    healthScore = Math.max(0, 100 - (avgPercentage / avgBenchmark) * 50)
    healthLabel = avgPercentage <= avgBenchmark ? "Healthy" : avgPercentage <= avgBenchmark * 2 ? "Monitor" : "High"
    healthColor = avgPercentage <= avgBenchmark ? "text-green-600" : avgPercentage <= avgBenchmark * 2 ? "text-amber-600" : "text-red-600"
  } else {
    // For growth and stability, higher percentage is better
    const avgBenchmark = data.reduce((sum, d) => sum + d.benchmark, 0) / data.length
    healthScore = Math.min(100, (avgPercentage / avgBenchmark) * 100)
    healthLabel = avgPercentage >= avgBenchmark ? "Strong" : avgPercentage >= avgBenchmark * 0.5 ? "Developing" : "Low"
    healthColor = avgPercentage >= avgBenchmark ? "text-green-600" : avgPercentage >= avgBenchmark * 0.5 ? "text-amber-600" : "text-red-600"
  }

  // Radar chart data uses percentage for visual
  const radarData = data.map(d => ({
    shape: d.shape,
    percentage: d.percentage,
    benchmark: d.benchmark,
  }))

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

      {/* Shape breakdown with count and percentage */}
      <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
        {data.map(d => (
          <div key={d.shape} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/30">
            <StatusIndicator status={d.status} isChallenge={categoryKey === "challenge"} />
            <span className="truncate flex-1">{d.shape}</span>
            <span className="font-medium">{d.count}</span>
            <span className="text-muted-foreground">({d.percentage}%)</span>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="shape"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 9, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxValue]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }}
              tickCount={4}
              tickFormatter={(value) => `${value}%`}
            />
            {/* Benchmark reference area */}
            <Radar
              name="Optimal %"
              dataKey="benchmark"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted))"
              fillOpacity={0.2}
              strokeDasharray="4 4"
            />
            {/* Actual percentage data */}
            <Radar
              name="Your %"
              dataKey="percentage"
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
                `${value}%`,
                name === "benchmark" ? "Optimal" : "Actual"
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
  const { data: rawData, totalEntries, isLoading, error } = useEnergyShapePercentages()
  const { data: stats } = useStats()
  const { getDateRangeLabel } = useDateFilter()
  const isMobile = useIsMobile()
  const [currentIndex, setCurrentIndex] = useState(0)

  const categoryKeys: CategoryKey[] = ["growth", "stability", "challenge"]

  // Prepare AI explainer data with percentages
  const explainerData = useMemo(() => {
    if (!rawData || rawData.length === 0) return null
    return {
      shapes: rawData.map(d => ({ shape: d.shape, count: d.count, percentage: d.percentage, status: d.status })),
      categories: {
        growth: rawData.filter(d => d.category === "growth"),
        stability: rawData.filter(d => d.category === "stability"),
        challenge: rawData.filter(d => d.category === "challenge")
      },
      totalEntries
    }
  }, [rawData, totalEntries])

  const explainerSummary = useMemo(() => {
    if (!stats) return undefined
    const topShapes = [...rawData].sort((a, b) => b.percentage - a.percentage).slice(0, 3).map(d => `${d.shape} (${d.percentage}%)`)
    return {
      totalEntries: stats.totalEntries,
      dateRange: getDateRangeLabel(),
      topItems: topShapes
    }
  }, [stats, rawData, getDateRangeLabel])

  const goNext = () => setCurrentIndex((i) => (i + 1) % 3)
  const goPrev = () => setCurrentIndex((i) => (i - 1 + 3) % 3)

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

  // Create data for each category with percentages
  const dataByShape = new Map(rawData.map(d => [d.shape, d]))

  // Find max percentage for consistent scaling (at least 25% for readability)
  const maxValue = Math.max(...rawData.map(d => d.percentage), 25)

  const categoryData: Record<CategoryKey, { shape: string; count: number; percentage: number; benchmark: number; status: BenchmarkStatus }[]> = {
    growth: ENERGY_CATEGORIES.growth.shapes.map(shape => {
      const shapeData = dataByShape.get(shape)
      return {
        shape,
        count: shapeData?.count || 0,
        percentage: shapeData?.percentage || 0,
        benchmark: shapeData?.benchmark || 15,
        status: shapeData?.status || "below",
      }
    }),
    stability: ENERGY_CATEGORIES.stability.shapes.map(shape => {
      const shapeData = dataByShape.get(shape)
      return {
        shape,
        count: shapeData?.count || 0,
        percentage: shapeData?.percentage || 0,
        benchmark: shapeData?.benchmark || 15,
        status: shapeData?.status || "below",
      }
    }),
    challenge: ENERGY_CATEGORIES.challenge.shapes.map(shape => {
      const shapeData = dataByShape.get(shape)
      return {
        shape,
        count: shapeData?.count || 0,
        percentage: shapeData?.percentage || 0,
        benchmark: shapeData?.benchmark || 5,
        status: shapeData?.status || "at",
      }
    }),
  }

  // Calculate overall energy health using percentages
  const growthPercentage = categoryData.growth.reduce((s, d) => s + d.percentage, 0)
  const stabilityPercentage = categoryData.stability.reduce((s, d) => s + d.percentage, 0)
  const challengePercentage = categoryData.challenge.reduce((s, d) => s + d.percentage, 0)

  const positiveRatio = growthPercentage + stabilityPercentage

  // Category styling for borders/backgrounds
  const categoryStyles: Record<CategoryKey, string> = {
    growth: "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20",
    stability: "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20",
    challenge: "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20",
  }

  // Mobile: Carousel view
  if (isMobile) {
    const currentCategory = categoryKeys[currentIndex]
    return (
      <div className="flex flex-col h-full gap-2">
        {/* Compact summary bar */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-amber-500"
                  style={{ width: `${Math.min(positiveRatio, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-medium">{Math.round(positiveRatio)}%</span>
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>G:{Math.round(growthPercentage)}%</span>
              <span>S:{Math.round(stabilityPercentage)}%</span>
              <span>C:{Math.round(challengePercentage)}%</span>
            </div>
          </div>
        </div>

        {/* Carousel container */}
        <div className="flex-1 relative">
          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-background/80 border shadow-sm hover:bg-muted min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="Previous category"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-background/80 border shadow-sm hover:bg-muted min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="Next category"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Current radar chart */}
          <div className={cn("h-full p-2 rounded-lg border mx-8", categoryStyles[currentCategory])}>
            <CategoryRadar
              categoryKey={currentCategory}
              data={categoryData[currentCategory]}
              maxValue={maxValue}
              totalEntries={totalEntries}
            />
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex gap-1.5 justify-center">
          {categoryKeys.map((key, i) => (
            <button
              key={key}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
              )}
              aria-label={`Go to ${ENERGY_CATEGORIES[key].name}`}
            />
          ))}
        </div>
      </div>
    )
  }

  // Desktop: Grid view (original)
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-amber-500"
                style={{ width: `${Math.min(positiveRatio, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium">{Math.round(positiveRatio)}% positive</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Growth: {Math.round(growthPercentage)}%</span>
            <span>Stability: {Math.round(stabilityPercentage)}%</span>
            <span>Challenge: {Math.round(challengePercentage)}%</span>
          </div>
        </div>
        {/* AI Explainer Button */}
        {explainerData && (
          <ChartExplainer
            chartType="energyRadar"
            chartData={explainerData}
            summary={explainerSummary}
          />
        )}
      </div>

      {/* Three radar charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="p-3 rounded-lg border border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
          <CategoryRadar
            categoryKey="growth"
            data={categoryData.growth}
            maxValue={maxValue}
            totalEntries={totalEntries}
          />
        </div>
        <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
          <CategoryRadar
            categoryKey="stability"
            data={categoryData.stability}
            maxValue={maxValue}
            totalEntries={totalEntries}
          />
        </div>
        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
          <CategoryRadar
            categoryKey="challenge"
            data={categoryData.challenge}
            maxValue={maxValue}
            totalEntries={totalEntries}
          />
        </div>
      </div>
    </div>
  )
}

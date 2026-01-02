import { useState, useCallback } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts"
import { useModeDistribution } from "../../hooks/useEntries"
import { Skeleton } from "../ui/skeleton"
import { AlertCircle, RefreshCw } from "lucide-react"

const COLORS = [
  "hsl(160, 84%, 52%)",  // positive green
  "hsl(220, 70%, 55%)",  // blue
  "hsl(30, 80%, 55%)",   // orange
  "hsl(280, 65%, 55%)",  // purple
  "hsl(0, 70%, 55%)",    // red
  "hsl(180, 60%, 45%)",  // teal
  "hsl(45, 90%, 50%)",   // yellow
  "hsl(330, 70%, 55%)",  // pink
  "hsl(200, 60%, 50%)",  // sky blue
]

// Custom active shape for hover effect
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" className="fill-foreground text-lg font-semibold">
        {payload?.mode || ""}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" className="fill-muted-foreground text-sm">
        {payload?.count || 0} entries ({payload?.percentage || 0}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  )
}

// Custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { mode: string; count: number; percentage: number } }> }) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg">
      <p className="font-semibold text-foreground">{data.mode}</p>
      <div className="mt-1 space-y-1 text-sm">
        <p className="text-muted-foreground">Entries: <span className="font-medium text-foreground">{data.count}</span></p>
        <p className="text-muted-foreground">Share: <span className="font-medium text-foreground">{data.percentage}%</span></p>
      </div>
    </div>
  )
}

function PieSkeleton() {
  return (
    <div className="flex h-[250px] flex-col items-center justify-center gap-4">
      <Skeleton className="h-32 w-32 rounded-full" />
      <div className="flex flex-wrap justify-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
    </div>
  )
}

export function ModeDistribution() {
  const { data, isLoading, error, refetch } = useModeDistribution()
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index)
  }, [])

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined)
  }, [])

  if (isLoading) {
    return <PieSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Failed to load modes</p>
        <button
          onClick={() => refetch?.()}
          className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm">No mode data yet</p>
        <p className="text-xs">Modes will appear as you add entries</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="count"
          nameKey="mode"
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.6}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
          iconType="circle"
          iconSize={10}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

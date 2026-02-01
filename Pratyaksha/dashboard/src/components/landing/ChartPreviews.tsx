import { cn } from "@/lib/utils"

// Emotional Timeline Preview - animated line chart
export function TimelinePreview({ className }: { className?: string }) {
  const points = [25, 45, 35, 60, 40, 70, 50, 65, 55, 75]
  const pathD = `M 0 ${100 - points[0]} ${points
    .map((p, i) => `L ${i * 40} ${100 - p}`)
    .join(" ")}`

  return (
    <svg
      viewBox="0 0 360 100"
      className={cn("w-full h-full chart-preview", className)}
    >
      <defs>
        <linearGradient id="timelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="timelineFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <path
        d={`${pathD} L 360 100 L 0 100 Z`}
        fill="url(#timelineFill)"
        className="opacity-50 group-hover:opacity-100 transition-opacity duration-500"
      />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#timelineGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        className="chart-preview-line"
      />
      {/* Points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={i * 40}
          cy={100 - p}
          r="4"
          fill="#0d9488"
          className="chart-preview-point"
        />
      ))}
    </svg>
  )
}

// Energy Radar Preview - animated radar/spider chart
export function RadarPreview({ className }: { className?: string }) {
  const dimensions = 5
  const values = [0.8, 0.6, 0.9, 0.5, 0.7]
  const centerX = 50
  const centerY = 50
  const radius = 35

  const getPoint = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / dimensions - Math.PI / 2
    return {
      x: centerX + Math.cos(angle) * radius * value,
      y: centerY + Math.sin(angle) * radius * value,
    }
  }

  const points = values.map((v, i) => getPoint(i, v))
  const pathD = `M ${points[0].x} ${points[0].y} ${points
    .slice(1)
    .map((p) => `L ${p.x} ${p.y}`)
    .join(" ")} Z`

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-full h-full chart-preview", className)}
    >
      <defs>
        <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#be123c" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* Grid rings */}
      {[0.33, 0.66, 1].map((scale, i) => (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={radius * scale}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
      ))}
      {/* Radar shape */}
      <path
        d={pathD}
        fill="url(#radarGrad)"
        stroke="#0d9488"
        strokeWidth="2"
        className="opacity-60 group-hover:opacity-100 transition-opacity duration-500 origin-center group-hover:scale-100 scale-75"
        style={{ transformOrigin: "center", transition: "all 0.5s ease" }}
      />
      {/* Points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#0d9488"
          className="chart-preview-point"
        />
      ))}
    </svg>
  )
}

// Heatmap Preview - calendar-style grid
export function HeatmapPreview({ className }: { className?: string }) {
  const weeks = 7
  const days = 5
  const cells = Array.from({ length: weeks * days }, () => Math.random())

  return (
    <svg
      viewBox="0 0 100 80"
      className={cn("w-full h-full chart-preview", className)}
    >
      {cells.map((intensity, i) => (
        <rect
          key={i}
          x={(i % weeks) * 13 + 5}
          y={Math.floor(i / weeks) * 14 + 5}
          width="11"
          height="11"
          rx="2"
          fill="#0d9488"
          fillOpacity={0.2 + intensity * 0.8}
          className="chart-preview-bar"
          style={{ transitionDelay: `${i * 20}ms` }}
        />
      ))}
    </svg>
  )
}

// Mode Pie Preview - donut chart
export function ModePiePreview({ className }: { className?: string }) {
  const segments = [
    { percent: 35, color: "#0d9488" },
    { percent: 25, color: "#be123c" },
    { percent: 20, color: "#f59e0b" },
    { percent: 20, color: "#8b5cf6" },
  ]

  let cumulativePercent = 0

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-full h-full chart-preview", className)}
    >
      <g
        className="origin-center group-hover:animate-spin"
        style={{
          transformOrigin: "50px 50px",
          animationDuration: "20s",
          animationTimingFunction: "linear",
        }}
      >
        {segments.map((segment, i) => {
          const startPercent = cumulativePercent
          cumulativePercent += segment.percent
          const startAngle = (startPercent / 100) * 360 - 90
          const endAngle = (cumulativePercent / 100) * 360 - 90
          const largeArcFlag = segment.percent > 50 ? 1 : 0
          const startX = 50 + 35 * Math.cos((startAngle * Math.PI) / 180)
          const startY = 50 + 35 * Math.sin((startAngle * Math.PI) / 180)
          const endX = 50 + 35 * Math.cos((endAngle * Math.PI) / 180)
          const endY = 50 + 35 * Math.sin((endAngle * Math.PI) / 180)

          return (
            <path
              key={i}
              d={`M 50 50 L ${startX} ${startY} A 35 35 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
              fill={segment.color}
              className="opacity-60 group-hover:opacity-90 transition-opacity duration-300"
              style={{ transitionDelay: `${i * 100}ms` }}
            />
          )
        })}
      </g>
      <circle cx="50" cy="50" r="18" fill="currentColor" fillOpacity="0.05" />
    </svg>
  )
}

// Contradiction Bar Preview - opposing bars
export function ContradictionPreview({ className }: { className?: string }) {
  const bars = [
    { label: "Action", value: 70, color: "#0d9488" },
    { label: "Fear", value: 55, color: "#be123c" },
    { label: "Growth", value: 85, color: "#14b8a6" },
    { label: "Comfort", value: 40, color: "#f43f5e" },
  ]

  return (
    <svg
      viewBox="0 0 200 80"
      className={cn("w-full h-full chart-preview", className)}
    >
      {bars.map((bar, i) => (
        <rect
          key={bar.label}
          x={i * 50 + 10}
          y={80 - bar.value * 0.7}
          width="30"
          height={bar.value * 0.7}
          rx="4"
          fill={bar.color}
          className="chart-preview-bar"
          style={{
            transformOrigin: `${i * 50 + 25}px 80px`,
            transitionDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </svg>
  )
}

// Theme Cloud Preview - word cloud
export function ThemeCloudPreview({ className }: { className?: string }) {
  const words = [
    { text: "work", x: 30, y: 25, size: 14 },
    { text: "growth", x: 70, y: 20, size: 18 },
    { text: "family", x: 50, y: 45, size: 16 },
    { text: "health", x: 25, y: 55, size: 12 },
    { text: "goals", x: 75, y: 60, size: 14 },
    { text: "peace", x: 50, y: 75, size: 13 },
  ]

  return (
    <svg
      viewBox="0 0 100 90"
      className={cn("w-full h-full chart-preview", className)}
    >
      {words.map((word, i) => (
        <text
          key={word.text}
          x={word.x}
          y={word.y}
          fontSize={word.size}
          fill="#0d9488"
          fillOpacity={0.6}
          textAnchor="middle"
          className="font-medium opacity-40 group-hover:opacity-100 transition-all duration-300"
          style={{
            transform: "translateY(0)",
            transitionDelay: `${i * 50}ms`,
          }}
        >
          {word.text}
        </text>
      ))}
    </svg>
  )
}

// Sankey Flow Preview - flowing paths
export function SankeyPreview({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 80"
      className={cn("w-full h-full chart-preview", className)}
    >
      <defs>
        <linearGradient id="sankeyGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#be123c" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="sankeyGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M 10 25 Q 100 15 190 40"
        fill="none"
        stroke="url(#sankeyGrad1)"
        strokeWidth="16"
        strokeLinecap="round"
        className="chart-preview-line"
      />
      <path
        d="M 10 55 Q 100 65 190 40"
        fill="none"
        stroke="url(#sankeyGrad2)"
        strokeWidth="12"
        strokeLinecap="round"
        className="chart-preview-line"
        style={{ animationDelay: "0.2s" }}
      />
    </svg>
  )
}

// Combined chart type for feature cards
export type ChartType =
  | "timeline"
  | "radar"
  | "heatmap"
  | "pie"
  | "contradiction"
  | "theme"
  | "sankey"

const chartComponents: Record<ChartType, React.FC<{ className?: string }>> = {
  timeline: TimelinePreview,
  radar: RadarPreview,
  heatmap: HeatmapPreview,
  pie: ModePiePreview,
  contradiction: ContradictionPreview,
  theme: ThemeCloudPreview,
  sankey: SankeyPreview,
}

export function ChartPreview({
  type,
  className,
}: {
  type: ChartType
  className?: string
}) {
  const ChartComponent = chartComponents[type]
  return <ChartComponent className={className} />
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'

// Demo data - realistic cognitive modes
const DEMO_DATA = [
  { mode: 'Reflective', count: 28, percentage: 32 },
  { mode: 'Hopeful', count: 21, percentage: 24 },
  { mode: 'Anxious', count: 14, percentage: 16 },
  { mode: 'Focused', count: 12, percentage: 14 },
  { mode: 'Creative', count: 8, percentage: 9 },
  { mode: 'Calm', count: 4, percentage: 5 },
]

const COLORS = [
  '#22c55e', // green - Reflective
  '#3b82f6', // blue - Hopeful
  '#f59e0b', // amber - Anxious
  '#8b5cf6', // purple - Focused
  '#ec4899', // pink - Creative
  '#06b6d4', // cyan - Calm
]

// Custom active shape for hover
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props

  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-white text-sm font-semibold">
        {payload?.mode || ''}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-white/60 text-xs">
        {payload?.percentage || 0}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}
      />
    </g>
  )
}

interface DemoModeChartProps {
  animate?: boolean
}

export function DemoModeChart({ animate = true }: DemoModeChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(0)

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.9 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={DEMO_DATA}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={3}
            dataKey="count"
            nameKey="mode"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(0)}
            animationDuration={animate ? 1200 : 0}
            animationEasing="ease-out"
          >
            {DEMO_DATA.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.5}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

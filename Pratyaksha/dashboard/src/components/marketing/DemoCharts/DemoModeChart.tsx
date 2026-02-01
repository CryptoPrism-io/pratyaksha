import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

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

interface DemoModeChartProps {
  animate?: boolean
}

export function DemoModeChart({ animate = true }: DemoModeChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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
            animationDuration={animate ? 1200 : 0}
            animationEasing="ease-out"
          >
            {DEMO_DATA.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-sm font-semibold text-foreground">{DEMO_DATA[0].mode}</div>
          <div className="text-xs text-muted-foreground">{DEMO_DATA[0].percentage}%</div>
        </div>
      </div>
    </motion.div>
  )
}

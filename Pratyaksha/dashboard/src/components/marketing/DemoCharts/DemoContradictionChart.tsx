import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'

// Demo data - contradiction pairs as diverging bar chart
const DEMO_DATA = [
  { name: 'Action', positive: 72, negative: -45, label: 'vs Fear' },
  { name: 'Growth', positive: 85, negative: -30, label: 'vs Comfort' },
  { name: 'Connect', positive: 60, negative: -55, label: 'vs Isolate' },
  { name: 'Present', positive: 40, negative: -68, label: 'vs Past' },
]

interface DemoContradictionChartProps {
  animate?: boolean
}

export function DemoContradictionChart({ animate = true }: DemoContradictionChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const axisColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const textColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
  const lineColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'

  return (
    <motion.div
      initial={animate ? { opacity: 0, x: -20 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={DEMO_DATA}
          layout="vertical"
          margin={{ top: 5, right: 10, left: 35, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[-100, 100]}
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <ReferenceLine x={0} stroke={lineColor} />

          {/* Positive side - teal */}
          <Bar
            dataKey="positive"
            animationDuration={animate ? 1200 : 0}
            radius={[0, 4, 4, 0]}
          >
            {DEMO_DATA.map((_, index) => (
              <Cell key={`pos-${index}`} fill="#14b8a6" fillOpacity={0.8} />
            ))}
          </Bar>

          {/* Negative side - rose */}
          <Bar
            dataKey="negative"
            animationDuration={animate ? 1200 : 0}
            radius={[4, 0, 0, 4]}
          >
            {DEMO_DATA.map((_, index) => (
              <Cell key={`neg-${index}`} fill="#f43f5e" fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#14b8a6]" />
          Approach
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
          Avoid
        </span>
      </div>
    </motion.div>
  )
}

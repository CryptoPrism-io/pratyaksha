import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'

// Demo data - mood trends over 4 weeks
const DEMO_DATA = [
  { week: 'W1', positive: 35, neutral: 40, negative: 25 },
  { week: 'W2', positive: 42, neutral: 35, negative: 23 },
  { week: 'W3', positive: 38, neutral: 38, negative: 24 },
  { week: 'W4', positive: 55, neutral: 30, negative: 15 },
  { week: 'W5', positive: 48, neutral: 35, negative: 17 },
  { week: 'W6', positive: 62, neutral: 28, negative: 10 },
]

interface DemoTrendChartProps {
  animate?: boolean
}

export function DemoTrendChart({ animate = true }: DemoTrendChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={DEMO_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="positiveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="neutralGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="negativeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="week"
            stroke={axisColor}
            fontSize={9}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={axisColor}
            fontSize={8}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />

          <Area
            type="monotone"
            dataKey="negative"
            stackId="1"
            stroke="#f59e0b"
            fill="url(#negativeGrad)"
            strokeWidth={1.5}
            animationDuration={animate ? 1500 : 0}
          />
          <Area
            type="monotone"
            dataKey="neutral"
            stackId="1"
            stroke="#6b7280"
            fill="url(#neutralGrad)"
            strokeWidth={1.5}
            animationDuration={animate ? 1500 : 0}
          />
          <Area
            type="monotone"
            dataKey="positive"
            stackId="1"
            stroke="#22c55e"
            fill="url(#positiveGrad)"
            strokeWidth={1.5}
            animationDuration={animate ? 1500 : 0}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-3 mt-1 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          Positive
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#6b7280]" />
          Neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          Challenging
        </span>
      </div>
    </motion.div>
  )
}

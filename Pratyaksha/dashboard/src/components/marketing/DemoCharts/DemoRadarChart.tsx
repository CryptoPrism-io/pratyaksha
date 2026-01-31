import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

// Demo data - energy dimensions
const DEMO_DATA = [
  { dimension: 'Focus', value: 85 },
  { dimension: 'Energy', value: 72 },
  { dimension: 'Calm', value: 58 },
  { dimension: 'Clarity', value: 90 },
  { dimension: 'Drive', value: 65 },
  { dimension: 'Peace', value: 48 },
]

interface DemoRadarChartProps {
  animate?: boolean
}

export function DemoRadarChart({ animate = true }: DemoRadarChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
  const textColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={DEMO_DATA} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: textColor, fontSize: 9 }}
          />
          <Radar
            name="Energy"
            dataKey="value"
            stroke="#14b8a6"
            fill="#14b8a6"
            fillOpacity={0.4}
            strokeWidth={2}
            animationDuration={animate ? 1500 : 0}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

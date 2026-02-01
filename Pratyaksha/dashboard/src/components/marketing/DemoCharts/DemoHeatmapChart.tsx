import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

// Demo data - 7 weeks x 7 days activity heatmap
const generateHeatmapData = () => {
  const weeks = 6
  const days = 7
  const data: { week: number; day: number; value: number }[] = []

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      // Create realistic pattern - more entries mid-week
      const baseValue = d >= 1 && d <= 5 ? 0.5 : 0.2
      const value = Math.min(1, Math.max(0, baseValue + Math.random() * 0.6 - 0.1))
      data.push({ week: w, day: d, value })
    }
  }
  return data
}

const DEMO_DATA = generateHeatmapData()
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface DemoHeatmapChartProps {
  animate?: boolean
}

export function DemoHeatmapChart({ animate = true }: DemoHeatmapChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const cellSize = 12

  return (
    <motion.div
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col items-center justify-center p-2"
    >
      {/* Day labels */}
      <div className="flex gap-[3px] mb-1 ml-4">
        {Array.from({ length: 6 }).map((_, w) => (
          <div key={w} style={{ width: cellSize }} className="text-[8px] text-muted-foreground text-center">
            W{w + 1}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex">
        {/* Row labels */}
        <div className="flex flex-col gap-[3px] mr-1">
          {DAYS.map((day, i) => (
            <div
              key={i}
              style={{ height: cellSize }}
              className="text-[8px] text-muted-foreground flex items-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="flex gap-[3px]">
          {Array.from({ length: 6 }).map((_, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, d) => {
                const cell = DEMO_DATA.find(c => c.week === w && c.day === d)
                const value = cell?.value || 0
                const delay = animate ? (w * 7 + d) * 0.02 : 0

                return (
                  <motion.div
                    key={d}
                    initial={animate ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay }}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: `rgba(20, 184, 166, ${0.15 + value * 0.85})`,
                    }}
                    className="rounded-sm"
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 text-[8px] text-muted-foreground">
        <span>Less</span>
        {[0.2, 0.4, 0.6, 0.8, 1].map((v, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: `rgba(20, 184, 166, ${0.15 + v * 0.85})` }}
          />
        ))}
        <span>More</span>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'

// Demo data - entries per day of week
const DEMO_DATA = [
  { day: 'Sun', count: 3, color: '#6b7280' },
  { day: 'Mon', count: 7, color: '#3b82f6' },
  { day: 'Tue', count: 5, color: '#3b82f6' },
  { day: 'Wed', count: 9, color: '#22c55e' },
  { day: 'Thu', count: 6, color: '#3b82f6' },
  { day: 'Fri', count: 4, color: '#6b7280' },
  { day: 'Sat', count: 2, color: '#6b7280' },
]

interface DemoActivityChartProps {
  animate?: boolean
}

export function DemoActivityChart({ animate = true }: DemoActivityChartProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DEMO_DATA} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="day"
            stroke="rgba(255,255,255,0.3)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            animationDuration={animate ? 1200 : 0}
            animationEasing="ease-out"
          >
            {DEMO_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Caption */}
      <div className="text-center mt-1">
        <span className="text-[10px] text-white/40">Weekly journaling rhythm</span>
      </div>
    </motion.div>
  )
}

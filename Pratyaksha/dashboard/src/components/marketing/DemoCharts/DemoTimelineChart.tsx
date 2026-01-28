import { motion } from 'framer-motion'
import {
  ComposedChart,
  Area,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// Demo timeline data - shows emotional journey over 2 weeks
const DEMO_DATA = [
  { day: 'Mon', sentiment: 0.6, category: 'positive' },
  { day: 'Tue', sentiment: 0.3, category: 'positive' },
  { day: 'Wed', sentiment: -0.2, category: 'negative' },
  { day: 'Thu', sentiment: -0.5, category: 'negative' },
  { day: 'Fri', sentiment: 0.1, category: 'neutral' },
  { day: 'Sat', sentiment: 0.7, category: 'positive' },
  { day: 'Sun', sentiment: 0.8, category: 'positive' },
  { day: 'Mon', sentiment: 0.4, category: 'positive' },
  { day: 'Tue', sentiment: -0.1, category: 'neutral' },
  { day: 'Wed', sentiment: 0.5, category: 'positive' },
  { day: 'Thu', sentiment: 0.9, category: 'positive' },
  { day: 'Fri', sentiment: 0.6, category: 'positive' },
].map((d, i) => ({ ...d, index: i }))

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280',
}

interface DemoTimelineChartProps {
  animate?: boolean
}

export function DemoTimelineChart({ animate = true }: DemoTimelineChartProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={DEMO_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="demoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="day"
            stroke="rgba(255,255,255,0.3)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            domain={[-1, 1]}
            stroke="rgba(255,255,255,0.3)"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            ticks={[1, 0, -1]}
            tickFormatter={(v) => v === 1 ? '+' : v === -1 ? '-' : '0'}
          />

          <Area
            type="monotone"
            dataKey="sentiment"
            stroke="#22c55e"
            strokeWidth={2}
            strokeOpacity={0.6}
            fill="url(#demoGradient)"
            animationDuration={animate ? 1500 : 0}
          />

          <Scatter dataKey="sentiment" animationDuration={animate ? 1500 : 0}>
            {DEMO_DATA.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={SENTIMENT_COLORS[entry.category as keyof typeof SENTIMENT_COLORS]}
                r={5}
              />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-1 text-[10px] text-white/50">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          Positive
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#6b7280]" />
          Neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          Negative
        </span>
      </div>
    </motion.div>
  )
}

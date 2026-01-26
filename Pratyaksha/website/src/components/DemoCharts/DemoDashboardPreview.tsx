import { motion } from 'framer-motion'

interface DemoDashboardPreviewProps {
  animate?: boolean
}

// Mini chart data
const LINE_DATA = [30, 45, 35, 60, 50, 75, 65, 80]
const BAR_DATA = [40, 70, 55, 85, 45, 65]
const HEATMAP_DATA = [
  [0.3, 0.7, 0.5, 0.9, 0.4],
  [0.6, 0.2, 0.8, 0.3, 0.7],
  [0.4, 0.9, 0.3, 0.6, 0.5],
]

export function DemoDashboardPreview({ animate = true }: DemoDashboardPreviewProps) {
  const baseDelay = animate ? 0.2 : 0

  // Generate line path
  const lineWidth = 100
  const lineHeight = 30
  const linePath = LINE_DATA.map((val, i) => {
    const x = (i / (LINE_DATA.length - 1)) * lineWidth
    const y = lineHeight - (val / 100) * lineHeight
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <div className="w-full h-full p-2 flex flex-col gap-1.5">
      {/* Top row: Line chart + Mini radar */}
      <div className="flex gap-1.5 flex-1">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: baseDelay }}
          className="flex-1 rounded-md p-1.5"
          style={{ backgroundColor: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}
        >
          <svg viewBox={`0 0 ${lineWidth} ${lineHeight + 5}`} className="w-full h-full">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
              <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <motion.path
              d={`${linePath} L ${lineWidth} ${lineHeight} L 0 ${lineHeight} Z`}
              fill="url(#areaGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: baseDelay + 0.3 }}
            />
            {/* Line */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.1 }}
            />
            {/* Dots */}
            {LINE_DATA.map((val, i) => {
              const x = (i / (LINE_DATA.length - 1)) * lineWidth
              const y = lineHeight - (val / 100) * lineHeight
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#60a5fa"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: baseDelay + 0.5 + i * 0.05 }}
                />
              )
            })}
          </svg>
        </motion.div>

        {/* Mini Donut */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: baseDelay + 0.1 }}
          className="w-12 rounded-md p-1"
          style={{ backgroundColor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}
        >
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <circle cx="20" cy="20" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <motion.circle
              cx="20"
              cy="20"
              r="12"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="75.4"
              strokeDashoffset="20"
              initial={{ strokeDashoffset: 75.4 }}
              animate={{ strokeDashoffset: 20 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.2 }}
              transform="rotate(-90 20 20)"
            />
            <motion.text
              x="20"
              y="22"
              textAnchor="middle"
              fill="#a78bfa"
              fontSize="8"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: baseDelay + 0.6 }}
            >
              73%
            </motion.text>
          </svg>
        </motion.div>
      </div>

      {/* Middle row: Bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: baseDelay + 0.2 }}
        className="h-8 rounded-md p-1.5 flex items-end gap-1"
        style={{ backgroundColor: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
      >
        {BAR_DATA.map((val, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              backgroundColor: i === 3 ? '#34d399' : 'rgba(52,211,153,0.5)',
              height: `${val}%`,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: baseDelay + 0.3 + i * 0.05 }}
          />
        ))}
      </motion.div>

      {/* Bottom row: Heatmap + Gauge */}
      <div className="flex gap-1.5 flex-1">
        {/* Mini Heatmap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: baseDelay + 0.3 }}
          className="flex-1 rounded-md p-1"
          style={{ backgroundColor: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)' }}
        >
          <div className="grid grid-cols-5 grid-rows-3 gap-0.5 h-full">
            {HEATMAP_DATA.flat().map((val, i) => (
              <motion.div
                key={i}
                className="rounded-sm"
                style={{
                  backgroundColor: `rgba(244,114,182,${val})`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: baseDelay + 0.4 + i * 0.02 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Mini Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: baseDelay + 0.4 }}
          className="w-12 rounded-md p-1"
          style={{ backgroundColor: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <svg viewBox="0 0 40 25" className="w-full h-full">
            {/* Gauge background arc */}
            <path
              d="M 5 22 A 15 15 0 0 1 35 22"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Gauge value arc */}
            <motion.path
              d="M 5 22 A 15 15 0 0 1 35 22"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="47"
              initial={{ strokeDashoffset: 47 }}
              animate={{ strokeDashoffset: 12 }}
              transition={{ duration: 0.8, delay: baseDelay + 0.5 }}
            />
            {/* Needle */}
            <motion.line
              x1="20"
              y1="22"
              x2="20"
              y2="10"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ rotate: -90 }}
              animate={{ rotate: 30 }}
              transition={{ duration: 0.6, delay: baseDelay + 0.6, type: 'spring' }}
              style={{ transformOrigin: '20px 22px' }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}

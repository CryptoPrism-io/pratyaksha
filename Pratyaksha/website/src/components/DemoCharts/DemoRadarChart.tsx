import { motion } from 'framer-motion'

interface DemoRadarChartProps {
  animate?: boolean
}

// Demo data for energy shapes radar
const RADAR_POINTS = [
  { label: 'Rising', value: 0.8 },
  { label: 'Chaotic', value: 0.5 },
  { label: 'Centered', value: 0.9 },
  { label: 'Expanding', value: 0.6 },
  { label: 'Flat', value: 0.3 },
  { label: 'Falling', value: 0.4 },
]

export function DemoRadarChart({ animate = true }: DemoRadarChartProps) {
  const centerX = 60
  const centerY = 50
  const maxRadius = 35
  const sides = RADAR_POINTS.length
  const angleStep = (2 * Math.PI) / sides

  // Calculate polygon points for the data
  const dataPoints = RADAR_POINTS.map((point, i) => {
    const angle = i * angleStep - Math.PI / 2
    const radius = maxRadius * point.value
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      label: point.label,
      value: point.value,
    }
  })

  // Create SVG path for the data polygon
  const dataPath = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z'

  // Grid circles
  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Grid circles */}
        {gridLevels.map((level, i) => (
          <motion.polygon
            key={i}
            points={RADAR_POINTS.map((_, j) => {
              const angle = j * angleStep - Math.PI / 2
              const radius = maxRadius * level
              return `${centerX + radius * Math.cos(angle)},${centerY + radius * Math.sin(angle)}`
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}

        {/* Axis lines */}
        {RADAR_POINTS.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2
          return (
            <motion.line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={centerX + maxRadius * Math.cos(angle)}
              y2={centerY + maxRadius * Math.sin(angle)}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          )
        })}

        {/* Data polygon with gradient fill */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <motion.path
          d={dataPath}
          fill="url(#radarGradient)"
          stroke="#a78bfa"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={animate ? {
            opacity: 1,
            scale: [0.5, 1.02, 1],
          } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="#ffffff"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
          />
        ))}

        {/* Labels */}
        {RADAR_POINTS.map((point, i) => {
          const angle = i * angleStep - Math.PI / 2
          const labelRadius = maxRadius + 10
          const x = centerX + labelRadius * Math.cos(angle)
          const y = centerY + labelRadius * Math.sin(angle)
          return (
            <motion.text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.6)"
              fontSize="5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.05 }}
            >
              {point.label}
            </motion.text>
          )
        })}
      </svg>
    </div>
  )
}

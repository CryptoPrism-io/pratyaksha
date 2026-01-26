import { motion } from 'framer-motion'

interface DemoSankeyChartProps {
  animate?: boolean
}

// Sankey flow: Entry Types → Sentiment (Positive/Neutral/Negative)
const ENTRY_TYPES = [
  { name: 'Emotional', color: '#f472b6', value: 30 },
  { name: 'Reflective', color: '#a78bfa', value: 25 },
  { name: 'Work', color: '#60a5fa', value: 20 },
  { name: 'Cognitive', color: '#fbbf24', value: 15 },
  { name: 'Health', color: '#34d399', value: 10 },
]

const SENTIMENTS = [
  { name: 'Positive', color: '#34d399', value: 45 },
  { name: 'Neutral', color: '#94a3b8', value: 30 },
  { name: 'Negative', color: '#f87171', value: 25 },
]

// Flow connections (which entry types flow to which sentiments)
const FLOWS = [
  { from: 0, to: 0, value: 15 }, // Emotional → Positive
  { from: 0, to: 1, value: 8 },  // Emotional → Neutral
  { from: 0, to: 2, value: 7 },  // Emotional → Negative
  { from: 1, to: 0, value: 18 }, // Reflective → Positive
  { from: 1, to: 1, value: 5 },  // Reflective → Neutral
  { from: 1, to: 2, value: 2 },  // Reflective → Negative
  { from: 2, to: 0, value: 5 },  // Work → Positive
  { from: 2, to: 1, value: 10 }, // Work → Neutral
  { from: 2, to: 2, value: 5 },  // Work → Negative
  { from: 3, to: 0, value: 5 },  // Cognitive → Positive
  { from: 3, to: 1, value: 5 },  // Cognitive → Neutral
  { from: 3, to: 2, value: 5 },  // Cognitive → Negative
  { from: 4, to: 0, value: 2 },  // Health → Positive
  { from: 4, to: 1, value: 2 },  // Health → Neutral
  { from: 4, to: 2, value: 6 },  // Health → Negative
]

export function DemoSankeyChart({ animate = true }: DemoSankeyChartProps) {
  const leftX = 15
  const rightX = 105
  const totalHeight = 80
  const startY = 10

  // Calculate positions for left nodes (entry types)
  const totalLeftValue = ENTRY_TYPES.reduce((sum, t) => sum + t.value, 0)
  let leftY = startY
  const leftNodes = ENTRY_TYPES.map((type, i) => {
    const height = (type.value / totalLeftValue) * totalHeight
    const node = { ...type, y: leftY, height, midY: leftY + height / 2 }
    leftY += height + 2
    return node
  })

  // Calculate positions for right nodes (sentiments)
  const totalRightValue = SENTIMENTS.reduce((sum, s) => sum + s.value, 0)
  let rightY = startY
  const rightNodes = SENTIMENTS.map((sent, i) => {
    const height = (sent.value / totalRightValue) * totalHeight
    const node = { ...sent, y: rightY, height, midY: rightY + height / 2 }
    rightY += height + 4
    return node
  })

  // Generate flow paths
  const flowPaths = FLOWS.map((flow, i) => {
    const fromNode = leftNodes[flow.from]
    const toNode = rightNodes[flow.to]
    const thickness = Math.max(1, flow.value / 5)

    // Bezier curve path
    const x1 = leftX + 8
    const y1 = fromNode.midY
    const x2 = rightX - 8
    const y2 = toNode.midY
    const cx1 = x1 + 25
    const cx2 = x2 - 25

    return {
      path: `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`,
      color: toNode.color,
      thickness,
      delay: i * 0.05,
    }
  })

  return (
    <div className="w-full h-full flex items-center justify-center p-1">
      <svg viewBox="0 0 120 100" className="w-full h-full">
        {/* Flow paths */}
        {flowPaths.map((flow, i) => (
          <motion.path
            key={i}
            d={flow.path}
            fill="none"
            stroke={flow.color}
            strokeWidth={flow.thickness}
            strokeOpacity={0.4}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={animate ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: flow.delay }}
          />
        ))}

        {/* Left nodes (Entry Types) */}
        {leftNodes.map((node, i) => (
          <g key={`left-${i}`}>
            <motion.rect
              x={leftX - 6}
              y={node.y}
              width={8}
              height={Math.max(node.height - 1, 3)}
              rx={2}
              fill={node.color}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{ transformOrigin: `${leftX}px ${node.y}px` }}
            />
            <motion.text
              x={leftX - 8}
              y={node.midY}
              textAnchor="end"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize="4.5"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            >
              {node.name}
            </motion.text>
          </g>
        ))}

        {/* Right nodes (Sentiments) */}
        {rightNodes.map((node, i) => (
          <g key={`right-${i}`}>
            <motion.rect
              x={rightX - 2}
              y={node.y}
              width={8}
              height={Math.max(node.height - 2, 6)}
              rx={2}
              fill={node.color}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              style={{ transformOrigin: `${rightX}px ${node.y}px` }}
            />
            <motion.text
              x={rightX + 8}
              y={node.midY}
              textAnchor="start"
              dominantBaseline="middle"
              fill={node.color}
              fontSize="5"
              fontWeight="500"
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
            >
              {node.name}
            </motion.text>
          </g>
        ))}

        {/* Center label */}
        <motion.text
          x={60}
          y={96}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Entry Type → Sentiment Flow
        </motion.text>
      </svg>
    </div>
  )
}

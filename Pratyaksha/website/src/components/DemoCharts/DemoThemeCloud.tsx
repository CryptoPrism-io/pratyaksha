import { motion } from 'framer-motion'

// Demo theme tags with realistic cognitive journaling themes
const DEMO_TAGS = [
  { text: 'self-doubt', value: 18, sentiment: 'negative' },
  { text: 'growth', value: 24, sentiment: 'positive' },
  { text: 'work-life balance', value: 15, sentiment: 'neutral' },
  { text: 'relationships', value: 21, sentiment: 'positive' },
  { text: 'anxiety', value: 12, sentiment: 'negative' },
  { text: 'creativity', value: 16, sentiment: 'positive' },
  { text: 'procrastination', value: 9, sentiment: 'negative' },
  { text: 'gratitude', value: 14, sentiment: 'positive' },
  { text: 'health', value: 11, sentiment: 'neutral' },
  { text: 'goals', value: 19, sentiment: 'positive' },
  { text: 'mindfulness', value: 8, sentiment: 'positive' },
  { text: 'stress', value: 13, sentiment: 'negative' },
]

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  negative: '#f59e0b',
  neutral: '#6b7280',
}

interface DemoThemeCloudProps {
  animate?: boolean
}

export function DemoThemeCloud({ animate = true }: DemoThemeCloudProps) {
  const maxValue = Math.max(...DEMO_TAGS.map((d) => d.value))
  const minValue = Math.min(...DEMO_TAGS.map((d) => d.value))
  const range = maxValue - minValue || 1

  const getFontSize = (value: number) => {
    const normalized = (value - minValue) / range
    return 11 + normalized * 10 // 11px to 21px
  }

  const getOpacity = (value: number) => {
    const normalized = (value - minValue) / range
    return 0.6 + normalized * 0.4
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex flex-wrap items-center justify-center gap-2 p-2"
    >
      {DEMO_TAGS.map((tag, index) => (
        <motion.span
          key={tag.text}
          initial={animate ? { opacity: 0, scale: 0.8 } : false}
          animate={{ opacity: getOpacity(tag.value), scale: 1 }}
          transition={{ duration: 0.3, delay: animate ? 0.5 + index * 0.05 : 0 }}
          whileHover={{ scale: 1.1, opacity: 1 }}
          className="cursor-pointer rounded-lg px-2 py-0.5 transition-colors"
          style={{
            fontSize: `${getFontSize(tag.value)}px`,
            color: SENTIMENT_COLORS[tag.sentiment as keyof typeof SENTIMENT_COLORS],
            backgroundColor: `${SENTIMENT_COLORS[tag.sentiment as keyof typeof SENTIMENT_COLORS]}15`,
          }}
        >
          {tag.text}
        </motion.span>
      ))}
    </motion.div>
  )
}

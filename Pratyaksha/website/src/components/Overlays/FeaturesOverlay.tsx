import { useState } from 'react'
import { motion } from 'framer-motion'
import { BaseOverlay, AnimatedText, GlassCard, TypewriterText } from './BaseOverlay'
import { STATE_CONTENT, STATES, STATE_COLORS } from '@/lib/constants'
import { BarChart3, PieChart, Tags, TrendingUp, Sparkles } from 'lucide-react'
import { DemoModeChart, DemoTimelineChart, DemoThemeCloud, DemoActivityChart } from '@/components/DemoCharts'

interface FeaturesOverlayProps {
  isVisible: boolean
  onNext?: () => void
  transitionOpacity?: number
  isPreloading?: boolean
}

// Chart cards configuration
const CHART_CARDS = [
  {
    id: 'modes',
    title: 'Cognitive Modes',
    description: 'Track your mental states',
    icon: PieChart,
    Chart: DemoModeChart,
  },
  {
    id: 'timeline',
    title: 'Emotional Timeline',
    description: 'See your journey unfold',
    icon: TrendingUp,
    Chart: DemoTimelineChart,
  },
  {
    id: 'themes',
    title: 'Theme Patterns',
    description: 'Discover recurring themes',
    icon: Tags,
    Chart: DemoThemeCloud,
  },
  {
    id: 'activity',
    title: 'Daily Rhythm',
    description: 'Your journaling habits',
    icon: BarChart3,
    Chart: DemoActivityChart,
  },
]

export function FeaturesOverlay({ isVisible, onNext, transitionOpacity, isPreloading }: FeaturesOverlayProps) {
  const content = STATE_CONTENT[STATES.ILLUMINATED]
  const color = STATE_COLORS[STATES.ILLUMINATED]
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <BaseOverlay isVisible={isVisible} transitionOpacity={transitionOpacity} isPreloading={isPreloading}>
      <div className="flex flex-col items-center justify-start text-center px-4 sm:px-6 max-w-5xl mx-auto py-4">
        {/* Badge */}
        <AnimatedText delay={0} animation="scaleIn">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-5 text-xs sm:text-sm"
            style={{ backgroundColor: `${color.hex}20`, color: color.hex }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <BarChart3 className="w-4 h-4" />
            </motion.div>
            21 Visualizations
          </motion.div>
        </AnimatedText>

        {/* Headline */}
        <AnimatedText delay={0.1} animation="pop">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            {content.headline}
          </h2>
        </AnimatedText>

        {/* Subline with typewriter effect */}
        <AnimatedText delay={0.15} animation="slideUp">
          <p className="text-sm sm:text-lg text-white/70 mb-4 sm:mb-6 max-w-lg">
            <TypewriterText
              text={content.subline}
              delay={0.2}
              speed={18}
              highlights={[
                { words: ['21'], color: '#fbbf24', fontClass: 'font-cabinet' },
                { words: ['see'], color: '#f59e0b', fontClass: 'font-playfair', italic: true },
                { words: ['show'], color: '#fcd34d', fontClass: 'font-syne' },
              ]}
            />
          </p>
        </AnimatedText>

        {/* Chart cards - 2x2 grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl relative">
          {CHART_CARDS.map((card, index) => {
            const Icon = card.icon
            const Chart = card.Chart
            const isHovered = hoveredCard === card.id

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="relative"
                style={{ zIndex: isHovered ? 50 : 1 }}
              >
                <motion.div
                  animate={isHovered ? {
                    scale: 1.618,
                    zIndex: 50,
                  } : {
                    scale: 1,
                    zIndex: 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="origin-center"
                >
                  <GlassCard className={`h-full !p-2 sm:!p-3 transition-all duration-300 border ${
                    isHovered
                      ? 'bg-slate-900/95 border-white/30 shadow-2xl shadow-black/50'
                      : 'hover:bg-white/10 border-transparent hover:border-white/20'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <div
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color.hex}20` }}
                      >
                        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: color.hex }} />
                      </div>
                      <div className="text-left min-w-0">
                        <h3 className="text-white font-medium text-[10px] sm:text-xs leading-tight truncate">
                          {card.title}
                        </h3>
                        <p className="text-white/50 text-[8px] sm:text-[10px] leading-tight truncate">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Chart container */}
                    <div className={`w-full rounded bg-white/5 overflow-hidden transition-all duration-300 ${
                      isHovered ? 'h-32 sm:h-40' : 'h-20 sm:h-28'
                    }`}>
                      {isVisible && <Chart animate={!isHovered} />}
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Overlay to dim other cards when one is hovered */}
                {hoveredCard && hoveredCard !== card.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 rounded-xl pointer-events-none"
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <AnimatedText delay={0.6} animation="slideUp" className="mt-3 sm:mt-4">
          <p className="text-white/40 text-[10px] sm:text-xs">
            + 17 more visualizations in the full dashboard
          </p>
        </AnimatedText>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center gap-3"
        >
          {/* Primary: Continue to final CTA */}
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: STATE_COLORS[STATES.ILLUMINATED].hex }} />
            </motion.div>
            <span className="text-sm font-medium">Begin Your Journey</span>
          </motion.button>

          {/* Secondary: Explore Dashboard */}
          <motion.a
            href="https://pratyaksha-963362833537.asia-south1.run.app/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/30 text-sm transition-all"
          >
            Explore Dashboard
          </motion.a>
        </motion.div>
      </div>
    </BaseOverlay>
  )
}

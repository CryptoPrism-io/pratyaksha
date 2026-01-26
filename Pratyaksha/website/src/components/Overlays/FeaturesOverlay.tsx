import { useState } from 'react'
import { motion } from 'framer-motion'
import { BaseOverlay } from './BaseOverlay'
import { VerticalBranding } from './VerticalBranding'
import {
  Brain,
  Zap,
  GitBranch,
  BarChart3,
  Lightbulb,
  Mic,
  Sparkles,
} from 'lucide-react'
import { DemoModeChart, DemoTimelineChart, DemoThemeCloud, DemoRadarChart, DemoSankeyChart, DemoDashboardPreview, DemoVoiceWave } from '@/components/DemoCharts'

interface FeaturesOverlayProps {
  isVisible: boolean
  onNext?: () => void
  transitionOpacity?: number
  isPreloading?: boolean
}

// Stats configuration
const STATS = [
  { value: '21+', label: 'Visualizations', sublabel: 'Charts & insights', color: '#a78bfa' },
  { value: '4', label: 'AI Agents', sublabel: 'Working in sequence', color: '#60a5fa' },
  { value: '12', label: 'Contradictions', sublabel: 'Tracked patterns', color: '#f472b6' },
  { value: '<2s', label: 'Processing', sublabel: 'Per entry analysis', color: '#34d399' },
]

// Features with associated demo charts
const FEATURES = [
  {
    id: 'intent',
    icon: Brain,
    title: 'Intent Classification',
    description: 'Automatically categorizes your entry: Emotional, Cognitive, Work, Health, Reflection, or 10 other types.',
    color: '#a78bfa',
    Chart: DemoSankeyChart,
    chartLabel: 'Entry Type → Sentiment Flow',
  },
  {
    id: 'mood',
    icon: Zap,
    title: 'Mood & Energy Shapes',
    description: 'Beyond simple moods — detect whether your energy is Rising, Chaotic, Centered, Expanding, or Flat.',
    color: '#f472b6',
    Chart: DemoRadarChart,
    chartLabel: 'Energy Shape Radar',
  },
  {
    id: 'contradiction',
    icon: GitBranch,
    title: 'Contradiction Tracking',
    description: 'Unique feature: Spot internal conflicts like "Action vs Fear" or "Growth vs Comfort" across entries.',
    color: '#fbbf24',
    Chart: DemoThemeCloud,
    chartLabel: 'Contradiction Patterns',
  },
  {
    id: 'viz',
    icon: BarChart3,
    title: '21 Visualizations',
    description: 'Sankey flows, GitHub-style heatmaps, radar charts, theme clouds, emotional timelines, and more.',
    color: '#60a5fa',
    Chart: DemoDashboardPreview,
    chartLabel: 'Dashboard Preview',
  },
  {
    id: 'insights',
    icon: Lightbulb,
    title: 'Actionable Insights',
    description: 'Each entry ends with a personalized "Next Action" suggestion based on your cognitive patterns.',
    color: '#34d399',
    Chart: DemoTimelineChart,
    chartLabel: 'Insight Timeline',
  },
  {
    id: 'voice',
    icon: Mic,
    title: 'Voice Journaling',
    description: 'Speak your thoughts freely. Real-time transcription means less friction, more flow.',
    color: '#f97316',
    Chart: DemoVoiceWave,
    chartLabel: 'Real-time Transcription',
  },
]

export function FeaturesOverlay({ isVisible, onNext, transitionOpacity, isPreloading }: FeaturesOverlayProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)

  // Handle both hover (desktop) and tap (mobile)
  const handleInteraction = (featureId: string) => {
    setActiveFeature(prev => prev === featureId ? null : featureId)
  }

  return (
    <BaseOverlay isVisible={isVisible} transitionOpacity={transitionOpacity} isPreloading={isPreloading}>
      <VerticalBranding isVisible={isVisible} animationStyle="breathe" />
      <div className="flex flex-col items-center justify-start px-4 sm:px-6 max-w-5xl mx-auto py-4">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl mb-6"
        >
          <div
            className="grid grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 rounded-2xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                className="text-center"
              >
                <div
                  className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs text-white/70 font-medium">{stat.label}</div>
                <div className="text-[8px] sm:text-[10px] text-white/40 hidden sm:block">{stat.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2" style={{ textAlign: 'center' }}>
            Beyond simple journaling
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto" style={{ textAlign: 'center' }}>
            Pratyaksha doesn't just store your thoughts — it analyzes them with 4 specialized AI agents to reveal patterns you've never seen before.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl relative">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            const Chart = feature.Chart
            const isActive = activeFeature === feature.id
            const delay = 0.4 + index * 0.1

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay }}
                onMouseEnter={() => window.innerWidth > 768 && setActiveFeature(feature.id)}
                onMouseLeave={() => window.innerWidth > 768 && setActiveFeature(null)}
                onClick={() => window.innerWidth <= 768 && handleInteraction(feature.id)}
                className="relative cursor-pointer"
                style={{ zIndex: isActive ? 50 : 1 }}
              >
                <motion.div
                  animate={isActive ? {
                    scale: window.innerWidth <= 768 ? 1.02 : 1.08,
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
                  {/* Card */}
                  <div
                    className="rounded-xl p-4 transition-all duration-300 h-full"
                    style={{
                      backgroundColor: isActive ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? feature.color + '50' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: isActive ? `0 20px 40px -10px ${feature.color}30` : 'none',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: feature.color + '20' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: feature.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                        {!isActive && (
                          <p className="text-xs text-white/50 line-clamp-2">{feature.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Hover content: Show visualization */}
                    {isActive ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Chart label */}
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: feature.color }}
                          />
                          <span className="text-[10px] text-white/50 uppercase tracking-wider">
                            {feature.chartLabel}
                          </span>
                        </div>

                        {/* Chart container */}
                        <div
                          className="w-full h-36 rounded-lg overflow-hidden"
                          style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                        >
                          <Chart animate={false} />
                        </div>

                        {/* Description below chart */}
                        <p className="text-[10px] text-white/40 mt-2 line-clamp-2">
                          {feature.description}
                        </p>
                      </motion.div>
                    ) : (
                      /* Default: Just the colored accent line */
                      <div
                        className="h-1 rounded-full mt-2"
                        style={{
                          background: `linear-gradient(to right, ${feature.color}50, transparent)`,
                        }}
                      />
                    )}

                    {/* Glow indicator */}
                    <motion.div
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: feature.color }}
                      initial={{ scale: 0 }}
                      animate={isVisible ? {
                        scale: [0, 1.2, 1],
                        boxShadow: [
                          `0 0 0 0 ${feature.color}`,
                          `0 0 10px 3px ${feature.color}50`,
                          `0 0 5px 1px ${feature.color}30`,
                        ]
                      } : {}}
                      transition={{ duration: 0.5, delay: delay + 0.1 }}
                    />
                  </div>
                </motion.div>

                {/* Dim other cards when one is hovered */}
                {activeFeature && activeFeature !== feature.id && (
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

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-6 flex items-center gap-2 text-white/30 text-xs"
        >
          <motion.div
            className="w-8 h-px bg-gradient-to-r from-transparent to-white/20"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ delay: 1.3, duration: 0.5 }}
          />
          <span className="hidden sm:inline">Hover to see sample visualizations</span>
          <span className="sm:hidden">Tap to see sample visualizations</span>
          <motion.div
            className="w-8 h-px bg-gradient-to-l from-transparent to-white/20"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ delay: 1.3, duration: 0.5 }}
          />
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={onNext}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 group flex items-center gap-2 px-6 py-3 rounded-full transition-all"
          style={{
            background: 'linear-gradient(to right, rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
            border: '1px solid rgba(168,85,247,0.3)',
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: '#c4b5fd' }} />
          <span className="text-sm font-medium" style={{ color: '#c4b5fd' }}>
            Ready to Start
          </span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ color: '#c4b5fd' }}
          >
            →
          </motion.span>
        </motion.button>
      </div>
    </BaseOverlay>
  )
}

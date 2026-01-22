import { useState } from 'react'
import { motion } from 'framer-motion'
import { BaseOverlay, AnimatedText, TypewriterText } from './BaseOverlay'
import { STATE_CONTENT, STATES } from '@/lib/constants'
import { Brain, Heart, Tags, Lightbulb, ChevronRight, ArrowRight } from 'lucide-react'

interface SolutionOverlayProps {
  isVisible: boolean
  onNext?: () => void
  transitionOpacity?: number
  isPreloading?: boolean
}

// Sample journal entry for demo
const SAMPLE_ENTRY = `Had a rough morning. Couldn't focus on work, kept thinking about the argument with Sarah. Feel anxious about the deadline but also grateful for the team's support.`

// Agent configuration with unique colors, extractions, and hover details
const AGENTS = [
  {
    id: 'intent',
    name: 'Intent Agent',
    icon: Brain,
    color: '#8b5cf6', // Purple
    extraction: 'Type: Emotional Reflection',
    detail: 'Classifies entry & generates snapshot',
    hoverTitle: 'Entry Classification',
    hoverDetails: [
      { label: 'Entry Type', value: 'Emotional Reflection' },
      { label: 'Generated Name', value: '"Morning Struggle & Gratitude"' },
      { label: 'Snapshot', value: 'Processing conflict while finding silver linings' },
    ],
    capabilities: ['15 Entry Types', 'Auto-naming', 'Context Detection'],
  },
  {
    id: 'emotion',
    name: 'Emotion Agent',
    icon: Heart,
    color: '#ec4899', // Pink
    extraction: 'Mode: Anxious → Grateful',
    detail: 'Analyzes mood & energy patterns',
    hoverTitle: 'Emotional Analysis',
    hoverDetails: [
      { label: 'Primary Mode', value: 'Anxious (shifting to Grateful)' },
      { label: 'Energy Level', value: '4/10 → 6/10' },
      { label: 'Energy Shape', value: 'Rising' },
      { label: 'Sentiment', value: '+0.3 (Mixed Positive)' },
    ],
    capabilities: ['15 Mood Modes', '12 Energy Shapes', 'Sentiment Score'],
  },
  {
    id: 'theme',
    name: 'Theme Agent',
    icon: Tags,
    color: '#f59e0b', // Amber
    extraction: '#work #relationships #stress',
    detail: 'Extracts recurring themes & loops',
    hoverTitle: 'Theme Extraction',
    hoverDetails: [
      { label: 'Primary Tags', value: '#work #relationships #stress' },
      { label: 'Secondary', value: '#gratitude #team #deadline' },
      { label: 'Contradiction', value: '"Action vs. Fear"' },
      { label: 'Loop Detected', value: 'Conflict avoidance pattern' },
    ],
    capabilities: ['Auto-tagging', '12 Contradictions', 'Pattern Loops'],
  },
  {
    id: 'insight',
    name: 'Insight Agent',
    icon: Lightbulb,
    color: '#22c55e', // Green
    extraction: '"Resolve conflict with Sarah"',
    detail: 'Generates actionable next steps',
    hoverTitle: 'Actionable Insights',
    hoverDetails: [
      { label: 'Summary', value: 'Work stress amplified by unresolved personal conflict' },
      { label: 'Key Insight', value: 'Team support is a resource to lean on' },
      { label: 'Next Action', value: 'Schedule conversation with Sarah today' },
    ],
    capabilities: ['AI Summaries', 'Action Items', 'Growth Insights'],
  },
]

export function SolutionOverlay({ isVisible, onNext, transitionOpacity, isPreloading }: SolutionOverlayProps) {
  const content = STATE_CONTENT[STATES.ORGANIZING]
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)

  return (
    <BaseOverlay isVisible={isVisible} transitionOpacity={transitionOpacity} isPreloading={isPreloading}>
      <div className="flex flex-col items-center justify-start text-center px-4 sm:px-6 max-w-4xl mx-auto py-2">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
        >
          <Brain className="w-3.5 h-3.5" />
          The 4-Agent Pipeline
        </motion.div>

        {/* Headline */}
        <AnimatedText delay={0.1} animation="pop">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            {content.headline}
          </h2>
        </AnimatedText>

        {/* Subline with typewriter effect */}
        <AnimatedText delay={0.15} animation="slideUp">
          <p className="text-sm sm:text-base text-white/60 mb-4 max-w-md">
            <TypewriterText
              text={content.subline}
              delay={0.2}
              speed={18}
              highlights={[
                { words: ['Four'], color: '#a78bfa', fontClass: 'font-cabinet' },
                { words: ['agents'], color: '#8b5cf6', fontClass: 'font-syne', uppercase: true },
                { words: ['understand'], color: '#c084fc', fontClass: 'font-playfair', italic: true },
              ]}
            />
          </p>
        </AnimatedText>

        {/* Sample Entry Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mb-4"
        >
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-lg p-3 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Sample Entry</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              "{SAMPLE_ENTRY}"
            </p>
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mb-3"
        >
          <ChevronRight className="w-5 h-5 text-white/30 rotate-90" />
        </motion.div>

        {/* Agents Grid - Sequential reveal with 3x hover */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-lg relative">
          {AGENTS.map((agent, index) => {
            const Icon = agent.icon
            const delay = 0.5 + index * 0.3
            const isHovered = hoveredAgent === agent.id

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, x: 0, scale: 1 } : {}}
                transition={{
                  duration: 0.5,
                  delay,
                  type: 'spring',
                  stiffness: 200,
                }}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
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
                  {/* Card */}
                  <div
                    className={`bg-slate-900/95 backdrop-blur border rounded-lg text-left h-full transition-all duration-300 ${
                      isHovered ? 'p-3 shadow-2xl shadow-black/50' : 'p-2.5 sm:p-3'
                    }`}
                    style={{ borderColor: isHovered ? `${agent.color}60` : `${agent.color}40` }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        className={`rounded-lg flex items-center justify-center ${isHovered ? 'w-8 h-8' : 'w-7 h-7 sm:w-8 sm:h-8'}`}
                        style={{ backgroundColor: `${agent.color}20` }}
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={isVisible ? { rotate: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: delay + 0.1 }}
                      >
                        <Icon className={`${isHovered ? 'w-4 h-4' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'}`} style={{ color: agent.color }} />
                      </motion.div>
                      <div>
                        <h3 className={`text-white font-medium ${isHovered ? 'text-xs' : 'text-[10px] sm:text-xs'}`}>
                          {isHovered ? agent.hoverTitle : agent.name}
                        </h3>
                        <p className={`text-white/40 ${isHovered ? 'text-[10px]' : 'text-[8px] sm:text-[10px]'}`}>
                          {agent.detail}
                        </p>
                      </div>
                    </div>

                    {/* Expanded content on hover */}
                    {isHovered ? (
                      <div className="space-y-1.5">
                        {/* Detailed extractions */}
                        {agent.hoverDetails.map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <span className="text-[8px] text-white/40 w-16 flex-shrink-0">{item.label}:</span>
                            <span className="text-[9px] font-medium" style={{ color: agent.color }}>{item.value}</span>
                          </motion.div>
                        ))}

                        {/* Capabilities pills */}
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/10">
                          {agent.capabilities.map((cap, i) => (
                            <motion.span
                              key={cap}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 + i * 0.05 }}
                              className="text-[7px] px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
                            >
                              {cap}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Default extraction result */
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4, delay: delay + 0.2 }}
                        className="rounded px-2 py-1.5"
                        style={{ backgroundColor: `${agent.color}15` }}
                      >
                        <span
                          className="text-[10px] sm:text-xs font-medium"
                          style={{ color: agent.color }}
                        >
                          {agent.extraction}
                        </span>
                      </motion.div>
                    )}

                    {/* Animated processing indicator */}
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: agent.color }}
                      initial={{ scale: 0 }}
                      animate={isVisible ? {
                        scale: [0, 1.2, 1],
                        boxShadow: [
                          `0 0 0 0 ${agent.color}`,
                          `0 0 10px 3px ${agent.color}50`,
                          `0 0 5px 1px ${agent.color}30`,
                        ]
                      } : {}}
                      transition={{ duration: 0.5, delay: delay + 0.15 }}
                    />
                  </div>
                </motion.div>

                {/* Dim other cards when one is hovered */}
                {hoveredAgent && hoveredAgent !== agent.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 rounded-lg pointer-events-none"
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 2 }}
          className="mt-4 flex items-center gap-2 text-white/30 text-[10px] sm:text-xs"
        >
          <motion.div
            className="w-6 h-px bg-gradient-to-r from-transparent to-white/20"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ delay: 2.2, duration: 0.5 }}
          />
          <span>Hover to explore each agent</span>
          <motion.div
            className="w-6 h-px bg-gradient-to-l from-transparent to-white/20"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ delay: 2.2, duration: 0.5 }}
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 2.5 }}
          className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center gap-3"
        >
          {/* Primary: Continue journey */}
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 hover:text-purple-200 transition-all duration-300"
          >
            <span className="text-xs sm:text-sm font-medium">See The Light</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.div>
          </motion.button>

          {/* Secondary: Try Demo */}
          <motion.a
            href="https://pratyaksha-963362833537.asia-south1.run.app/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white/80 text-xs sm:text-sm transition-colors"
          >
            Try it now →
          </motion.a>
        </motion.div>
      </div>
    </BaseOverlay>
  )
}

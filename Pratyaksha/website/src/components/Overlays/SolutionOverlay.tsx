import { useState } from 'react'
import { motion } from 'framer-motion'
import { BaseOverlay, AnimatedText } from './BaseOverlay'
import { STATE_CONTENT, STATES } from '@/lib/constants'
import { Brain, Heart, Tags, Lightbulb, FileText, Sparkles } from 'lucide-react'

interface SolutionOverlayProps {
  isVisible: boolean
  onNext?: () => void
  transitionOpacity?: number
  isPreloading?: boolean
}

// Agent configuration with unique colors and hover details
const AGENTS = [
  {
    id: 'intent',
    name: 'Intent Agent',
    icon: Brain,
    color: '#a78bfa',
    description: 'Classifies entry type',
    output: 'Type & snapshot',
    hoverTitle: 'Entry Classification',
    hoverDetails: [
      { label: 'Function', value: 'Classifies into 15 entry types' },
      { label: 'Output', value: 'Auto-generated name & snapshot' },
      { label: 'Example', value: '"Morning Struggle & Gratitude"' },
    ],
    capabilities: ['15 Entry Types', 'Auto-naming', 'Context Detection'],
  },
  {
    id: 'emotion',
    name: 'Emotion Agent',
    icon: Heart,
    color: '#f472b6',
    description: 'Analyzes mood & energy',
    output: 'Energy & sentiment',
    hoverTitle: 'Emotional Analysis',
    hoverDetails: [
      { label: 'Mood', value: '15 modes (Anxious, Hopeful, etc.)' },
      { label: 'Energy', value: 'Level 1-10 + Shape (Rising, Flat...)' },
      { label: 'Sentiment', value: 'Score from -1 to +1' },
    ],
    capabilities: ['15 Mood Modes', '12 Energy Shapes', 'Sentiment Score'],
  },
  {
    id: 'theme',
    name: 'Theme Agent',
    icon: Tags,
    color: '#fbbf24',
    description: 'Finds patterns & loops',
    output: 'Contradictions',
    hoverTitle: 'Pattern Detection',
    hoverDetails: [
      { label: 'Tags', value: 'Auto-extracted themes' },
      { label: 'Contradictions', value: '12 types (Action vs Fear...)' },
      { label: 'Loops', value: 'Recurring pattern detection' },
    ],
    capabilities: ['Auto-tagging', '12 Contradictions', 'Loop Detection'],
  },
  {
    id: 'insight',
    name: 'Insight Agent',
    icon: Lightbulb,
    color: '#34d399',
    description: 'Generates actions',
    output: 'Next steps',
    hoverTitle: 'Actionable Insights',
    hoverDetails: [
      { label: 'Summary', value: 'AI-generated entry summary' },
      { label: 'Insights', value: 'Key realizations extracted' },
      { label: 'Action', value: 'Concrete next step to take' },
    ],
    capabilities: ['AI Summaries', 'Key Insights', 'Action Items'],
  },
]

export function SolutionOverlay({ isVisible, onNext, transitionOpacity, isPreloading }: SolutionOverlayProps) {
  const content = STATE_CONTENT[STATES.ORGANIZING]
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)

  return (
    <BaseOverlay isVisible={isVisible} transitionOpacity={transitionOpacity} isPreloading={isPreloading}>
      <div className="flex flex-col items-center justify-start text-center px-4 sm:px-6 max-w-4xl mx-auto py-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
          style={{
            backgroundColor: 'rgba(167,139,250,0.15)',
            border: '1px solid rgba(167,139,250,0.3)',
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: '#a78bfa' }} />
          <span className="text-sm font-medium" style={{ color: '#c4b5fd' }}>
            The 4-Agent Pipeline
          </span>
        </motion.div>

        {/* Headline */}
        <AnimatedText delay={0.1} animation="pop">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3" style={{ textAlign: 'center' }}>
            {content.headline}
          </h2>
        </AnimatedText>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-white/60 mb-6 max-w-lg"
          style={{ textAlign: 'center' }}
        >
          Your entry flows through 4 specialized AI agents in sequence, each extracting a different layer of insight.
        </motion.p>

        {/* Pipeline Visualization */}
        <div className="w-full max-w-3xl">
          {/* YOU WRITE - Entry Point */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center mb-4"
          >
            <div
              className="flex items-center gap-3 px-6 py-4 rounded-2xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">You Write</h3>
                <p className="text-sm text-white/50">Type or speak freely</p>
              </div>
            </div>
          </motion.div>

          {/* Animated Connection Lines */}
          <div className="relative h-12 w-full max-w-2xl mx-auto mb-2">
            {/* Main vertical line from You Write - short */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isVisible ? { scaleY: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 origin-top"
              style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
            />

            {/* Horizontal spread line - only between first and last agent (20% to 80%) */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isVisible ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute h-0.5 origin-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.4)',
                top: '1rem',
                left: '20%',
                right: '20%',
              }}
            />

            {/* Vertical lines to each agent - longer to touch cards */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={isVisible ? { scaleY: 1 } : {}}
                transition={{ duration: 0.3, delay: 1.1 }}
                className="absolute w-0.5 origin-top"
                style={{
                  backgroundColor: AGENTS[i].color,
                  top: '1rem',
                  left: `${20 + i * 20}%`,
                  height: '2rem',
                  boxShadow: `0 0 8px ${AGENTS[i].color}60`,
                }}
              />
            ))}

            {/* White dot - travels down center */}
            <motion.div
              className="absolute w-2.5 h-2.5 rounded-full left-1/2"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(255,255,255,0.5)',
                marginLeft: '-5px',
              }}
              initial={{ opacity: 0, top: 0 }}
              animate={isVisible ? {
                opacity: [0, 1, 1, 0],
                top: ['0px', '16px', '16px', '16px'],
              } : {}}
              transition={{
                duration: 0.4,
                delay: 1.5,
                repeat: Infinity,
                repeatDelay: 3.6,
              }}
            />

            {/* 4 colored dots - appear at center, move horizontally, then down */}
            {[0, 1, 2, 3].map((i) => {
              const targetLeft = 20 + i * 20 // 20%, 40%, 60%, 80%

              return (
                <motion.div
                  key={`dot-${i}`}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: AGENTS[i].color,
                    boxShadow: `0 0 10px ${AGENTS[i].color}, 0 0 16px ${AGENTS[i].color}70`,
                    marginLeft: '-4px',
                  }}
                  initial={{ opacity: 0, left: '50%', top: '16px' }}
                  animate={isVisible ? {
                    opacity: [0, 1, 1, 1, 0],
                    left: ['50%', '50%', `${targetLeft}%`, `${targetLeft}%`, `${targetLeft}%`],
                    top: ['16px', '16px', '16px', '48px', '48px'],
                  } : {}}
                  transition={{
                    duration: 1.3,
                    delay: 1.8,
                    repeat: Infinity,
                    repeatDelay: 2.7,
                    times: [0, 0.1, 0.4, 0.85, 1],
                    ease: 'easeInOut',
                  }}
                />
              )
            })}
          </div>

          {/* 4 Agents Grid - aligned with connection lines */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto w-full">
            {AGENTS.map((agent, index) => {
              const Icon = agent.icon
              const delay = 1.2 + index * 0.2
              const isHovered = hoveredAgent === agent.id

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
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
                      scale: window.innerWidth <= 768 ? 1.03 : 1.15,
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
                      className="rounded-xl text-center transition-all duration-300 h-full"
                      style={{
                        backgroundColor: isHovered ? 'rgba(15,15,20,0.98)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isHovered ? agent.color + '60' : agent.color + '30'}`,
                        padding: isHovered ? '1rem' : '0.75rem',
                        boxShadow: isHovered ? `0 20px 40px -10px ${agent.color}30` : 'none',
                      }}
                    >
                      {/* Step number */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={isVisible ? { scale: 1 } : {}}
                        transition={{ duration: 0.3, delay: delay + 0.1 }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto mb-2"
                        style={{
                          backgroundColor: agent.color + '30',
                          color: agent.color,
                        }}
                      >
                        {index + 1}
                      </motion.div>

                      {/* Icon */}
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                        style={{ backgroundColor: agent.color + '20' }}
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={isVisible ? { rotate: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: delay + 0.15 }}
                      >
                        <Icon className="w-5 h-5" style={{ color: agent.color }} />
                      </motion.div>

                      {/* Title */}
                      <h3 className={`font-semibold text-white ${isHovered ? 'text-[10px] sm:text-sm mb-2' : 'text-xs sm:text-sm mb-1'}`}>
                        {isHovered ? agent.hoverTitle : agent.name}
                      </h3>

                      {/* Expanded content on hover */}
                      {isHovered ? (
                        <div className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3">
                          {agent.hoverDetails.map((item, i) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="text-left"
                            >
                              <span className="text-[7px] sm:text-[9px] text-white/40 block">{item.label}</span>
                              <span className="text-[8px] sm:text-[10px] font-medium" style={{ color: agent.color }}>
                                {item.value}
                              </span>
                            </motion.div>
                          ))}

                          {/* Capabilities */}
                          <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-white/10">
                            {agent.capabilities.map((cap, i) => (
                              <motion.span
                                key={cap}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: agent.color + '20', color: agent.color }}
                              >
                                {cap}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-[10px] sm:text-xs text-white/50 mb-2">
                            {agent.description}
                          </p>
                          <div
                            className="rounded-lg px-2 py-1.5"
                            style={{ backgroundColor: agent.color + '15' }}
                          >
                            <span className="text-[10px] font-medium" style={{ color: agent.color }}>
                              {agent.output}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Processing indicator */}
                      <motion.div
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: agent.color }}
                        initial={{ scale: 0 }}
                        animate={isVisible ? {
                          scale: [0, 1.2, 1],
                          boxShadow: [
                            `0 0 0 0 ${agent.color}`,
                            `0 0 12px 4px ${agent.color}50`,
                            `0 0 6px 2px ${agent.color}30`,
                          ]
                        } : {}}
                        transition={{ duration: 0.5, delay: delay + 0.2 }}
                      />
                    </div>
                  </motion.div>

                  {/* Dim other cards when one is hovered */}
                  {hoveredAgent && hoveredAgent !== agent.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/50 rounded-xl pointer-events-none"
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Processing time badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 2.2 }}
            className="mt-6 flex justify-center"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                backgroundColor: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.2)',
              }}
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#34d399' }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-medium" style={{ color: '#34d399' }}>
                Full analysis in under 2 seconds
              </span>
            </div>
          </motion.div>
        </div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 2.5 }}
          className="mt-4 flex items-center gap-2 text-white/30 text-xs"
        >
          <motion.div
            className="w-8 h-px bg-gradient-to-r from-transparent to-white/20"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ delay: 2.6, duration: 0.5 }}
          />
          <span>Hover to explore each agent</span>
          <motion.div
            className="w-8 h-px bg-gradient-to-l from-transparent to-white/20"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ delay: 2.6, duration: 0.5 }}
          />
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={onNext}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 2.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 group flex items-center gap-2 px-6 py-3 rounded-full transition-all"
          style={{
            backgroundColor: 'rgba(167,139,250,0.2)',
            border: '1px solid rgba(167,139,250,0.3)',
          }}
        >
          <span className="text-sm font-medium" style={{ color: '#c4b5fd' }}>
            See The Visualizations
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

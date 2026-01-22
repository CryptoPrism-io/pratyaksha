import { useState } from 'react'
import { motion } from 'framer-motion'
import { BaseOverlay, AnimatedText, TypewriterText } from './BaseOverlay'
import { STATE_CONTENT, STATES, STATE_COLORS } from '@/lib/constants'
import { AlertCircle, ArrowRight, FileText, Search, Clock, Lightbulb } from 'lucide-react'

interface ProblemOverlayProps {
  isVisible: boolean
  onNext?: () => void
  transitionOpacity?: number
  isPreloading?: boolean
}

// Rich problem cards with hover details
const PROBLEMS = [
  {
    id: 'scattered',
    title: 'Scattered Thoughts',
    shortDesc: 'Dozens of entries, no connections',
    icon: FileText,
    color: '#ef4444',
    hoverDetails: [
      { label: 'Reality', value: '50+ entries over months' },
      { label: 'Problem', value: 'Each entry lives in isolation' },
      { label: 'Impact', value: 'Patterns stay invisible' },
    ],
    example: '"I wrote about work stress 12 times... but never noticed"',
  },
  {
    id: 'themes',
    title: 'Hidden Themes',
    shortDesc: 'Recurring patterns you can\'t see',
    icon: Search,
    color: '#f97316',
    hoverDetails: [
      { label: 'Reality', value: 'Same themes repeat weekly' },
      { label: 'Problem', value: 'No way to track recurrence' },
      { label: 'Impact', value: 'Growth opportunities missed' },
    ],
    example: '"Anxiety before meetings appeared 8 times in 2 weeks"',
  },
  {
    id: 'emotions',
    title: 'Lost Emotions',
    shortDesc: 'Feelings buried in time',
    icon: Clock,
    color: '#eab308',
    hoverDetails: [
      { label: 'Reality', value: 'Moods shift unpredictably' },
      { label: 'Problem', value: 'Can\'t see emotional trajectory' },
      { label: 'Impact', value: 'Triggers remain unknown' },
    ],
    example: '"My energy always drops on Sundays... I had no idea"',
  },
  {
    id: 'insights',
    title: 'Buried Insights',
    shortDesc: 'Wisdom hidden in the noise',
    icon: Lightbulb,
    color: '#a855f7',
    hoverDetails: [
      { label: 'Reality', value: 'You\'ve already written the answers' },
      { label: 'Problem', value: 'No synthesis or summarization' },
      { label: 'Impact', value: 'Keep making same mistakes' },
    ],
    example: '"The solution was in my journal from 3 months ago"',
  },
]

export function ProblemOverlay({ isVisible, onNext, transitionOpacity, isPreloading }: ProblemOverlayProps) {
  const content = STATE_CONTENT[STATES.CHAOS]
  const color = STATE_COLORS[STATES.CHAOS]
  const [hoveredProblem, setHoveredProblem] = useState<string | null>(null)

  return (
    <BaseOverlay isVisible={isVisible} transitionOpacity={transitionOpacity} isPreloading={isPreloading}>
      <div className="flex flex-col items-center justify-start text-center px-4 sm:px-6 max-w-4xl mx-auto py-2">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs"
          style={{ backgroundColor: `${color.hex}20`, color: color.hex, borderColor: `${color.hex}30` }}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          The Challenge
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
                { words: ['connections'], color: '#f87171', fontClass: 'font-space' },
                { words: ['hidden'], color: '#fbbf24', fontClass: 'font-playfair', italic: true },
                { words: ['noise'], color: '#f97316', fontClass: 'font-syne', uppercase: true },
              ]}
            />
          </p>
        </AnimatedText>

        {/* Problem cards grid with hover zoom */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-lg relative">
          {PROBLEMS.map((problem, index) => {
            const Icon = problem.icon
            const delay = 0.2 + index * 0.1
            const isHovered = hoveredProblem === problem.id

            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay }}
                onMouseEnter={() => setHoveredProblem(problem.id)}
                onMouseLeave={() => setHoveredProblem(null)}
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
                  <div
                    className={`bg-slate-900/95 backdrop-blur border rounded-lg text-left h-full transition-all duration-300 ${
                      isHovered ? 'p-3 shadow-2xl shadow-black/50' : 'p-2.5 sm:p-3'
                    }`}
                    style={{ borderColor: isHovered ? `${problem.color}60` : `${problem.color}40` }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        className={`rounded-lg flex items-center justify-center ${isHovered ? 'w-7 h-7' : 'w-6 h-6 sm:w-7 sm:h-7'}`}
                        style={{ backgroundColor: `${problem.color}20` }}
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={isVisible ? { rotate: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: delay + 0.1 }}
                      >
                        <Icon className={`${isHovered ? 'w-3.5 h-3.5' : 'w-3 h-3 sm:w-3.5 sm:h-3.5'}`} style={{ color: problem.color }} />
                      </motion.div>
                      <div>
                        <h3 className={`text-white font-medium ${isHovered ? 'text-xs' : 'text-[10px] sm:text-xs'}`}>
                          {problem.title}
                        </h3>
                        <p className={`text-white/40 ${isHovered ? 'text-[10px]' : 'text-[8px] sm:text-[10px]'}`}>
                          {problem.shortDesc}
                        </p>
                      </div>
                    </div>

                    {/* Expanded content on hover */}
                    {isHovered ? (
                      <div className="space-y-1.5">
                        {/* Detailed breakdown */}
                        {problem.hoverDetails.map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <span className="text-[8px] text-white/40 w-12 flex-shrink-0">{item.label}:</span>
                            <span className="text-[9px] font-medium" style={{ color: problem.color }}>{item.value}</span>
                          </motion.div>
                        ))}

                        {/* Example quote */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-2 pt-2 border-t border-white/10"
                        >
                          <p className="text-[8px] text-white/50 italic">
                            {problem.example}
                          </p>
                        </motion.div>
                      </div>
                    ) : (
                      /* Default state - pulsing indicator */
                      <motion.div
                        className="rounded px-2 py-1.5"
                        style={{ backgroundColor: `${problem.color}15` }}
                      >
                        <span className="text-[10px] sm:text-xs text-white/50">
                          Hover to explore
                        </span>
                      </motion.div>
                    )}

                    {/* Animated indicator dot */}
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: problem.color }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    />
                  </div>
                </motion.div>

                {/* Dim other cards when one is hovered */}
                {hoveredProblem && hoveredProblem !== problem.id && (
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

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-3 flex items-center gap-2 text-white/30 text-[10px] sm:text-xs"
        >
          <motion.div
            className="w-6 h-px bg-gradient-to-r from-transparent to-white/20"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ delay: 1, duration: 0.5 }}
          />
          <span>Hover to see the impact</span>
          <motion.div
            className="w-6 h-px bg-gradient-to-l from-transparent to-white/20"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ delay: 1, duration: 0.5 }}
          />
        </motion.div>

        {/* CTA to next section */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          onClick={onNext}
          className="mt-6 sm:mt-10 group flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300"
        >
          <span className="text-sm sm:text-base font-medium tracking-wide">Find The Shift</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </motion.button>
      </div>
    </BaseOverlay>
  )
}

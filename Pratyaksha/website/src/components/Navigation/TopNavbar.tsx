import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { SECTION_CONFIG, type SectionPhase } from '@/lib/constants'

interface TopNavbarProps {
  progress: number
  currentPhase: SectionPhase
  sectionProgress: number
}

export function TopNavbar({ progress, currentPhase, sectionProgress }: TopNavbarProps) {
  // Get section info
  const sections = useMemo(() => {
    return Object.entries(SECTION_CONFIG).map(([key, config]) => ({
      id: key,
      label: config.label,
      start: config.start,
      end: config.end,
      type: config.type,
    }))
  }, [])

  // Find current text section for label
  const currentSection = useMemo(() => {
    return sections.find(s => progress >= s.start && progress < s.end)
  }, [progress, sections])

  // Calculate progress within current text section (for the progress bar)
  const textSectionProgress = useMemo(() => {
    if (currentPhase.type !== 'text') return 0
    return sectionProgress
  }, [currentPhase, sectionProgress])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-white/80 font-medium hidden sm:block">Pratyaksha</span>
        </div>

        {/* Center - Section indicator with progress */}
        <div className="flex flex-col items-center gap-1">
          {/* Current section label */}
          <motion.span
            key={currentSection?.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/60 text-xs uppercase tracking-wider"
          >
            {currentPhase.type === 'animation' ? 'Transitioning...' : currentSection?.label || ''}
          </motion.span>

          {/* Progress bar */}
          <div className="w-32 sm:w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/50 rounded-full"
              style={{ width: `${currentPhase.type === 'text' ? textSectionProgress * 100 : 0}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Right side - Overall progress indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((idx) => {
              const sectionStart = idx * 0.2
              const isActive = progress >= sectionStart
              const isCurrent = progress >= sectionStart && progress < sectionStart + 0.2
              return (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isCurrent ? 'bg-white scale-125' : isActive ? 'bg-white/50' : 'bg-white/20'
                  }`}
                />
              )
            })}
          </div>
          <span className="text-white/40 text-xs font-mono">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>
    </motion.nav>
  )
}

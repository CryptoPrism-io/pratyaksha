import { motion, AnimatePresence } from 'framer-motion'
import { type StepConfig, STEPS, TEXT_STEP_INDICES } from '@/hooks/useStepScroll'
import { ArrowRight, Sparkles } from 'lucide-react'

interface StepNavbarProps {
  currentStep: number
  totalSteps: number
  stepConfig: StepConfig
  isLocked: boolean
  onNavigate: (textStepIndex: number) => void
}

// Journey step labels - evocative story arc
const JOURNEY_STEPS = [
  { label: 'Awaken', shortLabel: 'I' },
  { label: 'The Chaos', shortLabel: 'II' },
  { label: 'The Shift', shortLabel: 'III' },
  { label: 'The Light', shortLabel: 'IV' },
  { label: 'Begin', shortLabel: 'V' },
]

export function StepNavbar({ currentStep, totalSteps, stepConfig, isLocked, onNavigate }: StepNavbarProps) {
  const textSteps = STEPS.filter(s => s.type === 'text')
  const currentTextStepIndex = textSteps.findIndex(s =>
    s.state === stepConfig.state && s.type === 'text'
  )
  const isAtEnd = currentStep === totalSteps - 1

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
      role="navigation"
      aria-label="Experience navigation"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main navbar row */}
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-white font-semibold text-sm leading-tight">Pratyaksha</span>
              <span className="text-white/40 text-[10px] leading-tight">Cognitive Journal</span>
            </div>
          </motion.a>

          {/* Center - Journey Timeline (desktop) */}
          <div className="hidden md:flex items-center gap-1" role="tablist" aria-label="Journey sections">
            {JOURNEY_STEPS.map((step, idx) => {
              const isActive = currentTextStepIndex >= idx
              const isCurrent = currentTextStepIndex === idx && stepConfig.type === 'text'
              const canClick = !isLocked && TEXT_STEP_INDICES[idx] !== currentStep

              return (
                <div key={idx} className="flex items-center">
                  <motion.button
                    onClick={() => canClick && onNavigate(idx)}
                    disabled={isLocked}
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`Go to ${step.label} section`}
                    className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      isCurrent
                        ? 'text-white'
                        : isActive
                          ? 'text-white/70 hover:text-white'
                          : 'text-white/40 hover:text-white/60'
                    } ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
                    whileHover={canClick ? { scale: 1.05 } : {}}
                    whileTap={canClick ? { scale: 0.95 } : {}}
                  >
                    {/* Active background pill */}
                    {isCurrent && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute inset-0 bg-white/15 backdrop-blur-sm rounded-full border border-white/20"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{step.label}</span>
                  </motion.button>

                  {/* Connector line */}
                  {idx < JOURNEY_STEPS.length - 1 && (
                    <div className={`w-4 h-px mx-0.5 transition-colors duration-300 ${
                      currentTextStepIndex > idx ? 'bg-white/40' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile - Compact step indicator */}
          <div className="flex md:hidden items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={stepConfig.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-white/80 text-sm font-medium"
              >
                {stepConfig.type === 'animation' ? '...' : JOURNEY_STEPS[currentTextStepIndex]?.label || ''}
              </motion.span>
            </AnimatePresence>
            <div className="flex items-center gap-1">
              {JOURNEY_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => !isLocked && onNavigate(idx)}
                  disabled={isLocked}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    currentTextStepIndex === idx
                      ? 'bg-white w-4'
                      : currentTextStepIndex > idx
                        ? 'bg-white/50'
                        : 'bg-white/20'
                  }`}
                  aria-label={`Go to ${JOURNEY_STEPS[idx].label}`}
                />
              ))}
            </div>
          </div>

          {/* Right - CTA Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => !isAtEnd && onNavigate(4)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isAtEnd
                ? 'bg-white text-gray-900 shadow-lg shadow-white/20'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30'
            }`}
          >
            <span className="hidden sm:inline">{isAtEnd ? 'Start Your Journey' : 'Skip Ahead'}</span>
            <span className="sm:hidden">{isAtEnd ? 'Begin' : 'Skip'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Progress bar - subtle and elegant */}
        <div className="mt-2 h-px bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-white/30 via-white/50 to-white/30"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.nav>
  )
}

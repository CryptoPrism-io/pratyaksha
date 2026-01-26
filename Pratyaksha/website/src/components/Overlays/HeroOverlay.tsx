import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BaseOverlay } from './BaseOverlay'
import { ChevronDown, Play, ArrowRight, Sparkles } from 'lucide-react'

// Value propositions that cycle
const VALUE_PROPS = [
  "hold up a mirror you can't look away from.",
  "make the unconscious conscious — one entry at a time.",
  "track the lies you tell yourself.",
  "witness your mind without judgment — and reflect it back.",
  "confront you with data, not opinions.",
  "architect a visual blueprint of your mind.",
  "accelerate the self-awareness timeline.",
]

// Cycling value prop component
function CyclingValueProp({ isVisible, startDelay = 3.5 }: { isVisible: boolean; startDelay?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    // Start after initial delay
    const startTimer = setTimeout(() => {
      setHasStarted(true)
    }, startDelay * 1000)

    return () => clearTimeout(startTimer)
  }, [isVisible, startDelay])

  useEffect(() => {
    if (!hasStarted) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % VALUE_PROPS.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [hasStarted])

  if (!hasStarted) return null

  return (
    <div className="min-h-[3rem] flex items-center justify-center w-full max-w-lg mx-auto px-4">
      <p className="text-sm sm:text-base text-left leading-relaxed">
        <span className="text-white font-bold">Pratyaksha.AI</span>
        <span className="text-white/40 mx-1">—</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white/60"
          >
            {VALUE_PROPS[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </p>
    </div>
  )
}

// Typewriter effect component
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.03,
            delay: delay + i * 0.05,
            ease: 'easeOut',
          }}
          style={{
            display: 'inline',
            color: char === '.' ? '#a78bfa' : undefined,
          }}
        >
          {char}
        </motion.span>
      ))}
      {/* Blinking cursor */}
      <motion.span
        className="inline-block w-0.5 h-5 ml-1 align-middle"
        style={{ backgroundColor: '#a78bfa' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: delay + text.length * 0.05,
        }}
      />
    </span>
  )
}

interface HeroOverlayProps {
  isVisible: boolean
  onNext?: () => void
  transitionOpacity?: number
  isPreloading?: boolean
}

export function HeroOverlay({ isVisible, onNext, transitionOpacity, isPreloading }: HeroOverlayProps) {
  const [isDefinitionHovered, setIsDefinitionHovered] = useState(false)

  return (
    <BaseOverlay isVisible={isVisible} transitionOpacity={transitionOpacity} isPreloading={isPreloading}>
      {/* 4-Corner Vertical Branding */}
      {/* Top Left - Hook sentence */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="fixed top-6 left-6 sm:top-8 sm:left-8 z-20 max-w-[140px] sm:max-w-[180px]"
      >
        <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed font-light tracking-wide">
          The patterns you can't see are the ones controlling you.
        </p>
      </motion.div>

      {/* Top Right - Sanskrit */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="fixed top-6 right-6 sm:top-8 sm:right-8 z-20"
      >
        <span
          className="text-xl sm:text-2xl md:text-3xl text-white/30 font-bold"
          style={{ fontFamily: 'serif' }}
        >
          प्रत्यक्ष
        </span>
      </motion.div>

      {/* Bottom Left - Pratyaksha name */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-20"
      >
        <span className="text-xs sm:text-sm font-semibold tracking-widest text-white/30 uppercase">
          Pratyaksha
        </span>
      </motion.div>

      {/* Bottom Right - Logo */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-20"
      >
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)' }}
        >
          <img src="/brain.svg" alt="Pratyaksha" className="w-5 h-5 sm:w-6 sm:h-6 opacity-50" />
        </div>
      </motion.div>

      <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto relative">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.2)',
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#a78bfa' }} />
            <span className="text-sm font-medium" style={{ color: '#c4b5fd' }}>
              Your mind, visualized with 4 AI agents
            </span>
          </div>
        </motion.div>

        {/* Main Title - Large Sanskrit with glow */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-2 text-white"
          style={{
            fontFamily: 'serif',
            textShadow: '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(168,85,247,0.6), 0 0 120px rgba(236,72,153,0.4)',
          }}
        >
          <motion.span
            animate={{
              textShadow: [
                '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(168,85,247,0.6), 0 0 120px rgba(236,72,153,0.4)',
                '0 0 60px rgba(255,255,255,0.7), 0 0 100px rgba(236,72,153,0.7), 0 0 140px rgba(168,85,247,0.5)',
                '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(168,85,247,0.6), 0 0 120px rgba(236,72,153,0.4)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            प्रत्यक्ष
          </motion.span>
        </motion.h1>

        {/* English transliteration - bright gradient */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8"
        >
          <motion.span
            style={{
              background: 'linear-gradient(90deg, #ffffff, #f0abfc, #ffffff, #c4b5fd, #ffffff)',
              backgroundSize: '400% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.5))',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          >
            Pratyaksha
          </motion.span>
        </motion.h2>

        {/* Dictionary-style definition - hover to reveal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8 sm:mb-10 text-center"
          onMouseEnter={() => setIsDefinitionHovered(true)}
          onMouseLeave={() => setIsDefinitionHovered(false)}
        >
          <motion.div
            className="inline-block text-left px-4 py-3 rounded-lg cursor-pointer transition-all duration-300"
            style={{
              backgroundColor: isDefinitionHovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
              border: isDefinitionHovered ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.08)'
            }}
            animate={{ scale: isDefinitionHovered ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-white/90 font-medium tracking-wide">pra·tyak·sha</span>
              <span className="text-white/40 text-xs sm:text-sm">/prəˈtyɑːkʃə/</span>
              <span className="text-purple-400/70 text-xs sm:text-sm italic">noun, Sanskrit</span>
              {!isDefinitionHovered && (
                <span className="text-white/30 text-[10px] ml-1">hover for meaning</span>
              )}
            </div>
            <AnimatePresence>
              {isDefinitionHovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-white/60 text-sm leading-relaxed mt-2 mb-2">
                    Direct perception; non-erroneous cognition arising from the contact of sense-organs with their objects — unmediated, unchanging, and free from doubt.
                  </p>
                  <p className="text-white/30 text-[10px] sm:text-xs italic">
                    — Nyāyasūtra I.i.4, Akṣapāda Gautama (2nd century BCE)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-4"
        >
          <motion.a
            href="https://pratyaksha-963362833537.asia-south1.run.app/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold shadow-lg transition-all"
            style={{
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              boxShadow: '0 10px 40px -10px rgba(168, 85, 247, 0.4)',
            }}
          >
            Decode Your Patterns
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>

          <motion.a
            href="https://pratyaksha-963362833537.asia-south1.run.app"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-8 py-4 rounded-full border text-white font-medium transition-all"
            style={{
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Play className="w-4 h-4" />
            Watch Demo
          </motion.a>
        </motion.div>

        {/* Cycling value prop - below CTA */}
        <CyclingValueProp isVisible={isVisible} startDelay={1.5} />

        {/* Radial glow at center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          }}
        />
      </div>
    </BaseOverlay>
  )
}

import { motion } from 'framer-motion'
import { BaseOverlay, AnimatedText, TypewriterText } from './BaseOverlay'
import { ChevronDown, Play, ArrowRight } from 'lucide-react'

interface HeroOverlayProps {
  isVisible: boolean
  onNext?: () => void
  transitionOpacity?: number
  isPreloading?: boolean
}

// Particle configuration for ambient effect - reduced from 30 to 10 for performance
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 2,
}))

// Floating orbs for depth
const ORBS = [
  { size: 200, x: '15%', y: '20%', color: 'rgba(147, 51, 234, 0.1)', blur: 80 },
  { size: 150, x: '80%', y: '70%', color: 'rgba(59, 130, 246, 0.1)', blur: 60 },
  { size: 100, x: '70%', y: '25%', color: 'rgba(236, 72, 153, 0.08)', blur: 50 },
]

export function HeroOverlay({ isVisible, onNext, transitionOpacity, isPreloading }: HeroOverlayProps) {
  return (
    <BaseOverlay isVisible={isVisible} transitionOpacity={transitionOpacity} isPreloading={isPreloading}>
      <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto relative">

        {/* Ambient floating orbs */}
        {ORBS.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: orb.color,
              filter: `blur(${orb.blur}px)`,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Sanskrit title with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-2 sm:mb-4"
        >
          {/* Glow effect behind text */}
          <motion.div
            className="absolute inset-0 blur-2xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-purple-500/50">
              प्रत्यक्ष
            </span>
          </motion.div>

          {/* Main Sanskrit text */}
          <motion.h1
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white relative"
            style={{ fontFamily: 'serif' }}
            animate={{
              textShadow: [
                '0 0 20px rgba(255,255,255,0.3)',
                '0 0 40px rgba(255,255,255,0.5)',
                '0 0 20px rgba(255,255,255,0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            प्रत्यक्ष
          </motion.h1>
        </motion.div>

        {/* English transliteration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <span className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light tracking-[0.3em] uppercase">
            Pratyaksha
          </span>
        </motion.div>

        {/* Meaning/tagline */}
        <AnimatedText delay={0.5} animation="slideUp">
          <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-md mb-4 italic">
            "Direct Perception"
          </p>
        </AnimatedText>

        {/* Subline description with typewriter effect */}
        <AnimatedText delay={0.7} animation="slideUp">
          <p className="text-sm sm:text-base md:text-lg text-white/50 max-w-xl">
            <TypewriterText
              text="See your mind clearly. Understand your patterns. Transform your thoughts."
              delay={0.5}
              speed={18}
              highlights={[
                { words: ['mind'], color: '#a78bfa', fontClass: 'font-playfair', italic: true },
                { words: ['patterns'], color: '#60a5fa', fontClass: 'font-syne', uppercase: true },
                { words: ['Transform'], color: '#34d399', fontClass: 'font-cabinet' },
              ]}
            />
          </p>
        </AnimatedText>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8 sm:mt-12 w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <motion.a
              href="https://pratyaksha-963362833537.asia-south1.run.app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-full bg-white text-gray-900 font-medium text-sm flex items-center gap-2 hover:bg-white/90 transition-colors"
            >
              Explore Dashboard
              <ArrowRight className="w-4 h-4" />
            </motion.a>

            <motion.a
              href="https://pratyaksha-963362833537.asia-south1.run.app"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-full border border-white/30 text-white font-medium text-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </motion.a>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={onNext}
            className="mt-4 group flex flex-col items-center gap-1 text-white/50 hover:text-white/70 transition-colors"
          >
            <span className="text-xs tracking-wide">or scroll to explore</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Radial glow at center */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </BaseOverlay>
  )
}

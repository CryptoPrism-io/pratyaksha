import { motion } from 'framer-motion'
import { BaseOverlay, AnimatedText, TypewriterText } from './BaseOverlay'
import { ChevronDown, Play, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

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
          <div
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
          />
        ))}

        {/* Sanskrit title with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-2 sm:mb-4"
        >
          {/* Main Sanskrit text - solid, no glow */}
          <h1
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white relative"
            style={{ fontFamily: 'serif' }}
          >
            प्रत्यक्ष
          </h1>
        </motion.div>

        {/* English transliteration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <span className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light tracking-[0.3em] uppercase">
            Becoming
          </span>
        </motion.div>

        {/* Meaning/tagline */}
        <AnimatedText delay={0.5} animation="slideUp">
          <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-md mb-4 italic">
            "Your Journey of Transformation"
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
                { words: ['mind'], color: '#a78bfa', fontClass: 'font-space', italic: true },
                { words: ['patterns'], color: '#60a5fa', fontClass: 'font-space', uppercase: true },
                { words: ['Transform'], color: '#34d399', fontClass: 'font-space' },
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
            <Link
              to="/dashboard"
              className="px-6 py-2.5 rounded-full bg-white text-gray-900 font-medium text-sm flex items-center gap-2 hover:bg-white/90 transition-colors"
            >
              Explore Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/logs"
              className="px-6 py-2.5 rounded-full border border-white/30 text-white font-medium text-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Journaling
            </Link>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={onNext}
            className="mt-4 group flex flex-col items-center gap-1 text-white/50 hover:text-white/70 transition-colors"
          >
            <span className="text-xs tracking-wide">or scroll to explore</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white/30"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
            />
          ))}
        </div>

        {/* Radial glow at center - static */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>
    </BaseOverlay>
  )
}

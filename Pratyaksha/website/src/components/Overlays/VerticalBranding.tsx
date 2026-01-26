import { motion } from 'framer-motion'

type AnimationStyle = 'glow' | 'pulse' | 'shake' | 'breathe' | 'flicker'

interface VerticalBrandingProps {
  isVisible: boolean
  animationStyle?: AnimationStyle
}

const animations = {
  glow: {
    textShadow: [
      '0 0 0px rgba(167,139,250,0)',
      '0 0 15px rgba(167,139,250,0.6)',
      '0 0 0px rgba(167,139,250,0)',
    ],
  },
  pulse: {
    scale: [1, 1.02, 1],
    opacity: [0.3, 0.6, 0.3],
  },
  shake: {
    x: [0, -1, 1, -1, 0],
    opacity: [0.3, 0.5, 0.3],
  },
  breathe: {
    opacity: [0.2, 0.5, 0.2],
    letterSpacing: ['0.2em', '0.35em', '0.2em'],
  },
  flicker: {
    opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
  },
}

export function VerticalBranding({ isVisible, animationStyle = 'glow' }: VerticalBrandingProps) {
  const leftAnimation = animations[animationStyle]
  const rightAnimation = animations[animationStyle === 'glow' ? 'pulse' : animationStyle === 'pulse' ? 'breathe' : animationStyle]

  return (
    <>
      {/* Left Side - Bottom to Top */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 hidden sm:block"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}
      >
        <motion.div
          className="flex items-center gap-3"
          animate={isVisible ? leftAnimation : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[10px] sm:text-xs text-white/30 tracking-[0.3em] uppercase">
            Pratyaksha
          </span>
          <span className="text-white/20">—</span>
          <div className="flex items-center gap-0.5">
            <span
              className="text-base sm:text-lg font-bold text-white/40"
              style={{ fontFamily: 'serif' }}
            >
              प्र
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-white/40">.AI</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side - Top to Bottom */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 hidden sm:block"
        style={{ writingMode: 'vertical-rl' }}
      >
        <motion.div
          className="flex items-center gap-3"
          animate={isVisible ? rightAnimation : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span
            className="text-base sm:text-lg font-bold text-white/30"
            style={{ fontFamily: 'serif' }}
          >
            प्रत्यक्ष
          </span>
          <span className="text-white/20">—</span>
          <span className="text-[9px] sm:text-[10px] text-white/20 tracking-wide">
            Direct perception
          </span>
        </motion.div>
      </motion.div>
    </>
  )
}

import { ReactNode, useState, useEffect } from 'react'
import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BaseOverlayProps {
  isVisible: boolean
  children: ReactNode
  className?: string
  // New props for smooth cross-fade transitions
  transitionOpacity?: number  // 0-1, controlled opacity during animation
  isPreloading?: boolean      // True when preloading (content fades slower than blur)
}

export function BaseOverlay({
  isVisible,
  children,
  className,
  transitionOpacity = 1,
  isPreloading = false,
}: BaseOverlayProps) {
  // Don't render if not visible and no transition opacity
  if (!isVisible) return null

  // Calculate actual opacities
  // During preload: blur comes in faster than content for smooth feel
  const blurOpacity = transitionOpacity
  const contentOpacity = isPreloading
    ? Math.max(0, (transitionOpacity - 0.3) / 0.7)  // Content starts at 30% blur progress
    : transitionOpacity

  // Use stepped blur values for better GPU performance (avoid constant repaints)
  // Steps: 0, 4, 8, 12 instead of continuous 0-12
  const blurSteps = [0, 4, 8, 12]
  const blurIndex = Math.min(Math.round(blurOpacity * 3), 3)
  const blurAmount = blurSteps[blurIndex]

  return (
    <>
      {/* Backdrop blur - leads the transition */}
      <motion.div
        initial={false}
        animate={{
          opacity: blurOpacity,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed inset-0 z-[9] bg-black/30"
        style={{
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
        }}
      />
      {/* Content overlay - follows slightly behind */}
      <motion.div
        initial={false}
        animate={{
          opacity: contentOpacity,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn('overlay-container content-overlay', className)}
        style={{
          pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none',
        }}
      >
        {children}
      </motion.div>
    </>
  )
}

// Pop animation variants
const popVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 30,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    filter: 'blur(5px)',
    transition: { duration: 0.2 },
  },
}

// Slide up with spring
const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  },
}

// Scale in from center
const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
}

// Fade in with slight rotation
const rotateInVariants: Variants = {
  hidden: {
    opacity: 0,
    rotateX: -15,
    y: 20,
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 250,
      damping: 20,
    },
  },
}

type AnimationType = 'pop' | 'slideUp' | 'scaleIn' | 'rotateIn'

const variantMap: Record<AnimationType, Variants> = {
  pop: popVariants,
  slideUp: slideUpVariants,
  scaleIn: scaleInVariants,
  rotateIn: rotateInVariants,
}

// Creative animated text component with multiple animation types
export function AnimatedText({
  children,
  delay = 0,
  className,
  animation = 'pop',
  style,
}: {
  children: ReactNode
  delay?: number
  className?: string
  animation?: AnimationType
  style?: React.CSSProperties
}) {
  const variants = variantMap[animation]

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay }}
      className={className}
      style={{ perspective: 1000, ...style }}
    >
      {children}
    </motion.div>
  )
}

// Staggered container for children animations
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
  initialDelay?: number
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Child item for staggered animations
export function StaggerItem({
  children,
  className,
  animation = 'pop',
}: {
  children: ReactNode
  className?: string
  animation?: AnimationType
}) {
  const variants = variantMap[animation]

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  )
}

// Glass card component with better contrast
export function GlassCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('glass-card-dark p-6', className)}>
      {children}
    </div>
  )
}

// Animated glass card with hover effects
export function AnimatedGlassCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 },
      }}
      className={cn('glass-card-dark p-6', className)}
    >
      {children}
    </motion.div>
  )
}

// Text reveal animation (word by word)
export function TextReveal({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const words = text.split(' ')

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
              },
            },
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

// Highlight configuration for keywords
export interface HighlightConfig {
  words: string[]
  color: string
  underline?: boolean
  fontClass?: string  // e.g., 'font-playfair', 'font-syne', 'font-space'
  italic?: boolean
  bold?: boolean
  uppercase?: boolean
}

// Typewriter animation component with keyword highlighting
export function TypewriterText({
  text,
  className,
  delay = 0,
  speed = 30,
  showCursor = true,
  highlights = [],
}: {
  text: string
  className?: string
  delay?: number
  speed?: number // ms per character
  showCursor?: boolean
  highlights?: HighlightConfig[]
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('')
    setHasStarted(false)
    setIsTyping(false)

    // Start after delay
    const startTimeout = setTimeout(() => {
      setHasStarted(true)
      setIsTyping(true)
    }, delay * 1000)

    return () => clearTimeout(startTimeout)
  }, [text, delay])

  useEffect(() => {
    if (!hasStarted || !isTyping) return

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [displayedText, text, speed, hasStarted, isTyping])

  // Render text with highlights
  const renderHighlightedText = (textToRender: string) => {
    if (highlights.length === 0) return textToRender

    // Build a regex pattern for all highlight words
    const allWords = highlights.flatMap(h => h.words)
    if (allWords.length === 0) return textToRender

    // Create pattern that matches whole words (case insensitive)
    const pattern = new RegExp(`(${allWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = textToRender.split(pattern)

    return parts.map((part, index) => {
      // Check if this part matches any highlight
      const highlight = highlights.find(h =>
        h.words.some(w => w.toLowerCase() === part.toLowerCase())
      )

      if (highlight) {
        const classes = [
          highlight.underline !== false ? 'underline decoration-2 underline-offset-4' : '',
          highlight.fontClass || '',
          highlight.italic ? 'italic' : '',
          highlight.bold !== false ? 'font-semibold' : '',
          highlight.uppercase ? 'uppercase tracking-wider' : '',
        ].filter(Boolean).join(' ')

        return (
          <span
            key={index}
            className={classes}
            style={{ color: highlight.color }}
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <span className={className}>
      {renderHighlightedText(displayedText)}
      {showCursor && (
        <motion.span
          animate={{ opacity: isTyping ? 1 : [1, 0] }}
          transition={isTyping ? {} : { duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block ml-0.5 -mb-0.5 w-[2px] h-[1em] bg-current align-middle"
        />
      )}
    </span>
  )
}

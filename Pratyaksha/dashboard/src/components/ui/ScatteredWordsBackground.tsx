import { useMemo, useState, useEffect, useRef } from "react"

// Positive aspirational words
const words = [
  "peaceful", "graceful", "serene", "gentle", "calm",
  "present", "grounded", "centered", "whole", "clear",
  "grateful", "mindful", "patient", "kind", "loving",
  "honest", "true", "authentic", "genuine", "humble",
  "brave", "resilient", "strong", "wise", "balanced",
  "focused", "driven", "inspired", "creative", "curious",
  "joyful", "content", "fulfilled", "radiant", "alive",
  "flourishing", "thriving", "growing", "evolving", "blooming",
  "elegant", "refined", "luminous", "worthy", "capable",
  "better", "wiser", "calmer", "smarter", "kinder",
  "healthier", "happier", "freer", "bolder", "softer",
  "confident", "powerful", "fearless", "limitless", "infinite",
  "magnetic", "brilliant", "shining", "glowing", "soaring",
  "trusted", "respected", "admired", "successful", "purposeful",
  "determined", "unstoppable", "rising", "ascending", "emerging",
  "awakening", "transforming", "transcending", "becoming", "being",
]

// Font variations
const fonts = [
  "font-space font-light",
  "font-space font-normal",
  "font-space font-medium",
  "font-space font-semibold",
  "font-space font-bold",
  "font-space font-light tracking-wide",
  "font-space font-normal tracking-wide",
]

// Colors - pastel teal, rose, amber
const colors = [
  "text-teal-800 dark:text-teal-300",
  "text-teal-900 dark:text-teal-200",
  "text-rose-800 dark:text-rose-300",
  "text-rose-900 dark:text-rose-200",
  "text-amber-800 dark:text-amber-300",
  "text-amber-900 dark:text-amber-200",
  "text-violet-800 dark:text-violet-300",
  "text-emerald-800 dark:text-emerald-300",
]

// Size classes
const sizes = [
  "text-[11px]",
  "text-[12px]",
  "text-[13px]",
  "text-[14px]",
  "text-[15px]",
  "text-[16px]",
  "text-[17px]",
  "text-[18px]",
]

interface WordItem {
  id: number
  word: string
  x: number
  y: number
  size: string
  font: string
  color: string
  rotation: number
  parallaxFactor: number // Different speeds for depth effect
}

// Generate scattered word positions with parallax factors
const generateWords = (count: number): WordItem[] => {
  const result: WordItem[] = []

  for (let i = 0; i < count; i++) {
    // Assign parallax factor based on size - larger words move faster (appear closer)
    const sizeIndex = Math.floor(Math.random() * sizes.length)
    const parallaxFactor = 0.1 + (sizeIndex / sizes.length) * 0.25 // 0.1 to 0.35

    result.push({
      id: i,
      word: words[i % words.length],
      x: Math.random() * 94 + 3,
      y: Math.random() * 92 + 4,
      size: sizes[sizeIndex],
      font: fonts[Math.floor(Math.random() * fonts.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: (Math.random() - 0.5) * 30,
      parallaxFactor,
    })
  }

  return result
}

interface ScatteredWordsBackgroundProps {
  wordCount?: number
  className?: string
  enableParallax?: boolean
}

export function ScatteredWordsBackground({
  wordCount = 150,
  className = "",
  enableParallax = true
}: ScatteredWordsBackgroundProps) {
  const wordItems = useMemo(() => generateWords(wordCount), [wordCount])
  const [scrollY, setScrollY] = useState(0)
  const rafRef = useRef<number>()

  // Smooth parallax scrolling
  useEffect(() => {
    if (!enableParallax) return

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [enableParallax])

  return (
    <div className={`fixed inset-0 -z-5 overflow-hidden pointer-events-none ${className}`}>
      {wordItems.map((item) => {
        const parallaxOffset = enableParallax ? scrollY * item.parallaxFactor : 0

        return (
          <div
            key={item.id}
            className={`absolute select-none pointer-events-auto cursor-default scattered-word ${item.size} ${item.font} ${item.color}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `rotate(${item.rotation}deg) translateX(-50%) translateY(calc(-50% - ${parallaxOffset}px))`,
              willChange: enableParallax ? 'transform' : 'auto',
            }}
          >
            {item.word}
          </div>
        )
      })}
    </div>
  )
}

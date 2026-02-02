import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

// Muted pastel color palette - elegant, not vibrant
const DARK_TEAL = "#115e59"    // teal-800 - muted
const DARK_ROSE = "#9f1239"    // rose-800 - muted
const DARK_BODY = "#1c1917"    // stone-900 - dark neutral
const DARK_AMBER = "#92400e"   // amber-800 - muted

// Single colors for tiny spawned moths
const SINGLE_COLORS = [DARK_TEAL, DARK_ROSE, DARK_AMBER]

// Orbiting moth - positioned relative to "Becoming" text
interface OrbitingMothProps {
  onPositionUpdate?: (x: number, y: number) => void
  isFluttering?: boolean
}

function OrbitingMoth({ onPositionUpdate, isFluttering = false }: OrbitingMothProps) {
  const ref = useRef<HTMLDivElement>(null)
  const animDuration = useMemo(() => 10 + Math.random() * 8, [])

  // Report position for collision detection
  useEffect(() => {
    if (!onPositionUpdate) return
    const interval = setInterval(() => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        onPositionUpdate(rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [onPositionUpdate])

  return (
    <div
      ref={ref}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
      style={{
        animation: `infinity-orbit ${animDuration}s linear infinite`,
        opacity: 0.8,
      }}
    >
      <MothSVG large fastFlutter={isFluttering} />
    </div>
  )
}

// Track cursor position for collision detection (global MothCursor handles visuals)
function useCursorTracker(onPosition: (x: number, y: number) => void) {
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      onPosition(e.clientX, e.clientY)
    }

    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [onPosition])
}

// Baby moth that flies to a word and sits on it
interface FreeFloatingMothProps {
  id: number
  variant: number
  startX: number
  startY: number
  targetX: number  // Target word position (viewport %)
  targetY: number
  onArrived?: (id: number) => void
}

function FreeFloatingMoth({ id, variant, startX, startY, targetX, targetY, onArrived }: FreeFloatingMothProps) {
  const [position, setPosition] = useState({ x: startX, y: startY })
  const [hasArrived, setHasArrived] = useState(false)
  const arrivedRef = useRef(false)

  // Pick a single color based on variant
  const color = SINGLE_COLORS[variant % SINGLE_COLORS.length]

  // Animate flying to target word
  useEffect(() => {
    const duration = 2000 + Math.random() * 1500 // 2-3.5 seconds flight
    const startTime = Date.now()

    // Convert target from % to viewport pixels
    const targetPxX = (targetX / 100) * window.innerWidth
    const targetPxY = (targetY / 100) * window.innerHeight

    let animationFrame: number

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Smooth ease-out for natural flight
      const eased = 1 - Math.pow(1 - progress, 3)

      // Add slight wobble during flight
      const wobbleX = Math.sin(progress * Math.PI * 4) * (1 - progress) * 20
      const wobbleY = Math.cos(progress * Math.PI * 3) * (1 - progress) * 15

      const newX = startX + (targetPxX - startX) * eased + wobbleX
      const newY = startY + (targetPxY - startY) * eased + wobbleY

      setPosition({ x: newX, y: newY })

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        // Arrived at target
        setHasArrived(true)
        if (!arrivedRef.current) {
          arrivedRef.current = true
          onArrived?.(id)
        }
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [id, startX, startY, targetX, targetY, onArrived])

  // Gentle hover animation when sitting on word
  const hoverOffset = hasArrived ? Math.sin(Date.now() / 500) * 2 : 0

  return (
    <div
      className="absolute pointer-events-none transition-transform"
      style={{
        left: position.x - 8,
        top: position.y - 5 + hoverOffset,
        opacity: 0.9,
        transform: `rotate(${hasArrived ? 0 : Math.sin(Date.now() / 200) * 15}deg)`,
      }}
    >
      <TinyMothSVG color={color} />
    </div>
  )
}

// Tiny single-color moth for spawned moths
function TinyMothSVG({ color }: { color: string }) {

  return (
    <svg width={16} height={10} viewBox="0 0 80 50">
      {/* Left wing - single color */}
      <ellipse
        cx="25" cy="25" rx="16" ry="10"
        fill={color}
        opacity="0.9"
        className="animate-wing-left"
        style={{ transformOrigin: "40px 25px" }}
      />
      {/* Right wing - single color */}
      <ellipse
        cx="55" cy="25" rx="16" ry="10"
        fill={color}
        opacity="0.9"
        className="animate-wing-right"
        style={{ transformOrigin: "40px 25px" }}
      />
      {/* Body */}
      <ellipse cx="40" cy="25" rx="2" ry="8" fill={DARK_BODY} opacity="0.9" />
    </svg>
  )
}

// Separate moth SVG component for reuse - with variants
function MothSVG({ small = false, large = false, variant = 0, fastFlutter = false }: { small?: boolean; large?: boolean; variant?: number; fastFlutter?: boolean }) {
  const size = large ? 80 : small ? 32 : 50
  const scale = large ? 1 : small ? 0.4 : 0.65
  const uniqueId = useMemo(() => `moth-${variant}-${Math.random().toString(36).slice(2, 9)}`, [variant])

  // Variant determines gradient direction and wing shape slightly
  const gradientAngles = [
    { l: { x1: "100%", y1: "0%", x2: "0%", y2: "100%" }, r: { x1: "0%", y1: "0%", x2: "100%", y2: "100%" } },
    { l: { x1: "0%", y1: "100%", x2: "100%", y2: "0%" }, r: { x1: "100%", y1: "100%", x2: "0%", y2: "0%" } },
    { l: { x1: "50%", y1: "0%", x2: "50%", y2: "100%" }, r: { x1: "50%", y1: "0%", x2: "50%", y2: "100%" } },
    { l: { x1: "0%", y1: "50%", x2: "100%", y2: "50%" }, r: { x1: "100%", y1: "50%", x2: "0%", y2: "50%" } },
  ]
  const angle = gradientAngles[variant % gradientAngles.length]

  // Slight wing size variations
  const wingRx = 18 + (variant % 3) - 1
  const wingRy = 12 + (variant % 2)

  // Wing animation class - 10x faster when fluttering
  const wingLeftClass = fastFlutter ? "animate-wing-left-fast" : "animate-wing-left"
  const wingRightClass = fastFlutter ? "animate-wing-right-fast" : "animate-wing-right"

  return (
    <svg
      width={size}
      height={size * 0.625}
      viewBox="0 0 80 50"
      style={{ transform: `scale(${scale})` }}
    >
      <defs>
        <linearGradient id={`${uniqueId}-wingL`} x1={angle.l.x1} y1={angle.l.y1} x2={angle.l.x2} y2={angle.l.y2}>
          <stop offset="0%" stopColor={DARK_TEAL} />
          <stop offset="100%" stopColor={DARK_ROSE} />
        </linearGradient>
        <linearGradient id={`${uniqueId}-wingR`} x1={angle.r.x1} y1={angle.r.y1} x2={angle.r.x2} y2={angle.r.y2}>
          <stop offset="0%" stopColor={DARK_TEAL} />
          <stop offset="100%" stopColor={DARK_ROSE} />
        </linearGradient>
      </defs>
      {/* Left wing */}
      <ellipse
        cx="25" cy="25" rx={wingRx} ry={wingRy}
        fill={`url(#${uniqueId}-wingL)`}
        opacity="0.85"
        className={wingLeftClass}
        style={{ transformOrigin: "40px 25px" }}
      />
      {/* Right wing */}
      <ellipse
        cx="55" cy="25" rx={wingRx} ry={wingRy}
        fill={`url(#${uniqueId}-wingR)`}
        opacity="0.85"
        className={wingRightClass}
        style={{ transformOrigin: "40px 25px" }}
      />
      {/* Body */}
      <ellipse cx="40" cy="25" rx="2.5" ry="10" fill={DARK_BODY} opacity="0.9" />
      {/* Antennae */}
      <line x1="38" y1="16" x2="33" y2="9" stroke={DARK_BODY} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="42" y1="16" x2="47" y2="9" stroke={DARK_BODY} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

// Positive aspirational words - elegant, uplifting, transformative
const scatterWords = [
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

// Space Grotesk with different weights for variety
const fonts = [
  "font-space font-light",
  "font-space font-normal",
  "font-space font-medium",
  "font-space font-semibold",
  "font-space font-bold",
  "font-space font-light tracking-wide",
  "font-space font-normal tracking-wide",
  "font-space font-medium tracking-wide",
  "font-space font-semibold tracking-tight",
  "font-space font-bold tracking-tight",
]

// High contrast colors - bright on dark, dark on light
const colors = [
  // Light mode: dark colors | Dark mode: bright colors
  "text-teal-800 dark:text-teal-300",
  "text-teal-900 dark:text-teal-200",
  "text-rose-800 dark:text-rose-300",
  "text-rose-900 dark:text-rose-200",
  "text-amber-800 dark:text-amber-300",
  "text-amber-900 dark:text-amber-200",
  "text-stone-800 dark:text-stone-200",
  "text-stone-900 dark:text-stone-100",
]

// Only allowed angles: 0°, 45°, 90°, -90°
const allowedAngles = [0, 45, 90, -90]

// Random sizes - range from 18px to 42px
const sizeClasses = [
  "text-[42px]", // largest
  "text-[40px]",
  "text-[38px]",
  "text-[36px]",
  "text-[34px]",
  "text-[32px]",
  "text-[30px]",
  "text-[28px]",
  "text-[26px]",
  "text-[24px]",
  "text-[22px]",
  "text-[21px]",
  "text-[20px]",
  "text-[19px]",
  "text-[18px]", // smallest
]

// Stats with numeric targets for animation
const stats = [
  { label: "AI Agents", value: 9, suffix: "", description: "Analyzing your patterns" },
  { label: "Visualizations", value: 10, suffix: "+", description: "See your journey" },
  { label: "Entry Types", value: 15, suffix: "", description: "Journal your way" },
]

// Animated counter component - counts from 0 to target with easing
function AnimatedCounter({ target, suffix = "", start }: { target: number; suffix?: string; start: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) {
      setCount(0)
      return
    }

    let startTime: number | null = null
    const duration = 1500 // 1.5 seconds total

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // For "increasing speed" effect, use ease-in-out but weighted toward end
      const easeInOut = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      const currentCount = Math.floor(easeInOut * target)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(animate)
  }, [start, target])

  return <>{count}{suffix}</>
}

// Size to approximate width/height in % for collision detection
const sizeToPercent: Record<string, { w: number; h: number }> = {
  "text-[42px]": { w: 12, h: 4 },
  "text-[40px]": { w: 11, h: 3.8 },
  "text-[38px]": { w: 10, h: 3.6 },
  "text-[36px]": { w: 9.5, h: 3.4 },
  "text-[34px]": { w: 9, h: 3.2 },
  "text-[32px]": { w: 8.5, h: 3 },
  "text-[30px]": { w: 8, h: 2.8 },
  "text-[28px]": { w: 7, h: 2.6 },
  "text-[26px]": { w: 6.5, h: 2.4 },
  "text-[24px]": { w: 6, h: 2.2 },
  "text-[22px]": { w: 5.5, h: 2 },
  "text-[21px]": { w: 5, h: 1.9 },
  "text-[20px]": { w: 4.8, h: 1.8 },
  "text-[19px]": { w: 4.5, h: 1.7 },
  "text-[18px]": { w: 4.2, h: 1.6 },
}

// Generate scattered word data - center-out reveal with Fibonacci sizing, no overlap
// Mobile gets 50% fewer words for performance
const generateScatteredWords = (isMobile: boolean = false) => {
  const words: Array<{
    id: number
    word: string
    x: number
    y: number
    size: string
    font: string
    color: string
    rotation: number
    opacity: number
    distanceFromCenter: number
    ring: number
    parallaxFactor: number // Different scroll speeds for depth effect
  }> = []

  const centerX = 50
  const centerY = 50
  const numWords = isMobile ? 200 : 1000 // 80% reduction for mobile

  // Track placed word bounding boxes
  const placedBoxes: Array<{ x: number; y: number; w: number; h: number }> = []

  const isInExclusionZone = (px: number, py: number) => {
    // Large exclusion zone around "Becoming" - no words here
    // Center zone: 20-80% width, 35-75% height
    const inBecomingZone = px > 20 && px < 80 && py > 35 && py < 75
    return inBecomingZone
  }

  const overlapsExisting = (x: number, y: number, w: number, h: number) => {
    for (const box of placedBoxes) {
      // Check bounding box overlap with padding
      const pad = 0.3
      if (
        x < box.x + box.w + pad &&
        x + w + pad > box.x &&
        y < box.y + box.h + pad &&
        y + h + pad > box.y
      ) {
        return true
      }
    }
    return false
  }

  for (let i = 0; i < numWords; i++) {
    const word = scatterWords[i % scatterWords.length]

    // Random size for variety
    const sizeIndex = Math.floor(Math.random() * sizeClasses.length)
    const size = sizeClasses[sizeIndex]
    const { w, h } = sizeToPercent[size] || { w: 3, h: 1.5 }

    // Try to place word without overlap
    let x = 0, y = 0, placed = false
    let attempts = 0
    const maxAttempts = 50

    while (!placed && attempts < maxAttempts) {
      x = Math.random() * (96 - w) + 2
      y = Math.random() * (94 - h) + 2

      if (!isInExclusionZone(x + w/2, y + h/2) && !overlapsExisting(x, y, w, h)) {
        placed = true
      }
      attempts++
    }

    if (!placed) continue // Skip if can't place without overlap

    // Calculate distance from center for reveal order
    const distanceFromTextCenter = Math.sqrt(
      Math.pow((x + w/2) - centerX, 2) + Math.pow(((y + h/2) - centerY) * 1.5, 2)
    )

    placedBoxes.push({ x, y, w, h })

    // Parallax factor based on size - larger words move faster (appear closer)
    const parallaxFactor = 0.05 + (sizeIndex / sizeClasses.length) * 0.2 // 0.05 to 0.25

    words.push({
      id: i,
      word,
      x: x + w/2, // Center position for CSS
      y: y + h/2,
      size,
      font: fonts[Math.floor(Math.random() * fonts.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: allowedAngles[Math.floor(Math.random() * allowedAngles.length)],
      opacity: 0.4 + Math.random() * 0.5, // Random opacity too
      distanceFromCenter: distanceFromTextCenter,
      ring: sizeIndex, // Just for reference
      parallaxFactor,
    })
  }

  // Sort by distance - center words first (for center-out reveal)
  words.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter)

  // Re-assign IDs after sorting
  return words.map((w, i) => ({ ...w, id: i }))
}

export function HeroIntro() {
  // Start directly in complete phase - no animation
  const [phase] = useState<"filling" | "transitioning" | "complete">("complete")

  // Detect mobile for performance optimization (fewer words)
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  }, [])

  // Left-to-right reveal state
  const [isFlickering, setIsFlickering] = useState(true)

  // Parallax scroll state
  const [scrollY, setScrollY] = useState(0)
  const rafRef = useRef<number>()

  // Smooth parallax scrolling effect
  useEffect(() => {
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
  }, [])

  // Moth collision and spawning state
  const [spawnedMoths, setSpawnedMoths] = useState<Array<{
    id: number
    variant: number
    x: number
    y: number
    targetWordIndex: number
    targetX: number
    targetY: number
  }>>([])
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [orbitMothPos, setOrbitMothPos] = useState({ x: -100, y: -100 })
  const [canSpawn, setCanSpawn] = useState(true)
  const [isCollisionFlutter, setIsCollisionFlutter] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  // Track which words have moths sitting on them
  const [mothsOnWords, setMothsOnWords] = useState<Set<number>>(new Set())

  // Handle when a moth arrives at its target word
  const handleMothArrived = useCallback((mothId: number) => {
    const moth = spawnedMoths.find(m => m.id === mothId)
    if (moth) {
      setMothsOnWords(prev => new Set([...prev, moth.targetWordIndex]))
    }
  }, [spawnedMoths])

  const MAX_MOTHS = 50

  // Handle cursor position update
  const handleCursorPosition = useCallback((x: number, y: number) => {
    setCursorPos({ x, y })
  }, [])

  // Track cursor for collision detection
  useCursorTracker(handleCursorPosition)

  // Handle orbit moth position update
  const handleOrbitMothPosition = useCallback((x: number, y: number) => {
    setOrbitMothPos({ x, y })
  }, [])

  // Generate scattered words first (needed for moth targets)
  // Mobile gets 60% fewer words for performance
  const scatteredWords = useMemo(() => generateScatteredWords(isMobile), [isMobile])

  // Check for collision between cursor and orbiting moth (only after animation)
  useEffect(() => {
    if (phase !== "complete" || !canSpawn) return
    if (orbitMothPos.x < 0 || cursorPos.x < 0) return // Not initialized

    const distance = Math.sqrt(
      Math.pow(cursorPos.x - orbitMothPos.x, 2) +
      Math.pow(cursorPos.y - orbitMothPos.y, 2)
    )

    // Collision threshold ~50px
    if (distance < 50 && spawnedMoths.length < MAX_MOTHS) {
      // Trigger 10x fast flutter on collision for both moths
      setIsCollisionFlutter(true)
      setTimeout(() => setIsCollisionFlutter(false), 500) // Flutter for 0.5s

      // Dispatch event for cursor moth to flutter too
      window.dispatchEvent(new CustomEvent("moth-collision-flutter"))

      // Pick a random word that doesn't already have a moth
      const availableWords = scatteredWords.filter((_, idx) => !mothsOnWords.has(idx))
      if (availableWords.length === 0) return

      const targetWord = availableWords[Math.floor(Math.random() * availableWords.length)]
      const targetWordIndex = scatteredWords.findIndex(w => w.id === targetWord.id)

      // Spawn new tiny moth that flies to the target word
      const newMoth = {
        id: Date.now(),
        variant: spawnedMoths.length,
        x: (cursorPos.x + orbitMothPos.x) / 2,
        y: (cursorPos.y + orbitMothPos.y) / 2,
        targetWordIndex,
        targetX: targetWord.x,
        targetY: targetWord.y,
      }
      setSpawnedMoths(prev => [...prev, newMoth])
      setCanSpawn(false)

      // Cooldown before next spawn
      setTimeout(() => setCanSpawn(true), 1500)
    }
  }, [phase, cursorPos, orbitMothPos, canSpawn, spawnedMoths.length, scatteredWords, mothsOnWords])

  // Outside-to-center reveal over 3 seconds with smooth easing
  const [revealProgress, setRevealProgress] = useState(0)
  const [becomingAlive, setBecomingAlive] = useState(false)

  useEffect(() => {
    if (!isFlickering) return

    const duration = 3000 // 3 seconds for smoother reveal
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      // Smooth ease-in-out cubic for fluid motion
      const linearProgress = Math.min(elapsed / duration, 1)
      const easedProgress = linearProgress < 0.5
        ? 4 * linearProgress * linearProgress * linearProgress
        : 1 - Math.pow(-2 * linearProgress + 2, 3) / 2

      setRevealProgress(easedProgress)

      if (linearProgress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setIsFlickering(false)
        // "Becoming" comes to life after words settle
        setTimeout(() => setBecomingAlive(true), 300)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [isFlickering])

  // Typing effect state - starts with "B" visible during initial animation
  const [typedText, setTypedText] = useState("B")
  const [showCursor, setShowCursor] = useState(false)
  const [cursorFlicker, setCursorFlicker] = useState(false)

  // Animate "Becoming" with typing effect: b (already shown) → be → ... → becoming...
  useEffect(() => {
    if (!becomingAlive) return

    // Flicker cursor 3 times rapidly
    const flickerCursor = (callback: () => void) => {
      let flicks = 0
      const flick = () => {
        setCursorFlicker(true)
        setTimeout(() => {
          setCursorFlicker(false)
          flicks++
          if (flicks < 3) {
            setTimeout(flick, 100)
          } else {
            setTimeout(callback, 150)
          }
        }, 80)
      }
      flick()
    }

    // Typing sequence - continues from "B" which is already visible
    const sequence = [
      { text: "Be", delay: 90 },
      { text: "Bec", delay: 90 },
      { text: "Beco", delay: 90 },
      { text: "Becom", delay: 90 },
      { text: "Become", delay: 90 },
      { text: "Become.", delay: "flicker" }, // First flicker - hesitation
      { text: "Become", delay: 120 },  // Backspace .
      { text: "Becom", delay: "flicker" },   // Second flicker - correction
      { text: "Becomi", delay: 90 },
      { text: "Becomin", delay: 90 },
      { text: "Becoming", delay: 90 },
      { text: "Becoming.", delay: 400 },   // First dot - deliberate
      { text: "Becoming..", delay: 600 },  // Second dot - building
      { text: "Becoming...", delay: "flicker-800" }, // Third dot - statement, then flicker
    ]

    let currentIndex = 0
    let timeoutId: ReturnType<typeof setTimeout>

    // Show cursor when typing continues
    setShowCursor(true)

    const typeNext = () => {
      if (currentIndex < sequence.length) {
        const step = sequence[currentIndex]
        setTypedText(step.text)

        // Opacity stays at 1 throughout
        currentIndex++

        if (currentIndex < sequence.length) {
          const nextDelay = sequence[currentIndex - 1].delay
          if (nextDelay === "flicker") {
            // Dramatic flicker pause
            flickerCursor(typeNext)
          } else if (typeof nextDelay === "string" && nextDelay.startsWith("flicker-")) {
            // Delayed flicker: wait, then flicker
            const delay = parseInt(nextDelay.split("-")[1])
            setTimeout(() => flickerCursor(typeNext), delay)
          } else {
            timeoutId = setTimeout(typeNext, nextDelay as number)
          }
        } else {
          // Final flicker then done - opacity stays at 1
          flickerCursor(() => {
            setShowCursor(false)
          })
        }
      }
    }

    // Start typing continuation after a brief pause
    timeoutId = setTimeout(typeNext, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [becomingAlive])

  // Get word opacity - outside-to-center reveal
  // Outside words = 1 opacity, center words = 0.01 opacity (based on distance)
  const getWordOpacity = (index: number, xPercent: number, yPercent: number) => {
    if (isFlickering) {
      // Calculate distance from center (50%, 50%)
      const centerX = 50
      const centerY = 50
      const distX = Math.abs(xPercent - centerX)
      const distY = Math.abs(yPercent - centerY)
      const distanceFromCenter = Math.sqrt(distX * distX + distY * distY)

      // Normalize: max distance is ~70 (corner to center)
      const maxDistance = 70
      const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1)

      // Reveal threshold: outer words (high distance) reveal first
      const revealThreshold = 1 - normalizedDistance // 0 = edge, 1 = center

      // Small random variation for organic feel
      const variation = (Math.sin(index * 0.7) * 0.03)
      const adjustedThreshold = Math.max(0, Math.min(1, revealThreshold + variation))

      if (revealProgress >= adjustedThreshold) {
        // Word is revealed - opacity based on reveal progress (wave position)
        // Start of wave (outer) = 0.67, end of wave (inner) = 0.11
        const waveOpacity = 0.67 - (revealProgress * 0.56) // 0.67 → 0.11 as wave moves inward
        return Math.max(0.11, waveOpacity)
      }
      return 0 // Not yet revealed
    }
    // After reveal: all words settle to 0.07 (CSS handles hover)
    return 0.07
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Baby moths - fly to random words and sit on them */}
      {/* Stays visible throughout page at subtle opacity */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none transition-opacity duration-300"
        style={{ opacity: Math.max(0.15, 1 - (scrollY / 600)) }}
      >
        {spawnedMoths.map((moth) => (
          <FreeFloatingMoth
            key={moth.id}
            id={moth.id}
            variant={moth.variant}
            startX={moth.x}
            startY={moth.y}
            targetX={moth.targetX}
            targetY={moth.targetY}
            onArrived={handleMothArrived}
          />
        ))}
      </div>

      {/* Background - FIXED to persist on scroll */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-teal-900/5 via-background to-rose-900/5 pointer-events-none" />
      <div className="fixed inset-0 -z-10 hero-pattern opacity-10 pointer-events-none" />

      {/* Ambient glow - FIXED to persist on scroll */}
      <div
        className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-800/30 rounded-full blur-[180px] pointer-events-none -z-10"
        style={{ opacity: 0.12 }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-800/30 rounded-full blur-[180px] pointer-events-none -z-10"
        style={{ opacity: 0.10 }}
      />

      {/* Scattered words - FIXED to stay visible on scroll, z-[1] to be BEHIND main content */}
      {/* Fades to subtle opacity as user scrolls, but never fully disappears */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none transition-opacity duration-300"
        style={{
          // Fade scattered words as user scrolls - settles at 0.15 opacity for ambient effect
          opacity: Math.max(0.15, 1 - (scrollY / 600)),
        }}
      >
        {scatteredWords.map((item, index) => {
          const hasMothSitting = mothsOnWords.has(index)
          // Parallax offset - larger words move faster (feel closer)
          const parallaxOffset = scrollY * item.parallaxFactor

          return (
            <div
              key={item.id}
              className={`absolute select-none ${item.size} ${item.font} ${item.color} ${
                !isFlickering && !hasMothSitting ? "pointer-events-auto cursor-default scattered-word" : ""
              }`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `rotate(${item.rotation}deg) translateX(-50%) translateY(calc(-50% - ${parallaxOffset}px))`,
                willChange: 'transform',
                // During reveal: smooth transition
                ...(isFlickering && {
                  opacity: getWordOpacity(index, item.x, item.y),
                  transition: "opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1)",
                }),
                // Moth sitting on word: high opacity
                ...(!isFlickering && hasMothSitting && {
                  opacity: 0.7,
                  transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  textShadow: "0 0 10px currentColor",
                }),
              }}
            >
              {item.word}
            </div>
          )
        })}
      </div>

      {/* PERSISTENT "Becoming" - in glassmorphism hero card */}
      {/* z-30 keeps it above scattered words (z-[1]), pointer-events-none allows hover on words behind */}
      <div className="relative z-30 flex flex-col items-center w-full px-4 pointer-events-none">
        <div className="relative w-full max-w-4xl backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5 flex flex-col items-center">
          {/* Atmospheric glow behind text - container glow, not text glow */}
          <div className="absolute inset-x-0 top-8 h-32 blur-3xl opacity-30 bg-gradient-to-r from-teal-500/40 via-rose-500/20 to-teal-500/40 pointer-events-none" />

          {/* The main Becoming text - clean, premium, no glow */}
          {/* Microscopic shadow for contrast lift. Let font weight + tracking + scale do the work */}
          <h1
            className={`font-space font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl tracking-tight relative transition-transform duration-700 ${
              becomingAlive ? "lg:scale-105" : "scale-100"
            }`}
            style={{
              textShadow: "0 1px 2px rgba(0,0,0,0.35)",
            }}
          >
            <span className="brand-gradient-animated">
              {typedText}
            </span>
            {/* Flickering cursor during typing */}
            {showCursor && (
              <span
                className="inline-block w-[2px] h-[0.75em] ml-1"
                style={{
                  verticalAlign: "baseline",
                  background: "linear-gradient(180deg, #115e59, #9f1239)",
                  opacity: cursorFlicker ? 1 : undefined,
                  animation: cursorFlicker ? "none" : "cursor-blink 0.6s ease-in-out infinite",
                }}
              />
            )}
            {/* Orbiting moth appears when typing is complete */}
            {becomingAlive && !showCursor && <OrbitingMoth onPositionUpdate={handleOrbitMothPosition} isFluttering={isCollisionFlutter} />}
          </h1>

          {/* Hero content - all in same glassmorphism card */}
          <div className="h-6 md:h-10" />

          <h2 className="mb-3 text-2xl md:text-3xl lg:text-4xl text-center font-space font-semibold heading-gradient">
            Stop drifting. Start becoming.
          </h2>

          <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground md:text-xl text-center px-4 leading-relaxed">
            Most journals are just text storage. Becoming is an AI partner that tracks your trajectory, alerts you when you drift, and helps you become who you defined.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-700 to-teal-800 px-10 py-5 text-xl font-medium text-white shadow-lg shadow-teal-900/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-teal-900/30"
            >
              Start Becoming
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-rose-700/30 bg-rose-900/5 px-10 py-5 text-xl font-medium transition-all hover:bg-rose-900/10 hover:border-rose-700/50"
            >
              See the Dashboard
            </Link>
          </div>

          <p className="mt-6 text-base text-muted-foreground">
            Free to start. Your journey begins now.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 sm:gap-10 border-t border-border/50 pt-8 w-full max-w-3xl">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground md:text-4xl tabular-nums">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    start={true}
                  />
                </div>
                <div className="text-sm font-medium text-foreground sm:text-base">{stat.label}</div>
                <div className="text-sm text-muted-foreground hidden sm:block">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      {phase === "complete" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-in">
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <span className="text-xs">Scroll to explore</span>
            <div className="h-8 w-5 rounded-full border border-current flex items-start justify-center p-1">
              <div className="h-1.5 w-1 rounded-full bg-current animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Moth spawn hint */}
      {phase === "complete" && spawnedMoths.length < MAX_MOTHS && (
        <div className="absolute bottom-8 left-8 animate-fade-in">
          <div className="flex items-center gap-2 text-muted-foreground/40 text-xs">
            <span>Catch the moth</span>
            <span className="text-muted-foreground/60">
              {spawnedMoths.length}/{MAX_MOTHS}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

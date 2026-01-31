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
      className="fixed pointer-events-none z-30 transition-transform"
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
  const uniqueId = useMemo(() => `tiny-moth-${Math.random().toString(36).slice(2, 9)}`, [])

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

// Variety of elegant fonts - serifs, sans, display
const fonts = [
  "font-cormorant font-light",
  "font-cormorant font-medium",
  "font-cormorant font-semibold",
  "font-cormorant italic font-light",
  "font-cormorant italic font-medium",
  "font-playfair font-normal",
  "font-playfair font-medium",
  "font-playfair font-semibold",
  "font-playfair italic",
  "font-playfair italic font-medium",
  "font-satoshi font-light",
  "font-satoshi font-normal",
  "font-satoshi font-medium",
  "font-satoshi font-bold",
  "font-clash font-normal",
  "font-clash font-medium",
  "font-clash font-semibold",
  "font-cabinet font-bold",
  "font-syne font-semibold",
  "font-space font-medium",
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

// Random sizes - from tiny to half of "Becoming"
const sizeClasses = [
  "text-4xl",    // 2.25rem - largest
  "text-3xl",    // 1.875rem
  "text-2xl",    // 1.5rem
  "text-xl",     // 1.25rem
  "text-lg",     // 1.125rem
  "text-base",   // 1rem
  "text-sm",     // 0.875rem
  "text-xs",     // 0.75rem
  "text-[10px]", // tiny
  "text-[11px]",
  "text-[13px]",
  "text-[15px]",
  "text-[17px]",
  "text-[19px]",
  "text-[22px]",
  "text-[26px]",
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

      // Ease-out cubic for increasing speed feel (fast at start, slows at end)
      // But we want increasing speed, so use ease-in: progress^3
      const easeIn = progress * progress * progress

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
  "text-4xl": { w: 10, h: 3.5 },
  "text-3xl": { w: 8, h: 3 },
  "text-2xl": { w: 6, h: 2.5 },
  "text-xl": { w: 5, h: 2 },
  "text-lg": { w: 4, h: 1.8 },
  "text-base": { w: 3.5, h: 1.5 },
  "text-sm": { w: 3, h: 1.2 },
  "text-xs": { w: 2.5, h: 1 },
  "text-[10px]": { w: 2, h: 0.8 },
  "text-[11px]": { w: 2.2, h: 0.9 },
  "text-[13px]": { w: 2.5, h: 1 },
  "text-[15px]": { w: 3, h: 1.2 },
  "text-[17px]": { w: 3.5, h: 1.4 },
  "text-[19px]": { w: 4, h: 1.6 },
  "text-[22px]": { w: 5, h: 1.8 },
  "text-[26px]": { w: 6, h: 2.2 },
}

// Generate scattered word data - center-out reveal with Fibonacci sizing, no overlap
const generateScatteredWords = () => {
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
  }> = []

  const centerX = 50
  const centerY = 50
  const numWords = 1000

  // Track placed word bounding boxes
  const placedBoxes: Array<{ x: number; y: number; w: number; h: number }> = []

  const isInExclusionZone = (px: number, py: number) => {
    // Main "Becoming" text zone: 15-85% width, 42-58% height
    const inTextZone = px > 15 && px < 85 && py > 42 && py < 58
    // Moth/metamorphosis zone above: 35-65% width, 30-44% height
    const inMothZone = px > 35 && px < 65 && py > 30 && py < 44
    return inTextZone || inMothZone
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

    const minDist = 20
    const maxDist = 70
    const normalizedDistance = Math.min(1, Math.max(0, (distanceFromTextCenter - minDist) / (maxDist - minDist)))

    placedBoxes.push({ x, y, w, h })

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
  const [heroOpacity] = useState(1)

  // Left-to-right reveal state
  const [isFlickering, setIsFlickering] = useState(true)

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
  const scatteredWords = useMemo(() => generateScatteredWords(), [])

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

  const totalWords = scatteredWords.length

  // Get word opacity - outside-to-center reveal based on distance from center
  // Words at edges reveal first, center words reveal last
  const getWordOpacity = (index: number, xPercent: number, yPercent: number) => {
    if (isFlickering) {
      // Calculate distance from center (50%, 50%)
      const centerX = 50
      const centerY = 50
      const distX = Math.abs(xPercent - centerX)
      const distY = Math.abs(yPercent - centerY)
      const distanceFromCenter = Math.sqrt(distX * distX + distY * distY)

      // Normalize: max distance is ~70 (corner to center)
      // Invert so outer words (high distance) have LOW threshold (reveal first)
      const maxDistance = 70
      const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1)
      const revealThreshold = 1 - normalizedDistance // 0 = edge (first), 1 = center (last)

      // Small random variation for organic feel
      const variation = (Math.sin(index * 0.7) * 0.05)
      const adjustedThreshold = Math.max(0, Math.min(1, revealThreshold + variation))

      if (revealProgress >= adjustedThreshold) {
        // How long since this word was revealed
        const timeSinceReveal = revealProgress - adjustedThreshold

        // Smooth flash up (0.05 of progress)
        if (timeSinceReveal < 0.05) {
          const flashProgress = timeSinceReveal / 0.05
          // Smooth ease-out for flash
          const easedFlash = 1 - Math.pow(1 - flashProgress, 3)
          return 0.02 + (easedFlash * 0.98) // 0.02 → 1
        }

        // Smooth fade down to settled opacity
        const fadeProgress = Math.min(1, (timeSinceReveal - 0.05) / 0.5)
        // Smooth ease-in-out for fade
        const easedFade = fadeProgress < 0.5
          ? 2 * fadeProgress * fadeProgress
          : 1 - Math.pow(-2 * fadeProgress + 2, 2) / 2
        return 1 - (easedFade * 0.9) // 1 → 0.1
      }
      return 0.02 // Not yet revealed
    }
    // After reveal: settled at 0.1
    return 0.1
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Baby moths - fly to random words and sit on them */}
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

      {/* Background - subtle, muted */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-900/5 via-background to-rose-900/5" />
      <div className="absolute inset-0 -z-10 hero-pattern opacity-10" />

      {/* Ambient glow - subtle pastel, not vibrant */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-800/30 rounded-full blur-[180px]"
        style={{ opacity: 0.12 }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-800/30 rounded-full blur-[180px]"
        style={{ opacity: 0.10 }}
      />

      {/* Scattered words - with flicker effect, moth sitting, and hover */}
      {scatteredWords.map((item, index) => {
        const hasMothSitting = mothsOnWords.has(index)
        const mothSittingOpacity = hasMothSitting ? 0.5 + Math.random() * 0.3 : 0 // 0.5-0.8 when moth sits

        return (
          <div
            key={item.id}
            className={`absolute select-none ${item.size} ${item.font} ${item.color} ${
              !isFlickering && !hasMothSitting ? "pointer-events-auto cursor-default scattered-word" : "pointer-events-none"
            }`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `rotate(${item.rotation}deg) translateX(-50%) translateY(-50%)`,
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

      {/* PERSISTENT "Becoming" - comes to life after words reveal */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glow behind Becoming - pulses when coming to life */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-20 transition-all duration-1000 ${
            becomingAlive ? "animate-pulse-glow" : ""
          }`}
          style={{
            opacity: becomingAlive ? 0.7 : 0.3,
            filter: becomingAlive ? "blur(80px)" : "blur(60px)",
            transform: `translate(-50%, -50%) scale(${becomingAlive ? 1.1 : 1})`,
          }}
        >
          <span className="font-clash text-7xl md:text-8xl lg:text-9xl font-semibold whitespace-nowrap tracking-[0.15em] brand-gradient-animated">
            Becoming
          </span>
        </div>

        {/* The main Becoming text with orbiting moth - animates when coming to life */}
        <h1
          className={`font-clash text-7xl md:text-8xl lg:text-9xl font-semibold tracking-[0.15em] relative transition-all duration-700 ${
            becomingAlive ? "scale-105" : "scale-100 opacity-70"
          }`}
          style={{
            textShadow: becomingAlive
              ? "0 0 40px rgba(20, 184, 166, 0.4), 0 0 80px rgba(244, 63, 94, 0.3)"
              : "none",
          }}
        >
          <span className="brand-gradient-animated">Becoming</span>
          {/* Orbiting moth appears when Becoming comes to life */}
          {becomingAlive && <OrbitingMoth onPositionUpdate={handleOrbitMothPosition} isFluttering={isCollisionFlutter} />}
        </h1>

        {/* Hero content fades in */}
        <div
          className="flex flex-col items-center transition-all duration-700"
          style={{
            opacity: heroOpacity,
            transform: `translateY(${(1 - heroOpacity) * 30}px)`,
          }}
        >
          <div className="h-6 md:h-10" />

          <p className="mb-3 text-2xl md:text-3xl lg:text-4xl text-center font-satoshi font-medium text-foreground/90">
            Who do you want to become?
          </p>

          <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground md:text-xl text-center px-4 leading-relaxed">
            We're with you every step of the way—until you become who you're meant to be.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
            {stats.map((stat, index) => (
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

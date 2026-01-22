import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { STATES, type BrainState } from '@/lib/constants'

// Step configuration
export interface StepConfig {
  type: 'text' | 'animation'
  state: BrainState
  transition?: 't1' | 't2' | 't3' | 't4'
  label: string
}

export const STEPS: StepConfig[] = [
  { type: 'text', state: STATES.DORMANT, label: 'Begin' },
  { type: 'animation', state: STATES.CHAOS, transition: 't1', label: '' },
  { type: 'text', state: STATES.CHAOS, label: 'Problem' },
  { type: 'animation', state: STATES.ORGANIZING, transition: 't2', label: '' },
  { type: 'text', state: STATES.ORGANIZING, label: 'Solution' },
  { type: 'animation', state: STATES.ILLUMINATED, transition: 't3', label: '' },
  { type: 'text', state: STATES.ILLUMINATED, label: 'Features' },
  { type: 'animation', state: STATES.RADIANT, transition: 't4', label: '' },
  { type: 'text', state: STATES.RADIANT, label: 'Start' },
]

// Get text step indices (0, 2, 4, 6, 8)
export const TEXT_STEP_INDICES = STEPS
  .map((step, idx) => (step.type === 'text' ? idx : -1))
  .filter(idx => idx !== -1)

const SCROLL_LOCK_DURATION = 1500
const ANIMATION_DURATION = 2000

type Direction = 'forward' | 'backward'

// Cross-fade timing configuration
const EXIT_END = 0.35       // Exiting overlay fully faded by 35% animation
const ENTER_START = 0.55    // Entering overlay starts fading in at 55%
const ENTER_END = 1.0       // Entering overlay fully visible at 100%

// Overlay opacity map for smooth cross-fades
export type OverlayOpacities = Record<BrainState, { opacity: number; isPreloading: boolean }>

interface StepScrollState {
  currentStep: number
  stepConfig: StepConfig
  animationProgress: number
  isAnimating: boolean
  isLocked: boolean
  totalSteps: number
  direction: Direction
  navigateToTextStep: (textStepIndex: number) => void
  // New: opacity map for all overlays (supports cross-fade)
  overlayOpacities: OverlayOpacities
}

export function useStepScroll(): StepScrollState {
  const [currentStep, setCurrentStep] = useState(0)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [direction, setDirection] = useState<Direction>('forward')

  // Refs to track animation state across renders
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const targetStepRef = useRef<number | null>(null)
  const directionRef = useRef<Direction>('forward')

  const stepConfig = STEPS[currentStep]

  // Animation effect - runs when entering an animation step
  useEffect(() => {
    // Clean up any existing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const isAnimationStep = STEPS[currentStep].type === 'animation'

    if (!isAnimationStep) {
      setAnimationProgress(0)
      setIsAnimating(false)
      return
    }

    // Start animation
    setIsAnimating(true)
    const isReverse = directionRef.current === 'backward'
    setAnimationProgress(isReverse ? 1 : 0)
    startTimeRef.current = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current
      let progress = Math.min(elapsed / ANIMATION_DURATION, 1)

      // Reverse the progress for backward direction
      if (isReverse) {
        progress = 1 - progress
      }

      setAnimationProgress(progress)

      const isComplete = isReverse ? progress <= 0 : progress >= 1

      if (!isComplete) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        setIsAnimating(false)
        animationFrameRef.current = null

        // Determine next step based on direction and target
        const nextStep = isReverse ? currentStep - 1 : currentStep + 1
        const hasTarget = targetStepRef.current !== null
        const reachedTarget = hasTarget && currentStep === targetStepRef.current

        if (reachedTarget) {
          // Reached target, stop and unlock
          targetStepRef.current = null
          setTimeout(() => setIsLocked(false), 300)
        } else if (nextStep >= 0 && nextStep < STEPS.length) {
          // Auto-advance to next step after delay
          setTimeout(() => {
            setCurrentStep(nextStep)
            // If next step is text and no further target, unlock
            if (STEPS[nextStep].type === 'text' && !hasTarget) {
              setTimeout(() => setIsLocked(false), 300)
            }
          }, 100)
        } else {
          // Edge of steps, just unlock
          setTimeout(() => setIsLocked(false), 300)
        }
      }
    }

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [currentStep])

  // Lock timeout for text steps (only when not navigating to a target)
  useEffect(() => {
    if (stepConfig.type === 'text' && isLocked && targetStepRef.current === null) {
      const timeout = setTimeout(() => {
        setIsLocked(false)
      }, SCROLL_LOCK_DURATION)
      return () => clearTimeout(timeout)
    }

    // If we're at a text step during navigation, continue to next animation
    if (stepConfig.type === 'text' && targetStepRef.current !== null) {
      const target = targetStepRef.current
      const dir = directionRef.current

      if (currentStep !== target) {
        // Continue navigation after brief pause
        setTimeout(() => {
          const nextStep = dir === 'forward' ? currentStep + 1 : currentStep - 1
          if (nextStep >= 0 && nextStep < STEPS.length) {
            setCurrentStep(nextStep)
          }
        }, 300)
      } else {
        // Reached target
        targetStepRef.current = null
        setTimeout(() => setIsLocked(false), 300)
      }
    }
  }, [currentStep, stepConfig.type, isLocked])

  // Handle single step change (scroll/keyboard)
  const goToStep = useCallback((newStep: number, dir: Direction) => {
    if (newStep < 0 || newStep >= STEPS.length || isLocked) return
    setIsLocked(true)
    setDirection(dir)
    directionRef.current = dir
    targetStepRef.current = null // Single step, no target
    setCurrentStep(newStep)
  }, [isLocked])

  // Navigate to a specific text step (for navbar clicks)
  const navigateToTextStep = useCallback((textStepIndex: number) => {
    if (isLocked) return

    // textStepIndex is the index in TEXT_STEP_INDICES array (0-4)
    const targetStep = TEXT_STEP_INDICES[textStepIndex]
    if (targetStep === undefined || targetStep === currentStep) return

    const dir: Direction = targetStep > currentStep ? 'forward' : 'backward'

    setIsLocked(true)
    setDirection(dir)
    directionRef.current = dir
    targetStepRef.current = targetStep

    // Start moving towards target
    const nextStep = dir === 'forward' ? currentStep + 1 : currentStep - 1
    if (nextStep >= 0 && nextStep < STEPS.length) {
      setCurrentStep(nextStep)
    }
  }, [currentStep, isLocked])

  // Scroll/keyboard/touch handlers
  useEffect(() => {
    let scrollAccumulator = 0
    const SCROLL_THRESHOLD = 50
    let lastWheelTime = 0
    const WHEEL_DEBOUNCE = 100

    // Touch tracking
    let touchStartY = 0
    let touchStartTime = 0
    const SWIPE_THRESHOLD = 50
    const SWIPE_VELOCITY_THRESHOLD = 0.3

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isLocked) return

      // Debounce wheel events to prevent over-scrolling
      const now = Date.now()
      if (now - lastWheelTime < WHEEL_DEBOUNCE) return
      lastWheelTime = now

      scrollAccumulator += e.deltaY

      if (Math.abs(scrollAccumulator) > SCROLL_THRESHOLD) {
        const dir: Direction = scrollAccumulator > 0 ? 'forward' : 'backward'

        if (scrollAccumulator > 0 && currentStep < STEPS.length - 1) {
          goToStep(currentStep + 1, dir)
        } else if (scrollAccumulator < 0 && currentStep > 0) {
          goToStep(currentStep - 1, dir)
        }
        scrollAccumulator = 0
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return

      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        if (currentStep < STEPS.length - 1) {
          goToStep(currentStep + 1, 'forward')
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        if (currentStep > 0) {
          goToStep(currentStep - 1, 'backward')
        }
      }
    }

    // Touch event handlers for mobile swipe
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY
        touchStartTime = Date.now()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isLocked) return
      if (e.changedTouches.length !== 1) return

      const touchEndY = e.changedTouches[0].clientY
      const touchEndTime = Date.now()

      const deltaY = touchStartY - touchEndY
      const deltaTime = touchEndTime - touchStartTime
      const velocity = Math.abs(deltaY) / deltaTime

      // Check if swipe meets threshold and velocity requirements
      if (Math.abs(deltaY) > SWIPE_THRESHOLD && velocity > SWIPE_VELOCITY_THRESHOLD) {
        if (deltaY > 0 && currentStep < STEPS.length - 1) {
          // Swipe up = scroll down = forward
          goToStep(currentStep + 1, 'forward')
        } else if (deltaY < 0 && currentStep > 0) {
          // Swipe down = scroll up = backward
          goToStep(currentStep - 1, 'backward')
        }
      }
    }

    // Prevent default touch behavior to avoid scroll conflicts
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault()
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [currentStep, isLocked, goToStep])

  // Calculate opacity map for all overlays (supports cross-fade) - memoized for performance
  const overlayOpacities = useMemo((): OverlayOpacities => {
    // Initialize all to hidden
    const opacities: OverlayOpacities = {
      [STATES.DORMANT]: { opacity: 0, isPreloading: false },
      [STATES.CHAOS]: { opacity: 0, isPreloading: false },
      [STATES.ORGANIZING]: { opacity: 0, isPreloading: false },
      [STATES.ILLUMINATED]: { opacity: 0, isPreloading: false },
      [STATES.RADIANT]: { opacity: 0, isPreloading: false },
    }

    const currentConfig = STEPS[currentStep]

    // If current step is text, show that overlay at full opacity
    if (currentConfig.type === 'text') {
      opacities[currentConfig.state] = { opacity: 1, isPreloading: false }
      return opacities
    }

    // Current step is animation - handle cross-fade
    const prevStep = currentStep - 1
    const nextStep = currentStep + 1

    if (direction === 'forward') {
      // Forward: previous text overlay fades out, next text overlay fades in

      // Find the previous text step's state (what we're exiting FROM)
      if (prevStep >= 0 && STEPS[prevStep].type === 'text') {
        const exitState = STEPS[prevStep].state
        // Fade out: full at 0%, gone by EXIT_END
        const exitOpacity = Math.max(0, 1 - (animationProgress / EXIT_END))
        opacities[exitState] = { opacity: exitOpacity, isPreloading: false }
      }

      // Find the next text step's state (what we're entering TO)
      if (nextStep < STEPS.length && STEPS[nextStep].type === 'text') {
        const enterState = STEPS[nextStep].state
        // Fade in: starts at ENTER_START, full at ENTER_END
        if (animationProgress >= ENTER_START) {
          const enterOpacity = (animationProgress - ENTER_START) / (ENTER_END - ENTER_START)
          opacities[enterState] = { opacity: Math.min(enterOpacity, 1), isPreloading: true }
        }
      }
    } else {
      // Backward: animation progress goes 1 → 0
      // Previous text overlay fades in, next text overlay fades out

      // The "next" step (higher index) is what we're exiting FROM
      if (nextStep < STEPS.length && STEPS[nextStep].type === 'text') {
        const exitState = STEPS[nextStep].state
        // Fade out as animation progresses backward (1 → 0)
        // At progress=1, should be visible; at progress=(1-EXIT_END), should be gone
        const exitOpacity = Math.max(0, animationProgress / EXIT_END - (1 - EXIT_END) / EXIT_END)
        opacities[exitState] = { opacity: Math.max(0, Math.min(1, exitOpacity)), isPreloading: false }
      }

      // The "prev" step (lower index) is what we're entering TO
      if (prevStep >= 0 && STEPS[prevStep].type === 'text') {
        const enterState = STEPS[prevStep].state
        // Fade in as animation progresses backward
        const reverseProgress = 1 - animationProgress
        if (reverseProgress >= ENTER_START) {
          const enterOpacity = (reverseProgress - ENTER_START) / (ENTER_END - ENTER_START)
          opacities[enterState] = { opacity: Math.min(enterOpacity, 1), isPreloading: true }
        }
      }
    }

    return opacities
  }, [currentStep, animationProgress, direction])

  return {
    currentStep,
    stepConfig,
    animationProgress,
    isAnimating,
    isLocked,
    totalSteps: STEPS.length,
    direction,
    navigateToTextStep,
    overlayOpacities,
  }
}

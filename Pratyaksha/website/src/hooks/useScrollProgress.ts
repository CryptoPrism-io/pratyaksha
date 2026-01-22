import { useState, useEffect, useCallback } from 'react'
import { STATES, SCROLL_MAPPING, SECTION_CONFIG, type BrainState, type SectionPhase } from '@/lib/constants'

interface ScrollProgress {
  progress: number // 0-1 overall scroll progress
  currentState: BrainState
  stateProgress: number // 0-1 progress within current state
  currentPhase: SectionPhase // Current phase (text or animation)
  sectionProgress: number // 0-1 progress within current section
  isTextPhase: boolean // Whether we're in a text phase (for overlay)
}

export function useScrollProgress(): ScrollProgress {
  const [scrollProgress, setScrollProgress] = useState<ScrollProgress>({
    progress: 0,
    currentState: STATES.DORMANT,
    stateProgress: 0,
    currentPhase: { type: 'text', state: STATES.DORMANT },
    sectionProgress: 0,
    isTextPhase: true,
  })

  const calculateState = useCallback((progress: number): ScrollProgress => {
    // Find which state we're in based on scroll progress (legacy mapping)
    let currentState: BrainState = STATES.DORMANT
    let stateProgress = 0

    for (const [state, range] of Object.entries(SCROLL_MAPPING)) {
      const stateNum = Number(state) as BrainState
      if (progress >= range.start && progress < range.end) {
        currentState = stateNum
        stateProgress = (progress - range.start) / (range.end - range.start)
        break
      }
    }

    // Handle edge case at 100%
    if (progress >= 1) {
      currentState = STATES.RADIANT
      stateProgress = 1
    }

    // Find current section phase
    let currentPhase: SectionPhase = { type: 'text', state: STATES.DORMANT }
    let sectionProgress = 0

    for (const [, config] of Object.entries(SECTION_CONFIG)) {
      if (progress >= config.start && progress < config.end) {
        currentPhase = {
          type: config.type,
          state: config.state,
          transition: config.type === 'animation' ? config.transition : undefined,
        }
        sectionProgress = (progress - config.start) / (config.end - config.start)
        break
      }
    }

    // Handle edge case at 100%
    if (progress >= 1) {
      currentPhase = { type: 'text', state: STATES.RADIANT }
      sectionProgress = 1
    }

    return {
      progress,
      currentState,
      stateProgress,
      currentPhase,
      sectionProgress,
      isTextPhase: currentPhase.type === 'text',
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollTop = window.scrollY
      const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1)

      setScrollProgress(calculateState(progress))
    }

    // Initial calculation
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [calculateState])

  return scrollProgress
}

// Hook to scroll to a specific state
export function useScrollToState() {
  const scrollToState = useCallback((state: BrainState) => {
    const range = SCROLL_MAPPING[state]
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    const targetScroll = range.start * scrollHeight

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    })
  }, [])

  return scrollToState
}

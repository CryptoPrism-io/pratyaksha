import { useRef, useEffect, useState, useCallback } from 'react'
import { STATES, type BrainState, STATE_COLORS, SECTION_CONFIG } from '@/lib/constants'
import frameManifest from '@/lib/frame-manifest.json'

interface FramePlayerProps {
  currentState: BrainState
  stateProgress: number
  overallProgress: number
  isTextPhase: boolean
}

// Preload frames for a transition
function preloadFrames(transition: string, count: number): Promise<HTMLImageElement[]> {
  const manifest = frameManifest[transition as keyof typeof frameManifest]
  if (!manifest) return Promise.resolve([])

  const promises: Promise<HTMLImageElement>[] = []

  for (let i = 1; i <= count; i++) {
    const frameNum = String(i).padStart(4, '0')
    const src = `${manifest.path}/frame-${frameNum}.jpg`

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

    promises.push(promise)
  }

  return Promise.all(promises)
}

export function FramePlayer({ currentState, stateProgress, overallProgress, isTextPhase }: FramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [frames, setFrames] = useState<Record<string, HTMLImageElement[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  // Load all frames on mount
  useEffect(() => {
    let mounted = true

    async function loadAllFrames() {
      const transitions = ['t1', 't2', 't3', 't4']
      const loadedFrames: Record<string, HTMLImageElement[]> = {}
      let totalLoaded = 0
      const totalFrames = transitions.reduce((sum, t) => {
        const m = frameManifest[t as keyof typeof frameManifest]
        return sum + (m?.count || 0)
      }, 0)

      for (const t of transitions) {
        const manifest = frameManifest[t as keyof typeof frameManifest]
        if (!manifest) continue

        try {
          const transitionFrames = await preloadFrames(t, manifest.count)
          if (!mounted) return

          loadedFrames[t] = transitionFrames
          totalLoaded += transitionFrames.length
          setLoadProgress(Math.round((totalLoaded / totalFrames) * 100))
        } catch (err) {
          console.error(`Failed to load frames for ${t}:`, err)
        }
      }

      if (mounted) {
        setFrames(loadedFrames)
        setIsLoading(false)
      }
    }

    loadAllFrames()

    return () => {
      mounted = false
    }
  }, [])

  // Get current frame based on overall scroll progress using new section config
  const getCurrentFrame = useCallback((): HTMLImageElement | null => {
    if (Object.keys(frames).length === 0) return null

    const t1 = frames['t1'] || []
    const t2 = frames['t2'] || []
    const t3 = frames['t3'] || []
    const t4 = frames['t4'] || []

    if (t1.length === 0) return null

    // Find current section
    let currentSection: typeof SECTION_CONFIG[keyof typeof SECTION_CONFIG] | null = null
    let sectionProgress = 0

    for (const [, config] of Object.entries(SECTION_CONFIG)) {
      if (overallProgress >= config.start && overallProgress < config.end) {
        currentSection = config
        sectionProgress = (overallProgress - config.start) / (config.end - config.start)
        break
      }
    }

    // Handle edge case at 100%
    if (overallProgress >= 1) {
      return t4[t4.length - 1] || t1[0]
    }

    if (!currentSection) return t1[0]

    // Text phases show static frame (last frame of previous animation or first frame)
    // Animation phases play through frames
    if (currentSection.type === 'text') {
      // Show static frame based on state
      switch (currentSection.state) {
        case STATES.DORMANT:
          return t1[0] // First frame
        case STATES.CHAOS:
          return t1[t1.length - 1] || t1[0] // Last frame of t1
        case STATES.ORGANIZING:
          return t2[t2.length - 1] || t1[t1.length - 1] // Last frame of t2
        case STATES.ILLUMINATED:
          return t3[t3.length - 1] || t2[t2.length - 1] // Last frame of t3
        case STATES.RADIANT:
          return t4[t4.length - 1] || t3[t3.length - 1] // Last frame of t4
        default:
          return t1[0]
      }
    } else {
      // Animation phase - play through transition frames
      const transition = currentSection.transition as 't1' | 't2' | 't3' | 't4'
      const transitionFrames = frames[transition] || []
      if (transitionFrames.length === 0) return t1[0]

      const frameIndex = Math.min(
        Math.floor(sectionProgress * transitionFrames.length),
        transitionFrames.length - 1
      )
      return transitionFrames[frameIndex]
    }
  }, [overallProgress, frames])

  // Draw frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isLoading) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const frame = getCurrentFrame()
      if (!frame) return

      // Set canvas size to match window
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)

      // Calculate cover fit
      const imgRatio = frame.width / frame.height
      const canvasRatio = window.innerWidth / window.innerHeight

      let drawWidth, drawHeight, drawX, drawY

      if (imgRatio > canvasRatio) {
        drawHeight = window.innerHeight
        drawWidth = drawHeight * imgRatio
        drawX = (window.innerWidth - drawWidth) / 2
        drawY = 0
      } else {
        drawWidth = window.innerWidth
        drawHeight = drawWidth / imgRatio
        drawX = 0
        drawY = (window.innerHeight - drawHeight) / 2
      }

      // Clear and draw
      ctx.fillStyle = '#050508'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.drawImage(frame, drawX, drawY, drawWidth, drawHeight)
    }

    draw()

    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [getCurrentFrame, isLoading])

  // Get glow color for current state
  const glowColor = STATE_COLORS[currentState]

  return (
    <div className="fixed inset-0 z-0">
      {/* Canvas for frame rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Radial glow effect */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at center, hsla(${glowColor.h}, ${glowColor.s}%, ${glowColor.l}%, 0.15) 0%, transparent 60%)`,
        }}
      />

      {/* Dark vignette for text contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 10%, rgba(5,5,8,0.3) 50%, rgba(5,5,8,0.7) 100%),
            linear-gradient(to bottom, rgba(5,5,8,0.4) 0%, transparent 20%, transparent 80%, rgba(5,5,8,0.4) 100%)
          `,
        }}
      />

      {/* Dark overlay for text readability - appears during text phases */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundColor: 'rgba(5, 5, 8, 0.55)',
          opacity: isTextPhase ? 1 : 0,
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050508] z-20">
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-white/50 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-white/50 text-sm">Loading experience... {loadProgress}%</p>
        </div>
      )}
    </div>
  )
}

import { useRef, useEffect, useState, useMemo } from 'react'
import { STATES, STATE_COLORS } from '@/lib/marketing-constants'
import { type StepConfig } from '@/hooks/useStepScroll'
import frameManifest from '@/lib/frame-manifest.json'

type Direction = 'forward' | 'backward'

interface StepFramePlayerProps {
  currentStep: number
  stepConfig: StepConfig
  animationProgress: number
  isAnimating: boolean
  direction: Direction
}

const MAX_RETRIES = 3
const RETRY_DELAY = 500

// Load single frame with retry logic
async function loadFrameWithRetry(src: string, retries = MAX_RETRIES): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = async () => {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, RETRY_DELAY))
        try {
          const result = await loadFrameWithRetry(src, retries - 1)
          resolve(result)
        } catch {
          reject(new Error(`Failed to load: ${src}`))
        }
      } else {
        reject(new Error(`Failed to load: ${src}`))
      }
    }

    img.src = src
  })
}

// Preload frames for a transition with error handling
async function preloadFrames(
  transition: string,
  count: number,
  onProgress?: (loaded: number) => void
): Promise<HTMLImageElement[]> {
  const manifest = frameManifest[transition as keyof typeof frameManifest]
  if (!manifest) return []

  const frames: HTMLImageElement[] = []
  let loaded = 0

  for (let i = 1; i <= count; i++) {
    const frameNum = String(i).padStart(4, '0')
    const src = `${manifest.path}/frame-${frameNum}.jpg`

    try {
      const img = await loadFrameWithRetry(src)
      frames.push(img)
      loaded++
      onProgress?.(loaded)
    } catch (err) {
      console.warn(`Skipping frame ${frameNum} for ${transition}:`, err)
      // Continue loading remaining frames instead of failing entirely
    }
  }

  return frames
}

// Loading messages for cinematic feel
const LOADING_MESSAGES = [
  'Preparing your journey...',
  'Loading visuals...',
  'Almost ready...',
  'Initializing experience...',
]

export function StepFramePlayer({ stepConfig, animationProgress, direction }: StepFramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [frames, setFrames] = useState<Record<string, HTMLImageElement[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Load frames with lazy loading - t1 first, then others in background
  useEffect(() => {
    let mounted = true

    async function loadFramesLazily() {
      const loadedFrames: Record<string, HTMLImageElement[]> = {}

      // Phase 1: Load only t1 (first transition) - this is all we need to start
      const t1Manifest = frameManifest['t1' as keyof typeof frameManifest]
      if (!t1Manifest) {
        setLoadError('Unable to load experience. Please refresh the page.')
        return
      }

      setLoadingMessage('Preparing your journey...')

      try {
        const t1Frames = await preloadFrames('t1', t1Manifest.count, (loaded) => {
          if (!mounted) return
          const progress = Math.round((loaded / t1Manifest.count) * 100)
          setLoadProgress(progress)
          if (progress < 50) setLoadingMessage('Loading visuals...')
          else if (progress < 80) setLoadingMessage('Almost ready...')
          else setLoadingMessage('Initializing experience...')
        })

        if (!mounted) return

        if (t1Frames.length < t1Manifest.count * 0.5) {
          setLoadError('Unable to load experience. Please refresh the page.')
          return
        }

        loadedFrames['t1'] = t1Frames
        setFrames({ ...loadedFrames })

        // Show content immediately after t1 loads
        setIsFadingOut(true)
        setTimeout(() => {
          if (mounted) setIsLoading(false)
        }, 500)

        // Phase 2: Load remaining transitions in background (don't block UI)
        const remainingTransitions = ['t2', 't3', 't4']

        for (const t of remainingTransitions) {
          if (!mounted) return

          const manifest = frameManifest[t as keyof typeof frameManifest]
          if (!manifest) continue

          try {
            const transitionFrames = await preloadFrames(t, manifest.count)
            if (!mounted) return

            loadedFrames[t] = transitionFrames
            // Update frames state incrementally
            setFrames(prev => ({ ...prev, [t]: transitionFrames }))
          } catch (err) {
            console.warn(`Background load failed for ${t}:`, err)
            // Continue loading others even if one fails
          }
        }
      } catch (err) {
        console.error('Failed to load initial frames:', err)
        if (mounted) {
          setLoadError('Unable to load experience. Please refresh the page.')
        }
      }
    }

    loadFramesLazily()

    return () => {
      mounted = false
    }
  }, [])

  // Get current frame based on step, animation progress, and direction
  const currentFrame = useMemo((): HTMLImageElement | null => {
    if (Object.keys(frames).length === 0) return null

    const t1 = frames['t1'] || []
    const t2 = frames['t2'] || []
    const t3 = frames['t3'] || []
    const t4 = frames['t4'] || []

    if (t1.length === 0) return null

    if (stepConfig.type === 'animation' && stepConfig.transition) {
      // During animation: play through frames based on animationProgress
      // animationProgress: 0→1 for forward, 1→0 for backward
      const transitionFrames = frames[stepConfig.transition] || []
      if (transitionFrames.length === 0) return t1[0]

      const frameIndex = Math.min(
        Math.floor(animationProgress * transitionFrames.length),
        transitionFrames.length - 1
      )
      return transitionFrames[Math.max(0, frameIndex)]
    } else {
      // During text: show static frame based on state and direction
      // Each transition has its own first and last keyframe
      // Direction tells us how we got to this state

      switch (stepConfig.state) {
        case STATES.DORMANT:
          // Always show first frame of t1 (starting point)
          return t1[0]

        case STATES.CHAOS:
          // Came from t1 forward: show t1's last frame
          // Came from t2 backward: show t2's first frame
          if (direction === 'forward') {
            return t1[t1.length - 1]
          } else {
            return t2[0]
          }

        case STATES.ORGANIZING:
          // Came from t2 forward: show t2's last frame
          // Came from t3 backward: show t3's first frame
          if (direction === 'forward') {
            return t2[t2.length - 1]
          } else {
            return t3[0]
          }

        case STATES.ILLUMINATED:
          // Came from t3 forward: show t3's last frame
          // Came from t4 backward: show t4's first frame
          if (direction === 'forward') {
            return t3[t3.length - 1]
          } else {
            return t4[0]
          }

        case STATES.RADIANT:
          // Always show last frame of t4 (end point)
          return t4[t4.length - 1]

        default:
          return t1[0]
      }
    }
  }, [stepConfig, animationProgress, frames, direction])

  // Track canvas dimensions to avoid unnecessary resizes
  const canvasSizeRef = useRef({ width: 0, height: 0, dpr: 1 })

  // Handle canvas resize separately (only on window resize)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isLoading) return

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight

      // Only resize if dimensions actually changed
      if (
        canvasSizeRef.current.width !== width ||
        canvasSizeRef.current.height !== height ||
        canvasSizeRef.current.dpr !== dpr
      ) {
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        const ctx = canvas.getContext('2d')
        if (ctx) ctx.scale(dpr, dpr)

        canvasSizeRef.current = { width, height, dpr }
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [isLoading])

  // Draw frame to canvas (separate from resize)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isLoading || !currentFrame) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvasSizeRef.current

    // Calculate cover fit
    const imgRatio = currentFrame.width / currentFrame.height
    const canvasRatio = width / height

    let drawWidth, drawHeight, drawX, drawY

    if (imgRatio > canvasRatio) {
      drawHeight = height
      drawWidth = drawHeight * imgRatio
      drawX = (width - drawWidth) / 2
      drawY = 0
    } else {
      drawWidth = width
      drawHeight = drawWidth / imgRatio
      drawX = 0
      drawY = (height - drawHeight) / 2
    }

    // Clear and draw
    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(currentFrame, drawX, drawY, drawWidth, drawHeight)
  }, [currentFrame, isLoading])

  // Get glow color for current state
  const glowColor = STATE_COLORS[stepConfig.state]
  const isTextPhase = stepConfig.type === 'text'

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

      {/* Enhanced cinematic loading overlay */}
      {isLoading && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center bg-[#050508] z-20 transition-opacity duration-500 ${
            isFadingOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Animated particles background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${20 + Math.floor(i / 4) * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + (i % 3)}s`,
                }}
              />
            ))}
          </div>

          {/* Central brain silhouette pulse */}
          <div className="relative mb-8">
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 animate-pulse"
              style={{ animationDuration: '2s' }}
            />
            <div
              className="absolute inset-0 w-20 h-20 rounded-full border border-white/10"
              style={{
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
          </div>

          {/* Progress bar with glow */}
          <div className="w-56 sm:w-64 h-1 bg-white/5 rounded-full overflow-hidden mb-4 relative">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${loadProgress}%`,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 100%)',
                boxShadow: '0 0 20px rgba(255,255,255,0.3)',
              }}
            />
          </div>

          {/* Loading message */}
          <p className="text-white/60 text-sm font-medium tracking-wide mb-2">
            {loadingMessage}
          </p>
          <p className="text-white/30 text-xs">
            {loadProgress}%
          </p>

          {/* Error state */}
          {loadError && (
            <div className="mt-6 text-center">
              <p className="text-red-400/80 text-sm mb-4">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

# Phase 2: 4-Agent Pipeline Storytelling

## Concept: Apple-Style Scroll Deconstruction

As users scroll, a sample journal entry gets "scanned" by each AI agent in sequence, demonstrating exactly how Pratyaksha analyzes their thoughts.

---

## Scroll Progression

```
SCROLL 0% ─────────────────────────────────────────────────────────
+-------------------------------------------------------------------+
|                                                                   |
|  "I felt really anxious about the meeting today. Part of         |
|   me wants to push through, but another part just wants          |
|   to avoid it entirely. I know I should face my fears..."        |
|                                                                   |
|                    [Sample Journal Entry]                         |
|                                                                   |
+-------------------------------------------------------------------+

SCROLL 25% ────────────────────────────────────────────────────────
+-------------------------------------------------------------------+
|                                                                   |
|  INTENT AGENT                                                     |
|  ------------                                                     |
|  "I felt really [ANXIOUS]..." -> Type: EMOTIONAL                  |
|                                                                   |
|  [Highlighting animation - words get classified]                  |
|                                                                   |
+-------------------------------------------------------------------+

SCROLL 50% ────────────────────────────────────────────────────────
+-------------------------------------------------------------------+
|                                                                   |
|  EMOTION AGENT                                                    |
|  ------------                                                     |
|  Mode: Anxious -> Overthinking                                    |
|  Energy: 4/10 [====------]                                        |
|  Shape: Chaotic ~~~~                                              |
|                                                                   |
|  [Color shifts, energy bar fills]                                 |
|                                                                   |
+-------------------------------------------------------------------+

SCROLL 75% ────────────────────────────────────────────────────────
+-------------------------------------------------------------------+
|                                                                   |
|  THEME AGENT                                                      |
|  -----------                                                      |
|                                                                   |
|  Action <------[Sankey]------> Fear                               |
|                                                                   |
|  Contradiction detected: "push through" vs "avoid"                |
|                                                                   |
+-------------------------------------------------------------------+

SCROLL 100% ───────────────────────────────────────────────────────
+-------------------------------------------------------------------+
|                                                                   |
|  INSIGHT AGENT                                                    |
|  ------------                                                     |
|                                                                   |
|  +----------------------------------------------+                 |
|  |  NEXT ACTION                                 |                 |
|  |                                              |                 |
|  |  "Try the 5-minute rule: commit to just     |                 |
|  |   5 minutes of preparation. Often,          |                 |
|  |   starting is the hardest part."            |                 |
|  +----------------------------------------------+                 |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## Animation Technique: Hybrid Approach

| Component | Technique | Reasoning |
|-----------|-----------|-----------|
| Text highlighting | GSAP ScrollTrigger | DOM-based, lightweight |
| Agent cards entrance | GSAP | Fade + translate |
| Energy bar fill | CSS animation | Simple, performant |
| Sankey diagram | **Frame Sequence** | Complex visual, needs scrub |
| Agent icons | Lottie loops | Professional polish |

### Why Frame Sequence for Sankey?

The Sankey diagram showing "Action vs Fear" contradiction is a KEY SELLING MOMENT.

> "Sometimes the only way to get a stunning, complex animation on the web is to pre-render it as frames... The advantage is unlimited visual fidelity."

---

## GSAP ScrollTrigger Implementation

```tsx
// components/sections/HowItWorks.tsx
'use client'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useGSAP(() => {
    // Pin the container during scroll
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=400%',
      pin: true,
      scrub: 1,
    })

    // Intent Agent - Highlight words
    gsap.to('.highlight-anxious', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=100%',
        scrub: true,
      },
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
      padding: '2px 6px',
      borderRadius: '4px',
    })

    // Emotion Agent - Energy bar fill
    gsap.to('.energy-bar-fill', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: '+=100%',
        end: '+=200%',
        scrub: true,
      },
      width: '40%',
      ease: 'power2.out',
    })

    // Theme Agent - Sankey reveal
    gsap.to('.sankey-container', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: '+=200%',
        end: '+=300%',
        scrub: true,
        onUpdate: (self) => {
          // Update frame sequence based on progress
          updateSankeyFrame(Math.floor(self.progress * 39))
        },
      },
      opacity: 1,
    })

    // Insight Agent - Card reveal
    gsap.from('.insight-card', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: '+=300%',
        end: '+=400%',
        scrub: true,
      },
      y: 50,
      opacity: 0,
      scale: 0.95,
    })
  }, [])

  return (
    <section ref={containerRef} className="min-h-screen">
      {/* Content */}
    </section>
  )
}
```

---

## Frame Sequence Implementation

```tsx
// components/animations/SankeySequence.tsx
'use client'
import { useRef, useEffect, useState } from 'react'

const TOTAL_FRAMES = 40
const FRAME_PATH = '/animations/sankey/frame-'

export function SankeySequence({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [loaded, setLoaded] = useState(false)

  // Preload all frames
  useEffect(() => {
    const loadImages = async () => {
      const imgs: HTMLImageElement[] = []

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image()
        img.src = `${FRAME_PATH}${String(i).padStart(3, '0')}.webp`
        await new Promise((resolve) => {
          img.onload = resolve
        })
        imgs.push(img)
      }

      setImages(imgs)
      setLoaded(true)
    }

    loadImages()
  }, [])

  // Draw current frame
  useEffect(() => {
    if (!loaded || !canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const frameIndex = Math.min(
      Math.floor(progress * (TOTAL_FRAMES - 1)),
      TOTAL_FRAMES - 1
    )

    const img = images[frameIndex]
    if (img) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)
    }
  }, [progress, images, loaded])

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={400}
      className="w-full h-auto"
    />
  )
}
```

---

## Agent Card Components

```tsx
// components/pipeline/AgentCard.tsx
interface AgentCardProps {
  name: string
  icon: string // Lottie path
  description: string
  isActive: boolean
  children: React.ReactNode
}

export function AgentCard({ name, icon, description, isActive, children }: AgentCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl p-6 backdrop-blur-lg border transition-all duration-500',
        isActive
          ? 'bg-white/10 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
          : 'bg-white/5 border-white/10'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10">
          <Lottie
            animationData={require(`@/assets/lottie/${icon}.json`)}
            loop={isActive}
            autoplay={isActive}
          />
        </div>
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}
```

---

## Sample Journal Entry

```tsx
// components/pipeline/SampleEntry.tsx
const sampleText = `I felt really anxious about the meeting today. Part of me wants to push through, but another part just wants to avoid it entirely. I know I should face my fears, but the thought of speaking up makes my heart race.`

const highlights = [
  { word: 'anxious', start: 16, end: 23, agent: 'intent' },
  { word: 'push through', start: 60, end: 72, agent: 'theme' },
  { word: 'avoid', start: 103, end: 108, agent: 'theme' },
  { word: 'face my fears', start: 135, end: 148, agent: 'emotion' },
]

export function SampleEntry({ activeAgent }: { activeAgent: string }) {
  return (
    <blockquote className="text-xl leading-relaxed text-gray-300 font-serif italic">
      {/* Render text with dynamic highlights based on activeAgent */}
    </blockquote>
  )
}
```

---

## Assets Required

| Asset | Format | Specs | Purpose |
|-------|--------|-------|---------|
| intent-agent-icon.json | Lottie | <30KB, 2s loop | Classify animation |
| emotion-agent-icon.json | Lottie | <30KB, 2s loop | Pulse/mood animation |
| theme-agent-icon.json | Lottie | <30KB, 2s loop | Orbit/connect animation |
| insight-agent-icon.json | Lottie | <30KB, 2s loop | Lightbulb reveal |
| sankey-frame-000 to 039.webp | WebP | 40 frames, 1280x400, ~20KB each | Scroll sequence |

### Sankey Frame Sequence Specs

- **Frames:** 40 (1 second at 40fps, scrubbed)
- **Dimensions:** 1280 x 400px
- **Format:** WebP (~20KB each)
- **Total Size:** ~800KB
- **Creation:** After Effects or Blender render

---

## Reduced Motion Support

```tsx
// hooks/useReducedMotion.ts
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}
```

When `prefers-reduced-motion` is enabled:
- Show all 4 agent cards simultaneously (no scroll animation)
- Use static Sankey image instead of frame sequence
- Disable GSAP scrub, use simple fade transitions

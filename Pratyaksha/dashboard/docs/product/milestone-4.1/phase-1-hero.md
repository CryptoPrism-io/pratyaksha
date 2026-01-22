# Phase 1: Interactive Hero Experience

## Concept: "Thought-Reactive Brain"

The hero section features a 3D brain that reacts in real-time to user-typed emotions, creating an immediate "wow" moment that demonstrates the product's core value.

---

## Visual Layout

```
+---------------------------------------------------------------------+
|                                                                     |
|      +-----------------------------------------------+              |
|      |                                               |              |
|      |              [3D BRAIN]                       |              |
|      |         Neural particles react                |              |
|      |         to emotion keywords                   |              |
|      |                                               |              |
|      +-----------------------------------------------+              |
|                                                                     |
|              YOUR MIND, VISUALIZED.                                 |
|              -----------------------                                |
|                                                                     |
|      +-----------------------------------------------+              |
|      |  Write how you're feeling...                  |              |
|      +-----------------------------------------------+              |
|                                                                     |
|                  [ See Your Mind -> ]                               |
|                                                                     |
+---------------------------------------------------------------------+
```

---

## Animation Technique

**Primary:** React Three Fiber (R3F) with real-time interaction

| Component | Library | Purpose |
|-----------|---------|---------|
| Brain Model | R3F + drei | 3D rendering |
| Particles | R3F Points | Neural connections |
| Text Animation | GSAP | Word-by-word reveal |
| Input Feedback | Custom hook | Emotion analysis |

---

## Emotion -> Visual Mapping

| Keyword Pattern | Particle Color | Speed | Brain Tint |
|-----------------|----------------|-------|------------|
| anxious, worried, stressed | `#EF4444` | Fast, chaotic | Warm |
| calm, peaceful, relaxed | `#3B82F6` | Slow, flowing | Cool |
| happy, excited, energized | `#F59E0B` | Bouncy | Bright |
| sad, tired, exhausted | `#6B7280` | Slow descent | Muted |
| hopeful, motivated | `#10B981` | Rising | Fresh |
| confused, overwhelmed | `#8B5CF6` | Swirling | Purple |

---

## Technical Implementation

### Brain Component

```tsx
// components/3d/Brain.tsx
import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MeshTransmissionMaterial } from '@react-three/drei'

interface BrainProps {
  emotionState: EmotionState
  scrollProgress: number
}

export function Brain({ emotionState, scrollProgress }: BrainProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const gltf = useLoader(GLTFLoader, '/models/brain-low-poly.glb')

  useFrame((state) => {
    if (!meshRef.current) return
    // Rotate based on scroll
    meshRef.current.rotation.y = scrollProgress * Math.PI * 2
    // Subtle bob animation
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
  })

  return (
    <mesh ref={meshRef} geometry={gltf.nodes.Brain.geometry}>
      <MeshTransmissionMaterial
        thickness={0.5}
        roughness={0.2}
        transmission={0.9}
        ior={1.5}
        chromaticAberration={0.03}
        color={emotionState.tint}
        backside
      />
    </mesh>
  )
}
```

### Emotion Analysis Hook

```tsx
// hooks/useEmotionAnalysis.ts
const emotionKeywords: Record<string, EmotionConfig> = {
  anxious: { color: '#EF4444', speed: 2.5, chaos: 0.8, tint: '#FEE2E2' },
  worried: { color: '#EF4444', speed: 2.2, chaos: 0.7, tint: '#FEE2E2' },
  calm: { color: '#3B82F6', speed: 0.3, chaos: 0.1, tint: '#DBEAFE' },
  peaceful: { color: '#3B82F6', speed: 0.2, chaos: 0.05, tint: '#DBEAFE' },
  happy: { color: '#F59E0B', speed: 1.5, chaos: 0.4, tint: '#FEF3C7' },
  sad: { color: '#6B7280', speed: 0.4, chaos: 0.2, tint: '#F3F4F6' },
  hopeful: { color: '#10B981', speed: 1.0, chaos: 0.3, tint: '#D1FAE5' },
}

export function useEmotionAnalysis(text: string): EmotionState {
  return useMemo(() => {
    const words = text.toLowerCase().split(/\s+/)
    let dominantEmotion: EmotionConfig | null = null
    let maxWeight = 0

    for (const word of words) {
      if (emotionKeywords[word]) {
        // Weight by recency (later words matter more)
        const weight = words.indexOf(word) / words.length + 1
        if (weight > maxWeight) {
          maxWeight = weight
          dominantEmotion = emotionKeywords[word]
        }
      }
    }

    return dominantEmotion || defaultEmotionState
  }, [text])
}
```

### Neural Particles

```tsx
// components/3d/NeuralConnections.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'

interface NeuralConnectionsProps {
  emotionState: EmotionState
}

export function NeuralConnections({ emotionState }: NeuralConnectionsProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(1000 * 3)
    for (let i = 0; i < 1000; i++) {
      // Sphere distribution around brain
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 1.5

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    // Animate based on emotion speed and chaos
    pointsRef.current.rotation.y += 0.001 * emotionState.speed
    pointsRef.current.rotation.x += 0.0005 * emotionState.chaos
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color={emotionState.color}
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  )
}
```

---

## Mobile Fallback Strategy

Per research: "Apple uses a static image for smaller screens and slower devices"

```tsx
// components/3d/HeroScene.tsx
export function HeroScene() {
  const { enable3D, quality } = use3DPerformance()

  if (!enable3D) {
    return <StaticBrainWithParallax />
  }

  return (
    <Canvas
      dpr={quality === 'high' ? [1, 2] : [1, 1]}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Suspense fallback={<Loader3D />}>
        <Brain emotionState={emotionState} scrollProgress={scroll} />
        <NeuralConnections emotionState={emotionState} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}
```

### Static Fallback Component

```tsx
// components/3d/StaticBrainWithParallax.tsx
export function StaticBrainWithParallax() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -50])

  return (
    <motion.div style={{ y }} className="relative">
      <Image
        src="/images/brain-static.webp"
        alt="Brain visualization"
        width={800}
        height={800}
        priority
      />
      {/* CSS particle overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-500/20 to-transparent animate-pulse" />
    </motion.div>
  )
}
```

---

## Assets Required

| Asset | Format | Size | Source |
|-------|--------|------|--------|
| brain-low-poly.glb | GLB (Draco) | <500KB | Poly Pizza / Sketchfab |
| brain-static.webp | WebP | ~100KB | Render from 3D model |
| neural-texture.png | PNG | 512x512 | Custom generation |
| loading-spinner.json | Lottie | <50KB | LottieFiles |

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| 3D Load Time | <3s | Custom timer |
| Desktop FPS | 60 | Chrome DevTools |
| Mobile FPS | 30 | Chrome DevTools |
| Time to Interactive | <3s | Lighthouse |

---

## Accessibility

- `prefers-reduced-motion`: Disable particle animation, use static brain
- Screen reader: Hidden canvas with aria-hidden, text fallback visible
- Keyboard: Skip to content link above hero

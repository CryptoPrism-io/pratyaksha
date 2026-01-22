# Phase 3: 21 Charts Bento Showcase

## Concept: Live Mini-Preview Feature Grid

A modern bento grid layout showcasing Pratyaksha's 21 visualization components with live Lottie previews and micro-interactions.

---

## Visual Layout

```
+----------------------------------------------------------------------+
|                                                                      |
|  VISUALIZE YOUR MIND WITH 21 POWERFUL CHARTS                         |
|                                                                      |
|  +----------------------+ +----------+ +----------+                  |
|  |                      | |          | |          |                  |
|  |   EMOTIONAL          | |  ENERGY  | |  THEME   |                  |
|  |   TIMELINE           | |  RADAR   | |  CLOUD   |                  |
|  |   [Live chart]       | | [Pulsing]| |[Floating]|                  |
|  |   (2x2)              | |  (1x1)   | |  (1x1)   |                  |
|  +----------------------+ +----------+-+----------+                  |
|  |                      | |                       |                  |
|  |   GITHUB-STYLE       | |   SANKEY FLOW         |                  |
|  |   HEATMAP            | |   [Animated paths]    |                  |
|  |   [Cells filling]    | |   (2x1)               |                  |
|  |   (2x1)              | |                       |                  |
|  +----------+-----------+ +-----------------------+                  |
|  |          |           | |                       |                  |
|  | MODE PIE | SENTIMENT | |   CONTRADICTION       |                  |
|  | [Rotate] | [Pulse]   | |   TRACKER (2x1)       |                  |
|  |  (1x1)   |  (1x1)    | |                       |                  |
|  +----------+-----------+ +-----------------------+                  |
|                                                                      |
+----------------------------------------------------------------------+
```

---

## Bento Grid CSS Implementation

```css
/* Using CSS Grid for responsive bento layout */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 200px);
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Card sizes */
.bento-card-2x2 {
  grid-column: span 2;
  grid-row: span 2;
}

.bento-card-2x1 {
  grid-column: span 2;
}

.bento-card-1x1 {
  /* Default: 1x1 */
}

/* Responsive: Stack on mobile */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }

  .bento-card-2x2 {
    grid-column: span 2;
    grid-row: span 1;
  }

  .bento-card-2x1 {
    grid-column: span 2;
  }
}

@media (max-width: 480px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }

  .bento-card-2x2,
  .bento-card-2x1 {
    grid-column: span 1;
  }
}
```

---

## Featured Charts (Priority Selection)

| Chart | Size | Lottie | Visual Appeal | Priority |
|-------|------|--------|---------------|----------|
| Emotional Timeline | 2x2 | Yes | High | P0 |
| Energy Radar | 1x1 | Yes | Very High | P0 |
| Theme Cloud | 1x1 | Yes | High | P0 |
| GitHub Heatmap | 2x1 | Yes | Very High | P0 |
| Sankey Flow | 2x1 | Yes | Very High | P0 |
| Mode Distribution | 1x1 | Yes | Medium | P1 |
| Sentiment Pulse | 1x1 | Yes | Medium | P1 |
| Contradiction Tracker | 2x1 | Yes | High | P1 |

---

## Bento Card Component

```tsx
// components/bento/BentoCard.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import { cn } from '@/lib/utils'

interface BentoCardProps {
  title: string
  description: string
  size: '1x1' | '2x1' | '2x2'
  lottieData: object
  staticPreview: string
  gradient: string
}

export function BentoCard({
  title,
  description,
  size,
  lottieData,
  staticPreview,
  gradient,
}: BentoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hasPlayedBurst, setHasPlayedBurst] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (!hasPlayedBurst) {
      setHasPlayedBurst(true)
      // Trigger particle burst (one-time)
    }
  }

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden cursor-pointer',
        'bg-gradient-to-br border border-white/10',
        'transition-all duration-300',
        gradient,
        {
          'bento-card-2x2': size === '2x2',
          'bento-card-2x1': size === '2x1',
        }
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 20px 40px -20px rgba(99, 102, 241, 0.3)',
      }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

      {/* Chart preview */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {isHovered ? (
            <motion.div
              key="lottie"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <Lottie
                animationData={lottieData}
                loop
                autoplay
                className="w-full h-full"
              />
            </motion.div>
          ) : (
            <motion.img
              key="static"
              src={staticPreview}
              alt={title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full object-contain"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-300 opacity-80">{description}</p>
      </div>

      {/* Particle burst effect (first hover only) */}
      <AnimatePresence>
        {hasPlayedBurst && (
          <ParticleBurst onComplete={() => {}} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

---

## Particle Burst Effect

```tsx
// components/effects/ParticleBurst.tsx
'use client'
import Lottie from 'lottie-react'
import particleBurstData from '@/assets/lottie/particle-burst.json'

export function ParticleBurst({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <Lottie
        animationData={particleBurstData}
        loop={false}
        autoplay
        onComplete={onComplete}
        className="w-full h-full"
      />
    </div>
  )
}
```

---

## Bento Grid Section

```tsx
// components/sections/Features.tsx
import { BentoCard } from '@/components/bento/BentoCard'

const charts = [
  {
    title: 'Emotional Timeline',
    description: 'Track emotional patterns over time',
    size: '2x2' as const,
    lottie: 'emotional-timeline',
    gradient: 'from-indigo-900/50 to-purple-900/50',
  },
  {
    title: 'Energy Radar',
    description: 'Visualize energy levels across dimensions',
    size: '1x1' as const,
    lottie: 'energy-radar',
    gradient: 'from-blue-900/50 to-cyan-900/50',
  },
  {
    title: 'Theme Cloud',
    description: 'See recurring themes and topics',
    size: '1x1' as const,
    lottie: 'theme-cloud',
    gradient: 'from-purple-900/50 to-pink-900/50',
  },
  {
    title: 'GitHub-Style Heatmap',
    description: 'Your journaling consistency at a glance',
    size: '2x1' as const,
    lottie: 'heatmap',
    gradient: 'from-green-900/50 to-emerald-900/50',
  },
  {
    title: 'Sankey Flow',
    description: 'Trace contradiction patterns',
    size: '2x1' as const,
    lottie: 'sankey-flow',
    gradient: 'from-orange-900/50 to-red-900/50',
  },
  {
    title: 'Mode Distribution',
    description: 'Balance of emotional states',
    size: '1x1' as const,
    lottie: 'mode-pie',
    gradient: 'from-slate-800/50 to-slate-900/50',
  },
  {
    title: 'Sentiment Pulse',
    description: 'Real-time sentiment analysis',
    size: '1x1' as const,
    lottie: 'sentiment-pulse',
    gradient: 'from-rose-900/50 to-pink-900/50',
  },
  {
    title: 'Contradiction Tracker',
    description: 'Identify internal conflicts',
    size: '2x1' as const,
    lottie: 'contradiction-tracker',
    gradient: 'from-amber-900/50 to-orange-900/50',
  },
]

export function Features() {
  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          className="text-4xl font-bold text-center text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Visualize Your Mind with 21 Powerful Charts
        </motion.h2>
        <motion.p
          className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          From emotional timelines to contradiction tracking, gain insights
          you've never had before.
        </motion.p>

        <div className="bento-grid">
          {charts.map((chart, index) => (
            <motion.div
              key={chart.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <BentoCard {...chart} />
            </motion.div>
          ))}
        </div>

        {/* CTA below grid */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 mb-4">
            Plus 13 more visualizations in the full dashboard
          </p>
          <Button variant="outline" size="lg">
            See All Charts
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
```

---

## Assets Required

| Asset | Format | Size | Purpose |
|-------|--------|------|---------|
| emotional-timeline.json | Lottie | <100KB | Line chart drawing |
| energy-radar.json | Lottie | <100KB | Pulsing radar |
| theme-cloud.json | Lottie | <100KB | Floating keywords |
| heatmap.json | Lottie | <80KB | Cells filling |
| sankey-flow.json | Lottie | <150KB | Animated paths |
| mode-pie.json | Lottie | <60KB | Rotating pie |
| sentiment-pulse.json | Lottie | <60KB | Wave animation |
| contradiction-tracker.json | Lottie | <80KB | Bar comparison |
| particle-burst.json | Lottie | <50KB | One-shot hover effect |
| chart-static-*.webp | WebP | ~30KB each | Default preview images |

**Total Lottie Size:** ~780KB

---

## Performance Optimization

### Lazy Loading Lotties

```tsx
// Only load Lottie data when card is in viewport
const [lottieData, setLottieData] = useState(null)

useEffect(() => {
  if (isInViewport) {
    import(`@/assets/lottie/${lottiePath}.json`).then(setLottieData)
  }
}, [isInViewport, lottiePath])
```

### Static Preview First

Show static WebP preview by default, only load Lottie on hover:
- Reduces initial payload
- Better LCP (Largest Contentful Paint)
- Progressive enhancement

---

## Micro-interaction Guidelines

| Interaction | Effect | Duration |
|-------------|--------|----------|
| Hover enter | Scale 1.02 + shadow | 300ms |
| Hover leave | Scale 1.0 + no shadow | 200ms |
| First hover | Particle burst | 500ms (one-shot) |
| Lottie loop | Chart animation | 2-4s loop |

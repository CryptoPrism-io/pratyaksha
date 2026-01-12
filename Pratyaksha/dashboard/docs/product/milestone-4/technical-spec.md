# Milestone 4: Technical Specification

**Project:** Pratyaksha Marketing Website
**Repository:** `pratyaksha-marketing` (separate from dashboard)

---

## Tech Stack

### Dependencies

```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@react-three/fiber": "^9.2.0",
    "@react-three/drei": "^9.118.0",
    "@react-three/postprocessing": "^2.16.0",
    "three": "^0.171.0",
    "gsap": "^3.13.0",
    "framer-motion": "^12.0.0",
    "leva": "^0.9.39",
    "posthog-js": "^1.181.0",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-toast": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "lucide-react": "^0.562.0",
    "resend": "^4.2.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^24.10.1",
    "@types/react": "^19.0.0",
    "@types/three": "^0.171.0",
    "typescript": "^5.9.0",
    "eslint": "^9.0.0",
    "prettier": "^3.5.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.5.0",
    "tailwindcss": "^3.4.0",
    "@playwright/test": "^1.50.0"
  }
}
```

---

## 3D Implementation

### Brain Component

```tsx
// components/3d/Brain.tsx
import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MeshTransmissionMaterial } from '@react-three/drei'

export function Brain({ scrollProgress }: { scrollProgress: number }) {
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
        backside
      />
    </mesh>
  )
}
```

### Neural Particle System

```tsx
// components/3d/NeuralConnections.tsx
import { useRef, useMemo } from 'react'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export function NeuralConnections() {
  const points = useMemo(() => {
    const positions = new Float32Array(1000 * 3)
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [])

  return (
    <Points positions={points} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#6366F1"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}
```

### Performance Optimization

```tsx
// hooks/use3DPerformance.ts
import { useState, useEffect } from 'react'

export function use3DPerformance() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high')
  const [enable3D, setEnable3D] = useState(true)

  useEffect(() => {
    // Check device capabilities
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')

    if (!gl) {
      setEnable3D(false)
      return
    }

    // Check for mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      setQuality('low')
    }

    // Check GPU
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      if (renderer.includes('Intel')) {
        setQuality('medium')
      }
    }
  }, [])

  return { quality, enable3D }
}
```

---

## Analytics Implementation

### PostHog Setup

```tsx
// components/analytics/PostHogProvider.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '.sensitive'
      }
    })
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

### Event Tracking Helper

```tsx
// lib/analytics.ts
import posthog from 'posthog-js'

export const analytics = {
  // Page views
  pageView: (path: string) => {
    posthog.capture('page_view', { path })
  },

  // 3D performance
  hero3DLoaded: (loadTime: number, success: boolean) => {
    posthog.capture('hero_3d_loaded', { load_time: loadTime, success })
  },

  // Section engagement
  sectionViewed: (section: string, timeVisible: number) => {
    posthog.capture('section_viewed', {
      section_name: section,
      time_visible: timeVisible
    })
  },

  // Conversion
  waitlistSignup: (emailDomain: string, source: string) => {
    posthog.capture('waitlist_signup', {
      email_domain: emailDomain,
      source
    })
  },

  // Feature interest
  featureCardHover: (feature: string) => {
    posthog.capture('feature_card_hover', { feature_name: feature })
  },

  // CTA clicks
  ctaClick: (location: string, text: string) => {
    posthog.capture('cta_click', {
      button_location: location,
      button_text: text
    })
  }
}
```

### Google Analytics 4

```tsx
// components/analytics/GoogleAnalytics.tsx
import Script from 'next/script'

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
```

---

## Waitlist API

```tsx
// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, source } = schema.parse(body)

    // Send welcome email
    await resend.emails.send({
      from: 'Pratyaksha <hello@pratyaksha.app>',
      to: email,
      subject: 'Welcome to Pratyaksha Waitlist',
      html: `
        <h1>You're on the list!</h1>
        <p>Thanks for joining the Pratyaksha waitlist.</p>
        <p>We'll notify you when we launch.</p>
      `
    })

    // Track in PostHog (server-side)
    // Note: Use PostHog Node SDK for server tracking

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server-side
RESEND_API_KEY=re_xxx
```

---

## Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

---

## Brand Constants

```tsx
// lib/constants.ts
export const BRAND = {
  name: 'Pratyaksha',
  tagline: 'See Your Mind. Clearly.',
  description: 'AI-powered cognitive journal that visualizes your mind',
  url: 'https://pratyaksha.app',
  twitter: '@PratyakshaApp',
  email: 'hello@pratyaksha.app'
}

export const COLORS = {
  primary: '#6366F1',      // Soft Indigo
  secondary: '#8B5CF6',    // Soft Purple
  accent: '#10B981',       // Calm Green
  background: '#0A0A0F',   // Near black
  foreground: '#FAFAFA',   // Off-white
  cardGlass: 'rgba(255, 255, 255, 0.05)',
  borderGlass: 'rgba(255, 255, 255, 0.1)'
}

export const ANIMATION = {
  fast: 0.2,      // Button hover
  normal: 0.4,    // Card entrance
  slow: 0.8,      // Section transitions
  scroll: 1.2     // Scroll-triggered
}

export const PRICING = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '50 entries/month',
      'Basic visualizations',
      '7-day data retention'
    ]
  },
  pro: {
    name: 'Pro',
    price: 9,
    features: [
      'Unlimited entries',
      'All visualizations',
      'Export data',
      'Priority AI processing',
      'Email digests'
    ]
  }
}
```

---

## 3D Model Requirements

### Specifications
- **Format:** GLB (GLTF Binary)
- **Polygons:** 5,000-10,000 (low-poly)
- **File Size:** <500KB (with Draco compression)
- **Texture:** Optional normal map (512x512)

### Sources
1. **Poly Pizza** - Free CC0 models
2. **Sketchfab** - Free/Paid models
3. **CGTrader** - Professional models
4. **Custom Blender** - 8-12 hours work

### Optimization Pipeline
```bash
# Install gltf-pipeline
npm install -g gltf-pipeline

# Compress with Draco
gltf-pipeline -i brain.glb -o brain-draco.glb --draco.compressionLevel 10

# Verify size
ls -la brain-draco.glb
```

---

## Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | 90+ | Chrome DevTools |
| Lighthouse Accessibility | 95+ | Chrome DevTools |
| Lighthouse SEO | 100 | Chrome DevTools |
| First Contentful Paint | <1.5s | Vercel Analytics |
| Time to Interactive | <3s | Vercel Analytics |
| Cumulative Layout Shift | <0.1 | Web Vitals |
| Desktop FPS | 60 | Chrome DevTools |
| Mobile FPS | 30 | Chrome DevTools |
| 3D Load Time | <3s | Custom metric |

---

## SEO Configuration

```tsx
// app/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pratyaksha - See Your Mind. Clearly.',
  description: 'AI-powered cognitive journal that visualizes emotional patterns, energy states, and mental insights.',
  keywords: ['cognitive journal', 'mental health', 'AI insights', 'emotional patterns'],
  authors: [{ name: 'Pratyaksha Team' }],
  openGraph: {
    title: 'Pratyaksha - See Your Mind. Clearly.',
    description: 'AI-powered cognitive journal that visualizes your mind.',
    url: 'https://pratyaksha.app',
    siteName: 'Pratyaksha',
    images: [
      {
        url: 'https://pratyaksha.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pratyaksha - Mind Visualization Dashboard'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pratyaksha - See Your Mind. Clearly.',
    description: 'AI-powered cognitive journal that visualizes your mind.',
    images: ['https://pratyaksha.app/og-image.png'],
    creator: '@PratyakshaApp'
  },
  robots: {
    index: true,
    follow: true
  }
}
```

---

## Domain & DNS

### Recommended Domain
- Primary: `pratyaksha.app` ($20/year)
- Alternative: `pratyaksha.io` ($35/year)

### DNS Records (Vercel)
```
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
CNAME _vercel cname.vercel-dns.com
```

SSL: Auto-provisioned by Vercel (Let's Encrypt)

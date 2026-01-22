# Milestone 4.1: Technical Specification

## Project Setup

**Repository:** `pratyaksha-website`
**Framework:** Next.js 15 (App Router)
**Deployment:** Google Cloud Run (GCP)
**Domain:** pratyaksha.app

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
    "@gsap/react": "^2.1.0",
    "framer-motion": "^12.0.0",
    "lottie-react": "^2.4.0",
    "posthog-js": "^1.181.0",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-toast": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "lucide-react": "^0.562.0",
    "resend": "^4.2.0",
    "zod": "^3.24.0",
    "react-countup": "^6.5.0"
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

## Repository Structure

```
pratyaksha-website/
├── public/
│   ├── models/
│   │   └── brain-low-poly.glb
│   ├── images/
│   ├── animations/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       └── waitlist/
│   │           └── route.ts
│   ├── components/
│   │   ├── sections/
│   │   │   ├── Hero3D.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Science.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── FinalCTA.tsx
│   │   ├── 3d/
│   │   │   ├── Brain.tsx
│   │   │   ├── NeuralConnections.tsx
│   │   │   ├── Scene.tsx
│   │   │   └── Loader3D.tsx
│   │   ├── bento/
│   │   │   ├── BentoCard.tsx
│   │   │   └── BentoGrid.tsx
│   │   ├── pipeline/
│   │   │   ├── AgentCard.tsx
│   │   │   ├── SampleEntry.tsx
│   │   │   └── SankeySequence.tsx
│   │   ├── diagrams/
│   │   │   └── NeuralPipelineDiagram.tsx
│   │   ├── ui/                     (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── effects/
│   │   │   └── ParticleBurst.tsx
│   │   └── analytics/
│   │       ├── PostHogProvider.tsx
│   │       └── GoogleAnalytics.tsx
│   ├── assets/
│   │   └── lottie/
│   │       └── *.json
│   ├── hooks/
│   │   ├── useMediaQuery.ts
│   │   ├── use3DPerformance.ts
│   │   ├── useScrollProgress.ts
│   │   ├── useEmotionAnalysis.ts
│   │   └── useReducedMotion.ts
│   └── lib/
│       ├── analytics.ts
│       ├── constants.ts
│       ├── utils.ts
│       └── cn.ts
├── .env.local.example
├── .dockerignore
├── Dockerfile
├── cloudbuild.yaml
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Google Cloud Run Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Cloud Build Configuration

```yaml
# cloudbuild.yaml
steps:
  # Build the Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'asia-south1-docker.pkg.dev/$PROJECT_ID/pratyaksha/website:$COMMIT_SHA'
      - '-t'
      - 'asia-south1-docker.pkg.dev/$PROJECT_ID/pratyaksha/website:latest'
      - '--build-arg'
      - 'NEXT_PUBLIC_POSTHOG_KEY=${_NEXT_PUBLIC_POSTHOG_KEY}'
      - '--build-arg'
      - 'NEXT_PUBLIC_POSTHOG_HOST=${_NEXT_PUBLIC_POSTHOG_HOST}'
      - '--build-arg'
      - 'NEXT_PUBLIC_GA_ID=${_NEXT_PUBLIC_GA_ID}'
      - '--build-arg'
      - 'NEXT_PUBLIC_SITE_URL=${_NEXT_PUBLIC_SITE_URL}'
      - '.'

  # Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'asia-south1-docker.pkg.dev/$PROJECT_ID/pratyaksha/website:$COMMIT_SHA'

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'asia-south1-docker.pkg.dev/$PROJECT_ID/pratyaksha/website:latest'

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'pratyaksha-website'
      - '--image'
      - 'asia-south1-docker.pkg.dev/$PROJECT_ID/pratyaksha/website:$COMMIT_SHA'
      - '--region'
      - 'asia-south1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'RESEND_API_KEY=${_RESEND_API_KEY}'

images:
  - 'asia-south1-docker.pkg.dev/$PROJECT_ID/pratyaksha/website:$COMMIT_SHA'
  - 'asia-south1-docker.pkg.dev/$PROJECT_ID/pratyaksha/website:latest'

substitutions:
  _NEXT_PUBLIC_POSTHOG_KEY: ''
  _NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com'
  _NEXT_PUBLIC_GA_ID: ''
  _NEXT_PUBLIC_SITE_URL: 'https://pratyaksha.app'
  _RESEND_API_KEY: ''

options:
  logging: CLOUD_LOGGING_ONLY
```

### Next.js Configuration for Standalone

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  // Enable GSAP
  transpilePackages: ['gsap'],
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### Deployment Commands

```bash
# One-time setup: Create Artifact Registry repository
gcloud artifacts repositories create pratyaksha \
  --repository-format=docker \
  --location=asia-south1 \
  --description="Pratyaksha Docker images"

# Deploy using Cloud Build (from pratyaksha-website directory)
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions="_NEXT_PUBLIC_POSTHOG_KEY=$POSTHOG_KEY,_NEXT_PUBLIC_GA_ID=$GA_ID,_RESEND_API_KEY=$RESEND_API_KEY"

# Or deploy manually
docker build -t asia-south1-docker.pkg.dev/PROJECT_ID/pratyaksha/website:latest .
docker push asia-south1-docker.pkg.dev/PROJECT_ID/pratyaksha/website:latest

gcloud run deploy pratyaksha-website \
  --image asia-south1-docker.pkg.dev/PROJECT_ID/pratyaksha/website:latest \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "RESEND_API_KEY=$RESEND_API_KEY"
```

---

## Environment Variables

```bash
# .env.local.example

# Analytics (Public - exposed to browser)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://pratyaksha.app

# Server-side only
RESEND_API_KEY=re_xxx
```

---

## Domain & DNS Configuration

### Cloud Run Custom Domain

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service pratyaksha-website \
  --domain pratyaksha.app \
  --region asia-south1

# Get DNS records to configure
gcloud run domain-mappings describe \
  --domain pratyaksha.app \
  --region asia-south1
```

### DNS Records (at domain registrar)

```
Type    Host    Value
A       @       [Cloud Run IP - provided by gcloud]
AAAA    @       [Cloud Run IPv6 - provided by gcloud]
CNAME   www     ghs.googlehosted.com.
```

---

## Performance Targets

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| Lighthouse Performance | 90+ | Chrome DevTools |
| Lighthouse Accessibility | 95+ | Chrome DevTools |
| Lighthouse SEO | 100 | Chrome DevTools |
| First Contentful Paint | <1.5s | Web Vitals |
| Largest Contentful Paint | <2.5s | Web Vitals |
| Time to Interactive | <3s | Lighthouse |
| Cumulative Layout Shift | <0.1 | Web Vitals |
| 3D Load Time | <3s | Custom metric |
| Desktop FPS | 60 | Chrome DevTools |
| Mobile FPS | 30 | Chrome DevTools |

---

## SEO Configuration

```tsx
// app/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pratyaksha - See Your Mind. Clearly.',
  description:
    'AI-powered cognitive journal that visualizes emotional patterns, energy states, and mental insights. Built on CBT principles.',
  keywords: [
    'cognitive journal',
    'mental health',
    'AI insights',
    'emotional patterns',
    'CBT',
    'self-reflection',
  ],
  authors: [{ name: 'Pratyaksha Team' }],
  creator: 'Pratyaksha',
  openGraph: {
    title: 'Pratyaksha - See Your Mind. Clearly.',
    description:
      'AI-powered cognitive journal that visualizes your mind.',
    url: 'https://pratyaksha.app',
    siteName: 'Pratyaksha',
    images: [
      {
        url: 'https://pratyaksha.app/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pratyaksha - Mind Visualization Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pratyaksha - See Your Mind. Clearly.',
    description:
      'AI-powered cognitive journal that visualizes your mind.',
    images: ['https://pratyaksha.app/images/og-image.png'],
    creator: '@PratyakshaApp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification_token',
  },
}
```

---

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npx playwright test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - id: auth
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run
        run: |
          gcloud builds submit \
            --config=cloudbuild.yaml \
            --substitutions="_NEXT_PUBLIC_POSTHOG_KEY=${{ secrets.POSTHOG_KEY }},_NEXT_PUBLIC_GA_ID=${{ secrets.GA_ID }},_RESEND_API_KEY=${{ secrets.RESEND_API_KEY }}"
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
  email: 'hello@pratyaksha.app',
}

export const COLORS = {
  primary: '#6366F1', // Soft Indigo
  secondary: '#8B5CF6', // Soft Purple
  accent: '#10B981', // Calm Green
  background: '#0A0A0F', // Near black
  foreground: '#FAFAFA', // Off-white
  muted: '#94A3B8', // Gray
  cardGlass: 'rgba(255, 255, 255, 0.05)',
  borderGlass: 'rgba(255, 255, 255, 0.1)',
}

export const ANIMATION = {
  fast: 0.2, // Button hover
  normal: 0.4, // Card entrance
  slow: 0.8, // Section transitions
  scroll: 1.2, // Scroll-triggered
}

export const PRICING = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '50 entries/month',
      'Basic visualizations',
      '7-day data retention',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9,
    features: [
      'Unlimited entries',
      'All 21 visualizations',
      'Export data',
      'Priority AI processing',
      'Weekly email digests',
    ],
  },
}
```

# Pratyaksha Marketing Website

Scroll-driven cinematic landing experience for Pratyaksha.

## Features

- **Scroll-driven brain animation** - Frame-by-frame video playback synced to scroll
- **5-State Journey:**
  1. Hero (प्रत्यक्ष - Direct Perception)
  2. Problem (The Chaos)
  3. Solution (4-Agent Pipeline)
  4. Features (21 Visualizations)
  5. CTA (Start Free)
- **Rich interactions:**
  - Golden ratio (1.618x) hover zoom with context cards
  - Typewriter text with multi-font highlighted keywords
  - Cross-fade transitions between states
  - CTAs at every stage

## Development

```bash
cd website
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Cloud Run

```bash
# From repo root
gcloud builds submit --config=Pratyaksha/website/cloudbuild.yaml

# Deploy
gcloud run deploy pratyaksha-website \
  --image asia-south1-docker.pkg.dev/social-data-pipeline-and-push/pratyaksha/website:latest \
  --region asia-south1 \
  --allow-unauthenticated
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

## Video Frames

Place brain animation frames in `public/frames/`:
```
public/frames/
├── t1/frame_001.jpg ... frame_090.jpg  (Chaos)
├── t2/frame_091.jpg ... frame_180.jpg  (Organizing)
├── t3/frame_181.jpg ... frame_270.jpg  (Illuminated)
└── t4/frame_271.jpg ... frame_360.jpg  (Radiant)
```

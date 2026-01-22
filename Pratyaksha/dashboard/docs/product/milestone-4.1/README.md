# Milestone 4.1: Refined Marketing Website Plan

## Overview

This refined plan builds on Milestone 4 with research-backed decisions for creating an immersive, high-converting 3D marketing website for Pratyaksha.

**Repository:** `pratyaksha-website` (separate from dashboard)
**Deployment:** Google Cloud Run (GCP)
**Domain:** pratyaksha.app

---

## The 4 Phases

| Phase | Name | Core Feature | Animation Technique |
|-------|------|--------------|---------------------|
| 1 | Interactive Hero | Thought-reactive 3D brain | React Three Fiber + GSAP |
| 2 | Pipeline Storytelling | 4-Agent scroll deconstruction | GSAP + Frame Sequence |
| 3 | Bento Showcase | 21 charts live preview | Lottie + CSS Grid |
| 4 | Trust + CTA | Scientific credibility | GSAP (minimal) |

---

## Key Design Decisions

### Animation Technique Matrix

| Content | Technique | Reasoning |
|---------|-----------|-----------|
| 3D Brain Hero | R3F Real-time | Interactive emotion response |
| Text highlighting | GSAP ScrollTrigger | Lightweight, DOM-based |
| Sankey Diagram | Frame Sequence (40 frames) | Complex, needs scrub control |
| Chart Previews | Lottie loops | Small files, scalable |
| Loading States | Lottie | Tiny, professional |

### Why NOT Video for Scroll

Video is not designed for scrubbing backwards/forwards. Frame sequences provide perfect control for Apple-style scroll animations.

---

## Tech Stack

```json
{
  "framework": "Next.js 15 (App Router)",
  "3d": "React Three Fiber + drei",
  "animations": "GSAP ScrollTrigger + Framer Motion",
  "styling": "Tailwind CSS + shadcn/ui",
  "lottie": "lottie-react",
  "analytics": "PostHog + Google Analytics 4",
  "email": "Resend",
  "deployment": "Google Cloud Run",
  "domain": "pratyaksha.app"
}
```

---

## Asset Budget

| Category | Total Size | Files |
|----------|------------|-------|
| 3D Model | ~500KB | 1 GLB |
| Lottie Animations | ~600KB | 10 files |
| Frame Sequences | ~1.5MB | 64 frames |
| Static Images | ~1MB | 8+ files |
| **Total** | **~3.6MB** | - |

---

## Documents in This Folder

1. `phase-1-hero.md` - Interactive Hero Experience
2. `phase-2-pipeline.md` - 4-Agent Pipeline Storytelling
3. `phase-3-bento.md` - 21 Charts Bento Showcase
4. `phase-4-trust.md` - Scientific Credibility + CTA
5. `assets-inventory.md` - Complete asset list with specs
6. `technical-spec.md` - Technical implementation + Cloud Run deployment

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 90+ |
| 3D Load Time | <3s |
| Waitlist Conversion | 3-5% |
| Week 1 Signups | 500+ |
| Product Hunt Ranking | Top 10 |

---

## Sprint Timeline

| Sprint | Focus | Deliverable |
|--------|-------|-------------|
| 1 | Foundation | Next.js + Cloud Run deploy |
| 2 | Phase 1 | Interactive 3D brain hero |
| 3 | Phase 2 | 4-Agent scroll storytelling |
| 4 | Phase 3 | Bento grid + Lottie previews |
| 5 | Phase 4 | Trust section + CTA + analytics |
| 6 | Launch | PH assets + final polish |

# Milestone 6: Launch & Marketing Website

> **Status:** Active
> **Target:** Production Launch
> **Prerequisites:** Milestone 5 (User Journey & Gamification)

---

## Overview

Milestone 6 focuses on launching Pratyaksha to production with a polished marketing website, high-quality video content, and essential business infrastructure (analytics, payments).

---

## Components

### 6.1 Marketing Website 2.0 (pratyaksha-website-2.0)

**Status:** Feature Complete ✅

A scroll-driven cinematic landing experience with:

- **Scroll-driven frame animation** - Brain transformation visualization
- **5-State Journey:**
  1. Hero (प्रत्यक्ष - Direct Perception)
  2. Problem (The Chaos - scattered thoughts)
  3. Solution (4-Agent Pipeline)
  4. Features (21 Visualizations)
  5. CTA (Start Free)
- **Rich interactions:**
  - Golden ratio (1.618x) hover zoom
  - Typewriter text with multi-font highlights
  - Cross-fade transitions between states
  - CTAs at every stage with secondary actions
- **Performance optimized:**
  - Reduced particles, memoized calculations
  - Stepped blur values for GPU
  - Separated canvas resize from frame drawing

**Location:** `pratyaksha-website-2.0/`

### 6.2 4K Video Upgrade

**Status:** Pending 🔄

Current video frames are pixelated. Need high-resolution brain animation:

- **Target resolution:** 4K (3840×2160) or minimum 1080p
- **Quality tiers:** 4k, hd (1920px), sd (960px)
- **Adaptive loading:** Based on device pixel ratio & network
- **Folder structure:** `/frames/{quality}/t{1-4}/frame_{n}.jpg`

**Tasks:**
- [ ] Source/create 4K brain animation video
- [ ] Implement FFmpeg extraction at multiple resolutions
- [ ] Add adaptive quality loader (`src/lib/frameLoader.ts`)
- [ ] Progressive loading (SD → HD → 4K)

### 6.3 Launch Infrastructure

**Status:** Pending 🔄

#### Analytics (PostHog)
- [ ] Install PostHog SDK
- [ ] Configure event tracking
- [ ] Set up conversion funnels
- [ ] Create dashboards

#### Payments (Stripe/Razorpay)
- [ ] Decide payment provider (Stripe global, Razorpay India)
- [ ] Create pricing tiers
- [ ] Implement subscription flow
- [ ] Add billing portal

#### Blog
- [ ] Set up blog (mdx-bundler or separate)
- [ ] Create launch announcement post
- [ ] Write "How it works" tutorial
- [ ] SEO optimization

#### Google Analytics
- [ ] GA4 setup
- [ ] Configure goals & conversions
- [ ] UTM tracking for campaigns

#### Demo Mode
- [ ] Create demo data set
- [ ] Implement demo toggle
- [ ] Auto-tour for demo visitors

---

## Deployment Plan

### Website 2.0 as Default
1. Build production bundle
2. Configure Cloud Run for website
3. Point domain to new website
4. Keep dashboard at `/dashboard` subdomain or path

### Domain Structure (Proposed)
```
pratyaksha.io/         → Marketing Website 2.0
pratyaksha.io/app/     → Dashboard Application
pratyaksha.io/blog/    → Blog
pratyaksha.io/docs/    → Documentation (future)
```

---

## Timeline

| Phase | Items | Status |
|-------|-------|--------|
| **Phase 1** | Website 2.0 ready, merge to main | ✅ Ready |
| **Phase 2** | 4K video upgrade | 🔄 Pending |
| **Phase 3** | PostHog + GA4 | 🔄 Pending |
| **Phase 4** | Stripe/Razorpay integration | 🔄 Pending |
| **Phase 5** | Blog + Demo mode | 🔄 Pending |
| **Launch** | Production deployment | 🔜 After Phase 1-3 |

---

## Dependencies from Milestone 5

These must be completed before launch:
- [ ] User journey & onboarding flow
- [ ] Progressive unlocks system
- [ ] First-entry experience
- [ ] Streak & gamification

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Landing → Dashboard click | > 15% |
| Demo tour completion | > 70% |
| First entry created | > 40% of signups |
| Day 7 retention | > 35% |
| Paid conversion (Month 1) | > 2% |

---

*Milestone 6 | Pratyaksha Launch*

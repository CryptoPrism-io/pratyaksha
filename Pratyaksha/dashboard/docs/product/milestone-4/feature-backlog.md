# Milestone 4: Feature Backlog

**Project:** Pratyaksha 3D Marketing Website
**Prioritization:** ICE Score (Impact x Confidence x Ease)

---

## Priority Legend
- **P0:** Critical for launch
- **P1:** High value, needed soon
- **P2:** Nice to have
- **P3:** Future consideration

## Complexity Legend
- **S:** <1 day
- **M:** 1-3 days
- **L:** 1 week
- **XL:** 2+ weeks

---

## Website Features

### P0 - Critical (Must Have for Launch)

| Feature | Complexity | ICE Score | Sprint | Notes |
|---------|------------|-----------|--------|-------|
| Next.js 15 + R3F Foundation | M | 850 | 1 | Modern stack, excellent perf |
| 3D Brain Hero Section | L | 900 | 2 | Primary differentiator |
| Hero Section Responsive | M | 720 | 2 | Mobile 60%+ of traffic |
| How It Works Section | M | 650 | 3 | Explains 3-step flow |
| Features Showcase | M | 650 | 3 | 6 cards with animations |
| Pricing Section | S | 600 | 3 | Free + Pro tiers |
| Waitlist CTA + API | M | 700 | 3-4 | Email capture critical |
| Basic SEO (meta, sitemap) | S | 600 | 4 | Crawlability |
| Vercel Deployment | S | 550 | 1 | Go-live foundation |

### P1 - High Value

| Feature | Complexity | ICE Score | Sprint | Notes |
|---------|------------|-----------|--------|-------|
| GSAP ScrollTrigger Animations | M | 720 | 3 | Storytelling through scroll |
| PostHog Analytics | M | 800 | 4 | Conversion tracking |
| Google Analytics 4 | S | 504 | 4 | Traffic insights |
| Science Section | M | 500 | 3 | Credibility builder |
| Testimonials Section | S | 480 | 3 | Social proof |
| Open Graph Images | S | 450 | 4 | Social sharing |
| Neural Particle System | M | 600 | 2 | Visual polish |
| Mobile 3D Fallback | M | 700 | 2 | Performance critical |

### P2 - Nice to Have

| Feature | Complexity | ICE Score | Sprint | Notes |
|---------|------------|-----------|--------|-------|
| Session Replay | M | 450 | 4 | UX debugging |
| Feature Flags (A/B) | M | 450 | 4 | Post-launch optimization |
| Cookie Consent Banner | S | 400 | 4 | GDPR compliance |
| Blog Section | L | 350 | 5+ | SEO long-tail |
| Loading Progress Bar | S | 380 | 2 | UX polish |
| Micro-interactions | M | 360 | 3 | Feature card hovers |

### P3 - Future

| Feature | Complexity | ICE Score | Sprint | Notes |
|---------|------------|-----------|--------|-------|
| Advanced 3D Effects | L | 300 | Post-launch | Bloom, DOF |
| Animated Testimonials | M | 280 | Post-launch | Carousel |
| Localization | XL | 250 | Post-launch | i18n support |
| Dark/Light Toggle | S | 200 | Post-launch | Already dark |

---

## Analytics Events

### P0 - Must Track

| Event | Properties | Purpose |
|-------|------------|---------|
| `page_view` | path, referrer, device | Traffic analysis |
| `waitlist_signup` | email_domain, source | Conversion |
| `hero_3d_loaded` | load_time, success | Performance |
| `cta_click` | button_location, text | CTA optimization |

### P1 - Important

| Event | Properties | Purpose |
|-------|------------|---------|
| `section_viewed` | section_name, time_visible | Engagement |
| `feature_card_hover` | feature_name | Interest heatmap |
| `pricing_viewed` | scroll_depth | Purchase intent |
| `scroll_depth` | percentage (25/50/75/100) | Content engagement |

### P2 - Nice to Have

| Event | Properties | Purpose |
|-------|------------|---------|
| `3d_interaction` | action_type | 3D engagement |
| `testimonial_viewed` | testimonial_index | Social proof impact |
| `external_link_click` | destination | Traffic leakage |

---

## Launch Assets

### P0 - Critical

| Asset | Format | Size | Sprint |
|-------|--------|------|--------|
| Brain 3D Model | GLB (Draco) | <500KB | 2 |
| OG Image | PNG | 1200x630 | 4 |
| Favicon | SVG | <10KB | 1 |
| Product Hunt Thumbnail | PNG | 240x240 | 5 |
| PH Gallery Images (3) | PNG | 1270x760 | 5 |
| Launch Thread GIFs | GIF | <5MB each | 5 |

### P1 - Important

| Asset | Format | Size | Sprint |
|-------|--------|------|--------|
| Dashboard Preview | PNG | ~200KB | 4 |
| Feature Screenshots (6) | PNG | ~100KB each | 4 |
| Press Kit PDF | PDF | <2MB | 5 |
| Logo Pack | SVG/PNG | Various | 1 |

---

## Dependencies Map

```
Sprint 1 (Foundation)
├── Next.js Setup (no deps)
├── Tailwind + shadcn (no deps)
├── Vercel Deploy (depends on Next.js)
└── PostHog Account Setup (no deps)

Sprint 2 (3D Hero)
├── Brain Model (no deps - external source)
├── R3F Canvas (depends on Next.js)
├── Brain Component (depends on model)
├── Particle System (depends on Canvas)
└── Mobile Fallback (depends on Brain)

Sprint 3 (Content)
├── How It Works (depends on GSAP)
├── Features (depends on layout)
├── Science (no deps)
├── Testimonials (no deps - content ready)
├── Pricing (no deps)
└── CTA (depends on API endpoint)

Sprint 4 (Analytics)
├── PostHog Integration (depends on Sprint 1 setup)
├── GA4 Integration (no deps)
├── Events (depends on PostHog)
├── SEO Meta (no deps)
└── Waitlist API (depends on Resend)

Sprint 5 (Launch Prep)
├── PH Assets (depends on Sprint 3 content)
├── HN Post (depends on content)
├── Twitter Thread (depends on assets)
├── Beta Tester Outreach (no deps)
└── QA Testing (depends on all features)

Sprint 6 (Launch)
└── All launches (depends on Sprint 5)
```

---

## Descope Options

### If Behind Schedule

**Week 2 (3D Hero):**
- Skip particle system, add post-launch
- Use simpler brain model with fewer polygons
- Static hero image instead of 3D (last resort)

**Week 3 (Content):**
- Reduce testimonials to 2 (instead of 4)
- Simplify Science section to text-only
- Skip micro-interaction hover effects

**Week 4 (Analytics):**
- GA4 only, defer PostHog
- Skip session replay
- Basic SEO only (meta tags)

**Week 5 (Launch Prep):**
- Skip press kit
- 1 PH gallery image instead of 3
- 5-tweet thread instead of 10

### If Ahead of Schedule

**Add from P2:**
- Blog section shell
- Advanced 3D effects (bloom)
- Session replay configuration
- A/B test infrastructure

---

## Effort Estimates

| Sprint | Features | Est. Hours | Buffer |
|--------|----------|------------|--------|
| 1 | Foundation | 16 hrs | 4 hrs |
| 2 | 3D Hero | 32 hrs | 8 hrs |
| 3 | Content | 40 hrs | 8 hrs |
| 4 | Analytics | 24 hrs | 4 hrs |
| 5 | Launch Prep | 24 hrs | 8 hrs |
| 6 | Launch | 16 hrs | 8 hrs |
| **Total** | | **152 hrs** | **40 hrs** |

**With buffer:** ~192 hours (~5 weeks full-time)

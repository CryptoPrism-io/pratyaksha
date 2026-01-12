# Milestone 4: 3D Marketing Website & Launch Infrastructure

## Vision Statement

Create a **killer 3D marketing website** that communicates "Your Mind, Visualized" with scientific credibility and premium aesthetics. This is a **separate project** from the main dashboard with its own repository, deployment, and analytics.

---

## Strategic Objectives

| Objective | Success Metric |
|-----------|----------------|
| Stunning first impression | Hero 3D load time <3s |
| Clear value proposition | Scroll depth >70% |
| High conversion | Waitlist signup rate >3% |
| Launch momentum | Product Hunt Top 10 |
| Sustainable growth | 500+ signups Week 1 |

---

## Tech Stack

```json
{
  "framework": "Next.js 15 (App Router)",
  "3d": "React Three Fiber + drei",
  "animations": "GSAP ScrollTrigger + Framer Motion",
  "styling": "Tailwind CSS + shadcn/ui",
  "analytics": "PostHog + Google Analytics 4",
  "email": "Resend",
  "deployment": "Vercel",
  "domain": "pratyaksha.app"
}
```

---

## Page Structure (7 Sections)

### 1. Hero Section with 3D Brain
- Low-poly stylized brain (5000-10000 polygons)
- Neural particle connections pulsing on scroll
- Holographic glassmorphism effect
- "Your Mind, Visualized" tagline with word-by-word animation

### 2. How It Works (3-Step Animation)
1. **Log Your Thoughts** - Journal icon transforms into text particles
2. **AI Analyzes** - 4 agent icons orbit around text sphere
3. **Gain Insights** - Charts materialize from data points

### 3. Features (6 Cards)
| Feature | Icon | Hover Animation |
|---------|------|-----------------|
| Emotional Timeline | LineChart | Chart line draws |
| AI-Powered Insights | Brain | Pulse effect |
| Pattern Recognition | Target | Concentric rings |
| Privacy-First | Shield | Lock animation |
| Beautiful Visualizations | Sparkles | Particle burst |
| Export & Share | Download | Progress bar |

### 4. Science Section
- "Built on Cognitive Behavioral Therapy principles"
- "4-Agent AI Pipeline inspired by clinical assessment"
- Neural network diagram with labeled nodes
- Disclaimer: Not a replacement for professional therapy

### 5. Testimonials
- 3-4 beta tester quotes (anonymous)
- Outcome-based messaging:
  - "Helped me spot anxiety triggers I missed for months"
  - "The contradiction tracker showed patterns my therapist confirmed"

### 6. Pricing
| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/month | 50 entries/month, basic charts, 7-day retention |
| **Pro** | $9/month | Unlimited entries, all charts, export, priority AI |

### 7. Final CTA
- Full-width gradient section
- Email input with inline validation
- Real-time counter: "Join 200+ early users"

---

## Sprint Breakdown

### Sprint 1: Foundation (Week 1)
- Initialize Next.js 15 project with TypeScript
- Set up Tailwind + shadcn/ui
- Configure Vercel + domain
- PostHog initial integration
- **Deliverable:** Deployed placeholder site

### Sprint 2: 3D Brain Hero (Week 2)
- Download/optimize brain 3D model
- Set up R3F Canvas with lighting
- Implement brain rotation on scroll
- Neural particle system
- Mobile fallback (static render)
- **Deliverable:** Working 3D hero, <3s load

### Sprint 3: Content Sections (Week 3)
- How It Works with GSAP ScrollTrigger
- Features cards with hover effects
- Science section
- Testimonials carousel
- Pricing section
- Final CTA with waitlist form
- **Deliverable:** Complete marketing page

### Sprint 4: Analytics & SEO (Week 4)
- Complete PostHog integration (all events)
- Google Analytics 4
- Session recording + heatmaps
- Feature flags (A/B ready)
- SEO optimization (meta, sitemap, robots.txt)
- Open Graph images
- `/api/waitlist` endpoint
- **Deliverable:** Full analytics + SEO

### Sprint 5: Launch Prep (Week 5)
- Product Hunt assets
- Hacker News post + first comment
- Twitter launch thread (10 tweets)
- Press kit creation
- Beta tester outreach (10 people)
- Final QA + Playwright tests
- **Deliverable:** All launch assets ready

### Sprint 6: Launch Week (Week 6)
- Monday: Final checks, schedule emails
- Tuesday: Product Hunt launch
- Wednesday: Hacker News "Show HN"
- Thursday-Friday: Bug fixes, A/B tests
- **Deliverable:** Live product, 500+ signups

---

## Repository Structure

```
pratyaksha-marketing/
├── public/
│   ├── models/
│   │   ├── brain-low-poly.glb      (<500KB)
│   │   └── brain-fallback.jpg      (mobile)
│   ├── images/
│   │   ├── og-image.png            (1200x630)
│   │   └── dashboard-preview.png
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/waitlist/route.ts
│   ├── components/
│   │   ├── sections/
│   │   │   ├── Hero3D.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Science.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── CTA.tsx
│   │   ├── 3d/
│   │   │   ├── Brain.tsx
│   │   │   ├── NeuralConnections.tsx
│   │   │   ├── Scene.tsx
│   │   │   └── Loader3D.tsx
│   │   ├── ui/                     (shadcn)
│   │   └── analytics/
│   │       ├── PostHogProvider.tsx
│   │       └── GoogleAnalytics.tsx
│   ├── lib/
│   │   ├── analytics.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── hooks/
│       ├── useMediaQuery.ts
│       ├── use3DPerformance.ts
│       └── useScrollProgress.ts
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
├── vercel.json
└── package.json
```

---

## Success Metrics

### Pre-Launch (2 Weeks Before)
- [ ] Waitlist signups: 200+
- [ ] Twitter followers: 100+
- [ ] Beta testers: 10+ committed

### Launch Day
- [ ] Product Hunt upvotes: 50+ (Top 10 goal: 200+)
- [ ] Unique visitors: 1,000+
- [ ] Waitlist conversion: 3-5%

### Week 1 Post-Launch
- [ ] Total signups: 500+
- [ ] Hacker News points: 50+
- [ ] Organic search traffic: 50+ visitors

### Technical Performance
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 95+
- [ ] Lighthouse SEO: 100
- [ ] First Contentful Paint: <1.5s
- [ ] Time to Interactive: <3s

---

## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 3D performance on mobile | High | High | LOD system, static fallback |
| Model file size | Medium | Medium | Draco compression, progressive load |
| GSAP/R3F conflicts | Low | Medium | Separate scroll from 3D logic |

### Launch Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PH launch flops | Medium | High | Pre-build audience, engage 2 weeks prior |
| Negative HN comments | Medium | Medium | Prepare FAQ, stay humble |
| Low conversion | Medium | High | A/B test CTAs, session replay |

---

## Next Steps

1. Create GitHub repository `pratyaksha-marketing`
2. Register domain `pratyaksha.app`
3. Set up PostHog + GA4 accounts
4. Source 3D brain model from Poly Pizza
5. Create design mockups in Figma

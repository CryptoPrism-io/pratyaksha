# Pratyaksha: Feature Backlog

**Date:** January 9, 2026
**Roadmap Reference:** `milestone-3/roadmap.md`

---

## Backlog Overview

Features prioritized using ICE scoring (Impact x Confidence x Ease) and organized by sprint.

**Priority Legend:**
- **P0:** Critical for launch
- **P1:** High value, needed soon
- **P2:** Nice to have
- **P3:** Future consideration

**Complexity Legend:**
- **S:** <1 day
- **M:** 1-3 days
- **L:** 1 week
- **XL:** 2+ weeks

---

## Sprint 14: Foundation Layer (AI Explainers + Radar %)

| Feature | Priority | Complexity | Dependencies | ICE Score | User Value | Technical Risk |
|---------|----------|------------|--------------|-----------|------------|----------------|
| Energy Radar % Transformation | P0 | M | None | 441 | Context for patterns | Low |
| ChartExplainer Component | P0 | M | None | 432 | Reusable across all charts | Low |
| AI Chart Explainers - Core System | P0 | L | None | 360 | Users understand chart meaning | Medium |
| Explainer for 4 Core Charts | P0 | M | ChartExplainer | 486 | Energy Radar, Mode, Timeline, Contradiction | Medium |
| Explainer Caching Layer | P1 | S | ChartExplainer | 432 | Reduces API costs, faster UX | Low |
| Benchmark Indicators UI | P1 | S | Radar % Transform | 320 | Visual feedback on health metrics | Low |
| Explainer for Supporting Charts | P2 | M | ChartExplainer | 252 | Theme Cloud, Calendar, Activity | Low |

### Sprint 14 Success Criteria
- Energy Radar shows percentages with benchmark status
- 2+ charts have working AI explainers
- Explainer responses cached in localStorage

### Sprint 14 Descope Options
- Defer supporting chart explainers to Sprint 15
- Start with 2 charts (Energy Radar + Mode Distribution) for initial validation

---

## Sprint 15-16: Insights v2 - HCD Redesign

| Feature | Priority | Complexity | Dependencies | ICE Score | User Value | Technical Risk |
|---------|----------|------------|--------------|-----------|------------|----------------|
| MetricCard Component | P0 | S | None | 567 | Scannable KPIs with trends | Low |
| HeroHighlight Component | P0 | M | Hero endpoint | 504 | Reduces cognitive load | Low |
| Insights Page Responsive Design | P0 | M | All components | 504 | Mobile experience critical | Low |
| Hero Highlight AI Endpoint | P0 | L | AI Explainers | 360 | Most important insight first | High |
| DeepDive Tabbed Explorer | P1 | M | Existing charts | 336 | Advanced users dig deeper | Low |
| FocusAreas Component | P1 | M | Pattern analysis | 294 | Personalized concerns | Medium |
| Weekly/Monthly Toggle | P2 | S | None | 280 | Time period flexibility | Low |
| Progressive Disclosure Animation | P3 | S | DeepDive | 168 | Aesthetic enhancement | Low |

### Recommended: Simplify Hero Highlight

**Option A (Original):** AI-generated highlight
- Complexity: L
- Risk: High
- Effort: 3-4 days

**Option B (Recommended):** Rule-based highlight
```typescript
// Instead of complex AI analysis:
const highlight = {
  title: `Your most common mode: ${topMode}`,
  insight: `You logged ${entryCount} entries this week, ${percentChange}% vs last week.`,
  cta: "Explore patterns"
}
```
- Complexity: S
- Risk: Low
- Effort: 1 day
- **Savings: 3 days**

### Sprint 15-16 Descope Options
- Use rule-based Hero Highlight (saves 3 days)
- Defer FocusAreas to Sprint 17+
- Skip progressive disclosure animations

---

## Sprint 17: Whisper + Intent LLM Integration

| Feature | Priority | Complexity | Dependencies | ICE Score | User Value | Technical Risk |
|---------|----------|------------|--------------|-----------|------------|----------------|
| UI Integration in LogEntryForm | P0 | M | useSpeechToText | 384 | Seamless voice experience | Low |
| Fallback to Web Speech API | P1 | S | None | 384 | Graceful degradation | Low |
| OpenAI SDK Integration | P0 | M | None | 343 | Add openai npm package | Medium |
| Audio Blob Upload | P1 | M | useSpeechToText | 336 | Base64 encoding + streaming | Medium |
| Intent LLM Processing | P0 | M | Whisper | 315 | Cleaned entries + auto-tags | Medium |
| useSpeechToText Hook | P0 | L | Whisper endpoint | 224 | MediaRecorder audio capture | High |
| Cost Monitoring Dashboard | P2 | M | Whisper live | 210 | Track Whisper API costs | Low |
| Whisper Transcription Backend | P0 | L | OpenAI SDK | 192 | Accurate transcription | High |

### Sprint 17 Descope Options

**Option: Skip Whisper Entirely**
- Keep Web Speech API as primary
- Trade-off: Lower accuracy for Indian English accents
- Recommendation: Only add Whisper if user complaints about accuracy
- **Savings: Entire sprint**

**Option: Simplified Intent LLM**
- Use GPT-4o-mini for cleanup only, skip auto-tagging
- Reduces complexity M -> S
- Still get cleaned transcripts

---

## Milestone 4: Marketing Website (Parallel Track)

| Feature | Priority | Complexity | Dependencies | ICE Score | User Value | Technical Risk |
|---------|----------|------------|--------------|-----------|------------|----------------|
| Email Capture Form | P0 | S | None | 648 | Waitlist building | Low |
| How It Works Section | P0 | M | None | 504 | Explains 3-step flow | Low |
| Features Showcase | P0 | M | None | 504 | Chart previews | Low |
| Next.js Project Setup | P0 | S | None | 486 | Foundation for site | Low |
| Deploy to Vercel | P0 | S | Next.js | 486 | Public launch | Low |
| Hero Section (No 3D) | P0 | M | Next.js | 441 | Clear value prop, CTA | Low |
| ProductHunt Launch Prep | P1 | M | Marketing site | 432 | Launch day traffic | Medium |
| GA4 + PostHog Integration | P1 | M | None | 392 | Track conversions | Medium |
| Testimonials / Social Proof | P1 | S | Beta users | 392 | Trust building | Low |
| Pricing Page | P2 | M | None | 252 | Free + premium tiers | Low |
| 3D Brain Component | P1 | XL | Three.js | 80 | Visual "wow" factor | High |

### Critical Recommendation: Skip 3D Brain

| Metric | 3D Brain | Illustrated Brain |
|--------|----------|-------------------|
| ICE Score | 80 (lowest) | ~400 |
| Complexity | XL | S |
| Risk | High | Low |
| Time | 2+ weeks | 1-2 days |

**Alternative:** High-quality brain illustration + subtle CSS animations
- Saves 2+ weeks of dev time
- No Three.js performance concerns on mobile
- Still looks professional

---

## Analytics & GTM Features

| Feature | Priority | Complexity | Dependencies | ICE Score |
|---------|----------|------------|--------------|-----------|
| Google Analytics 4 Setup | P1 | S | Marketing site | 504 |
| ProductHunt Launch Prep | P1 | M | Marketing site | 432 |
| PostHog Product Analytics | P1 | M | Dashboard live | 392 |
| Event Tracking (7 key events) | P1 | M | PostHog | 392 |
| Feature Flags System | P2 | M | PostHog | 294 |

### Key Events to Track
1. `entry_created` - type, word_count, has_voice
2. `insight_viewed` - insight_type, chart_name
3. `explainer_opened` - chart_type, time_spent
4. `voice_recording_started` - duration, success
5. `notification_enabled` - frequency, timezone
6. `streak_achieved` - streak_length
7. `export_triggered` - format, date_range

---

## Prioritized Implementation Order

### NOW - Sprint 14 (Week 1)
1. Energy Radar % Transformation
2. ChartExplainer Component
3. Backend `/api/explain/:chartType` endpoint
4. Explainer for Energy Radar + Mode Distribution
5. Benchmark Indicators UI
6. Caching Layer

### NEXT - Sprint 15-16 (Week 2-3)
1. Rule-based Hero Highlight (simplified)
2. MetricCard Component
3. HeroHighlight Component
4. DeepDive Tabs
5. Responsive Design
6. Remaining chart explainers

### LATER - Sprint 17+ (Backlog)
**Option A:** Whisper Integration (if users request)
**Option B:** Marketing Website (parallel)
**Option C:** Analytics & GTM

---

## Dependencies Map

```
Sprint 14
├── Energy Radar % (no deps)
├── ChartExplainer Component (no deps)
│   └── Explainer Caching (depends on ChartExplainer)
│   └── Chart Integrations (depends on ChartExplainer)
└── Benchmark Indicators (depends on Radar %)

Sprint 15-16
├── Hero Highlight (depends on Sprint 14 AI patterns)
├── MetricCard (no deps)
├── DeepDive (depends on existing charts)
└── Responsive Design (depends on all components)

Sprint 17 (if needed)
├── OpenAI SDK (no deps)
│   └── Whisper Backend (depends on SDK)
│       └── useSpeechToText (depends on Whisper)
│           └── UI Integration (depends on hook)
└── Web Speech Fallback (no deps - already exists)

Milestone 4 (parallel)
├── Next.js Setup (no deps)
│   └── All marketing pages (depends on Next.js)
│   └── Vercel Deploy (depends on pages)
├── GA4/PostHog (can start anytime)
└── 3D Brain (SKIP - too risky)
```

---

## Risk Assessment

### Technical Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Hero Highlight AI hallucinations | Medium | Medium | Use rule-based approach |
| Whisper audio codec issues | High | Medium | Keep Web Speech fallback |
| 3D Brain mobile performance | High | High | Skip 3D, use illustrations |
| Whisper cost overruns | Medium | Low | Add cost monitoring + quotas |

### Product Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Users don't engage with Insights v2 | High | Low | A/B test with PostHog flags |
| AI explainers give wrong advice | High | Medium | Add disclaimers, focus on patterns |
| Voice accuracy complaints | Medium | Medium | Whisper as "premium" upgrade |

---

## Files to Create/Modify

### Sprint 14 - New Files
- `src/components/charts/ChartExplainer.tsx`
- `src/hooks/useChartExplainer.ts`
- `server/routes/explain.ts`
- `server/lib/explainerPrompts.ts`

### Sprint 14 - Modified Files
- `src/lib/transforms.ts` (add percentage functions)
- `src/components/charts/EnergyRadar.tsx` (display %)
- `server/index.ts` (register `/api/explain` route)

### Sprint 15-16 - New Files
- `src/pages/InsightsV2.tsx`
- `src/components/insights/HeroHighlight.tsx`
- `src/components/insights/MetricCard.tsx`
- `src/components/insights/DeepDive.tsx`
- `server/routes/insights.ts`

### Sprint 17 - New Files (if proceeding)
- `src/hooks/useSpeechToText.ts`
- `server/routes/speech.ts`
- `server/lib/intentPrompt.ts`

### Milestone 4 - New Repository
- `pratyaksha-website/` (Next.js + Tailwind)

---

## Next Steps

1. Validate Sprint 14 scope with engineering team
2. Decide on Hero Highlight approach: Rule-based vs AI
3. Confirm 3D Brain decision: Skip or commit 2+ weeks
4. Set up PostHog for feature flagging
5. Create GitHub issues for each P0 feature
6. Recruit 5 beta users for testimonials

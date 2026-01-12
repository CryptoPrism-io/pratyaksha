# Pratyaksha: Milestones 3 & 4 Strategic Plan

## Vision Statement

Transform Pratyaksha from a functional journaling tool into an **intelligent cognitive companion** with world-class UX and a compelling market presence. This involves:

1. **AI Explainers** - Every chart speaks to the user
2. **Insights v2** - HCD/HCI-driven redesign
3. **Whisper + Intent LLM** - True voice understanding
4. **3D Marketing Website** - A separate milestone for launch

---

## Milestone 3: Intelligent Dashboard

### 3.1 AI Chart Explainers System

**Problem**: Users see charts but don't understand what they mean for their mental health.

**Solution**: Every chart gets a contextual AI explainer icon that provides personalized insights.

```
┌─────────────────────────────────────────────────────────┐
│  Energy Patterns                              [?] [AI]  │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Radar Chart                            │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ AI Explainer Popover ──────────────────────────┐   │
│  │ 🧠 What This Means For You                      │   │
│  │                                                  │   │
│  │ Your energy patterns show **67% stability**,    │   │
│  │ which is above healthy baseline. However,       │   │
│  │ "Chaotic" energy appeared 4 times this week,    │   │
│  │ correlating with your Work entries.             │   │
│  │                                                  │   │
│  │ 💡 Insight: Consider energy check-ins before    │   │
│  │ work tasks to catch chaotic patterns early.     │   │
│  │                                                  │   │
│  │ [View Related Entries]     [Dismiss]            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Architecture**:
```
User clicks [AI] icon
       ↓
Fetch chart's current data + user's entries context
       ↓
Send to OpenRouter (gpt-4o-mini) with chart-specific prompt
       ↓
Stream response into Popover component
       ↓
Cache explanation for 1 hour (localStorage)
```

**Files to Create**:
| File | Purpose |
|------|---------|
| `src/components/charts/ChartExplainer.tsx` | Reusable explainer button + popover |
| `src/hooks/useChartExplainer.ts` | AI call + caching logic |
| `server/routes/explain.ts` | `/api/explain/:chartType` endpoint |
| `server/lib/explainerPrompts.ts` | Chart-specific system prompts |

**Chart-Specific Prompts** (examples):
- **EnergyRadar**: "Analyze the user's energy shape distribution. Identify dominant patterns, correlations with entry types, and actionable recommendations."
- **ModeDistribution**: "Interpret the cognitive mode breakdown. Which modes dominate? What does the balance suggest about mental state?"
- **ContradictionFlow**: "Explain the user's contradiction patterns. Which inner conflicts are most frequent? What entry types trigger them?"
- **EmotionalTimeline**: "Analyze the sentiment trajectory. Are there patterns by time of day or week? What's the overall emotional arc?"

**Caching Strategy**:
```typescript
const CACHE_KEY = `explainer_${chartType}_${dataHash}_${userId}`
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Check cache before API call
const cached = localStorage.getItem(CACHE_KEY)
if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  return cached.explanation
}
```

---

### 3.2 Energy Radar % of Grand Total Refactor

**Problem**: Raw counts don't tell the full story. "Rising: 5" means nothing without context.

**Solution**: Display as percentage of total entries, with benchmarks.

**Current** (count-based):
```
Rising: 5
Flat: 3
Chaotic: 2
```

**Proposed** (percentage-based with benchmark):
```
Rising: 50% (▲ above 30% benchmark)
Flat: 30% (✓ at 30% benchmark)
Chaotic: 20% (▼ above 15% concern threshold)
```

**Implementation**:

```typescript
// transforms.ts - new function
export function toEnergyShapePercentages(entries: Entry[]): EnergyShapePercent[] {
  const total = entries.length
  const counts = entries.reduce((acc, e) => {
    acc[e.energyShape] = (acc[e.energyShape] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return ENERGY_SHAPES.map(shape => ({
    shape,
    count: counts[shape] || 0,
    percentage: total > 0 ? ((counts[shape] || 0) / total) * 100 : 0,
    benchmark: SHAPE_BENCHMARKS[shape],
    status: getStatus(percentage, SHAPE_BENCHMARKS[shape])
  }))
}

const SHAPE_BENCHMARKS = {
  Rising: 15,      // Growth - want high
  Expanding: 10,
  Pulsing: 10,
  Centered: 20,    // Stability - want high
  Stabilized: 15,
  Flat: 10,
  Cyclical: 5,
  Chaotic: 5,      // Challenge - want low
  Heavy: 5,
  Collapsing: 3,
  Contracted: 2,
  Uneven: 5
}
```

**Files to Modify**:
- `src/lib/transforms.ts` - Add `toEnergyShapePercentages()`
- `src/hooks/useEntries.ts` - Add `useEnergyShapePercentages()` hook
- `src/components/charts/EnergyRadar.tsx` - Display percentages + benchmark indicators
- `src/components/charts/EnergyRadarGroup.tsx` - Update health score calculations

---

### 3.3 Insights Page v2 - HCD/HCI Redesign

**Current Problems**:
1. Information overload - too many cards at once
2. No clear hierarchy - all insights feel equal
3. No progressive disclosure - advanced users want depth, new users want simplicity
4. No personalization - same layout regardless of user's patterns

**HCD Principles to Apply**:
1. **Recognition over Recall** - Show the most relevant insight first
2. **Progressive Disclosure** - Start simple, let users dig deeper
3. **Aesthetic-Usability Effect** - Beautiful designs feel more usable
4. **Hick's Law** - Reduce choices at each decision point

**New Information Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  INSIGHTS                                    [Week] [Month] │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🌟 YOUR HIGHLIGHT                                   │   │
│  │                                                      │   │
│  │  "Your emotional stability improved 23% this week.   │   │
│  │   Rising energy patterns correlate with your         │   │
│  │   morning Reflection entries."                       │   │
│  │                                                      │   │
│  │  [Explore This Pattern →]                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ 📈 Mood Trend    │  │ ⚡ Energy Flow   │                │
│  │                  │  │                  │                │
│  │  ▲ 12% better    │  │  Centered: 45%   │                │
│  │  vs last week    │  │  (Healthy!)      │                │
│  │                  │  │                  │                │
│  │  [Details]       │  │  [Details]       │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ 🎯 Focus Areas   │  │ 💡 Suggestions   │                │
│  │                  │  │                  │                │
│  │  • Work stress   │  │  • Morning logs  │                │
│  │  • Sleep quality │  │  • Energy checks │                │
│  │                  │  │                  │                │
│  │  [Learn More]    │  │  [Start Now]     │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  ── Deep Dive ─────────────────────────────────────────    │
│                                                             │
│  [Emotional Timeline] [Contradiction Map] [Theme Cloud]    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Selected Chart with AI Explainer                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Changes**:

1. **Hero Highlight Card** - AI-generated most important insight
2. **Metric Cards** - Scannable KPIs with trend indicators
3. **Focus Areas** - Personalized based on contradiction/mode patterns
4. **Deep Dive Section** - Tabbed charts for users who want depth
5. **Collapsed by Default** - Weekly/Monthly summaries expandable

**Files to Create**:
| File | Purpose |
|------|---------|
| `src/pages/InsightsV2.tsx` | New insights page |
| `src/components/insights/HeroHighlight.tsx` | AI-generated top insight |
| `src/components/insights/MetricCard.tsx` | Compact KPI display |
| `src/components/insights/FocusAreas.tsx` | Personalized concerns |
| `src/components/insights/DeepDive.tsx` | Tabbed chart explorer |
| `server/routes/insights.ts` | `/api/insights/highlight` AI endpoint |

---

### 3.4 Whisper + Intent LLM Integration

**Problem**: Web Speech API has poor accuracy, especially for:
- Indian English accents
- Domain-specific terms (cognitive, energy shapes)
- Stream of consciousness entries

**Solution**: Two-stage pipeline:
1. **Whisper** (OpenAI) - Accurate transcription
2. **Intent LLM** (GPT-4o-mini) - Clean up + understand intent

```
┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  Audio Blob  │───▶│   Whisper   │───▶│  Intent LLM │
│  (WebM/MP3)  │    │  (OpenAI)   │    │  (GPT-4o)   │
└──────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                    Raw Transcript      Cleaned Entry +
                                       Suggested Type +
                                       Suggested Tags
```

**Intent LLM Prompt**:
```
You are processing a voice journal entry. The raw transcript may contain:
- Filler words ("um", "like", "you know")
- Incomplete sentences
- Corrections ("I mean", "actually")

Your task:
1. Clean the transcript into coherent sentences
2. Preserve the user's emotional tone and meaning
3. Suggest an entry type (Emotional, Cognitive, Work, Health, etc.)
4. Extract 3-5 theme tags

Input: "{raw_transcript}"

Output JSON:
{
  "cleanedText": "...",
  "suggestedType": "Emotional",
  "suggestedTags": ["stress", "work", "deadline"],
  "confidence": 0.85
}
```

**Implementation Flow**:

```typescript
// useSpeechToText.ts (new hook)
export function useSpeechToText() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [suggestions, setSuggestions] = useState(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })

    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
      const result = await processAudio(audioBlob)
      setTranscript(result.cleanedText)
      setSuggestions(result)
    }

    mediaRecorder.start(1000) // 1 second chunks
    setIsRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  return { isRecording, transcript, suggestions, startRecording, stopRecording }
}
```

**Server Endpoint**:
```typescript
// server/routes/speech.ts
router.post("/api/speech/process", async (req, res) => {
  const audioBuffer = req.body.audio // Base64 encoded

  // Step 1: Whisper transcription
  const whisperResponse = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: "whisper-1",
    language: "en"
  })

  // Step 2: Intent understanding
  const intentResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: INTENT_PROMPT },
      { role: "user", content: whisperResponse.text }
    ],
    response_format: { type: "json_object" }
  })

  res.json(JSON.parse(intentResponse.choices[0].message.content))
})
```

**Files to Create**:
| File | Purpose |
|------|---------|
| `src/hooks/useSpeechToText.ts` | MediaRecorder + API integration |
| `server/routes/speech.ts` | Whisper + Intent endpoint |
| `server/lib/intentPrompt.ts` | Intent understanding prompt |

**Cost Estimate**:
- Whisper: $0.006/minute
- GPT-4o-mini: ~$0.0001/request
- **Per 1-minute entry**: ~$0.007

---

## Milestone 4: Launch & Growth Infrastructure

**This is a separate, parallel milestone focused on market presence.**

### 4.1 3D Marketing Website

**Vision**: A stunning, brain-themed 3D experience that communicates:
- "Your mind, visualized"
- Scientific credibility
- Premium, modern aesthetic

**Tech Stack**:
- **Three.js** / **React Three Fiber** - 3D rendering
- **GSAP** - Scroll animations
- **Framer Motion** - UI transitions
- **Next.js** - SSR for SEO

**Hero Section Concept**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ╭──────────────────────────╮                   │
│             ╱   Rotating 3D Brain       ╲                   │
│            │   with neural connections   │                  │
│            │   that pulse with activity  │                  │
│             ╲                           ╱                   │
│              ╰──────────────────────────╯                   │
│                                                             │
│                    PRATYAKSHA                               │
│              See Your Mind. Clearly.                        │
│                                                             │
│                 [Start Journaling]                          │
│                                                             │
│  ──────────── Scroll to explore ────────────               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Page Sections**:
1. **Hero** - 3D brain with particle effects
2. **How It Works** - 3-step animation (Write → AI Analyzes → Insights)
3. **Features** - Interactive chart previews
4. **Science** - Cognitive psychology backing
5. **Testimonials** - User stories
6. **Pricing** - Free tier + Premium
7. **CTA** - Email capture / Sign up

**3D Assets Needed**:
- Brain mesh (low-poly, stylized)
- Neural connection particles
- Energy flow visualizations
- Chart mock-ups that animate

**Repo Structure**:
```
pratyaksha-website/
├── src/
│   ├── components/
│   │   ├── three/           # 3D components
│   │   │   ├── Brain.tsx
│   │   │   ├── NeuralParticles.tsx
│   │   │   └── EnergyFlow.tsx
│   │   ├── sections/        # Page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   └── Features.tsx
│   │   └── ui/              # Shared UI
│   ├── pages/
│   │   └── index.tsx
│   └── styles/
├── public/
│   └── models/              # 3D models (.glb)
└── package.json
```

---

### 4.2 Analytics Integration

**Tools**:
- **Google Analytics 4** - Traffic, conversions, user flow
- **PostHog** - Product analytics, feature flags, session replay

**Key Events to Track**:

| Event | Properties | Purpose |
|-------|------------|---------|
| `entry_created` | type, word_count, has_voice | Feature adoption |
| `insight_viewed` | insight_type, chart_name | Content engagement |
| `explainer_opened` | chart_type, time_spent | AI feature usage |
| `voice_recording_started` | duration, success | Voice UX quality |
| `notification_enabled` | frequency, timezone | Engagement setup |
| `streak_achieved` | streak_length | Retention driver |
| `export_triggered` | format, date_range | Data ownership |

**PostHog Feature Flags**:
```typescript
// Use for gradual rollout
if (posthog.isFeatureEnabled("insights-v2")) {
  return <InsightsV2 />
} else {
  return <Insights />
}
```

**Files to Create**:
| File | Purpose |
|------|---------|
| `src/lib/analytics.ts` | Unified analytics wrapper |
| `src/hooks/useAnalytics.ts` | Hook for event tracking |

---

### 4.3 GTM & Launch Plan

**Pre-Launch (2 weeks before)**:
- [ ] Landing page live with email capture
- [ ] Twitter/X thread announcing
- [ ] ProductHunt draft submitted
- [ ] 5 beta users recruited for testimonials

**Launch Day**:
- [ ] ProductHunt live at 12:01 AM PT
- [ ] Twitter announcement thread
- [ ] LinkedIn post
- [ ] Email to waitlist
- [ ] Hacker News "Show HN" post

**Post-Launch (Week 1)**:
- [ ] Respond to all comments
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Send thank-you emails

---

## Implementation Phases

### Phase 1: AI Explainers (Sprint 14)
- [ ] ChartExplainer component
- [ ] Backend `/api/explain` endpoint
- [ ] Prompt engineering for each chart
- [ ] Caching layer
- [ ] Integration with all charts

### Phase 2: Radar % Refactor (Sprint 14)
- [ ] Transform function update
- [ ] Benchmark constants
- [ ] Radar chart UI update
- [ ] Health score recalculation

### Phase 3: Insights v2 (Sprint 15-16)
- [ ] New page structure
- [ ] Hero highlight AI endpoint
- [ ] Metric cards
- [ ] Deep dive tabs
- [ ] Mobile responsive design

### Phase 4: Whisper Integration (Sprint 17)
- [ ] MediaRecorder implementation
- [ ] Server endpoint
- [ ] Intent LLM prompt
- [ ] UI integration in LogEntryForm
- [ ] Fallback to Web Speech API

### Phase 5: Marketing Website (Separate Track)
- [ ] Next.js project setup
- [ ] 3D brain component
- [ ] Page sections
- [ ] GA + PostHog integration
- [ ] Deploy to Vercel

---

## Files Summary

### Milestone 3 - Dashboard Intelligence

**New Files**:
- `src/components/charts/ChartExplainer.tsx`
- `src/hooks/useChartExplainer.ts`
- `src/hooks/useSpeechToText.ts`
- `src/pages/InsightsV2.tsx`
- `src/components/insights/HeroHighlight.tsx`
- `src/components/insights/MetricCard.tsx`
- `src/components/insights/FocusAreas.tsx`
- `src/components/insights/DeepDive.tsx`
- `server/routes/explain.ts`
- `server/routes/speech.ts`
- `server/routes/insights.ts`
- `server/lib/explainerPrompts.ts`
- `server/lib/intentPrompt.ts`

**Modified Files**:
- `src/lib/transforms.ts` - Add percentage calculations
- `src/hooks/useEntries.ts` - Add percentage hooks
- `src/components/charts/EnergyRadar.tsx` - Display percentages
- `src/components/charts/EnergyRadarGroup.tsx` - Update calculations
- `src/components/logs/LogEntryForm.tsx` - Whisper integration
- `server/index.ts` - Register new routes
- `package.json` - Add openai SDK

### Milestone 4 - Marketing Website

**New Repository**: `pratyaksha-website/`
- Full Next.js + React Three Fiber project
- Separate deployment on Vercel

---

## Verification Plan

### AI Explainers
1. Click AI icon on EnergyRadar → Verify explanation renders
2. Check localStorage for cached explanation
3. Wait 1 hour → Verify new explanation generated
4. Test all chart types for appropriate responses

### Radar Percentages
1. Create entries with known energy shapes
2. Verify percentages sum to 100%
3. Check benchmark indicators show correct status
4. Compare health scores before/after

### Insights v2
1. Verify Hero Highlight changes with user data
2. Test metric card trend indicators
3. Check deep dive tab navigation
4. Mobile responsive testing

### Whisper Integration
1. Record 30-second voice entry
2. Verify transcription accuracy
3. Check suggested type/tags
4. Test Indian English accent handling

---

## Success Criteria

- [ ] All charts have AI explainers
- [ ] Radar charts show percentages with benchmarks
- [ ] Insights v2 loads in <2s
- [ ] Whisper transcription >90% accuracy
- [ ] Marketing website PageSpeed score >90
- [ ] GA tracking all key events
- [ ] PostHog feature flags working

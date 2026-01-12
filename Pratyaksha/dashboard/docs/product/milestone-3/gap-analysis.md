# Pratyaksha: Milestone 3 Gap Analysis

**Analysis Date:** January 9, 2026
**Codebase:** Pratyaksha Dashboard (React + Express)
**Roadmap Reference:** `milestone-3/roadmap.md`

---

## Executive Summary

The Pratyaksha dashboard has a **strong foundational architecture** with 4-agent AI pipeline and 19 chart visualizations, but is **missing key Milestone 3 features**: AI chart explainers, energy shape percentages, Insights v2 redesign, and Whisper integration.

**Completion Status:**
| Component | Status | Completion |
|-----------|--------|------------|
| 3.1 AI Chart Explainers | MISSING | 0% |
| 3.2 Energy Radar % Refactor | PARTIAL | 20% |
| 3.3 Insights v2 Redesign | PARTIAL | 30% |
| 3.4 Whisper Integration | PARTIAL | 40% |

---

## 1. Charts & Visualizations

### Current State

**19 Chart Components Exist:**
- `ActivityCalendar.tsx` - Calendar heatmap
- `CalendarHeatmap.tsx` - Alternative calendar
- `ContradictionFlow.tsx` - Sankey-style flow
- `ContradictionTracker.tsx` - Contradiction patterns
- `DailyRhythm.tsx` - Time-of-day analysis
- `EmotionalTimeline.tsx` - Sentiment over time
- `EnergyModeBubble.tsx` - Bubble chart
- `EnergyModeGroupedBar.tsx` - Grouped bar chart
- `EnergyModeHeatmap.tsx` - Heatmap visualization
- `EnergyModeMatrix.tsx` - Matrix view
- `EnergyModeResponsive.tsx` - Responsive grid
- `EnergyRadar.tsx` - Radar (counts-based)
- `EnergyRadarGroup.tsx` - Categorized radar with benchmarks
- `EntriesTable.tsx` - Table view
- `EntryCard.tsx` - Individual entry display
- `InsightActions.tsx` - Insight cards
- `ModeDistribution.tsx` - Mode pie/bar chart (with percentages)
- `ThemeCloud.tsx` - Tag cloud
- `ChartSkeleton.tsx` - Loading state

**Current Tooltip/Explainer Functionality:**
- EmotionalTimeline.tsx - Has basic Recharts Tooltip
- EnergyRadar.tsx - Has basic Recharts Tooltip
- ModeDistribution.tsx - Has basic Recharts Tooltip
- All Recharts charts have default `<Tooltip />` components
- **No AI-powered explainers exist**
- **No contextual insight popover system**

---

## 2. Gap Analysis by Feature

### 3.1 AI Chart Explainers System

**STATUS: MISSING (0%)**

| File | Status | Purpose |
|------|--------|---------|
| `src/components/charts/ChartExplainer.tsx` | MISSING | Reusable explainer button + popover |
| `src/hooks/useChartExplainer.ts` | MISSING | AI call + caching logic |
| `server/routes/explain.ts` | MISSING | `/api/explain/:chartType` endpoint |
| `server/lib/explainerPrompts.ts` | MISSING | Chart-specific system prompts |

**What Exists:**
- `server/lib/openrouter.ts` - OpenRouter API integration ready
- Backend infrastructure to add new routes (`server/index.ts`)
- All charts have data accessible via React hooks
- Popover UI components from shadcn/ui available

**What's Missing:**
1. No `/api/explain` endpoint
2. No chart-specific prompts (EnergyRadar, ModeDistribution, etc.)
3. No localStorage caching strategy implemented
4. No ChartExplainer component with popover UI
5. No integration points on charts (no [AI] buttons)

**Estimated Effort:** 40-50 hours

---

### 3.2 Energy Radar % of Grand Total Refactor

**STATUS: PARTIAL (20%)**

**Current Implementation:**
```typescript
// EnergyRadar shows raw COUNTS only
interface EnergyShapeData {
  shape: string
  count: number  // Just counts, no percentages
}

// Example output:
// Rising: 5
// Flat: 3
// Chaotic: 2
```

**EnergyRadarGroup already has:**
- Categorizes shapes into 3 groups: Growth, Stability, Challenge
- Calculates health scores (0-100) per category
- Shows health labels: "Healthy", "Monitor", "High"
- **But still uses raw counts, not percentages**

**What's Missing:**
| Component | Status |
|-----------|--------|
| `toEnergyShapePercentages()` function | MISSING |
| `SHAPE_BENCHMARKS` constant | MISSING |
| `useEnergyShapePercentages()` hook | MISSING |
| Benchmark indicators (arrows) in UI | MISSING |
| Percentage display in radar chart | MISSING |

**Reference Pattern (already exists):**
```typescript
// toModeDistribution() already calculates percentages
export function toModeDistribution(entries: Entry[]): ModeCount[] {
  const counts = countBy(entries, "inferredMode")
  const total = entries.length
  return Object.entries(counts)
    .map(([mode, count]) => ({
      mode,
      count,
      percentage: Math.round((count / total) * 100),
    }))
}
```

**Estimated Effort:** 15-20 hours

---

### 3.3 Insights Page v2 - HCD/HCI Redesign

**STATUS: PARTIAL (30%)**

**Current State (`src/pages/Insights.tsx`):**
```
[Daily Summary Card] [Weekly Summary Card]
[Monthly Summary Card] [Week-over-Week Card]
[Monthly Trends Chart] [Cognitive Analysis - Coming Soon]
```

**Existing Components:**
- DailySummaryCard.tsx - Daily AI summary
- WeeklySummaryCard.tsx - Weekly AI summary + regenerate
- MonthlySummaryCard.tsx - Monthly summary
- WeekOverWeekCard.tsx - Week-over-week comparison
- MonthlyTrendsChart.tsx - Trend visualization
- WeekPicker.tsx / MonthPicker.tsx - Navigation

**What's Missing:**
| File | Status | Purpose |
|------|--------|---------|
| `src/pages/InsightsV2.tsx` | MISSING | New page with hero + tabs |
| `src/components/insights/HeroHighlight.tsx` | MISSING | AI-generated top insight |
| `src/components/insights/MetricCard.tsx` | MISSING | Compact KPI with trend |
| `src/components/insights/FocusAreas.tsx` | MISSING | Personalized concerns |
| `src/components/insights/DeepDive.tsx` | MISSING | Tabbed chart explorer |
| `server/routes/insights.ts` | MISSING | `/api/insights/highlight` endpoint |

**Design Principles Missing:**
- Recognition over Recall
- Progressive Disclosure
- Hick's Law (reducing cognitive load)
- Personalization based on user patterns

**Estimated Effort:** 60-80 hours

---

### 3.4 Whisper + Intent LLM Integration

**STATUS: PARTIAL (40%)**

**What Exists:**
- `src/hooks/useSpeechRecognition.ts` - Full Web Speech API implementation
  - Uses browser's `SpeechRecognition` API
  - Supports interim + final transcripts
  - Error handling for microphone access
  - Language: hardcoded to "en-US"
- Integrated in LogEntryForm with mic button

**Current Limitations:**
- Web Speech API has poor accuracy for Indian English accents
- No domain-specific term recognition (energy shapes, cognitive modes)
- No stream-of-consciousness cleanup
- No suggested entry type or tags after recording

**What's Missing:**
| Component | Status |
|-----------|--------|
| `src/hooks/useSpeechToText.ts` | MISSING |
| MediaRecorder + audio encoding | MISSING |
| `server/routes/speech.ts` | MISSING |
| Whisper transcription call | MISSING |
| Intent LLM processing | MISSING |
| `server/lib/intentPrompt.ts` | MISSING |
| Suggestion display in UI | MISSING |

**Estimated Effort:** 35-45 hours

---

## 3. Server Routes Gap

### Existing Endpoints
```typescript
POST /api/process-entry         // 4-agent pipeline
PATCH /api/entry/:id            // Update entry
DELETE /api/entry/:id           // Delete entry
PATCH /api/entry/:id/bookmark   // Toggle bookmark

GET /api/weekly-summary         // AI summary
GET /api/daily-summary          // AI summary
GET /api/monthly-summary        // AI summary

POST /api/notifications/register
PUT /api/notifications/preferences
POST /api/cron/notifications
```

### Missing Endpoints
| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `GET /api/explain/:chartType` | AI chart explanations | P0 |
| `POST /api/speech/process` | Whisper + Intent | P1 |
| `GET /api/insights/highlight` | Hero insight AI | P1 |

---

## 4. Comprehensive Gap Table

| Feature | Component | Built | Partial | Missing | Effort (hrs) |
|---------|-----------|-------|---------|---------|--------------|
| **3.1: AI Explainers** |||||
| | ChartExplainer.tsx | | | X | 12-15 |
| | useChartExplainer.ts | | | X | 8-10 |
| | /api/explain endpoint | | | X | 10-15 |
| | Explainer prompts | | | X | 5-8 |
| | Integration with 19 charts | | | X | 15-20 |
| **3.2: Energy Radar %** |||||
| | toEnergyShapePercentages() | | | X | 3-5 |
| | SHAPE_BENCHMARKS constant | | | X | 1-2 |
| | useEnergyShapePercentages() | | | X | 2-3 |
| | EnergyRadar UI update | | X | | 5-7 |
| | Benchmark indicators | | | X | 3-5 |
| **3.3: Insights v2** |||||
| | Core card components | X | | | 0 |
| | Summary endpoints | X | | | 0 |
| | InsightsV2 page | | | X | 15-20 |
| | HeroHighlight component | | | X | 8-10 |
| | MetricCard component | | | X | 5-7 |
| | FocusAreas component | | | X | 8-10 |
| | DeepDive tabbed interface | | | X | 10-15 |
| | /api/insights/highlight | | | X | 10-12 |
| **3.4: Whisper** |||||
| | Web Speech API hook | X | | | 0 |
| | Voice integration in UI | X | | | 0 |
| | useSpeechToText() hook | | | X | 8-10 |
| | MediaRecorder + encoding | | | X | 5-8 |
| | /api/speech/process endpoint | | | X | 12-15 |
| | Intent LLM prompt | | | X | 3-5 |
| | Suggestion UI display | | | X | 5-8 |

---

## 5. Summary by Component

| Component | Status | Files Needed | Lines of Code | Effort | Complexity |
|-----------|--------|--------------|---------------|--------|------------|
| 3.1 AI Explainers | 0% | 4 new | ~1,200-1,500 | 40-50 hrs | High |
| 3.2 Energy Radar % | 20% | 1 new constant | ~150-200 | 15-20 hrs | Low |
| 3.3 Insights v2 | 30% | 6 new | ~2,500-3,000 | 60-80 hrs | High |
| 3.4 Whisper + Intent | 40% | 3 new | ~800-1,000 | 35-45 hrs | Medium |

---

## 6. Recommended Implementation Order

1. **Phase 1:** Energy Radar % Refactor (quick, unblocks health score improvements)
2. **Phase 2:** AI Chart Explainers (high impact, moderately complex)
3. **Phase 3:** Whisper Integration (matches existing voice UX)
4. **Phase 4:** Insights v2 (largest redesign, last for stability)

---

## 7. API Keys Needed

| Service | Status | Purpose |
|---------|--------|---------|
| OpenRouter | EXISTS | AI processing (already in use) |
| Whisper/OpenAI | NEEDED | Speech-to-text (new setup required) |

---

## Notes

The **foundational architecture is solid** - the 4-agent pipeline, charts, and summary endpoints are all working. The gap is primarily in **higher-order features**: explainers, voice processing enhancements, and dashboard redesign.

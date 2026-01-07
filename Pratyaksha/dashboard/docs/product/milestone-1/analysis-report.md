# Pratyaksha Product Analysis Report

*Generated: 2026-01-05 | Agent: product-manager*

## Executive Summary

Pratyaksha is a cognitive journaling dashboard that combines AI-powered analysis with data visualization to help users understand their mental patterns. The application is well-built with a strong technical foundation but has opportunities to improve user engagement, retention, and the overall journaling experience.

---

## Current Feature Inventory

### Pages (3)

| Page | Location | Description |
|------|----------|-------------|
| **Landing** | `src/pages/Landing.tsx` | Marketing page with features overview, how-it-works section |
| **Dashboard** | `src/pages/Dashboard.tsx` | Main analytics view with 10 chart widgets |
| **Logs** | `src/pages/Logs.tsx` | Entry creation + historical entries table |

### Data Visualizations (10)

| Chart | File | Purpose |
|-------|------|---------|
| Mode Distribution | `ModeDistribution.tsx` | Pie chart of cognitive modes (Hopeful, Calm, Anxious, etc.) |
| Contradiction Flow | `ContradictionFlow.tsx` | Sankey diagram: Type -> Contradiction -> Mode |
| Energy Radar Group | `EnergyRadarGroup.tsx` | 3 radar charts for Growth/Stability/Challenge patterns |
| Energy-Mode Matrix | `EnergyModeResponsive.tsx` | Clickable visualization linking energy + modes |
| Activity Calendar | `ActivityCalendar.tsx` | Calendar heatmap with entry-type color dots |
| Emotional Timeline | `EmotionalTimeline.tsx` | Scatter+area chart of sentiment over time |
| Contradiction Tracker | `ContradictionTracker.tsx` | Top 5 contradictions with trend indicators |
| Theme Cloud | `ThemeCloud.tsx` | Word cloud with 3 view modes (cloud/list/compact) |
| Insights & Actions | `InsightActions.tsx` | Rule-based suggestions based on stats |
| Daily Rhythm | `DailyRhythm.tsx` | Entry patterns by day/time |

### AI Processing Pipeline (4 Agents)

| Agent | Purpose | Output |
|-------|---------|--------|
| **Intent Agent** | Classifies entry type, generates name/snapshot | type, name, snapshot |
| **Emotion Agent** | Analyzes psychological state | mode, energy level, energy shape, sentiment |
| **Theme Agent** | Extracts patterns | theme tags, contradiction, loops |
| **Insight Agent** | Generates recommendations | summary, actionable insights, next action |

### Core Features

- **Voice Input**: Speech-to-text via Web Speech API
- **Dark/Light Themes**: Full theme support with toggle
- **Keyboard Shortcuts**: `T` (theme), `R` (refresh), `?` (shortcuts), `Ctrl+E` (export)
- **Export**: CSV and JSON export with summary stats
- **Filtering**: Search, date range, type, sentiment, mode, energy filters
- **Onboarding Tour**: driver.js-based walkthrough for new users
- **Real-time Polling**: 30-second data refresh
- **Global Date Filter**: Filter all charts by date range

---

## Competitive Positioning

### Differentiators (Strengths)
- 4-agent AI pipeline is unique and thorough
- Contradiction tracking is novel for journaling apps
- Energy shape vocabulary is psychologically meaningful
- Beautiful glassmorphism design

### Gaps vs Competitors

| Competitor | What They Do Better |
|------------|---------------------|
| **Daylio** | Mood tracking widgets, reminders, statistics |
| **Journey** | Media attachments, templates, calendar view |
| **Reflectly** | AI conversation, prompts, habit tracking |
| **Notion** | Full customization, templates gallery |

---

## Technical Debt Notes

1. **Demo/Fallback Data**: `lib/airtable.ts` has hardcoded fallback data - should be removed or clearly flagged

2. **Unused Components**: Several chart variations exist (e.g., `EnergyModeHeatmap`, `EnergyModeBubble`, `EnergyModeGroupedBar`) but only `EnergyModeResponsive` is used

3. **Contradiction Trend**: `ContradictionTracker` shows a `trend` field but it's always "stable" - needs time-series calculation

4. **Inconsistent Error Handling**: Some components use `ERROR_MESSAGES` constants, others have inline strings

5. **Mobile Table UX**: `EntriesTable` switches to cards on mobile but loses sorting capability

---

## Key Insight

> *"Pratyaksha has sophisticated AI analysis but needs retention mechanics. Users see great data but have no reason to come back daily."*

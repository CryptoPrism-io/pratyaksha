# Mind Dashboard: Visualization Report

**Project:** Cognitive Journal Analytics Dashboard
**Data Source:** Airtable - Cognition Base
**Date:** January 2026
**Version:** 1.0

---

## Executive Summary

This report outlines a comprehensive visualization strategy for transforming cognitive journal entries into actionable mental health insights. The dashboard will provide real-time visualization of emotional patterns, energy states, and psychological contradictions to support self-awareness and personal growth.

---

## 1. Data Source Overview

### 1.1 Database Configuration

| Property | Value |
|----------|-------|
| Base Name | cognition |
| Base ID | `appMzFpUZLuZs9VGc` |
| Table Name | Entries |
| Table ID | `tblhKYssgHtjpmbni` |
| View ID | `viwyaZVF5fznvFkTV` |

### 1.2 Field Inventory

The Entries table contains 21 fields organized into four categories:

#### Core Fields (Manual Input)
| Field | Type | Description |
|-------|------|-------------|
| Name | Single Line Text | Entry title |
| Type | Single Select | Life area category (15 options) |
| Date | Date | Entry date |
| Text | Multi-line Text | Main journal content |
| Snapshot | Single Line Text | Quick state capture |
| Loops | Multi-line Text | Recurring thought patterns |
| Next Action | Single Line Text | Intended follow-up |

#### Psychological Dimensions (Tagged)
| Field | Type | Options Count |
|-------|------|---------------|
| Inferred Mode | Single Select | 15 mental states |
| Inferred Energy | Single Select | 10 energy levels |
| Energy Shape | Single Select | 12 flow patterns |
| Contradiction | Single Select | 12 internal conflicts |

#### Computed Fields (Formulas)
| Field | Formula Logic |
|-------|---------------|
| Entry Length (Words) | Word count of Text field |
| Days Since Entry | Days elapsed since Date |
| Is Recent? | "Yes" if within 7 days |

#### AI-Generated Fields
| Field | Output |
|-------|--------|
| Entry Sentiment (AI) | Positive / Negative / Neutral |
| Entry Theme Tags (AI) | 2-4 comma-separated tags |
| Summary (AI) | Condensed entry summary |
| Actionable Insights (AI) | Recommended actions |

---

## 2. Sample Data Analysis

### 2.1 Recent Entries Snapshot

Below is a sample of four consecutive entries demonstrating the data structure:

```
Entry 1: "Morning Anxiety Spike"
├── Date: 2026-01-01
├── Type: Emotional
├── Mode: Anxious
├── Energy: High
├── Shape: Chaotic
├── Contradiction: Action vs. Fear
├── Sentiment: Negative
└── Tags: Anxiety, Work Stress, Coping

Entry 2: "Lost in Debugging Loops"
├── Date: 2026-01-01
├── Type: Work
├── Mode: Overthinking
├── Energy: Drained
├── Shape: Uneven
├── Contradiction: Action vs. Fear
├── Sentiment: Negative
└── Tags: debugging, frustration, software development

Entry 3: "Small Victory Celebration"
├── Date: 2026-01-01
├── Type: Creativity
├── Mode: Hopeful
├── Energy: Elevated
├── Shape: Rising
├── Contradiction: Growth vs. Comfort
├── Sentiment: Positive
└── Tags: achievement, excitement, technology

Entry 4: "Pure Joy and Relief"
├── Date: 2026-01-01
├── Type: Reflection
├── Mode: Grounded
├── Energy: High
├── Shape: Expanding
├── Contradiction: Confidence vs. Doubt
├── Sentiment: Positive
└── Tags: excitement, spontaneity, happiness, relaxation
```

### 2.2 Pattern Observation

The sample data reveals a **V-shaped emotional recovery arc**:

```
Sentiment:  [-] ────────── [-] ────────── [+] ────────── [+]
             │              │              │              │
Mode:     Anxious ───► Overthinking ───► Hopeful ───► Grounded
             │              │              │              │
Shape:    Chaotic ────► Uneven ────────► Rising ────► Expanding
```

**Key Insight:** The transition from negative to positive sentiment coincided with:
- Mode shift from reactive (Anxious/Overthinking) to proactive (Hopeful/Grounded)
- Energy shape transformation from unstable (Chaotic/Uneven) to growth-oriented (Rising/Expanding)

---

## 3. Visualization Specifications

### 3.1 Emotional Timeline

**Purpose:** Track emotional trajectory over time to identify patterns and cycles.

**Chart Type:** Multi-layer Area Chart with Line Overlay

**Data Mapping:**
```
X-Axis: Date (chronological)
Y-Axis: Sentiment Score (-1 to +1)
  - Positive = +1
  - Neutral = 0
  - Negative = -1

Layers:
  - Area: Energy level (opacity indicates intensity)
  - Line: Sentiment trend (7-day moving average)
  - Points: Individual entries (hover for details)
```

**Example Visualization:**
```
Sentiment
   +1 │                              ╭───●───●
      │                         ●───╯
    0 │─────────────────────────────────────────
      │     ●───╮
   -1 │         ╰───●
      └─────────────────────────────────────────►
        Jan 1   Jan 2   Jan 3   Jan 4   Jan 5   Date

Legend: ● Entry Point  ─── Trend Line  ░ Energy Area
```

**Insights Enabled:**
- Emotional cycle detection (weekly/monthly patterns)
- Recovery time measurement after negative episodes
- Correlation between energy levels and sentiment

---

### 3.2 Mode Distribution

**Purpose:** Understand the balance of mental states over a given period.

**Chart Type:** Donut Chart with Comparative View

**Data Mapping:**
```
Segments: Inferred Mode values
Size: Frequency count
Color: Sentiment association
  - Green tones: Positive modes (Hopeful, Calm, Grounded, Compassionate, Curious)
  - Red tones: Negative modes (Anxious, Withdrawn, Overthinking, Agitated, Defensive)
  - Gray tones: Neutral modes (Reflective, Conflicted, Numb, Disconnected, Self-critical)
```

**Example Visualization:**
```
        This Week                    Last Week
     ┌─────────────┐              ┌─────────────┐
     │   ╭─────╮   │              │   ╭─────╮   │
     │  ╱ 25%   ╲  │              │  ╱ 40%   ╲  │
     │ │Anxious │  │              │ │Anxious │  │
     │  ╲_______╱  │              │  ╲_______╱  │
     │ ╱    │    ╲ │              │ ╱    │    ╲ │
     │20%   │  30% │              │15%   │  25% │
     │Calm  │Hopeful              │Calm  │Hopeful
     └─────────────┘              └─────────────┘

     Improvement: Anxious -15%, Hopeful +5%
```

**Insights Enabled:**
- Dominant mental state identification
- Week-over-week mood balance comparison
- Early warning for negative mode accumulation

---

### 3.3 Energy Shape Radar

**Purpose:** Visualize the geometry of mental energy patterns.

**Chart Type:** Radar/Spider Chart

**Data Mapping:**
```
Axes (12): Each Energy Shape option
  - Flat, Heavy, Chaotic, Rising, Collapsing, Expanding
  - Contracted, Uneven, Centered, Cyclical, Stabilized, Pulsing

Values: Frequency percentage (0-100%)
Overlays: Multiple time periods for comparison
```

**Example Visualization:**
```
                    Centered
                       ╱╲
                      ╱  ╲
            Cyclical ╱    ╲ Stabilized
                    ╱  ██  ╲
                   ╱  ████  ╲
        Contracted ──████████── Rising
                   ╲  ████  ╱
                    ╲  ██  ╱
             Uneven  ╲    ╱ Expanding
                      ╲  ╱
                       ╲╱
                    Chaotic

        ██ This Week    ░░ Last Week
```

**Insights Enabled:**
- Mental stability assessment (Centered/Stabilized vs Chaotic/Uneven)
- Growth trajectory (Rising/Expanding frequency)
- Energy pattern volatility measurement

---

### 3.4 Contradiction Flow (Sankey Diagram)

**Purpose:** Map the flow from life areas through internal conflicts to resulting mental states.

**Chart Type:** Sankey Diagram

**Data Mapping:**
```
Source Nodes: Type (life area)
Middle Nodes: Contradiction (internal conflict)
Target Nodes: Inferred Mode (resulting state)
Flow Width: Entry count
```

**Example Visualization:**
```
TYPE              CONTRADICTION           MODE
────────          ─────────────           ────────

   Work ═══════╗
               ╠══► Action vs Fear ════╦══► Anxious
  Stress ══════╝                       ║
                                       ╚══► Overthinking

Emotional ═════╦══► Hope vs Hopelessness ══► Withdrawn
               ║
               ╚══► Confidence vs Doubt ═══► Hopeful

Creativity ══════► Growth vs Comfort ══════► Grounded
```

**Insights Enabled:**
- Which life areas trigger which conflicts
- Conflict-to-outcome pathways
- Intervention points for breaking negative patterns

---

### 3.5 Entry Calendar Heatmap

**Purpose:** Provide a temporal overview of journaling activity and emotional state.

**Chart Type:** GitHub-style Calendar Heatmap

**Data Mapping:**
```
Cell: Day of year
Color Intensity: Entry count
Color Hue: Average sentiment
  - Green: Positive
  - Yellow: Neutral
  - Red: Negative
  - Gray: No entries
```

**Example Visualization:**
```
January 2026
Mon  ░░ ██ ░░ ░░ ██
Tue  ░░ ▓▓ ██ ░░ ░░
Wed  ██ ░░ ░░ ▓▓ ██
Thu  ▓▓ ██ ▓▓ ░░ ░░
Fri  ░░ ░░ ██ ██ ▓▓
Sat  ░░ ░░ ░░ ░░ ░░
Sun  ░░ ░░ ░░ ░░ ░░

Legend: ░░ No Entry  ▓▓ Negative  ██ Positive
```

**Insights Enabled:**
- Journaling consistency tracking
- Day-of-week emotional patterns
- High-stress period identification

---

### 3.6 Theme Tag Cloud

**Purpose:** Surface recurring themes and evolving concerns.

**Chart Type:** Weighted Word Cloud

**Data Mapping:**
```
Words: Entry Theme Tags (AI) - split by comma
Size: Frequency count
Color: Associated average sentiment
Position: Random or clustered by similarity
```

**Example Visualization:**
```
                    ANXIETY
            stress      ╱╲        achievement
                 ╲     ╱  ╲      ╱
        frustration ──╱    ╲────╱ excitement
                     ╱      ╲
            WORK ───╱   self   ╲─── JOY
                   ╱  reflection ╲
          debugging             happiness
                     technology

        Size = Frequency    Color = Sentiment
```

**Insights Enabled:**
- Top concerns at a glance
- Theme evolution over time
- Sentiment association by topic

---

### 3.7 Energy-Mode Bubble Matrix

**Purpose:** Correlate energy levels with mental modes and entry verbosity.

**Chart Type:** Bubble Scatter Plot

**Data Mapping:**
```
X-Axis: Inferred Energy (categorical, ordered low to high)
Y-Axis: Inferred Mode (categorical, grouped by valence)
Bubble Size: Entry Length (Words)
Bubble Color: Entry Sentiment (AI)
```

**Example Visualization:**
```
Mode (Positive)
    Grounded    │              ○
    Hopeful     │          ●
    Calm        │      ○
                │
Mode (Negative) │
    Anxious     │  ●
    Overthinking│      ●
    Withdrawn   │  ○
                └─────────────────────────►
                Low    Med    High    Energy

    ● Negative  ○ Positive  Size = Word Count
```

**Insights Enabled:**
- Energy-mode correlation patterns
- Verbosity as emotional indicator
- Optimal energy levels for positive states

---

### 3.8 Daily Rhythm Analysis

**Purpose:** Understand intra-day patterns of journaling and emotional states.

**Chart Type:** Radial/Clock Chart or Stacked Bar

**Data Mapping:**
```
Segments: Hour of day (from Timestamp)
Height/Radius: Entry count
Color Stack: Entry Type distribution
```

**Example Visualization:**
```
                    12:00
                      │
            ████      │
         ███████      │      ██
        █████████     │     ████
       ███████████    │    ██████
      ─────────────────────────────
       ███████████    │    ████████
        █████████     │     ██████
         ███████      │      ████
            ████      │
                      │
                    24:00

    Peak Hours: 9-11 AM, 8-10 PM
```

**Insights Enabled:**
- Optimal journaling times
- Time-of-day emotional patterns
- Energy rhythm alignment

---

### 3.9 Contradiction Resolution Tracker

**Purpose:** Monitor progress on resolving internal conflicts over time.

**Chart Type:** Gauge Charts with Trend Indicators

**Data Mapping:**
```
Each Contradiction gets a gauge:
  - Left extreme: First pole (e.g., "Action")
  - Right extreme: Second pole (e.g., "Fear")
  - Needle position: Recent balance based on sentiment trend
  - Trend arrow: Direction of change
```

**Example Visualization:**
```
┌─────────────────────────────────────────────────────┐
│  Action vs. Fear                                    │
│  ┌───────────────────────────────────────────────┐  │
│  │ Action  ════════════●═══════════════  Fear   │  │
│  └───────────────────────────────────────────────┘  │
│  Trend: ← Moving toward Action (+12% this week)     │
├─────────────────────────────────────────────────────┤
│  Confidence vs. Doubt                               │
│  ┌───────────────────────────────────────────────┐  │
│  │ Confidence  ═══════════════●════════  Doubt  │  │
│  └───────────────────────────────────────────────┘  │
│  Trend: → Moving toward Doubt (-5% this week)       │
└─────────────────────────────────────────────────────┘
```

**Insights Enabled:**
- Conflict resolution progress
- Areas needing attention
- Celebrate improvements

---

### 3.10 Insight-to-Action Tracker

**Purpose:** Connect AI-generated insights to actionable follow-through.

**Chart Type:** Kanban Board / Progress List

**Data Mapping:**
```
Cards: Entries with Actionable Insights (AI) populated
Columns: Status derived from Next Action field
  - Pending: Insight generated, no action recorded
  - In Progress: Action noted but ongoing
  - Complete: Entries marked as summary or with completed actions
```

**Example Visualization:**
```
┌─────────────┬─────────────┬─────────────┐
│   PENDING   │ IN PROGRESS │  COMPLETE   │
├─────────────┼─────────────┼─────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │Practice │ │ │Schedule │ │ │Boundary │ │
│ │breathing│ │ │therapy  │ │ │set with │ │
│ │exercises│ │ │session  │ │ │coworker │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │
│ ┌─────────┐ │             │ ┌─────────┐ │
│ │Limit    │ │             │ │Morning  │ │
│ │screen   │ │             │ │routine  │ │
│ │time     │ │             │ │started  │ │
│ └─────────┘ │             │ └─────────┘ │
└─────────────┴─────────────┴─────────────┘

Completion Rate: 40% (2/5 insights acted upon)
```

**Insights Enabled:**
- Accountability tracking
- Insight-to-action conversion rate
- Identify neglected recommendations

---

## 4. Dashboard Layout

### 4.1 Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│  MIND DASHBOARD           [Today ▼] [This Week ▼] [Filter ▼]    │
│  Last updated: 2 min ago                                         │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────┬─────────────────────────────┐ │
│ │                                │                             │ │
│ │   EMOTIONAL TIMELINE           │    MODE DISTRIBUTION        │ │
│ │   (Line + Area Chart)          │    (Donut Chart)            │ │
│ │                                │                             │ │
│ │   [Chart Area - 60%]           │    [Chart Area - 40%]       │ │
│ │                                │                             │ │
│ └────────────────────────────────┴─────────────────────────────┘ │
│ ┌────────────────────────────────┬─────────────────────────────┐ │
│ │                                │                             │ │
│ │   ENERGY SHAPE RADAR           │    CONTRADICTION FLOW       │ │
│ │   (Spider Chart)               │    (Sankey Diagram)         │ │
│ │                                │                             │ │
│ │   [Chart Area - 40%]           │    [Chart Area - 60%]       │ │
│ │                                │                             │ │
│ └────────────────────────────────┴─────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │                                                              │ │
│ │   ENTRY CALENDAR HEATMAP (Full Width)                        │ │
│ │                                                              │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────┬─────────────────────────────┐ │
│ │                                │                             │ │
│ │   THEME TAG CLOUD              │    ENERGY-MODE MATRIX       │ │
│ │   (Word Cloud)                 │    (Bubble Chart)           │ │
│ │                                │                             │ │
│ └────────────────────────────────┴─────────────────────────────┘ │
│ ┌────────────────────────────────┬─────────────────────────────┐ │
│ │                                │                             │ │
│ │   CONTRADICTION TRACKER        │    INSIGHT ACTIONS          │ │
│ │   (Gauge Charts)               │    (Kanban Board)           │ │
│ │                                │                             │ │
│ └────────────────────────────────┴─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Responsive Breakpoints

| Breakpoint | Layout Adjustment |
|------------|-------------------|
| Desktop (>1200px) | Full 2-column layout as shown |
| Tablet (768-1200px) | Stack charts vertically, maintain order |
| Mobile (<768px) | Single column, collapsible sections |

---

## 5. Technical Implementation

### 5.1 Recommended Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | React 18 + TypeScript | Type safety, component reuse |
| Build Tool | Vite | Fast HMR, optimized builds |
| Styling | Tailwind CSS | Utility-first, responsive |
| UI Components | shadcn/ui | Accessible, customizable |
| Charts | Recharts | React-native, declarative |
| Sankey | D3-sankey | Industry standard for flows |
| Word Cloud | react-wordcloud | Easy integration |
| Calendar | react-calendar-heatmap | GitHub-style heatmap |
| Data Fetching | TanStack Query | Caching, background refresh |
| State | Zustand | Lightweight, simple |

### 5.2 Data Flow Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Airtable   │────►│  API Layer  │────►│   React     │
│  (Source)   │     │  (Transform)│     │  (Render)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   ▼                   │
       │           ┌─────────────┐             │
       │           │   Cache     │             │
       │           │  (TanStack) │             │
       │           └─────────────┘             │
       │                   │                   │
       ▼                   ▼                   ▼
  Real-time         5-min refresh       Optimistic UI
  webhooks          background          updates
```

### 5.3 API Integration Example

```typescript
// api/airtable.ts
import { Api } from 'pyairtable';  // For Python backend
// OR use fetch for direct JS integration

const BASE_ID = 'appMzFpUZLuZs9VGc';
const TABLE_ID = 'tblhKYssgHtjpmbni';
const API_KEY = process.env.AIRTABLE_API_KEY;

interface Entry {
  id: string;
  name: string;
  date: string;
  type: string;
  inferredMode: string;
  inferredEnergy: string;
  energyShape: string;
  contradiction: string;
  text: string;
  sentiment: string;
  themeTags: string[];
  wordCount: number;
}

async function fetchEntries(limit = 100): Promise<Entry[]> {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?maxRecords=${limit}&sort[0][field]=Date&sort[0][direction]=desc`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();
  return data.records.map(transformRecord);
}
```

---

## 6. Data Privacy Considerations

### 6.1 Security Requirements

| Concern | Mitigation |
|---------|------------|
| API Key Exposure | Store in environment variables, never in client code |
| Data in Transit | HTTPS only, TLS 1.3 |
| Data at Rest | Airtable handles encryption |
| Access Control | Personal use only; add auth if shared |
| Session Security | JWT tokens with expiration |

### 6.2 Recommended Practices

- Use a backend proxy to hide API keys from browser
- Implement rate limiting to avoid Airtable quota exhaustion
- Consider local-first architecture with sync for offline support
- Add data export functionality for user ownership

---

## 7. Future Enhancements

### 7.1 Phase 2 Features

| Feature | Description |
|---------|-------------|
| AI Chat Interface | Natural language queries about your mental patterns |
| Predictive Alerts | ML-based early warning for negative cycles |
| Goal Setting | Connect insights to measurable objectives |
| Export Reports | Weekly/monthly PDF summaries |
| Mobile App | React Native companion app |

### 7.2 Integration Opportunities

- **Wearables:** Import heart rate, sleep data for correlation
- **Calendar:** Overlay life events with emotional data
- **Therapy Tools:** Export summaries for clinical review
- **Meditation Apps:** Track practice impact on mental states

---

## 8. Appendix

### A. Complete Field Reference

| Field Name | Field ID | Type |
|------------|----------|------|
| Name | fld... | singleLineText |
| Type | fld... | singleSelect |
| Timestamp | fld... | date |
| Date | fldR7clyeyKJTRPHQ | date |
| Meta Flag | fld... | singleLineText |
| Is Summary? | fld... | checkbox |
| Inferred Mode | fld... | singleSelect |
| Inferred Energy | fld... | singleSelect |
| Energy Shape | fld... | singleSelect |
| Contradiction | fld... | singleSelect |
| Text | fldwyhy9U1KOdv3XN | multilineText |
| Snapshot | fld... | singleLineText |
| Loops | fld... | multilineText |
| Next Action | fld... | singleLineText |
| Summary (AI) | fld... | multilineText |
| Actionable Insights (AI) | fld... | multilineText |
| Entry Length (Words) | fld... | formula |
| Days Since Entry | fld... | formula |
| Is Recent? | fld... | formula |
| Entry Sentiment (AI) | fld... | aiText |
| Entry Theme Tags (AI) | fld... | aiText |

### B. Select Field Options

**Type (15 options):**
Emotional, Cognitive, Family, Work, Relationship, Health, Creativity, Social, Reflection, Decision, Avoidance, Growth, Stress, Communication, Routine

**Inferred Mode (15 options):**
Reflective, Withdrawn, Overthinking, Hopeful, Conflicted, Numb, Anxious, Calm, Grounded, Agitated, Disconnected, Self-critical, Compassionate, Curious, Defensive

**Inferred Energy (10 options):**
Very Low, Low, Moderate, Balanced, High, Elevated, Scattered, Drained, Flat, Restorative

**Energy Shape (12 options):**
Flat, Heavy, Chaotic, Rising, Collapsing, Expanding, Contracted, Uneven, Centered, Cyclical, Stabilized, Pulsing

**Contradiction (12 options):**
Connection vs. Avoidance, Hope vs. Hopelessness, Anger vs. Shame, Control vs. Surrender, Confidence vs. Doubt, Independence vs. Belonging, Closeness vs. Distance, Expression vs. Silence, Self-care vs. Obligation, Ideal vs. Reality, Action vs. Fear, Growth vs. Comfort

---

*End of Report*

# Pratyaksha Dashboard - Implementation Plan

## Project Overview

**Name:** Pratyaksha (प्रत्यक्ष = "Direct Perception")
**Type:** Cognitive Journal Analytics Dashboard + Landing Page
**Purpose:** Portfolio/showcase piece
**Design:** Clean, minimal, calm (zen aesthetic)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Charts | **Tremor** (built on Recharts, dashboard-optimized) |
| Data | Airtable API via fetch |
| State | React Query (TanStack Query) |
| Routing | React Router |
| Icons | Lucide React |
| **Deployment** | **GCP Cloud Run** (containerized) |
| **Dev Tooling** | **MCP** (IDE integration) |

### Mobile-First Approach
- Responsive grid layout (1 col mobile → 2 col tablet → grid desktop)
- Touch-friendly chart interactions
- Collapsible sections on mobile
- Bottom navigation for mobile dashboard

---

## Project Structure

```
Pratyaksha/
├── dashboard/                    ← React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               ← shadcn components
│   │   │   ├── charts/           ← Chart components
│   │   │   │   ├── EmotionalTimeline.tsx
│   │   │   │   ├── ModeDistribution.tsx
│   │   │   │   ├── EnergyRadar.tsx
│   │   │   │   ├── ContradictionFlow.tsx
│   │   │   │   ├── CalendarHeatmap.tsx
│   │   │   │   ├── ThemeCloud.tsx
│   │   │   │   ├── EnergyModeMatrix.tsx
│   │   │   │   ├── DailyRhythm.tsx
│   │   │   │   ├── ContradictionTracker.tsx
│   │   │   │   └── InsightActions.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── DashboardGrid.tsx
│   │   │   └── landing/
│   │   │       ├── Hero.tsx
│   │   │       ├── Features.tsx
│   │   │       ├── Demo.tsx
│   │   │       └── Footer.tsx
│   │   ├── hooks/
│   │   │   ├── useEntries.ts     ← Airtable data fetching
│   │   │   └── useStats.ts       ← Computed statistics
│   │   ├── lib/
│   │   │   ├── airtable.ts       ← API client
│   │   │   ├── transforms.ts     ← Data transformations
│   │   │   └── utils.ts          ← Utilities
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
```

---

## Pages

### 1. Landing Page (`/`)
Clean, minimal intro page showcasing the project.

**Sections:**
- **Hero:** "Pratyaksha" title, tagline, CTA to dashboard
- **Features:** 3-4 key capabilities with icons
- **Demo:** Animated preview or screenshot carousel
- **Footer:** Links, credits

**Design:**
- Soft gradients (subtle purples/blues)
- Large typography
- Smooth scroll animations
- Mobile responsive

### 2. Dashboard (`/dashboard`)
Full analytics view with all 10 visualizations.

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  HEADER: Pratyaksha | Date Range | Filters                 │
├────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┬──────────────────────────┐ │
│ │  Emotional Timeline (60%)   │  Mode Distribution (40%) │ │
│ └─────────────────────────────┴──────────────────────────┘ │
│ ┌─────────────────────────────┬──────────────────────────┐ │
│ │  Energy Radar (40%)         │  Contradiction Flow (60%)│ │
│ └─────────────────────────────┴──────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐│
│ │  Calendar Heatmap (100%)                                 ││
│ └──────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────┬──────────────────────────┐ │
│ │  Theme Cloud (50%)          │  Energy-Mode Matrix (50%)│ │
│ └─────────────────────────────┴──────────────────────────┘ │
│ ┌─────────────────────────────┬──────────────────────────┐ │
│ │  Contradiction Tracker (40%)│  Insight Actions (60%)   │ │
│ └─────────────────────────────┴──────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 10 Chart Components (Tremor)

| # | Component | Tremor Component | Data Fields |
|---|-----------|------------------|-------------|
| 1 | EmotionalTimeline | AreaChart | Date, Sentiment, Energy |
| 2 | ModeDistribution | DonutChart | Inferred Mode |
| 3 | EnergyRadar | Custom (Recharts Radar) | Energy Shape |
| 4 | ContradictionFlow | Custom (D3 Sankey) | Type → Contradiction → Mode |
| 5 | CalendarHeatmap | Custom grid | Date, Sentiment |
| 6 | ThemeCloud | Custom (react-wordcloud) | Entry Theme Tags |
| 7 | EnergyModeMatrix | ScatterChart | Energy, Mode, Word Count |
| 8 | DailyRhythm | BarChart | Timestamp, Type |
| 9 | ContradictionTracker | ProgressBar + Tracker | Contradiction, Sentiment trend |
| 10 | InsightActions | Card + List | Next Action, Insights |

**Tremor Benefits:**
- Pre-built dashboard components (Cards, Metrics, KPIs)
- Consistent styling with Tailwind
- Accessible by default
- Works seamlessly with shadcn

---

## Design System

### Colors (Calm/Zen Palette)
```css
--background: #FAFAFA       /* Off-white */
--foreground: #1A1A1A       /* Near black */
--card: #FFFFFF             /* Pure white */
--primary: #6366F1          /* Soft indigo */
--secondary: #8B5CF6        /* Soft purple */
--accent: #10B981           /* Calm green */
--muted: #F3F4F6            /* Light gray */
--positive: #34D399         /* Soft green */
--negative: #F87171         /* Soft red */
--neutral: #9CA3AF          /* Medium gray */
```

### Typography
- **Display:** Inter or Geist (clean, modern)
- **Body:** Same, lighter weights
- **Mono:** JetBrains Mono (for data)

### Spacing
- Generous whitespace
- Consistent 4px grid
- Card padding: 24px
- Section gaps: 32px

---

## Implementation Order

### Phase 1: Setup (Step 1-3)
1. Initialize Vite + React + TypeScript project
2. Install and configure shadcn/ui
3. Set up Tailwind with custom theme

### Phase 2: Data Layer (Step 4-5)
4. Create Airtable API client
5. Build useEntries hook with React Query

### Phase 3: Layout (Step 6-8)
6. Create Header component
7. Create DashboardGrid layout
8. Create Landing page structure

### Phase 4: Charts (Step 9-18)
9. EmotionalTimeline
10. ModeDistribution
11. EnergyRadar
12. CalendarHeatmap
13. ThemeCloud
14. EnergyModeMatrix
15. DailyRhythm
16. ContradictionFlow (D3)
17. ContradictionTracker
18. InsightActions

### Phase 5: Polish (Step 19-21)
19. Add animations/transitions
20. Responsive design
21. Final landing page polish

---

## Files to Create

### Core Setup
- `dashboard/package.json`
- `dashboard/vite.config.ts`
- `dashboard/tsconfig.json`
- `dashboard/tailwind.config.js`
- `dashboard/src/index.css`
- `dashboard/src/main.tsx`
- `dashboard/src/App.tsx`

### Data Layer
- `dashboard/src/lib/airtable.ts`
- `dashboard/src/lib/transforms.ts`
- `dashboard/src/hooks/useEntries.ts`

### Layout
- `dashboard/src/components/layout/Header.tsx`
- `dashboard/src/components/layout/DashboardGrid.tsx`
- `dashboard/src/pages/Dashboard.tsx`
- `dashboard/src/pages/Landing.tsx`

### Charts (10 files)
- `dashboard/src/components/charts/*.tsx`

---

## Key Decisions

1. **No backend needed** - Fetch directly from Airtable API
2. **GCP Cloud Run** - Containerized deployment
3. **Demo mode** - Can work with sample data if API not available
4. **Mobile-first** - Responsive design, touch-friendly

---

## GCP Cloud Run Deployment

### Files to Add
```
dashboard/
├── Dockerfile
├── .dockerignore
├── cloudbuild.yaml         ← CI/CD config
└── .env.production         ← Production env vars
```

### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy Command
```bash
gcloud run deploy pratyaksha \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Mobile Layout

### Breakpoints
```css
/* Mobile: < 640px */
/* Tablet: 640px - 1024px */
/* Desktop: > 1024px */
```

### Mobile Dashboard Layout
```
┌─────────────────────┐
│  HEADER (sticky)    │
├─────────────────────┤
│  Quick Stats (KPIs) │
├─────────────────────┤
│  Emotional Timeline │
│  (full width)       │
├─────────────────────┤
│  Mode Distribution  │
├─────────────────────┤
│  Calendar Heatmap   │
│  (horizontal scroll)│
├─────────────────────┤
│  [Expand for more]  │
├─────────────────────┤
│  BOTTOM NAV         │
│  📊 📅 ⚡ ⚙️         │
└─────────────────────┘
```

### Bottom Navigation
- Dashboard (charts)
- Timeline (calendar view)
- Insights (AI summaries)
- Settings

---

## Status: Ready to Build

Plan saved: 2026-01-01

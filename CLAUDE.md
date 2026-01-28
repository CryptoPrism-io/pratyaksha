# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pratyaksha** is a cognitive journaling dashboard that connects to Airtable and uses AI (via OpenRouter) to analyze journal entries. The main application lives in `Pratyaksha/dashboard/`.

## Development Commands

```bash
# Start both frontend (Vite) and backend (Express) concurrently
cd Pratyaksha/dashboard
npm run dev

# Individual servers
npm run dev:client   # Frontend only (localhost:5173)
npm run dev:server   # Backend only (localhost:3001)

# Build
npm run build        # Build frontend
npm run build:server # Build backend

# Linting
npm run lint
```

## Testing (Playwright)

```bash
cd Pratyaksha/dashboard

# Run all tests
npm test

# By device category
npm run test:desktop  # Chrome, Firefox, Safari (1920x1080)
npm run test:mobile   # iPhone 14/SE, Pixel 7, Galaxy S23
npm run test:ipad     # iPad Pro landscape/portrait, iPad Mini

# Single test file
npx playwright test tests/ui/responsive.spec.ts

# Specific device
npx playwright test --project=mobile-iphone-14

# Interactive UI mode
npm run test:ui

# View HTML report
npm run test:report
```

Test results: `test-results/html-report/index.html`

## Architecture

### Frontend (React + Vite + TanStack Query)
- **Entry Point**: `src/main.tsx` → `src/App.tsx`
- **Pages**: Landing (`/`), Dashboard (`/dashboard`), Logs (`/logs`)
- **Data Flow**: `useEntries()` hook fetches from Airtable API → transform functions in `lib/transforms.ts` → chart components
- **State**: TanStack Query for server state (5-min stale time, 30-sec polling)
- **Styling**: Tailwind + shadcn/ui components + Recharts
- **Path alias**: `@/` maps to `./src/`

### Backend (Express + TypeScript)
- **Entry Point**: `server/index.ts` (port 3001)
- **4-Agent AI Pipeline** (`server/routes/entry.ts`):
  1. `intentAgent` - Classifies entry type and generates name/snapshot
  2. `emotionAgent` - Analyzes mode, energy level, energy shape, sentiment
  3. `themeAgent` - Extracts theme tags, contradictions, and loops
  4. `insightAgent` - Generates summary, actionable insights, next action

### Key Data Types (`server/types.ts`)
- **Entry Types**: Emotional, Cognitive, Work, Health, Reflection, etc. (15 types)
- **Inferred Modes**: Hopeful, Calm, Anxious, Overthinking, etc. (15 modes)
- **Energy Shapes**: Flat, Rising, Chaotic, Centered, Expanding, etc. (12 shapes)
- **Contradictions**: "Action vs. Fear", "Growth vs. Comfort", etc. (12 pairs)

### External Services
- **Airtable**: Primary data store (Base: `appMzFpUZLuZs9VGc`, Table: `tblhKYssgHtjpmbni`)
- **OpenRouter**: AI processing via `gpt-4o-mini` (cheap) and `gpt-4o` (quality)

## Environment Variables

Copy `.env.example` to `.env` in `Pratyaksha/dashboard/`:
- `OPENROUTER_API_KEY` - Required for AI processing
- `VITE_AIRTABLE_API_KEY` / `AIRTABLE_API_KEY` - Required for data access
- `VITE_AIRTABLE_BASE_ID` / `AIRTABLE_BASE_ID`
- `VITE_AIRTABLE_TABLE_ID` / `AIRTABLE_TABLE_ID`

## Claude Code Skills

Available slash commands (see `.claude/skills/`):
- `/ui-test-desktop` - Test on desktop browsers
- `/ui-test-mobile` - Test on mobile devices
- `/ui-test-ipad` - Test on iPad viewports
- `/ui-test-all` - Complete test suite
- `/ux-review` - Comprehensive UX audit
- `/shadcn-suggest` - Suggest shadcn components

## Deployment (Cloud Run)

```bash
# Deploy to Cloud Run (from repo root)
cd Pratyaksha/dashboard && source .env && gcloud builds submit --config=cloudbuild.yaml --substitutions="_VITE_AIRTABLE_API_KEY=$VITE_AIRTABLE_API_KEY,_VITE_AIRTABLE_BASE_ID=$VITE_AIRTABLE_BASE_ID,_VITE_AIRTABLE_TABLE_ID=$VITE_AIRTABLE_TABLE_ID,_OPENROUTER_API_KEY=$OPENROUTER_API_KEY,_GROQ_API_KEY=$GROQ_API_KEY"
```

**Live URL**: https://pratyaksha-963362833537.asia-south1.run.app

## Critical Guidelines

- **NEVER use dummy/synthetic data** without explicit user permission. Always inform the user if the database has insufficient data.
- The frontend falls back to demo data in `lib/airtable.ts` if no API key is configured.
- Vite proxies `/api/*` requests to the backend at `localhost:3001`.

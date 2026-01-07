# Milestone 2: Analysis Report

*Created: 2026-01-07*

---

## Executive Summary

Milestone 1 delivered a fully functional single-user cognitive journaling dashboard with AI-powered analysis, PWA support, and offline capabilities. Milestone 2 focuses on **scaling to multi-user** with authentication, enhanced analytics, and engagement features.

**Live Production URL**: https://pratyaksha-963362833537.asia-south1.run.app

---

## Milestone 1 Achievements

### What We Built (5 Sprints)

| Sprint | Focus | Key Deliverables |
|--------|-------|------------------|
| Sprint 1 | Onboarding | 3-phase tour, glassmorphism UI, keyboard shortcuts |
| Sprint 2 | Retention | Streak system, 6 entry templates, weekly AI summary |
| Sprint 3-4 | Core CRUD | Entry edit/delete/bookmark, soft delete |
| Sprint 5 | PWA & Offline | Service worker, IndexedDB queue, offline sync |

### Technical Stack

```
Frontend: React 18 + Vite + TanStack Query + Tailwind + shadcn/ui
Backend:  Express + TypeScript + 4-Agent AI Pipeline (OpenRouter)
Database: Airtable
Hosting:  Google Cloud Run (asia-south1)
PWA:      manifest.json + Service Worker + IndexedDB
```

### Key Metrics (Current State)

| Metric | Value |
|--------|-------|
| Total Entries | 76+ |
| Visualizations | 10+ charts |
| AI Agents | 4 (Intent, Emotion, Theme, Insight) |
| Response Time | <2 seconds |
| Users | 1 (single-user) |

---

## Milestone 2 Vision

### Primary Goal
Transform Pratyaksha from a single-user tool to a **multi-user platform** supporting up to 100 users on the current Airtable infrastructure.

### Target Outcomes

1. **User Authentication** - Secure login/signup with Firebase Auth
2. **Data Isolation** - Each user sees only their entries
3. **Engagement Boost** - Push notifications for journaling reminders
4. **Deeper Insights** - Week-over-week comparison analytics
5. **Data Portability** - Import existing journal data

---

## Technical Analysis

### Authentication Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │ ───► │  Firebase   │      │  Airtable   │
│   Frontend  │      │    Auth     │      │  + User ID  │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       │              uid: "abc123"              │
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                    ┌─────────────┐
                    │   Express   │
                    │   Backend   │
                    │ (verify JWT)│
                    └─────────────┘
```

### Database Changes Required

| Table | New Field | Type | Purpose |
|-------|-----------|------|---------|
| Entries | `User ID` | Text | Filter by user |
| Weekly Summaries | `User ID` | Text | User-specific summaries |

### API Changes Required

| Endpoint | Change |
|----------|--------|
| `POST /api/process-entry` | Include user ID from JWT |
| `GET /api/entries` | Filter by user ID |
| `GET /api/weekly-summary` | Filter by user ID |
| All PATCH/DELETE | Verify user owns resource |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Airtable rate limits (100 users) | Medium | High | Implement caching, consider migration at 100+ |
| Auth token expiration UX | Low | Medium | Silent refresh, graceful logout |
| Data migration complexity | Low | Low | User ID field is additive |
| Push notification permissions | Medium | Medium | Clear value proposition, optional |

---

## Success Criteria for Milestone 2

| Metric | Target |
|--------|--------|
| Registered Users | 50+ |
| Weekly Active Users | 20+ |
| Push Notification Opt-in | 40% |
| Week-over-Week Feature Usage | 30% |
| Average Session Duration | 5+ minutes |

---

## Recommended Approach

1. **Start with Auth** - Foundation for everything else
2. **Add User ID to Airtable** - Non-breaking change
3. **Update API layer** - JWT verification + filtering
4. **Build login/signup UI** - Clean, minimal friction
5. **Then add features** - Push notifications, analytics, import

---

## Next Steps

See `roadmap.md` for detailed sprint planning and `feature-backlog.md` for prioritized feature list.

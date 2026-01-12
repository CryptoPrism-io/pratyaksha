# Milestone 5: User Journey & Gamification

> **Status:** Planning Complete
> **Target:** Q1 2026
> **Duration:** 5 Weeks
> **Team:** 2 Developers

---

## Overview

Milestone 5 transforms Pratyaksha from a feature-complete dashboard into a guided, gamified journaling experience that converts demo viewers into engaged daily journalers.

### Core Initiatives
1. **Demo Dashboard Tour** - 30-second guided tour with conversion CTA
2. **First Entry Flow** - Frictionless first log with draft persistence
3. **Guided Onboarding** - Day 1 completion with 3 structured entries
4. **Progressive Unlocks** - 4-tier feature gating based on engagement
5. **Enhanced Streaks** - 3-entry daily goal for meaningful streaks

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [User Journey & Gamification](./user-journey-gamification.md) | Master specification with full requirements |
| [Feature Logs](./feature-logs.md) | Detailed specifications for each feature |
| [Gap Analysis](./gap-analysis.md) | Current vs target state comparison |
| [Roadmap](./roadmap.md) | 5-week implementation timeline |

---

## Quick Reference

### Unlock Tiers

| Tier | Requirement | Features Unlocked |
|------|-------------|-------------------|
| 0 | Demo | View demo data only |
| 1 | 3 entries | Calendar, Sankey, Timeline, Modes, Insights |
| 2 | 10 entries OR 3-day streak | Energy Patterns, Matrix, Contradictions, Tags (basic) |
| 3 | 20 entries OR 7-day streak | Tags (full), Daily Rhythm, Compare (basic) |
| 4 | 30 entries OR 14-day streak | Compare (full), AI Chat |

### Streak Rules
- **Daily Goal:** 3 entries minimum
- **Streak Day:** Only days with 3+ entries count
- **Streak Break:** 0 entries in a day

### Key Metrics
| Metric | Target |
|--------|--------|
| Demo → First Entry | 25% |
| Day 1 Completion | 40% |
| Day 7 Retention | 35% |
| Daily Goal Rate | 50% |

---

## Implementation Timeline

```
Week 1: Infrastructure (Hooks, Components)
Week 2: First Entry Flow (Draft Persistence, Auth)
Week 3: Progressive Unlocks (Dashboard Gating)
Week 4: Guided Onboarding (Tour, Templates)
Week 5: Analytics & Polish
```

---

## Key Files to Create

```
src/
├── lib/
│   ├── unlockTiers.ts
│   └── draftStorage.ts
├── hooks/
│   ├── useUnlockStatus.ts
│   └── useDraftPersistence.ts
├── components/
│   ├── onboarding/
│   │   ├── ProductTour.tsx
│   │   └── GuidedEntryProgress.tsx
│   ├── auth/
│   │   └── SignInPromptModal.tsx
│   ├── streak/
│   │   └── DailyGoalProgress.tsx
│   └── ui/
│       ├── LockedChart.tsx
│       └── UnlockModal.tsx
└── pages/
    └── FirstEntry.tsx
```

---

## Contacts

- **Product:** [Product Manager]
- **Engineering:** [Tech Lead]
- **Design:** [Designer]

---

*Last Updated: January 12, 2026*

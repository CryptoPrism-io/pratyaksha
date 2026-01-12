# Milestone 5: Implementation Roadmap

> **Document Type:** Roadmap & Timeline
> **Last Updated:** January 12, 2026
> **Duration:** 5 Weeks
> **Team:** 2 Developers

---

## Roadmap Overview

```
WEEK 1          WEEK 2          WEEK 3          WEEK 4          WEEK 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[████████████] Infrastructure & Core Hooks
                [████████████] First Entry Flow & Auth
                                [████████████] Progressive Unlocks
                                                [████████████] Guided Onboarding
                                                                [████████████] Polish & Analytics

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MILESTONES:
    ◆ W1: Unlock system working
    ◆ W2: First entry saves through sign-in
    ◆ W3: Dashboard fully gated
    ◆ W4: Day 1 onboarding complete
    ◆ W5: Launch ready
```

---

## Week 1: Infrastructure & Core Hooks

### Objective
Build the foundational systems that all other features depend on.

### Deliverables

| Task | Owner | Est. | Priority |
|------|-------|------|----------|
| Create `unlockTiers.ts` configuration | Dev 1 | 0.5d | P0 |
| Create `useUnlockStatus` hook | Dev 1 | 1d | P0 |
| Create `LockedChart` component | Dev 1 | 1d | P0 |
| Update `useStreak` for 3-entry minimum | Dev 2 | 1d | P1 |
| Create `DailyGoalProgress` component | Dev 2 | 0.5d | P1 |
| Create `draftStorage.ts` utilities | Dev 2 | 0.5d | P0 |
| Create `useDraftPersistence` hook | Dev 2 | 0.5d | P0 |
| Unit tests for unlock logic | Both | 0.5d | P1 |

### Definition of Done
- [ ] `useUnlockStatus` returns correct tier for 0, 3, 10, 20, 30 entries
- [ ] `useUnlockStatus` returns correct tier for 0, 3, 7, 14 day streaks
- [ ] `LockedChart` renders blurred state with progress bar
- [ ] `useStreak` counts only days with 3+ entries
- [ ] Draft saves to localStorage and survives page refresh
- [ ] All unit tests passing

### Files Created
```
src/
├── lib/
│   ├── unlockTiers.ts        ✨ NEW
│   └── draftStorage.ts       ✨ NEW
├── hooks/
│   ├── useUnlockStatus.ts    ✨ NEW
│   ├── useDraftPersistence.ts ✨ NEW
│   └── useStreak.ts          📝 MODIFIED
└── components/
    ├── ui/
    │   └── LockedChart.tsx   ✨ NEW
    └── streak/
        └── DailyGoalProgress.tsx ✨ NEW
```

### Milestone Checkpoint ◆
**End of Week 1:** Demo showing unlock tiers working in console, locked chart rendering on dashboard.

---

## Week 2: First Entry Flow & Authentication

### Objective
Enable users to write their first entry without being signed in, then seamlessly save after authentication.

### Deliverables

| Task | Owner | Est. | Priority |
|------|-------|------|----------|
| Create `SignInPromptModal` component | Dev 1 | 1d | P0 |
| Create `FirstEntry.tsx` page | Dev 1 | 1d | P0 |
| Modify `LogEntryForm` for draft handling | Dev 1 | 1d | P0 |
| Handle draft recovery in auth callback | Dev 2 | 1d | P0 |
| Add `/first-entry` route | Dev 2 | 0.5d | P0 |
| Create celebration animation (confetti) | Dev 2 | 0.5d | P2 |
| Integration testing | Both | 1d | P0 |

### Definition of Done
- [ ] User can write entry without signing in
- [ ] Clicking "Save" shows sign-in modal (not hard redirect)
- [ ] Draft persists through sign-in flow
- [ ] After sign-in, entry auto-submits
- [ ] Confetti plays on first entry save
- [ ] User redirected to guided entry #2 prompt

### User Flow Verification
```
1. Visit /first-entry
2. Type "This is my first entry"
3. Click "Save Entry"
4. See SignInPromptModal (NOT redirect)
5. Click "Continue with Google"
6. Complete Google OAuth
7. Return to app
8. Entry auto-submits
9. See confetti + "First Entry Complete!"
10. See prompt for entry #2
```

### Files Created/Modified
```
src/
├── pages/
│   └── FirstEntry.tsx         ✨ NEW
├── components/
│   ├── auth/
│   │   └── SignInPromptModal.tsx ✨ NEW
│   └── logs/
│       └── LogEntryForm.tsx   📝 MODIFIED
├── App.tsx                    📝 MODIFIED (add route)
└── pages/
    └── Login.tsx              📝 MODIFIED (handle draft)
```

### Milestone Checkpoint ◆
**End of Week 2:** Full first-entry flow working end-to-end. Draft survives sign-in. Celebration plays.

---

## Week 3: Progressive Unlocks on Dashboard

### Objective
Gate all dashboard charts with the unlock system. Users see locked previews until they reach required tier.

### Deliverables

| Task | Owner | Est. | Priority |
|------|-------|------|----------|
| Gate Tier 1 charts (4 charts) | Dev 1 | 1d | P0 |
| Gate Tier 2 charts (4 charts) | Dev 1 | 1d | P0 |
| Gate Tier 3 charts (2 charts) | Dev 2 | 0.5d | P0 |
| Create `UnlockModal` celebration | Dev 2 | 0.5d | P2 |
| Add unlock triggers (on entry save) | Dev 2 | 1d | P0 |
| Gate Compare page (Tier 3/4) | Dev 1 | 0.5d | P1 |
| Gate Chat page (Tier 4) | Dev 1 | 0.5d | P1 |
| Visual polish for locked states | Dev 2 | 0.5d | P2 |
| End-to-end testing | Both | 0.5d | P0 |

### Definition of Done
- [ ] New user sees mostly locked charts
- [ ] After 3 entries, Tier 1 charts unlock with celebration
- [ ] Locked charts show blurred preview + progress
- [ ] Progress updates in real-time as entries are added
- [ ] Compare page shows locked state until Tier 3
- [ ] Chat page shows locked state until Tier 4
- [ ] No feature can be accessed before its tier

### Dashboard State by Tier
```
TIER 0 (New User):
┌─────────────────────────────────────────────────────────┐
│  Streak Calendar [LOCKED]  │  Sankey Flow [LOCKED]      │
├─────────────────────────────────────────────────────────┤
│  Energy Patterns [LOCKED]  │  Energy Matrix [LOCKED]    │
├─────────────────────────────────────────────────────────┤
│  Mode Distribution [LOCKED]│  Timeline [LOCKED]         │
├─────────────────────────────────────────────────────────┤
│  Contradictions [LOCKED]   │  Theme Tags [LOCKED]       │
├─────────────────────────────────────────────────────────┤
│  Insights [LOCKED]         │  Daily Rhythm [LOCKED]     │
└─────────────────────────────────────────────────────────┘

TIER 1 (3+ entries):
┌─────────────────────────────────────────────────────────┐
│  Streak Calendar ✓         │  Sankey Flow ✓             │
├─────────────────────────────────────────────────────────┤
│  Energy Patterns [LOCKED]  │  Energy Matrix [LOCKED]    │
├─────────────────────────────────────────────────────────┤
│  Mode Distribution ✓       │  Timeline ✓                │
├─────────────────────────────────────────────────────────┤
│  Contradictions [LOCKED]   │  Theme Tags [LOCKED]       │
├─────────────────────────────────────────────────────────┤
│  Insights ✓                │  Daily Rhythm [LOCKED]     │
└─────────────────────────────────────────────────────────┘
```

### Files Modified
```
src/
├── pages/
│   ├── Dashboard.tsx          📝 MODIFIED (add gating)
│   ├── Compare.tsx            📝 MODIFIED (add gating)
│   └── Chat.tsx               📝 MODIFIED (add gating)
└── components/
    └── ui/
        └── UnlockModal.tsx    ✨ NEW
```

### Milestone Checkpoint ◆
**End of Week 3:** Dashboard fully gated. Creating 3 entries unlocks Tier 1. Unlocks feel rewarding.

---

## Week 4: Guided Onboarding & Product Tour

### Objective
Build the guided first-day experience and the demo dashboard tour.

### Deliverables

| Task | Owner | Est. | Priority |
|------|-------|------|----------|
| Create `ProductTour` for demo | Dev 1 | 1.5d | P1 |
| Create `GuidedEntryProgress` component | Dev 1 | 1d | P1 |
| Build guided templates for entries 2&3 | Dev 2 | 1d | P1 |
| Create Day 1 completion celebration | Dev 2 | 0.5d | P2 |
| Add "Start Your Journey" CTA logic | Dev 1 | 0.5d | P0 |
| Modify Landing page for tour trigger | Dev 2 | 0.5d | P1 |
| Onboarding state persistence | Dev 2 | 0.5d | P1 |
| End-to-end onboarding test | Both | 0.5d | P0 |

### Definition of Done
- [ ] Demo dashboard shows product tour on first view
- [ ] Tour has 6 steps, under 30 seconds total
- [ ] "Start Your Journey" appears on every step
- [ ] Clicking CTA navigates to first entry page
- [ ] After first entry, guided progress shows 1/3
- [ ] Entry 2 suggests Morning Check-in template
- [ ] Entry 3 suggests Evening Reflection template
- [ ] After 3 entries, Day 1 celebration shows
- [ ] Guided progress dismisses after Day 1

### Guided Flow Visualization
```
DEMO TOUR                    FIRST ENTRY               GUIDED ENTRIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Step 1] Stats ──┐          ┌──────────────┐          ┌────────────────┐
[Step 2] Streak ─┤          │  First Entry │          │ Progress: 1/3  │
[Step 3] Sankey ─┼──► CTA ──►│    Page      │──► ✓ ───►│ [Entry 2: AM]  │
[Step 4] Modes ──┤          │              │          │ [Entry 3: PM]  │
[Step 5] AI ─────┤          └──────────────┘          └────────────────┘
[Step 6] Final ──┘                                           │
                                                             ▼
                                                    ┌────────────────┐
                                                    │  DAY 1 DONE!   │
                                                    │  🎉 Unlocked   │
                                                    │  • Calendar    │
                                                    │  • Sankey      │
                                                    │  • Timeline    │
                                                    │  • Modes       │
                                                    └────────────────┘
```

### Files Created/Modified
```
src/
├── components/
│   └── onboarding/
│       ├── ProductTour.tsx         ✨ NEW
│       ├── GuidedEntryProgress.tsx ✨ NEW
│       └── OnboardingTour.tsx      📝 MODIFIED
├── pages/
│   └── Landing.tsx                 📝 MODIFIED
└── lib/
    └── guidedTemplates.ts          ✨ NEW
```

### Milestone Checkpoint ◆
**End of Week 4:** Full onboarding flow from demo tour → 3 entries → unlocked dashboard.

---

## Week 5: Analytics, Polish & Launch Prep

### Objective
Add analytics tracking, polish UX, fix bugs, and prepare for launch.

### Deliverables

| Task | Owner | Est. | Priority |
|------|-------|------|----------|
| Implement all analytics events | Dev 1 | 1d | P1 |
| Set up onboarding funnel in PostHog | Dev 1 | 0.5d | P1 |
| Mobile responsive testing | Dev 2 | 1d | P1 |
| Accessibility audit & fixes | Dev 2 | 1d | P1 |
| Performance optimization | Dev 1 | 0.5d | P2 |
| Bug fixes from testing | Both | 1d | P0 |
| Documentation update | Dev 1 | 0.5d | P2 |
| QA sign-off testing | Both | 0.5d | P0 |

### Analytics Events to Implement
```typescript
// Onboarding Funnel
'tour_started'
'tour_step_viewed'
'tour_completed'
'tour_skipped'
'tour_cta_clicked'

// First Entry Funnel
'first_entry_page_viewed'
'first_entry_started'
'signin_prompt_shown'
'signin_completed_with_draft'
'first_entry_saved'

// Guided Onboarding
'guided_entry_2_started'
'guided_entry_2_completed'
'guided_entry_3_started'
'guided_entry_3_completed'
'day1_completed'

// Unlock Events
'tier_1_unlocked'
'tier_2_unlocked'
'tier_3_unlocked'
'tier_4_unlocked'
'feature_unlocked'
'locked_chart_viewed'
'unlock_cta_clicked'

// Engagement
'daily_goal_progress'
'daily_goal_completed'
'streak_continued'
'streak_broken'
```

### PostHog Funnel Setup
```
ONBOARDING FUNNEL:
tour_started → tour_completed → first_entry_saved → day1_completed

CONVERSION FUNNEL:
landing_page_viewed → demo_viewed → tour_started → first_entry_saved → tier_1_unlocked
```

### Definition of Done
- [ ] All analytics events firing correctly
- [ ] Funnel visible in PostHog dashboard
- [ ] Mobile experience smooth on iPhone SE, iPhone 14, Pixel 7
- [ ] No accessibility blockers (keyboard nav, screen reader)
- [ ] Page load under 3s on 3G
- [ ] All P0 bugs fixed
- [ ] README updated with new features

### Files Modified
```
src/
├── lib/
│   └── analytics.ts              📝 MODIFIED (add events)
├── components/
│   └── (various)                 📝 MODIFIED (add tracking)
└── docs/
    └── product/
        └── milestone-5/
            └── CHANGELOG.md      ✨ NEW
```

### Milestone Checkpoint ◆
**End of Week 5:** Feature complete, tested, analytics working. Ready for production deploy.

---

## Post-Launch Monitoring

### Week 6+ Activities
- Monitor funnel conversion rates
- A/B test unlock thresholds
- Gather user feedback
- Iterate on tour content
- Optimize based on drop-off points

### Key Metrics to Watch
| Metric | Target | Alert If |
|--------|--------|----------|
| Tour completion rate | >70% | <50% |
| Tour → First entry | >40% | <25% |
| First entry → Day 1 | >30% | <15% |
| Day 7 retention | >35% | <20% |
| Daily goal completion | >50% | <30% |

---

## Risk Mitigation Plan

### Technical Risks

| Risk | Mitigation | Owner |
|------|------------|-------|
| localStorage quota exceeded | Implement quota check, fallback to sessionStorage | Dev 2 |
| OAuth redirect loses draft | Store draft before redirect, recover after | Dev 2 |
| Streak recalculation breaks | Feature flag, rollback plan, thorough testing | Dev 1 |
| Tour blocks page interaction | Add skip button, timeout auto-dismiss | Dev 1 |

### Product Risks

| Risk | Mitigation | Owner |
|------|------------|-------|
| Unlock thresholds too high | Start conservative (3/10/20/30), A/B test | PM |
| Tour feels too long | Test with users, iterate on copy | PM |
| Users frustrated by locks | Clear progress indicators, fair thresholds | PM |
| Daily goal too demanding | Monitor completion rate, adjust if <30% | PM |

---

## Dependencies & Prerequisites

### Before Week 1
- [ ] Design mockups for LockedChart approved
- [ ] Analytics event schema reviewed
- [ ] Unlock thresholds confirmed (3/10/20/30)

### Before Week 2
- [ ] SignInPromptModal design approved
- [ ] FirstEntry page copy finalized
- [ ] Celebration animation assets ready

### Before Week 4
- [ ] Tour step content written
- [ ] Guided templates copy finalized
- [ ] Day 1 celebration design approved

### Before Week 5
- [ ] PostHog funnel configured
- [ ] QA test plan created
- [ ] Launch communication drafted

---

## Team Allocation

### Developer 1 Focus
- Unlock system architecture
- Chart gating logic
- Product tour implementation
- Analytics integration

### Developer 2 Focus
- Draft persistence system
- Authentication flow
- Streak system updates
- Mobile responsiveness

### Shared Responsibilities
- Code reviews
- Integration testing
- Bug fixes
- Documentation

---

## Success Criteria for Launch

### Must Have (P0)
- [ ] First entry flow works without sign-in
- [ ] Draft persists through sign-in
- [ ] All 10 charts properly gated by tier
- [ ] Tier 1 unlocks at 3 entries
- [ ] No data loss scenarios

### Should Have (P1)
- [ ] Product tour on demo dashboard
- [ ] Guided onboarding for 3 entries
- [ ] Daily goal progress indicator
- [ ] Analytics funnel tracking

### Nice to Have (P2)
- [ ] Celebration animations
- [ ] A/B testing ready
- [ ] Performance optimized

---

## Appendix: Sprint Tickets

### Week 1 Tickets
```
M5-001: Create unlockTiers.ts configuration
M5-002: Implement useUnlockStatus hook
M5-003: Build LockedChart component
M5-004: Update useStreak for 3-entry minimum
M5-005: Create DailyGoalProgress component
M5-006: Implement draftStorage utilities
M5-007: Create useDraftPersistence hook
M5-008: Write unit tests for unlock logic
```

### Week 2 Tickets
```
M5-009: Build SignInPromptModal component
M5-010: Create FirstEntry page
M5-011: Modify LogEntryForm for drafts
M5-012: Handle draft recovery in auth
M5-013: Add /first-entry route
M5-014: Implement celebration animation
M5-015: Integration testing - first entry flow
```

### Week 3 Tickets
```
M5-016: Gate Tier 1 charts on Dashboard
M5-017: Gate Tier 2 charts on Dashboard
M5-018: Gate Tier 3 charts on Dashboard
M5-019: Build UnlockModal celebration
M5-020: Add unlock triggers on entry save
M5-021: Gate Compare page
M5-022: Gate Chat page
M5-023: Polish locked chart visuals
```

### Week 4 Tickets
```
M5-024: Build ProductTour component
M5-025: Create GuidedEntryProgress
M5-026: Build guided entry templates
M5-027: Create Day 1 celebration
M5-028: Implement "Start Your Journey" CTA
M5-029: Modify Landing page for tour
M5-030: Persist onboarding state
M5-031: E2E onboarding testing
```

### Week 5 Tickets
```
M5-032: Implement analytics events
M5-033: Set up PostHog funnels
M5-034: Mobile responsive testing
M5-035: Accessibility audit
M5-036: Performance optimization
M5-037: Bug fixes
M5-038: Documentation update
M5-039: QA sign-off
```

---

*Roadmap v1.0 | Milestone 5 | Pratyaksha*

# Milestone 2: Roadmap

**Version**: 1.0
**Timeline**: 8 weeks (Sprints 6-13)
**Goal**: Multi-user authentication and enhanced analytics

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Milestone 2: Multi-User & Analytics (8 weeks)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: Quick Wins & Auth Prep (2 weeks)                      │
│  ├── Sprint 6: Quick Wins Bundle                                │
│  └── Sprint 7: Firebase Setup + Airtable User ID                │
│                                                                 │
│  Phase 2: Auth Implementation (2 weeks)                         │
│  ├── Sprint 8: Auth UI (Login/Signup/Profile)                   │
│  └── Sprint 9: Backend Auth + Data Isolation                    │
│                                                                 │
│  Phase 3: Analytics & Comparisons (2 weeks)                     │
│  ├── Sprint 10: Week-over-Week Comparison                       │
│  └── Sprint 11: Monthly Trends + Data Export                    │
│                                                                 │
│  Phase 4: Engagement Features (2 weeks)                         │
│  ├── Sprint 12: Push Notifications                              │
│  └── Sprint 13: Data Import + Polish                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Quick Wins & Auth Preparation

### Sprint 6: Quick Wins Bundle
**Duration**: 1 week
**Focus**: User-visible improvements while architecting auth

| Task | Priority | Effort |
|------|----------|--------|
| Streak counter with celebrations | P0 | 2h |
| Keyboard shortcuts (N, J/K, Esc, ?) | P0 | 4h |
| Entry templates (Morning, Work, Gratitude) | P1 | 3h |
| Session persistence (filters, view mode) | P1 | 3h |
| Copy entry to clipboard | P2 | 2h |

**Deliverables**:
- [ ] 5 quick wins shipped
- [ ] User engagement metrics baseline established

---

### Sprint 7: Firebase + Airtable Prep
**Duration**: 1 week
**Focus**: Auth infrastructure setup

| Task | Priority | Effort |
|------|----------|--------|
| Create Firebase project | P0 | 1h |
| Configure Firebase Auth (Email/Password) | P0 | 2h |
| Add Google OAuth provider | P1 | 2h |
| Add `User ID` field to Airtable | P0 | 0.5h |
| Backfill existing entries with default user | P0 | 1h |
| Create auth middleware for Express | P0 | 4h |

**Deliverables**:
- [ ] Firebase project configured
- [ ] Airtable schema updated
- [ ] Backend ready for auth

---

## Phase 2: Auth Implementation

### Sprint 8: Auth UI
**Duration**: 1 week
**Focus**: Frontend auth experience

| Task | Priority | Effort |
|------|----------|--------|
| Firebase SDK integration (client) | P0 | 2h |
| Login page with email/password | P0 | 4h |
| Signup page with validation | P0 | 4h |
| Google OAuth button | P1 | 2h |
| Forgot password flow | P1 | 2h |
| User profile dropdown | P0 | 3h |
| Logout functionality | P0 | 1h |
| Protected routes (redirect to login) | P0 | 2h |

**Deliverables**:
- [ ] Complete auth flow working
- [ ] Users can sign up and log in
- [ ] Profile menu in header

---

### Sprint 9: Data Isolation
**Duration**: 1 week
**Focus**: Multi-tenant data separation

| Task | Priority | Effort |
|------|----------|--------|
| Pass Firebase UID in API requests | P0 | 2h |
| Filter Airtable queries by User ID | P0 | 4h |
| Update all write operations with User ID | P0 | 4h |
| Test data isolation (user A can't see user B) | P0 | 2h |
| Handle unauthenticated Airtable requests | P1 | 2h |
| User onboarding flow (first entry prompt) | P2 | 3h |

**Deliverables**:
- [ ] Complete multi-user isolation
- [ ] Each user sees only their data
- [ ] New users get clean slate

---

## Phase 3: Analytics & Comparisons

### Sprint 10: Week-over-Week
**Duration**: 1 week
**Focus**: Comparative analytics

| Task | Priority | Effort |
|------|----------|--------|
| Design WoW comparison UI | P0 | 2h |
| Calculate WoW metrics (entries, mood, themes) | P0 | 4h |
| Create comparison chart component | P0 | 4h |
| Add WoW section to Insights page | P0 | 3h |
| Handle edge cases (first week, gaps) | P1 | 2h |

**Metrics to compare**:
- Entry count: This week vs last week
- Average energy level: This week vs last week
- Dominant mood shift
- Theme frequency changes
- Sentiment trend

**Deliverables**:
- [ ] WoW comparison on Insights page
- [ ] Trend indicators (up/down arrows)
- [ ] Visual comparison charts

---

### Sprint 11: Monthly Trends + Export
**Duration**: 1 week
**Focus**: Long-term patterns and data ownership

| Task | Priority | Effort |
|------|----------|--------|
| Monthly summary calculation | P0 | 4h |
| Monthly trends chart | P0 | 4h |
| Export to JSON button | P1 | 2h |
| Export to CSV button | P1 | 2h |
| Export to PDF report | P2 | 4h |
| Date range selector for exports | P1 | 2h |

**Deliverables**:
- [ ] Monthly trends view
- [ ] Full data export (JSON, CSV)
- [ ] PDF summary report (optional)

---

## Phase 4: Engagement Features

### Sprint 12: Push Notifications
**Duration**: 1 week
**Focus**: Re-engagement and reminders

| Task | Priority | Effort |
|------|----------|--------|
| Configure FCM (Firebase Cloud Messaging) | P0 | 2h |
| Request notification permission | P0 | 2h |
| Store FCM tokens in Airtable | P0 | 2h |
| Create notification preferences UI | P0 | 3h |
| Daily reminder notification (configurable time) | P0 | 4h |
| Streak at risk notification | P1 | 2h |
| Weekly summary notification | P2 | 2h |

**Deliverables**:
- [ ] Push notifications working on PWA
- [ ] Customizable reminder time
- [ ] Users can opt out per notification type

---

### Sprint 13: Data Import + Polish
**Duration**: 1 week
**Focus**: Migration path and final polish

| Task | Priority | Effort |
|------|----------|--------|
| JSON import parser | P1 | 3h |
| CSV import parser | P1 | 3h |
| Import preview UI | P1 | 3h |
| Duplicate detection | P2 | 2h |
| Import progress indicator | P2 | 2h |
| Bug fixes and polish | P0 | 4h |
| Performance optimization | P1 | 3h |

**Deliverables**:
- [ ] Users can import existing journal data
- [ ] All known bugs fixed
- [ ] Milestone 2 complete

---

## Timeline Summary

| Week | Sprint | Focus | Key Deliverable |
|------|--------|-------|-----------------|
| 1 | Sprint 6 | Quick Wins | 5 quick features |
| 2 | Sprint 7 | Auth Prep | Firebase + Airtable ready |
| 3 | Sprint 8 | Auth UI | Login/Signup working |
| 4 | Sprint 9 | Data Isolation | Multi-user complete |
| 5 | Sprint 10 | WoW Comparison | Comparative analytics |
| 6 | Sprint 11 | Monthly + Export | Data export working |
| 7 | Sprint 12 | Notifications | Push reminders working |
| 8 | Sprint 13 | Import + Polish | Milestone complete |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firebase rate limits | High | Monitor usage, implement caching |
| Airtable 50K record limit | High | Plan Supabase migration for M3 |
| PWA notification permission denied | Medium | Graceful fallback, email option |
| Auth state sync issues | Medium | Thorough testing, error boundaries |
| Data migration complexity | Medium | Build robust validation, dry-run mode |

---

## Success Criteria

### Milestone 2 Complete When:
- [ ] 10+ users can use the app independently
- [ ] Each user sees only their own data
- [ ] Week-over-week comparison working
- [ ] Push notifications functional
- [ ] Data export working (JSON/CSV)
- [ ] Data import working
- [ ] Zero critical bugs

### Metrics Targets:
| Metric | Target |
|--------|--------|
| User signup completion rate | >80% |
| Daily active users | 10+ |
| Notification opt-in rate | >50% |
| 7-day retention | >40% |
| Average entries per user | 10+ |

---

## Future Considerations (Milestone 3)

Features deliberately deferred:
- AI chat interface for pattern questions
- Custom entry types
- Supabase migration (if Airtable limits reached)
- Team/shared journals
- Mobile native app (React Native)
- Voice-to-text entry

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-07 | Initial Milestone 2 roadmap |

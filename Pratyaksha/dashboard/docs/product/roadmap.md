# Product Roadmap

*Generated: 2026-01-05 | Agent: product-manager*

---

## NOW (Sprint 1-2)
**Focus**: User Onboarding & First-Time Experience

| Feature | Effort | Status | Notes |
|---------|--------|--------|-------|
| Fix `/log` link bug | 15 min | Pending | Critical path blocker |
| Guided first entry flow | 1 day | Pending | Post-tour experience |
| Rich empty states | 1 day | Pending | All chart components |
| Entry prompts/templates | 2 days | Pending | 6 templates |
| Journaling streak system | 3 days | Pending | Core retention mechanic |
| First entry confetti | 2 hours | Pending | Delight moment |

**Success Metric**: First entry completion rate > 80%

**Total Effort**: ~8 days

---

## NEXT (Sprint 3-4)
**Focus**: Engagement & Retention

| Feature | Effort | Status | Notes |
|---------|--------|--------|-------|
| Weekly AI summary modal | 3 days | Pending | Auto-generated insights |
| Entry editing | 2 days | Pending | Re-trigger AI analysis |
| Entry deletion (soft) | 1 day | Pending | With confirmation |
| Bookmarked entries | 2 days | Pending | Star/flag system |
| PWA installation | 2 days | Pending | manifest.json + SW |
| Restart tour button | 2 hours | Pending | Quick win |

**Success Metric**: 7-day retention > 40%

**Total Effort**: ~10 days

---

## LATER (Sprint 5+)
**Focus**: Power Features & Scale

| Feature | Effort | Status | Notes |
|---------|--------|--------|-------|
| User authentication | 5 days | Pending | Multi-user support |
| Week-over-week comparison | 3 days | Pending | Trend analysis |
| Push notification reminders | 3 days | Pending | Habit support |
| Data import (JSON/CSV) | 2 days | Pending | Migration from other apps |
| AI chat for pattern questions | 5 days | Pending | Conversational insights |
| Custom entry types | 3 days | Pending | User-defined categories |

**Success Metric**: MAU > 1000, DAU/MAU > 30%

**Total Effort**: ~21 days

---

## Parking Lot
*Ideas to revisit later*

- Social sharing of insights
- Team/group journaling
- Integration with Apple Health
- Integration with Google Fit
- Therapist/coach sharing mode
- Journal prompts from AI based on patterns
- Meditation/breathing exercise integration
- Export to PDF report
- Dark mode scheduling (auto switch at night)
- Widget for mobile home screen

---

## Roadmap Visualization

```
Q1 2026                    Q2 2026                    Q3 2026
├─────────────────────────┼─────────────────────────┼─────────────────
│                         │                         │
│  NOW                    │  NEXT                   │  LATER
│  ────                   │  ────                   │  ─────
│  • Onboarding flow      │  • Weekly summaries     │  • Authentication
│  • Empty states         │  • Entry editing        │  • Comparisons
│  • Templates            │  • Bookmarks            │  • Notifications
│  • Streak system        │  • PWA support          │  • AI chat
│                         │                         │  • Data import
│                         │                         │
└─────────────────────────┴─────────────────────────┴─────────────────
```

---

## Dependencies

```
Streak System ──────────────┐
                            ├──► Weekly Summary
Entry Templates ────────────┘

Entry Editing ──────────────┬──► Entry Deletion
                            │
Bookmarks ──────────────────┘

Authentication ─────────────┬──► Push Notifications
                            ├──► Team Features
                            └──► Cloud Sync
```

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| Streak pressure causes anxiety | Add "grace days" and positive messaging |
| Weekly summary feels generic | Use specific entry references |
| PWA complexity | Start with basic manifest, add SW later |
| Auth adds friction | Offer guest mode with local storage |
| AI chat costs | Use cheaper model, rate limit |

---

## Review Schedule

- **Weekly**: Sprint progress check
- **Bi-weekly**: Metrics review
- **Monthly**: Roadmap adjustment
- **Quarterly**: Strategy alignment

# Gap Analysis

*Generated: 2026-01-05 | Agent: product-manager*

## Critical Gaps (High Priority)

| Gap | Impact | Why Missing |
|-----|--------|-------------|
| **No User Authentication** | Can't support multiple users; no data privacy | MVP scope |
| **No Journaling Streaks/Gamification** | Low retention - users have no motivation to return daily | Not implemented |
| **No Entry Editing/Deletion** | Users can't correct mistakes or remove entries | Write-only design |
| **No Goal Setting** | Dashboard shows data but no actionable targets | Analytics-focused MVP |
| **No Weekly/Monthly Summaries** | Users don't get periodic insights automatically | Manual analysis only |
| **No Notifications/Reminders** | Users must remember to journal; no habit support | No backend scheduler |
| **No Mobile PWA Optimization** | Not installable; no offline support | Web-first development |

---

## Moderate Gaps (Medium Priority)

| Gap | Impact | Details |
|-----|--------|---------|
| **No Entry Templates** | Friction for new users; blank page syndrome | Could offer prompts like "How are you feeling today?" |
| **No Comparative Analysis** | Can't compare week-over-week or month-over-month | Transform functions exist but no UI |
| **No Entry Bookmarking** | Can't mark important entries for review | All entries treated equally |
| **No AI Chat Interface** | Can't ask questions about patterns | AI is write-only, not conversational |
| **No Social/Sharing Features** | Can't share insights (privacy-minded, but some want it) | Single-user focus |
| **No Data Import** | Can't migrate from other journaling apps | New users start from scratch |
| **No Custom Entry Types** | Limited to 15 predefined types | Schema is fixed |

---

## UX Gaps

| Gap | Impact |
|-----|--------|
| Empty states are minimal | New users see "No data" everywhere - discouraging |
| No guided first entry | Users land on dashboard with zero entries |
| No progress indicators | No sense of accomplishment |
| No micro-interactions | Charts are static; limited delight moments |

---

## Bugs Found

### Critical
- **Landing page "Start Logging" links to `/log` (404)** - should be `/logs`
  - File: `Landing.tsx:109`
  - Priority: Fix immediately

### Minor
- Contradiction trend always shows "stable" (TODO in code)
- Mobile table loses sorting capability

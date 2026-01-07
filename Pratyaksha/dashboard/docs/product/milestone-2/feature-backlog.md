# Milestone 2: Feature Backlog

*Created: 2026-01-07*

---

## Priority Tiers

- **P0**: Must have for launch
- **P1**: Should have, high value
- **P2**: Nice to have
- **P3**: Future consideration

---

## P0 - Core Platform (Must Have)

### 1. User Authentication
**Effort**: 5 days | **Dependencies**: None

**User Stories**:
- As a user, I can sign up with email/password
- As a user, I can log in and see only my entries
- As a user, I can log out securely
- As a user, I can reset my password

**Technical Scope**:
- [ ] Firebase Auth project setup
- [ ] AuthContext + useAuth hook
- [ ] Login page (`/login`)
- [ ] Signup page (`/signup`)
- [ ] Protected route wrapper
- [ ] JWT verification middleware (backend)
- [ ] Logout functionality

**Acceptance Criteria**:
- Users can sign up and immediately use the app
- Invalid credentials show clear error messages
- Session persists across browser refresh
- Logout clears all local state

---

### 2. Multi-User Data Isolation
**Effort**: 3 days | **Dependencies**: Authentication

**User Stories**:
- As a user, I see only my own entries
- As a user, my data is private from other users
- As a user, my weekly summaries are personal to me

**Technical Scope**:
- [ ] Add `User ID` field to Airtable Entries table
- [ ] Add `User ID` field to Weekly Summaries table
- [ ] Update `POST /api/process-entry` to include user ID
- [ ] Update `GET /api/entries` to filter by user ID
- [ ] Update `GET /api/weekly-summary` to filter by user ID
- [ ] Update all PATCH/DELETE to verify ownership
- [ ] Backfill script for existing entries (assign to admin user)

**Acceptance Criteria**:
- User A cannot see User B's entries
- API returns 403 if user tries to access another's data
- New entries automatically tagged with user ID

---

## P1 - Engagement Features (Should Have)

### 3. Admin Dashboard
**Effort**: 3 days | **Dependencies**: Authentication, Multi-user

**User Stories**:
- As an admin, I can see total user count and list all users
- As an admin, I can view user activity metrics (entries, last active)
- As an admin, I can trigger password reset for users
- As an admin, I can disable problem accounts

**Technical Scope**:
- [ ] Admin role in Firebase (custom claims)
- [ ] `/admin` protected route (admin only)
- [ ] Admin check middleware on backend
- [ ] User list table with search/filter
- [ ] User stats card (entries count, last active, signup date)
- [ ] Password reset action (Firebase Admin SDK)
- [ ] Disable account action
- [ ] Dashboard stats (total users, DAU, WAU, entries today)

**Acceptance Criteria**:
- Only admin users can access /admin route
- User list loads within 2 seconds
- Password reset sends email to user
- Disabled users cannot log in
- Dashboard shows real-time stats

---

### 5. Push Notification Reminders
**Effort**: 3 days | **Dependencies**: Authentication, PWA

**User Stories**:
- As a user, I receive daily reminders to journal
- As a user, I can customize reminder time
- As a user, I can turn off notifications

**Technical Scope**:
- [ ] Firebase Cloud Messaging setup
- [ ] Service Worker push handler
- [ ] Notification permission request flow
- [ ] User preferences storage (Airtable or Firebase)
- [ ] Scheduled notification triggers (Cloud Functions)
- [ ] Settings UI in Profile page

**Acceptance Criteria**:
- Users can opt-in to notifications during onboarding
- Notifications appear at user-configured time
- Clicking notification opens app to Logs page
- Settings allow enable/disable and time change

---

### 4. Week-over-Week Comparison
**Effort**: 3 days | **Dependencies**: Multi-user data

**User Stories**:
- As a user, I can compare this week vs last week
- As a user, I see trends in my mood/energy
- As a user, I understand if I'm improving

**Technical Scope**:
- [ ] `GET /api/analytics/week-comparison` endpoint
- [ ] Comparison calculation logic (entries, sentiment, themes)
- [ ] WeekComparisonCard component
- [ ] Trend indicators (up/down arrows, percentages)
- [ ] Add to Insights page

**Metrics to Compare**:
- Entry count (this week vs last)
- Positive sentiment % change
- Top modes comparison
- New themes vs recurring themes
- Streak status

**Acceptance Criteria**:
- Shows clear improvement/decline indicators
- Works even with partial week data
- Handles first week (no comparison available)

---

### 6. Data Import (CSV/JSON)
**Effort**: 2 days | **Dependencies**: Authentication

**User Stories**:
- As a user, I can import my existing journal entries
- As a user, I can migrate from another journaling app
- As a user, imported entries get AI analysis

**Technical Scope**:
- [ ] Import page/modal UI
- [ ] CSV parser (date, text columns)
- [ ] JSON parser (array of entries)
- [ ] Batch processing with progress indicator
- [ ] AI analysis queue for imported entries
- [ ] Error handling for malformed data

**Supported Formats**:
```csv
date,text
2026-01-01,"My journal entry here"
2026-01-02,"Another entry"
```

```json
[
  { "date": "2026-01-01", "text": "My journal entry" },
  { "date": "2026-01-02", "text": "Another entry" }
]
```

**Acceptance Criteria**:
- Import 100+ entries in under 5 minutes
- Progress bar shows completion status
- Errors reported clearly (which rows failed)
- Imported entries appear in Logs after processing

---

## P2 - Advanced Features (Nice to Have)

### 7. AI Chat for Pattern Questions
**Effort**: 5 days | **Dependencies**: Multi-user data

**User Stories**:
- As a user, I can ask questions about my journal patterns
- As a user, I get AI insights specific to my data
- As a user, I can explore my mental health trends conversationally

**Example Queries**:
- "What makes me anxious?"
- "When am I most productive?"
- "What patterns do you see in my stress entries?"
- "Compare my mood in December vs January"

**Technical Scope**:
- [ ] Chat UI component
- [ ] Context builder (fetch user's entries)
- [ ] GPT-4 integration with entry context
- [ ] Conversation history (per session)
- [ ] Suggested questions

**Acceptance Criteria**:
- Responses reference actual user entries
- Chat feels conversational, not robotic
- Handles "I don't have enough data" gracefully

---

### 8. Custom Entry Types
**Effort**: 3 days | **Dependencies**: Multi-user data

**User Stories**:
- As a user, I can create my own entry categories
- As a user, I can track custom metrics (e.g., "Meditation", "Exercise")
- As a user, custom types appear in my analytics

**Technical Scope**:
- [ ] User settings for custom types
- [ ] Entry type selector in LogEntryForm
- [ ] Custom type management UI
- [ ] Update AI prompt to handle custom types
- [ ] Filter entries by custom type

**Acceptance Criteria**:
- Users can create up to 10 custom types
- Custom types have name + icon
- Analytics include custom types

---

## P3 - Future Considerations (Parking Lot)

| Feature | Notes |
|---------|-------|
| Social sharing of insights | Privacy concerns, needs careful design |
| Team/group journaling | B2B use case, different product |
| Apple Health / Google Fit integration | Adds complexity, limited value |
| Therapist/coach sharing mode | Privacy + legal considerations |
| AI-generated journal prompts | Based on patterns, low effort |
| Meditation integration | Scope creep, stay focused |
| Export to PDF report | Nice for users, low priority |
| Dark mode scheduling | Minor UX improvement |
| Mobile home screen widget | Platform-specific, complex |
| Voice-to-text entry | Already have speech recognition |

---

## Backlog Summary

| Priority | Features | Total Effort |
|----------|----------|--------------|
| P0 | Auth, Multi-user | 8 days |
| P1 | Admin Dashboard, Push, Week Comparison, Import | 11 days |
| P2 | AI Chat, Custom Types | 8 days |
| P3 | Parking lot | TBD |

**Milestone 2 Target**: P0 + P1 = ~19 days of work

---

## Next Steps

1. Review and approve backlog priorities
2. See `roadmap.md` for sprint breakdown
3. See `quick-wins.md` for low-effort items to tackle first

# Milestone 2: Gap Analysis

*Created: 2026-01-07*

---

## Current State vs Target State

### Authentication & Users

| Aspect | Current (M1) | Target (M2) | Gap |
|--------|--------------|-------------|-----|
| Users | Single user | Multi-user (100+) | **Critical** |
| Authentication | None | Firebase Auth | **Critical** |
| Data isolation | None | Per-user filtering | **Critical** |
| User profiles | Static page | User-specific data | Medium |
| Session management | None | JWT + refresh | **Critical** |

### Data & Analytics

| Aspect | Current (M1) | Target (M2) | Gap |
|--------|--------------|-------------|-----|
| Time comparison | None | Week-over-week | Medium |
| Trend analysis | Single week | Historical trends | Medium |
| Data import | None | CSV/JSON import | Low |
| Data export | None | Not in scope | - |
| Personal benchmarks | None | vs own history | Low |

### Engagement & Retention

| Aspect | Current (M1) | Target (M2) | Gap |
|--------|--------------|-------------|-----|
| Push notifications | None | Daily reminders | Medium |
| Email notifications | None | Not in scope | - |
| Streak persistence | Per-browser | Per-user account | **Critical** |
| Reminder customization | None | Time + frequency | Low |

### AI & Intelligence

| Aspect | Current (M1) | Target (M2) | Gap |
|--------|--------------|-------------|-----|
| Entry analysis | 4-agent pipeline | Same | None |
| Weekly summary | Per-week cache | Per-user cache | Medium |
| Conversational AI | None | Pattern chat | Low (P2) |
| Personalized prompts | Static templates | AI-suggested | Low (P3) |

---

## Critical Gaps (Must Address)

### 1. No User Authentication
**Impact**: Cannot scale beyond single user
**Risk Level**: Blocker
**Solution**: Firebase Auth integration

**What's Missing**:
- Login/signup pages
- AuthContext for React
- JWT verification middleware
- Protected routes

---

### 2. No Data Isolation
**Impact**: All users would see all entries
**Risk Level**: Blocker (privacy violation)
**Solution**: User ID field + API filtering

**What's Missing**:
- `User ID` field in Airtable
- API filter logic
- Ownership verification on mutations

---

### 3. Streak Not Persistent Across Devices
**Impact**: Users lose streak when switching devices
**Risk Level**: High (frustration)
**Solution**: Streak tied to user account, not localStorage

**What's Missing**:
- Streak calculation from Airtable (already done, just needs user filter)
- Remove localStorage dependency for streak

---

## Medium Gaps (Should Address)

### 4. No Week-over-Week Insights
**Impact**: Users can't see progress over time
**Risk Level**: Medium (reduced value)
**Solution**: Comparison analytics endpoint + UI

**What's Missing**:
- API endpoint for comparison data
- Comparison UI component
- Trend calculation logic

---

### 5. No Push Notifications
**Impact**: Users forget to journal
**Risk Level**: Medium (retention impact)
**Solution**: Firebase Cloud Messaging + user preferences

**What's Missing**:
- FCM setup
- Notification permission flow
- Scheduled triggers
- Preference management

---

### 6. No Data Import
**Impact**: Users can't migrate existing journals
**Risk Level**: Low (nice-to-have)
**Solution**: CSV/JSON import with batch processing

**What's Missing**:
- Import UI
- File parsing
- Batch entry creation

---

## Technical Debt to Address

| Item | Impact | Effort | Recommendation |
|------|--------|--------|----------------|
| Weekly summary caches not user-specific | High | 2 hours | Fix during auth implementation |
| No rate limiting on API | Medium | 4 hours | Add before public launch |
| No input sanitization | Medium | 2 hours | Add XSS protection |
| Console.log statements in production | Low | 1 hour | Add log level config |
| Error messages expose internals | Low | 2 hours | Sanitize error responses |

---

## Infrastructure Gaps

| Aspect | Current | Needed | Gap |
|--------|---------|--------|-----|
| Database | Airtable | Airtable (ok for 100 users) | None |
| Auth provider | None | Firebase Auth | **Critical** |
| Push service | None | Firebase Cloud Messaging | Medium |
| Hosting | Cloud Run | Cloud Run (sufficient) | None |
| CDN | Cloud Run default | Consider Cloudflare | Low |
| Monitoring | Cloud Run logs | Consider Sentry | Low |

---

## Gap Closure Roadmap

### Phase 1: Foundation (Sprint 6)
- [x] ~~PWA support~~ (M1)
- [x] ~~Offline queue~~ (M1)
- [ ] Firebase Auth integration
- [ ] Login/Signup pages
- [ ] Protected routes

### Phase 2: Multi-User (Sprint 7)
- [ ] User ID field in Airtable
- [ ] API filtering by user
- [ ] User-specific weekly summaries
- [ ] Ownership verification

### Phase 3: Engagement (Sprint 8)
- [ ] Push notification setup
- [ ] Reminder preferences
- [ ] Week-over-week comparison

### Phase 4: Polish (Sprint 9)
- [ ] Data import
- [ ] Technical debt cleanup
- [ ] Performance optimization

---

## Success Metrics Post-Gap Closure

| Metric | Current | Target |
|--------|---------|--------|
| Supported users | 1 | 100+ |
| Data privacy | None | Full isolation |
| Cross-device sync | No | Yes |
| Retention (7-day) | Unknown | >40% |
| Push opt-in | N/A | >40% |

---

## Recommendations

1. **Prioritize auth first** - It's the foundation for everything
2. **User ID is non-breaking** - Can add field without migration
3. **Don't over-engineer** - Airtable is fine for 100 users
4. **Add monitoring** - Know when things break
5. **Plan for migration** - At 100+ users, consider Supabase

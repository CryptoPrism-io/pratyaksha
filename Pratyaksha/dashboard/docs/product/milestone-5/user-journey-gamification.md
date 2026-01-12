# Milestone 5: User Journey & Gamification System

> **Status:** Planning
> **Target:** Q1 2026
> **Owner:** Product Team
> **Last Updated:** January 12, 2026

---

## Executive Summary

Milestone 5 transforms Pratyaksha from a feature-rich dashboard into a guided journaling experience with progressive unlocks. The goal is to convert demo viewers into active journalers through a compelling first-entry flow, guided onboarding, and gamification that rewards consistent journaling habits.

### Key Objectives
1. **Reduce time-to-first-entry** from landing to under 2 minutes
2. **Increase Day 1 retention** through guided 3-entry onboarding
3. **Drive daily engagement** with 3-entry minimum for streak success
4. **Create progression hooks** with tiered feature unlocks

### Success Metrics (KPIs)
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Demo → First Entry | ~5% | 25% | Sign-ups that complete first entry |
| Day 1 Completion (3 entries) | N/A | 40% | Users completing guided onboarding |
| Day 7 Retention | ~15% | 35% | Users returning after 1 week |
| Avg Entries/Active User/Day | 1.2 | 3.5 | Daily active journaling |
| Streak Success Rate | N/A | 60% | Days with 3+ entries |

---

## Phase 1: Demo Dashboard Tour

### Overview
A 30-second guided tour that highlights key features when users first view the demo dashboard. Every step includes a "Start Your Journey" CTA.

### User Flow
```
Landing Page
     │
     ▼
[View Demo Dashboard] ←── Click demo persona (Mario, etc.)
     │
     ▼
┌─────────────────────────────────┐
│     DEMO DASHBOARD TOUR         │
│  (Auto-starts, 6-8 steps)       │
│                                 │
│  Step 1: Welcome + Stats Bar    │
│  Step 2: Streak Calendar        │
│  Step 3: Contradiction Flow     │
│  Step 4: Mode Distribution      │
│  Step 5: AI Insights            │
│  Step 6: "Ready to Start?"      │
│                                 │
│  [Start Your Journey] on EVERY  │
│  step (persistent CTA)          │
└─────────────────────────────────┘
     │
     ▼
User clicks "Start Your Journey"
     │
     ▼
[Add Your First Log Page]
```

### Tour Steps Specification

| Step | Element | Title | Description | Duration |
|------|---------|-------|-------------|----------|
| 1 | Stats Bar | "Your Journey at a Glance" | "Track entries, streaks, and emotional patterns. This is Mario's 45-entry journey." | 4s |
| 2 | Streak Calendar | "Build Your Streak" | "Log daily to build momentum. 3 entries per day keeps your streak alive." | 4s |
| 3 | Sankey Diagram | "See Your Patterns" | "Discover how your entry types connect to emotions and moods." | 5s |
| 4 | Mode Distribution | "Know Your Moods" | "Understand which cognitive modes dominate your thinking." | 4s |
| 5 | AI Insights | "AI-Powered Clarity" | "Get personalized recommendations based on your patterns." | 4s |
| 6 | Final CTA | "Ready to Begin?" | "Start your own journey. Your first 3 entries unlock your dashboard." | 5s |

**Total Reading Time:** ~26 seconds

### Tour UI Requirements
- Floating popover with arrow pointing to element
- Progress dots (1/6, 2/6, etc.)
- "Skip Tour" link (small, bottom-left)
- "Start Your Journey" button (primary, always visible)
- Dim/blur non-highlighted areas
- Auto-advance after duration OR on click

### Technical Component
```tsx
// src/components/onboarding/ProductTour.tsx
interface ProductTourProps {
  onComplete: () => void;
  onStartJourney: () => void;
}
```

---

## Phase 2: First Log Flow

### Overview
Convert tour completers into first-time loggers with zero friction. Critical requirement: **draft must persist through sign-in flow**.

### User Flow
```
"Start Your Journey" clicked
          │
          ▼
┌─────────────────────────────────┐
│    ADD YOUR FIRST LOG PAGE      │
│                                 │
│  "What's on your mind?"         │
│  [Large text area]              │
│                                 │
│  Suggested prompts:             │
│  • How are you feeling today?   │
│  • What's occupying your mind?  │
│  • Describe your current state  │
│                                 │
│  [Save Entry] (primary button)  │
└─────────────────────────────────┘
          │
          ▼
    User types entry
          │
          ▼
    User clicks "Save"
          │
          ▼
┌─────────────────────────────────┐
│   IS USER SIGNED IN?            │
│                                 │
│   YES ──────────► Save entry    │
│                   Show confetti │
│                   "First Entry  │
│                    Complete!"   │
│                                 │
│   NO ───────────► Store draft   │
│                   in localStorage│
│                   Show sign-in  │
│                   modal         │
└─────────────────────────────────┘
          │
          ▼ (if not signed in)
┌─────────────────────────────────┐
│     SIGN IN PROMPT MODAL        │
│                                 │
│  "Save your journey"            │
│                                 │
│  Your entry is ready! Sign in   │
│  to save it and start building  │
│  your personal dashboard.       │
│                                 │
│  [Continue with Google]         │
│  [Sign in with Email]           │
│                                 │
│  Your draft is saved locally    │
│  and will be submitted after    │
│  sign-in.                       │
└─────────────────────────────────┘
          │
          ▼
   User completes sign-in
          │
          ▼
┌─────────────────────────────────┐
│  AUTO-SUBMIT PENDING DRAFT      │
│                                 │
│  1. Check localStorage for      │
│     pending draft               │
│  2. Submit via API              │
│  3. Clear localStorage          │
│  4. Show success celebration    │
│  5. Redirect to guided next     │
│     entry                       │
└─────────────────────────────────┘
```

### Draft Persistence Specification

```typescript
// src/lib/draftStorage.ts

interface PendingDraft {
  content: string;
  timestamp: number;
  source: 'first-entry' | 'log-form';
}

const DRAFT_KEY = 'pratyaksha_pending_draft';
const DRAFT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function saveDraft(content: string, source: string): void {
  const draft: PendingDraft = {
    content,
    timestamp: Date.now(),
    source
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function getDraft(): PendingDraft | null {
  const stored = localStorage.getItem(DRAFT_KEY);
  if (!stored) return null;

  const draft = JSON.parse(stored) as PendingDraft;

  // Check expiry
  if (Date.now() - draft.timestamp > DRAFT_EXPIRY) {
    clearDraft();
    return null;
  }

  return draft;
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}
```

### Sign-In Modal Component
```tsx
// src/components/auth/SignInPromptModal.tsx
interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAction: 'save-entry' | 'unlock-feature';
  featureName?: string;
}
```

### Success Celebration
- Confetti animation (3 seconds)
- Toast: "Your first entry is saved!"
- Auto-transition to guided entry #2

---

## Phase 3: Guided First 3 Entries

### Overview
After the first entry, guide users through 2 more structured entries to complete their "Day 1" and unlock initial dashboard features.

### Progress UI
```
┌─────────────────────────────────────────┐
│  YOUR FIRST DAY                         │
│                                         │
│  ✓ Entry 1: Free Write      [Complete]  │
│  ○ Entry 2: Morning Check-in [Current]  │
│  ○ Entry 3: Evening Reflect  [Locked]   │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━  33%        │
│                                         │
│  Complete 3 entries to unlock your      │
│  personal dashboard!                    │
└─────────────────────────────────────────┘
```

### Guided Entry Templates

#### Entry 2: Morning Check-in
```
MORNING CHECK-IN

How did you wake up feeling today?

Prompts to consider:
• What's your energy level? (1-10)
• Any dreams you remember?
• What are you looking forward to today?
• Any worries on your mind?

[Start Writing]
```

#### Entry 3: Evening Reflection / Stress Dump
```
EVENING REFLECTION

How did your day go?

Choose your style:
┌──────────────┐  ┌──────────────┐
│  Reflection  │  │  Stress Dump │
│              │  │              │
│  Structured  │  │  Free-form   │
│  questions   │  │  venting     │
└──────────────┘  └──────────────┘

Reflection prompts:
• What went well today?
• What challenged you?
• What did you learn?

Stress dump:
• Just let it all out - no judgment
• Type whatever comes to mind
• This is your safe space

[Start Writing]
```

### Completion Celebration
```
┌─────────────────────────────────────────┐
│            🎉 DAY 1 COMPLETE! 🎉         │
│                                         │
│  You've made 3 entries today!           │
│                                         │
│  UNLOCKED:                              │
│  ✓ Streak Calendar (Day 1!)             │
│  ✓ Contradiction Flow                   │
│  ✓ Emotional Timeline                   │
│  ✓ Mode Distribution                    │
│                                         │
│  [View Your Dashboard]                  │
│                                         │
│  Keep the momentum! Come back tomorrow  │
│  for Day 2 of your streak.              │
└─────────────────────────────────────────┘
```

---

## Phase 4: Progressive Unlock System

### Unlock Tiers Matrix

| Tier | Requirement | Features Unlocked |
|------|-------------|-------------------|
| **0 - Demo** | No account | View demo data only |
| **1 - Starter** | 3 entries (Day 1) | Streak Calendar, Sankey Flow, Emotional Timeline, Mode Distribution |
| **2 - Active** | 10 entries OR 3-day streak | Energy Patterns, Energy-Mode Matrix, Contradiction Tracker, Theme Tags (basic) |
| **3 - Committed** | 20 entries OR 7-day streak | Theme Tags (full), Daily Rhythm, Compare Page (This Week vs Last Week) |
| **4 - Power User** | 30 entries OR 14-day streak | Full Compare Page (custom ranges), AI Chat |

### Streak Rules
```typescript
// Streak success requires minimum 3 entries per day
interface DailyProgress {
  date: string;        // YYYY-MM-DD
  entryCount: number;  // Total entries that day
  isStreakDay: boolean; // true if entryCount >= 3
}

const DAILY_GOAL = 3;

function isStreakDay(entries: Entry[], date: Date): boolean {
  const dayEntries = entries.filter(e =>
    isSameDay(new Date(e.createdAt), date)
  );
  return dayEntries.length >= DAILY_GOAL;
}
```

### Daily Goal Progress UI
```
┌─────────────────────────────────────────┐
│  TODAY'S PROGRESS                       │
│                                         │
│  ●●○  2 of 3 entries                    │
│  ━━━━━━━━━━━━━━━━━━  66%                │
│                                         │
│  1 more entry to complete today's goal  │
│  and keep your streak alive!            │
│                                         │
│  [Add Entry]                            │
└─────────────────────────────────────────┘
```

### Locked Chart UI Component

```tsx
// src/components/ui/LockedChart.tsx

interface LockedChartProps {
  title: string;
  description: string;
  unlockRequirement: {
    type: 'entries' | 'streak';
    count: number;
    current: number;
  };
  previewImage?: string; // Blurred screenshot of chart
}

// Visual:
// - Blurred/greyed background
// - Lock icon centered
// - "X more entries to unlock" or "X-day streak required"
// - Progress bar showing current vs required
```

### Unlock Check Hook

```typescript
// src/hooks/useUnlockStatus.ts

interface UnlockStatus {
  tier: 0 | 1 | 2 | 3 | 4;
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;

  // Feature checks
  canViewStreakCalendar: boolean;
  canViewSankeyFlow: boolean;
  canViewEmotionalTimeline: boolean;
  canViewModeDistribution: boolean;
  canViewEnergyPatterns: boolean;
  canViewEnergyMatrix: boolean;
  canViewContradictionTracker: boolean;
  canViewThemeTags: boolean;
  canViewDailyRhythm: boolean;
  canViewCompare: boolean;
  canViewCompareCustom: boolean;
  canUseChat: boolean;

  // Progress to next tier
  nextTier: {
    tier: number;
    entriesNeeded: number;
    streakNeeded: number;
  } | null;
}

export function useUnlockStatus(): UnlockStatus {
  const { data: stats } = useStats();
  const { data: streak } = useStreak();

  const totalEntries = stats?.totalEntries ?? 0;
  const currentStreak = streak?.currentStreak ?? 0;

  // Calculate tier based on entries OR streak
  const tier = calculateTier(totalEntries, currentStreak);

  return {
    tier,
    totalEntries,
    currentStreak,
    // ... feature flags based on tier
  };
}

function calculateTier(entries: number, streak: number): 0 | 1 | 2 | 3 | 4 {
  // Tier 4: 30 entries OR 14-day streak
  if (entries >= 30 || streak >= 14) return 4;
  // Tier 3: 20 entries OR 7-day streak
  if (entries >= 20 || streak >= 7) return 3;
  // Tier 2: 10 entries OR 3-day streak
  if (entries >= 10 || streak >= 3) return 2;
  // Tier 1: 3 entries
  if (entries >= 3) return 1;
  // Tier 0: Demo/no entries
  return 0;
}
```

### Dashboard Gating Implementation

```tsx
// src/pages/Dashboard.tsx (modified)

export function Dashboard() {
  const {
    canViewSankeyFlow,
    canViewEnergyPatterns,
    nextTier
  } = useUnlockStatus();

  return (
    <DashboardGrid>
      {/* Always visible after Tier 1 */}
      <ChartCard title="Streak Calendar">
        <StreakCalendar />
      </ChartCard>

      {/* Conditional render with lock */}
      <ChartCard title="Contradiction Flow">
        {canViewSankeyFlow ? (
          <SankeyFlow />
        ) : (
          <LockedChart
            title="Contradiction Flow"
            description="See how your entry types connect to emotions"
            unlockRequirement={{
              type: 'entries',
              count: 3,
              current: nextTier?.entriesNeeded ?? 0
            }}
          />
        )}
      </ChartCard>

      {/* Energy Patterns - Tier 2 */}
      <ChartCard title="Energy Patterns">
        {canViewEnergyPatterns ? (
          <EnergyRadarGroup />
        ) : (
          <LockedChart
            title="Energy Patterns"
            description="Track your growth, stability & challenge patterns"
            unlockRequirement={{
              type: 'entries',
              count: 10,
              current: totalEntries
            }}
          />
        )}
      </ChartCard>

      {/* ... etc */}
    </DashboardGrid>
  );
}
```

---

## Phase 5: Compare & Chat Unlocks

### Compare Page Progressive Unlock

| Stage | Requirement | Available Comparisons |
|-------|-------------|----------------------|
| Locked | < 20 entries | None (show locked state) |
| Basic | 20+ entries OR 7-day streak | This Week vs Last Week only |
| Full | 30+ entries OR 14-day streak | Any custom date ranges |

### Compare Locked UI
```
┌─────────────────────────────────────────┐
│           COMPARE YOUR WEEKS            │
│                                         │
│    [Blurred preview of comparison]      │
│                                         │
│           🔒 LOCKED                      │
│                                         │
│    See how your patterns evolve over    │
│    time by comparing different periods. │
│                                         │
│    Unlock with:                         │
│    • 20 journal entries, OR             │
│    • 7-day streak (3 entries/day)       │
│                                         │
│    Your progress: 15/20 entries         │
│    ━━━━━━━━━━━━━━━━━━  75%              │
│                                         │
│    [Keep Journaling]                    │
└─────────────────────────────────────────┘
```

### Chat Page (Final Unlock)

| Requirement | 30+ entries OR 14-day streak |
|-------------|------------------------------|
| Why Last? | Chat is most valuable with rich data history |

### Chat Locked UI
```
┌─────────────────────────────────────────┐
│           AI JOURNAL ASSISTANT          │
│                                         │
│    [Preview conversation bubbles]       │
│                                         │
│           🔒 COMING SOON                 │
│                                         │
│    Chat with an AI that knows your      │
│    journal history. Ask questions,      │
│    get insights, and explore patterns.  │
│                                         │
│    Unlock with:                         │
│    • 30 journal entries, OR             │
│    • 14-day streak (3 entries/day)      │
│                                         │
│    Your progress: 22/30 entries         │
│    ━━━━━━━━━━━━━━━━━━  73%              │
│                                         │
│    [Add Entry to Unlock Faster]         │
└─────────────────────────────────────────┘
```

---

## Technical Architecture

### New Files to Create

```
src/
├── components/
│   ├── onboarding/
│   │   ├── ProductTour.tsx          # Landing page demo tour
│   │   ├── GuidedEntryProgress.tsx  # Day 1 progress tracker
│   │   └── FirstEntryPage.tsx       # Dedicated first entry experience
│   │
│   ├── auth/
│   │   └── SignInPromptModal.tsx    # "Sign in to save" modal
│   │
│   ├── streak/
│   │   └── DailyGoalProgress.tsx    # 3-entry daily goal UI
│   │
│   └── ui/
│       ├── LockedChart.tsx          # Blurred locked chart wrapper
│       └── UnlockModal.tsx          # "Feature unlocked!" celebration
│
├── hooks/
│   ├── useUnlockStatus.ts           # Tier calculation & feature flags
│   └── useDraftPersistence.ts       # localStorage draft management
│
├── lib/
│   ├── unlockTiers.ts               # Tier definitions & requirements
│   └── draftStorage.ts              # Draft save/load utilities
│
└── pages/
    └── FirstEntry.tsx               # /first-entry route
```

### Modified Files

```
src/
├── components/
│   └── logs/
│       └── LogEntryForm.tsx         # Add draft persistence
│
├── hooks/
│   └── useStreak.ts                 # Update for 3-entry minimum
│
├── pages/
│   ├── Dashboard.tsx                # Add chart gating
│   ├── Landing.tsx                  # Add product tour trigger
│   ├── Compare.tsx                  # Add locked state
│   ├── Chat.tsx                     # Add locked state
│   └── Login.tsx                    # Handle draft redirect
│
└── App.tsx                          # Add /first-entry route
```

### Database Considerations

No schema changes required. Unlock status is calculated from:
- `entries` table: COUNT for total entries
- `entries` table: GROUP BY date for streak calculation

Optional future optimization:
- Cache unlock tier in user profile
- Recalculate on entry create/delete

---

## Analytics Events

### Event Schema

```typescript
// Onboarding Events
'tour_started'        // User begins demo tour
'tour_step_viewed'    // { step: number, stepName: string }
'tour_completed'      // User finishes all steps
'tour_skipped'        // { atStep: number }
'tour_cta_clicked'    // { step: number } - "Start Your Journey"

// First Entry Events
'first_entry_started' // User begins typing first entry
'first_entry_saved'   // User saves first entry
'signin_prompt_shown' // Shown sign-in modal during entry
'draft_persisted'     // Draft saved to localStorage
'draft_recovered'     // Draft loaded after sign-in

// Guided Onboarding Events
'guided_entry_started' // { entryNumber: 1 | 2 | 3 }
'guided_entry_completed' // { entryNumber: 1 | 2 | 3 }
'day1_completed'       // All 3 entries done

// Unlock Events
'tier_unlocked'        // { tier: 1 | 2 | 3 | 4, trigger: 'entries' | 'streak' }
'feature_unlocked'     // { feature: string }
'locked_chart_viewed'  // { chartName: string }
'unlock_cta_clicked'   // { chartName: string }

// Engagement Events
'daily_goal_progress'  // { entriesComplete: number, goal: 3 }
'daily_goal_completed' // User hits 3 entries for the day
'streak_continued'     // { streakDay: number }
'streak_broken'        // { previousStreak: number }
```

---

## Implementation Phases

### Week 1: Infrastructure
- [ ] Create `useUnlockStatus` hook with tier calculation
- [ ] Create `LockedChart` component
- [ ] Create `unlockTiers.ts` configuration
- [ ] Update `useStreak` for 3-entry minimum
- [ ] Add daily goal progress to streak widget

### Week 2: First Entry Flow
- [ ] Create `draftStorage.ts` utilities
- [ ] Create `SignInPromptModal` component
- [ ] Modify `LogEntryForm` for draft persistence
- [ ] Handle draft recovery after sign-in
- [ ] Add celebration animations

### Week 3: Progressive Unlocks
- [ ] Gate all charts in Dashboard with unlock checks
- [ ] Create unlock celebration modal
- [ ] Add locked states to Compare page
- [ ] Add locked state to Chat page
- [ ] Implement progress indicators on locked charts

### Week 4: Guided Onboarding
- [ ] Create `ProductTour` component
- [ ] Create `GuidedEntryProgress` component
- [ ] Build `FirstEntryPage` with prompts
- [ ] Create morning/evening/stress templates
- [ ] Add Day 1 completion celebration

### Week 5: Analytics & Polish
- [ ] Implement all analytics events
- [ ] Add feature flags for A/B testing thresholds
- [ ] Mobile responsive testing
- [ ] Accessibility audit
- [ ] Performance optimization

---

## Edge Cases & Error Handling

### Draft Persistence
- **localStorage full**: Fallback to sessionStorage, show warning
- **Draft expired (>24h)**: Clear silently, start fresh
- **Multiple drafts**: Keep most recent only
- **Sign-in fails**: Keep draft, allow retry

### Unlock Calculations
- **Entry deleted**: Don't downgrade tier (use "high water mark")
- **Timezone changes**: Calculate streak in user's local timezone
- **Backdated entries**: Include in count, but don't affect streak
- **Demo mode**: Always show Tier 0 (locked preview)

### Tour & Onboarding
- **User refreshes during tour**: Resume from step 1
- **User already has entries**: Skip first-entry flow, show dashboard
- **Multiple devices**: Sync unlock status via server

---

## Success Criteria

### Phase Gate: Week 2
- [ ] First entry saves successfully through sign-in flow
- [ ] Draft persists after page refresh
- [ ] No content loss during authentication

### Phase Gate: Week 4
- [ ] 3 guided entries complete Day 1
- [ ] Features unlock correctly at each tier
- [ ] Locked charts show clear unlock path

### Launch Criteria: Week 5
- [ ] All analytics events firing
- [ ] Mobile experience smooth
- [ ] No accessibility blockers
- [ ] <3s load time on 3G

---

## Future Enhancements (Post-M5)

1. **Push notifications** for streak reminders
2. **Weekly progress emails** with unlock progress
3. **Social sharing** of milestones
4. **Customizable daily goals** (3-5 entries)
5. **Achievement badges** beyond tiers
6. **Referral rewards** for inviting friends
7. **Premium tier** with instant unlocks

---

## Appendix: Competitor Research

| App | Unlock System | Daily Goal | Streak Rules |
|-----|---------------|------------|--------------|
| Duolingo | XP-based levels | Lessons/day | Any activity counts |
| Headspace | Session-based | 1 session | Consecutive days |
| Day One | None | None | None |
| Reflectly | Mood streaks | 1 entry | Any entry counts |

**Pratyaksha Differentiator**: Quality-focused streaks (3 entries minimum) encourage deeper reflection vs. checkbox behavior.

---

*Document prepared by Product Team | Pratyaksha v2.0*

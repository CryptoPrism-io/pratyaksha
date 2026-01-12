# Milestone 5: Feature Logs

> **Document Type:** Feature Specifications
> **Last Updated:** January 12, 2026

---

## Feature Index

| ID | Feature Name | Priority | Status | Tier |
|----|--------------|----------|--------|------|
| F5.01 | Product Tour | P0 | Planned | - |
| F5.02 | Draft Persistence | P0 | Planned | - |
| F5.03 | Sign-In Prompt Modal | P0 | Planned | - |
| F5.04 | First Entry Page | P0 | Planned | - |
| F5.05 | Guided Entry Progress | P1 | Planned | - |
| F5.06 | Entry Templates (Guided) | P1 | Planned | - |
| F5.07 | Unlock Status Hook | P0 | Planned | - |
| F5.08 | Locked Chart Component | P0 | Planned | - |
| F5.09 | Daily Goal Progress | P1 | Planned | - |
| F5.10 | Streak Rules Update | P1 | Planned | - |
| F5.11 | Unlock Celebration Modal | P2 | Planned | - |
| F5.12 | Compare Page Gating | P1 | Planned | Tier 3-4 |
| F5.13 | Chat Page Gating | P1 | Planned | Tier 4 |
| F5.14 | Analytics Events | P1 | Planned | - |

---

## F5.01: Product Tour

### Overview
A guided tour of the demo dashboard that plays when users first view demo mode, highlighting key features and driving conversion to first entry.

### User Story
> As a new visitor viewing the demo dashboard, I want a quick guided tour so that I understand what Pratyaksha offers and feel motivated to start my own journal.

### Acceptance Criteria
- [ ] Tour auto-starts when user views demo dashboard for first time
- [ ] Tour has 6 steps, each highlighting a different feature
- [ ] Each step shows popover with title, description, and "Start Your Journey" CTA
- [ ] Total reading time under 30 seconds
- [ ] User can skip tour at any point
- [ ] Tour completion triggers analytics event
- [ ] "Start Your Journey" navigates to /first-entry page
- [ ] Tour does not replay on subsequent visits (localStorage flag)

### Technical Specification

**Component:** `src/components/onboarding/ProductTour.tsx`

**Props:**
```typescript
interface ProductTourProps {
  onComplete: () => void;
  onStartJourney: () => void;
  onSkip: () => void;
}
```

**Tour Steps:**
```typescript
const TOUR_STEPS = [
  {
    target: '[data-tour="stats-bar"]',
    title: "Your Journey at a Glance",
    description: "Track entries, streaks, and emotional patterns.",
    duration: 4000
  },
  {
    target: '[data-tour="streak-calendar"]',
    title: "Build Your Streak",
    description: "Log daily to build momentum. 3 entries per day keeps your streak alive.",
    duration: 4000
  },
  {
    target: '[data-tour="sankey-flow"]',
    title: "See Your Patterns",
    description: "Discover how your entry types connect to emotions and moods.",
    duration: 5000
  },
  {
    target: '[data-tour="mode-distribution"]',
    title: "Know Your Moods",
    description: "Understand which cognitive modes dominate your thinking.",
    duration: 4000
  },
  {
    target: '[data-tour="ai-insights"]',
    title: "AI-Powered Clarity",
    description: "Get personalized recommendations based on your patterns.",
    duration: 4000
  },
  {
    target: null, // Center modal
    title: "Ready to Begin?",
    description: "Start your own journey. Your first 3 entries unlock your dashboard.",
    duration: 5000,
    isFinal: true
  }
];
```

**Dependencies:**
- driver.js (existing) or custom implementation
- localStorage for "tour seen" flag

**Analytics Events:**
- `tour_started`
- `tour_step_viewed` (step, stepName)
- `tour_completed`
- `tour_skipped` (atStep)
- `tour_cta_clicked` (step)

---

## F5.02: Draft Persistence

### Overview
Automatically save entry drafts to localStorage so content is not lost if user needs to sign in or accidentally closes the page.

### User Story
> As a user writing an entry, I want my draft saved automatically so that I don't lose my writing if I need to sign in or leave the page.

### Acceptance Criteria
- [ ] Draft auto-saves every 5 seconds while typing
- [ ] Draft persists in localStorage with 24-hour expiry
- [ ] Draft recovered and pre-filled when user returns
- [ ] Draft cleared after successful submission
- [ ] Draft survives sign-in redirect flow
- [ ] Graceful fallback if localStorage is full
- [ ] Visual indicator showing "Draft saved"

### Technical Specification

**Module:** `src/lib/draftStorage.ts`

```typescript
interface PendingDraft {
  content: string;
  timestamp: number;
  source: 'first-entry' | 'log-form' | 'quick-add';
  metadata?: {
    mood?: string;
    tags?: string[];
  };
}

const DRAFT_KEY = 'pratyaksha_pending_draft';
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const AUTO_SAVE_INTERVAL_MS = 5000; // 5 seconds

export function saveDraft(draft: Omit<PendingDraft, 'timestamp'>): boolean;
export function getDraft(): PendingDraft | null;
export function clearDraft(): void;
export function isDraftExpired(draft: PendingDraft): boolean;
```

**Hook:** `src/hooks/useDraftPersistence.ts`

```typescript
interface UseDraftPersistenceOptions {
  source: PendingDraft['source'];
  onRecover?: (draft: PendingDraft) => void;
}

interface UseDraftPersistenceReturn {
  saveDraft: (content: string, metadata?: object) => void;
  recoverDraft: () => PendingDraft | null;
  clearDraft: () => void;
  hasPendingDraft: boolean;
  lastSaved: Date | null;
}

export function useDraftPersistence(options: UseDraftPersistenceOptions): UseDraftPersistenceReturn;
```

**Error Handling:**
- QuotaExceededError: Try sessionStorage, then memory-only with warning
- Parse errors: Clear corrupted draft, start fresh
- Expiry: Silently clear old drafts

---

## F5.03: Sign-In Prompt Modal

### Overview
Modal that appears when an unauthenticated user tries to save an entry, prompting them to sign in while assuring their draft is safe.

### User Story
> As an unauthenticated user trying to save an entry, I want to be prompted to sign in with assurance my content won't be lost so that I can continue my journey without fear.

### Acceptance Criteria
- [ ] Modal appears when unsigned user clicks "Save Entry"
- [ ] Shows reassuring message about draft safety
- [ ] Offers Google sign-in and email options
- [ ] Shows small text "Your draft is saved locally"
- [ ] After sign-in, auto-submits the pending entry
- [ ] Handles sign-in failures gracefully
- [ ] Modal can be dismissed (draft still saved)

### Technical Specification

**Component:** `src/components/auth/SignInPromptModal.tsx`

```typescript
interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInComplete: () => void;
  pendingAction: 'save-entry' | 'unlock-feature';
  featureName?: string; // For unlock-feature action
}
```

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  ✕                                      │
│                                         │
│         📝 Save Your Journey            │
│                                         │
│  Your entry is ready! Sign in to save   │
│  it and start building your personal    │
│  dashboard.                             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔵 Continue with Google        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✉️  Sign in with Email         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Your draft is saved locally and will   │
│  be submitted after sign-in.            │
│                                         │
└─────────────────────────────────────────┘
```

---

## F5.04: First Entry Page

### Overview
Dedicated page for the first entry experience with prompts, encouragement, and streamlined UI focused solely on getting the user to write.

### User Story
> As a new user starting my journal, I want a welcoming first entry page with helpful prompts so that I can easily begin writing without feeling overwhelmed.

### Acceptance Criteria
- [ ] Accessible at /first-entry route
- [ ] Shows welcoming headline and encouraging copy
- [ ] Provides 3-4 starter prompts user can click to pre-fill
- [ ] Large, distraction-free text area
- [ ] Character/word count (optional, subtle)
- [ ] "Save Entry" button prominent
- [ ] Redirects to sign-in if unauthenticated (with draft saved)
- [ ] After save, shows celebration and proceeds to entry #2

### Technical Specification

**Page:** `src/pages/FirstEntry.tsx`

**Route:** `/first-entry`

**Starter Prompts:**
```typescript
const FIRST_ENTRY_PROMPTS = [
  "How are you feeling right now?",
  "What's been on your mind today?",
  "Describe your current emotional state.",
  "What would make today a good day?"
];
```

**Flow After Save:**
1. Check authentication
2. If authenticated: Submit entry → Show celebration → Navigate to /logs with guided prompt for entry #2
3. If not authenticated: Save draft → Show SignInPromptModal → After sign-in, auto-submit → Celebrate → Guide to entry #2

---

## F5.05: Guided Entry Progress

### Overview
Progress tracker showing completion of first 3 guided entries (Day 1 onboarding).

### User Story
> As a new user completing my first day, I want to see my progress toward the 3-entry goal so that I feel motivated to complete the onboarding.

### Acceptance Criteria
- [ ] Shows 3-step progress: Entry 1, Entry 2, Entry 3
- [ ] Current step highlighted, completed steps checked
- [ ] Progress bar showing percentage
- [ ] Displays "Complete 3 entries to unlock your dashboard!"
- [ ] After completion, shows celebration and unlocks Tier 1
- [ ] Dismissible after Day 1 completion
- [ ] Persists across sessions until complete

### Technical Specification

**Component:** `src/components/onboarding/GuidedEntryProgress.tsx`

```typescript
interface GuidedEntryProgressProps {
  currentStep: 1 | 2 | 3;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}
```

**State Storage:**
- Track in user profile or localStorage
- `onboarding_entries_completed: number[]` (entry IDs)
- `onboarding_completed: boolean`

---

## F5.06: Entry Templates (Guided)

### Overview
Pre-built templates for morning check-in and evening reflection to guide users through entries 2 and 3.

### User Story
> As a new user unsure what to write, I want guided templates with prompts so that I can easily complete my first 3 entries.

### Acceptance Criteria
- [ ] Morning Check-in template with energy, dreams, goals prompts
- [ ] Evening Reflection template with wins, challenges, learnings
- [ ] Stress Dump option for free-form venting
- [ ] Templates pre-fill text area with prompts as placeholders
- [ ] User can clear template and write freely
- [ ] Templates accessible from guided progress component

### Technical Specification

**Templates:**
```typescript
const GUIDED_TEMPLATES = {
  morning: {
    name: "Morning Check-in",
    icon: "☀️",
    prompts: [
      "How did you wake up feeling today?",
      "Energy level (1-10):",
      "What are you looking forward to?",
      "Any concerns on your mind?"
    ]
  },
  evening: {
    name: "Evening Reflection",
    icon: "🌙",
    prompts: [
      "What went well today?",
      "What challenged you?",
      "What did you learn?",
      "How are you feeling now?"
    ]
  },
  stressDump: {
    name: "Stress Dump",
    icon: "💨",
    prompts: [
      "Let it all out - no judgment, no structure.",
      "Type whatever comes to mind...",
      ""
    ]
  }
};
```

---

## F5.07: Unlock Status Hook

### Overview
Central hook that calculates user's unlock tier and provides feature access flags.

### User Story
> As a developer, I need a single source of truth for unlock status so that I can consistently gate features across the app.

### Acceptance Criteria
- [ ] Calculates tier based on entry count OR streak length
- [ ] Returns boolean flags for each gated feature
- [ ] Returns progress toward next tier
- [ ] Updates reactively when entries change
- [ ] Uses "high water mark" (never downgrades)
- [ ] Works in demo mode (always Tier 0)

### Technical Specification

**Hook:** `src/hooks/useUnlockStatus.ts`

```typescript
interface UnlockStatus {
  // Current status
  tier: 0 | 1 | 2 | 3 | 4;
  totalEntries: number;
  currentStreak: number;
  maxEntriesEver: number; // High water mark

  // Feature flags - Tier 1
  canViewStreakCalendar: boolean;
  canViewSankeyFlow: boolean;
  canViewEmotionalTimeline: boolean;
  canViewModeDistribution: boolean;

  // Feature flags - Tier 2
  canViewEnergyPatterns: boolean;
  canViewEnergyMatrix: boolean;
  canViewContradictionTracker: boolean;
  canViewThemeTagsBasic: boolean;

  // Feature flags - Tier 3
  canViewThemeTagsFull: boolean;
  canViewDailyRhythm: boolean;
  canViewCompareBasic: boolean;

  // Feature flags - Tier 4
  canViewCompareFull: boolean;
  canUseChat: boolean;

  // Progress
  nextTier: {
    tier: number;
    entriesRequired: number;
    entriesRemaining: number;
    streakRequired: number;
    streakRemaining: number;
  } | null;

  // Daily progress
  todayEntries: number;
  dailyGoal: number;
  dailyGoalComplete: boolean;
}
```

**Tier Calculation:**
```typescript
function calculateTier(entries: number, streak: number): 0 | 1 | 2 | 3 | 4 {
  if (entries >= 30 || streak >= 14) return 4;
  if (entries >= 20 || streak >= 7) return 3;
  if (entries >= 10 || streak >= 3) return 2;
  if (entries >= 3) return 1;
  return 0;
}
```

---

## F5.08: Locked Chart Component

### Overview
Wrapper component that displays a blurred/locked state for charts that haven't been unlocked yet.

### User Story
> As a user who hasn't unlocked a feature, I want to see what's behind the lock so that I'm motivated to keep journaling to unlock it.

### Acceptance Criteria
- [ ] Shows blurred/greyed preview of chart
- [ ] Displays lock icon centered
- [ ] Shows unlock requirement text
- [ ] Shows progress bar toward unlock
- [ ] "Keep Journaling" or "Add Entry" CTA button
- [ ] Clicking CTA navigates to log entry page
- [ ] Smooth transition when chart unlocks

### Technical Specification

**Component:** `src/components/ui/LockedChart.tsx`

```typescript
interface LockedChartProps {
  title: string;
  description: string;
  unlockRequirement: {
    type: 'entries' | 'streak' | 'either';
    entriesNeeded?: number;
    streakNeeded?: number;
    currentEntries: number;
    currentStreak: number;
  };
  previewContent?: React.ReactNode; // Blurred preview
  className?: string;
}
```

**Visual States:**
1. Fully locked (0% progress) - Heavy blur, prominent lock
2. Partial progress (1-99%) - Light blur, progress bar visible
3. Almost there (90%+) - Minimal blur, "Almost there!" message

---

## F5.09: Daily Goal Progress

### Overview
UI component showing progress toward the daily 3-entry goal required for a successful streak day.

### User Story
> As a user building my streak, I want to see how many more entries I need today so that I can complete my daily goal before midnight.

### Acceptance Criteria
- [ ] Shows X of 3 entries completed today
- [ ] Visual progress indicator (dots or bar)
- [ ] Updates in real-time as entries are added
- [ ] Shows encouraging message based on progress
- [ ] Integrates with streak widget
- [ ] Timezone-aware (uses local time for "today")

### Technical Specification

**Component:** `src/components/streak/DailyGoalProgress.tsx`

```typescript
interface DailyGoalProgressProps {
  entriestoday: number;
  goal?: number; // Default 3
  onAddEntry?: () => void;
  compact?: boolean; // For header integration
}
```

**Messages by Progress:**
- 0/3: "Start your day with an entry"
- 1/3: "Great start! 2 more to complete today"
- 2/3: "Almost there! 1 more for today's goal"
- 3/3: "Daily goal complete! 🎉"
- 4+/3: "Above and beyond! Keep it up"

---

## F5.10: Streak Rules Update

### Overview
Update streak calculation to require minimum 3 entries per day for a successful streak day.

### User Story
> As a dedicated journaler, I want streaks to require 3 entries per day so that the streak represents meaningful engagement, not just checking a box.

### Acceptance Criteria
- [ ] Streak only counts days with 3+ entries
- [ ] Days with 1-2 entries show as "incomplete" (not streak break)
- [ ] Calendar visualizes complete vs incomplete days differently
- [ ] Streak count updates correctly with new rules
- [ ] Historical data recalculated with new rules
- [ ] Clear messaging about 3-entry requirement

### Technical Specification

**Modified Hook:** `src/hooks/useStreak.ts`

```typescript
const DAILY_GOAL = 3;

interface DayStatus {
  date: string;
  entryCount: number;
  isComplete: boolean; // entryCount >= DAILY_GOAL
  isStreakDay: boolean; // isComplete && part of consecutive streak
}

function calculateStreak(entries: Entry[]): {
  currentStreak: number;
  longestStreak: number;
  todayComplete: boolean;
  todayEntries: number;
  recentDays: DayStatus[];
} {
  // Group entries by local date
  // Count consecutive days with 3+ entries
  // Return streak metrics
}
```

**Calendar Legend:**
- 🟢 Green: Complete day (3+ entries, in streak)
- 🟡 Yellow: Incomplete day (1-2 entries)
- ⚪ Grey: No entries
- 🔴 Red: Streak broken (0 entries after streak)

---

## F5.11: Unlock Celebration Modal

### Overview
Celebratory modal that appears when user unlocks a new tier or feature.

### User Story
> As a user who just unlocked a new feature, I want to be celebrated so that I feel rewarded for my journaling consistency.

### Acceptance Criteria
- [ ] Confetti animation on modal open
- [ ] Shows which tier/features were unlocked
- [ ] Lists newly available features
- [ ] "Explore Dashboard" CTA button
- [ ] Auto-dismisses after 5 seconds OR on click
- [ ] Only shows once per unlock (tracked in state)

### Technical Specification

**Component:** `src/components/ui/UnlockModal.tsx`

```typescript
interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedTier: 1 | 2 | 3 | 4;
  unlockedFeatures: string[];
  trigger: 'entries' | 'streak';
  triggerValue: number; // Entry count or streak days
}
```

---

## F5.12: Compare Page Gating

### Overview
Gate the Compare page with progressive unlocks - basic comparison at Tier 3, full custom ranges at Tier 4.

### User Story
> As a progressing user, I want to unlock Compare features gradually so that I have goals to work toward and appreciate the feature when I get it.

### Acceptance Criteria
- [ ] Tier 0-2: Shows locked page with preview
- [ ] Tier 3: "This Week vs Last Week" comparison only
- [ ] Tier 4: Full custom date range comparison
- [ ] Locked state shows feature preview and unlock path
- [ ] Smooth unlock transition

### Technical Specification

**Modified Page:** `src/pages/Compare.tsx`

```typescript
function Compare() {
  const { canViewCompareBasic, canViewCompareFull, nextTier } = useUnlockStatus();

  if (!canViewCompareBasic) {
    return <LockedPage
      title="Compare Your Weeks"
      description="See how your patterns evolve over time"
      unlockRequirement={{ entries: 20, streak: 7 }}
    />;
  }

  // Render with limited options if !canViewCompareFull
  return (
    <ComparePage
      allowCustomRanges={canViewCompareFull}
    />
  );
}
```

---

## F5.13: Chat Page Gating

### Overview
Gate the AI Chat feature as the final unlock at Tier 4.

### User Story
> As a power user, I want AI Chat as a reward for consistent journaling so that the AI has enough data to provide meaningful insights.

### Acceptance Criteria
- [ ] Tier 0-3: Shows locked page with preview
- [ ] Tier 4: Full chat access
- [ ] Locked state shows chat preview bubbles
- [ ] Explains why chat needs 30+ entries
- [ ] Clear unlock path displayed

### Technical Specification

**Modified Page:** `src/pages/Chat.tsx`

```typescript
function Chat() {
  const { canUseChat, nextTier, totalEntries } = useUnlockStatus();

  if (!canUseChat) {
    return <LockedPage
      title="AI Journal Assistant"
      description="Chat with an AI that knows your journal history"
      unlockRequirement={{ entries: 30, streak: 14 }}
      rationale="The AI needs at least 30 entries to provide meaningful, personalized insights about your patterns."
    />;
  }

  return <ChatPage />;
}
```

---

## F5.14: Analytics Events

### Overview
Comprehensive analytics tracking for all Milestone 5 features.

### Event Schema

```typescript
// Onboarding Events
interface TourEvent {
  event: 'tour_started' | 'tour_completed' | 'tour_skipped';
  step?: number;
  stepName?: string;
}

interface TourStepEvent {
  event: 'tour_step_viewed' | 'tour_cta_clicked';
  step: number;
  stepName: string;
}

// Entry Events
interface EntryEvent {
  event: 'first_entry_started' | 'first_entry_saved' | 'guided_entry_started' | 'guided_entry_completed' | 'day1_completed';
  entryNumber?: 1 | 2 | 3;
  template?: string;
}

// Draft Events
interface DraftEvent {
  event: 'draft_saved' | 'draft_recovered' | 'draft_expired' | 'draft_cleared';
  source: string;
  contentLength?: number;
}

// Auth Events
interface AuthPromptEvent {
  event: 'signin_prompt_shown' | 'signin_prompt_dismissed' | 'signin_completed_with_draft';
  pendingAction: string;
}

// Unlock Events
interface UnlockEvent {
  event: 'tier_unlocked' | 'feature_unlocked';
  tier?: number;
  feature?: string;
  trigger: 'entries' | 'streak';
  triggerValue: number;
}

// Engagement Events
interface EngagementEvent {
  event: 'locked_chart_viewed' | 'unlock_cta_clicked' | 'daily_goal_progress' | 'daily_goal_completed' | 'streak_continued' | 'streak_broken';
  chartName?: string;
  entriesComplete?: number;
  streakDay?: number;
  previousStreak?: number;
}
```

---

*Feature Logs v1.0 | Milestone 5 | Pratyaksha*

// Gamification Storage - Karma Points & Soul Mapping Progress
// localStorage key: pratyaksha-gamification

// ==================== TYPES ====================

export interface GamificationState {
  // Karma currency
  karma: number;

  // Soul Mapping completion tracking
  completedSoulMappingTopics: string[];

  // Streak tracking
  streakDays: number;
  lastEntryDate: string | null;

  // Daily bonuses
  lastDailyDashboardBonus: string | null;

  // Entry tracking for unlocks
  totalEntriesLogged: number;

  // Launch period auto-gift tracking
  lastAutoGift: string | null;
  totalGiftsReceived: number;

  // Streak milestone celebrations (cloud-synced)
  celebratedMilestones: number[];

  // Timestamps
  createdAt: string;
  lastUpdatedAt: string;
}

// ==================== CONSTANTS ====================

// Karma earning amounts
export const KARMA_REWARDS = {
  JOURNAL_ENTRY: 10,           // Every submission
  SOUL_MAPPING_COMPLETE: 25,   // First time only per topic
  DAILY_DASHBOARD_VIEW: 5,     // Once per day
  DAILY_STREAK_BONUS: 5,       // Per day of streak
  ONBOARDING_COMPLETE: 50,     // One-time
} as const;

// Karma spending costs
export const KARMA_COSTS = {
  AI_CHAT_MESSAGE: 50,         // Per message
  AI_CHART_EXPLAINER: 3,       // Free if cached
  REGENERATE_SUMMARY: 10,      // Weekly/Monthly
} as const;

// Entry count thresholds for unlocking tiers
export const UNLOCK_THRESHOLDS = {
  SURFACE: 0,   // Always unlocked
  DEEP: 10,     // 10 entries
  CORE: 25,     // 25 entries
} as const;

export type UnlockTier = "surface" | "deep" | "core";

// Soul Mapping topic IDs from PROFILE_CATEGORIES (17 total)
export const SOUL_MAPPING_TOPICS = {
  // Surface level (4 topics) - Always unlocked
  surface: [
    "childhood",
    "joys",
    "friendships",
    "interests",
  ],
  // Deep level (6 topics) - Unlocked at 10 entries
  deep: [
    "parents",
    "siblings",
    "love",
    "career",
    "turning-points",
    "body",
  ],
  // Core level (7 topics) - Unlocked at 25 entries
  core: [
    "wounds",
    "fears",
    "regrets",
    "shadow",
    "identity",
    "beliefs",
    "mortality",
  ],
} as const;

export const ALL_SOUL_MAPPING_TOPICS = [
  ...SOUL_MAPPING_TOPICS.surface,
  ...SOUL_MAPPING_TOPICS.deep,
  ...SOUL_MAPPING_TOPICS.core,
] as const;

export type SoulMappingTopicId = typeof ALL_SOUL_MAPPING_TOPICS[number];

// ==================== LAUNCH CONFIG ====================

// Toggle this during launch period to auto-gift karma when users run low
export const LAUNCH_CONFIG = {
  // Set to true during beta/launch to be generous with Karma
  AUTO_GIFT_ENABLED: true,

  // When user's karma falls below this, auto-gift kicks in
  LOW_KARMA_THRESHOLD: 10,

  // Amount to gift when user is low
  AUTO_GIFT_AMOUNT: 100,

  // Cooldown between auto-gifts (24 hours in ms)
  AUTO_GIFT_COOLDOWN: 24 * 60 * 60 * 1000,

  // Launch period end date (set to null for no end)
  LAUNCH_PERIOD_END: null as string | null, // e.g., "2025-03-01"
} as const;

// ==================== STORAGE KEY ====================

export const GAMIFICATION_STORAGE_KEY = "pratyaksha-gamification";

// ==================== DEFAULT STATE ====================

export const DEFAULT_GAMIFICATION_STATE: GamificationState = {
  karma: 0,
  completedSoulMappingTopics: [],
  streakDays: 0,
  lastEntryDate: null,
  lastDailyDashboardBonus: null,
  totalEntriesLogged: 0,
  lastAutoGift: null,
  totalGiftsReceived: 0,
  celebratedMilestones: [],
  createdAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
};

// ==================== STORAGE FUNCTIONS ====================

/**
 * Load gamification state from localStorage
 */
export function loadGamificationState(): GamificationState {
  if (typeof window === "undefined") return DEFAULT_GAMIFICATION_STATE;

  try {
    const stored = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_GAMIFICATION_STATE, ...parsed };
    }
  } catch (error) {
    console.error("[Gamification] Failed to load state:", error);
  }

  return DEFAULT_GAMIFICATION_STATE;
}

/**
 * Save gamification state to localStorage and trigger cloud sync
 */
export function saveGamificationState(state: GamificationState): void {
  if (typeof window === "undefined") return;

  try {
    const updatedState = {
      ...state,
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(updatedState));

    // Trigger cloud sync (debounced in the sync hook)
    window.dispatchEvent(new StorageEvent("storage", {
      key: GAMIFICATION_STORAGE_KEY,
      newValue: JSON.stringify(updatedState),
    }));
  } catch (error) {
    console.error("[Gamification] Failed to save state:", error);
  }
}

/**
 * Clear gamification data (full reset)
 */
export function clearGamificationData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GAMIFICATION_STORAGE_KEY);
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get the tier a topic belongs to
 */
export function getTopicTier(topicId: string): UnlockTier | null {
  if (SOUL_MAPPING_TOPICS.surface.includes(topicId as any)) return "surface";
  if (SOUL_MAPPING_TOPICS.deep.includes(topicId as any)) return "deep";
  if (SOUL_MAPPING_TOPICS.core.includes(topicId as any)) return "core";
  return null;
}

/**
 * Check if a tier is unlocked based on entry count
 */
export function isTierUnlockedByEntryCount(tier: UnlockTier, entryCount: number): boolean {
  switch (tier) {
    case "surface":
      return true; // Always unlocked
    case "deep":
      return entryCount >= UNLOCK_THRESHOLDS.DEEP;
    case "core":
      return entryCount >= UNLOCK_THRESHOLDS.CORE;
    default:
      return false;
  }
}

/**
 * Get the current unlock level based on entry count
 */
export function getCurrentUnlockLevel(entryCount: number): UnlockTier {
  if (entryCount >= UNLOCK_THRESHOLDS.CORE) return "core";
  if (entryCount >= UNLOCK_THRESHOLDS.DEEP) return "deep";
  return "surface";
}

/**
 * Get entries needed until next level
 */
export function getEntriesUntilNextLevel(entryCount: number): { nextTier: UnlockTier | null; entriesNeeded: number } {
  if (entryCount < UNLOCK_THRESHOLDS.DEEP) {
    return { nextTier: "deep", entriesNeeded: UNLOCK_THRESHOLDS.DEEP - entryCount };
  }
  if (entryCount < UNLOCK_THRESHOLDS.CORE) {
    return { nextTier: "core", entriesNeeded: UNLOCK_THRESHOLDS.CORE - entryCount };
  }
  return { nextTier: null, entriesNeeded: 0 };
}

/**
 * Check if today's date matches a given date string (YYYY-MM-DD comparison)
 */
export function isToday(dateString: string | null): boolean {
  if (!dateString) return false;
  const today = new Date().toISOString().split("T")[0];
  const compareDate = dateString.split("T")[0];
  return today === compareDate;
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(dateString: string | null): boolean {
  if (!dateString) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const compareDate = dateString.split("T")[0];
  return yesterdayStr === compareDate;
}

/**
 * Check if auto-gift should be triggered during launch period
 */
export function shouldAutoGiftKarma(state: GamificationState): {
  shouldGift: boolean;
  amount: number;
  reason: string;
} {
  // Check if auto-gift is enabled
  if (!LAUNCH_CONFIG.AUTO_GIFT_ENABLED) {
    return { shouldGift: false, amount: 0, reason: "Auto-gift disabled" };
  }

  // Check if launch period has ended
  if (LAUNCH_CONFIG.LAUNCH_PERIOD_END) {
    const endDate = new Date(LAUNCH_CONFIG.LAUNCH_PERIOD_END);
    if (new Date() > endDate) {
      return { shouldGift: false, amount: 0, reason: "Launch period ended" };
    }
  }

  // Check if user's karma is above threshold
  if (state.karma >= LAUNCH_CONFIG.LOW_KARMA_THRESHOLD) {
    return { shouldGift: false, amount: 0, reason: "Karma above threshold" };
  }

  // Check cooldown
  if (state.lastAutoGift) {
    const lastGiftTime = new Date(state.lastAutoGift).getTime();
    const now = Date.now();
    if (now - lastGiftTime < LAUNCH_CONFIG.AUTO_GIFT_COOLDOWN) {
      const hoursRemaining = Math.ceil((LAUNCH_CONFIG.AUTO_GIFT_COOLDOWN - (now - lastGiftTime)) / (60 * 60 * 1000));
      return { shouldGift: false, amount: 0, reason: `Cooldown: ${hoursRemaining}h remaining` };
    }
  }

  // All checks passed - should gift!
  return {
    shouldGift: true,
    amount: LAUNCH_CONFIG.AUTO_GIFT_AMOUNT,
    reason: "Welcome bonus during launch!",
  };
}

/**
 * Get Soul Mapping completion progress
 */
export function getSoulMappingProgress(completedTopics: string[]): {
  completed: number;
  total: number;
  percentage: number;
  byTier: {
    surface: { completed: number; total: number };
    deep: { completed: number; total: number };
    core: { completed: number; total: number };
  };
} {
  const surfaceCompleted = SOUL_MAPPING_TOPICS.surface.filter(t => completedTopics.includes(t)).length;
  const deepCompleted = SOUL_MAPPING_TOPICS.deep.filter(t => completedTopics.includes(t)).length;
  const coreCompleted = SOUL_MAPPING_TOPICS.core.filter(t => completedTopics.includes(t)).length;

  const total = ALL_SOUL_MAPPING_TOPICS.length;
  const completed = surfaceCompleted + deepCompleted + coreCompleted;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    byTier: {
      surface: { completed: surfaceCompleted, total: SOUL_MAPPING_TOPICS.surface.length },
      deep: { completed: deepCompleted, total: SOUL_MAPPING_TOPICS.deep.length },
      core: { completed: coreCompleted, total: SOUL_MAPPING_TOPICS.core.length },
    },
  };
}

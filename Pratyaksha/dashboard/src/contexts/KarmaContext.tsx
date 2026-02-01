// Karma Context - Gamification state management
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useEntries } from "../hooks/useEntries";
import type { GamificationState, UnlockTier } from "../lib/gamificationStorage";
import {
  loadGamificationState,
  saveGamificationState,
  DEFAULT_GAMIFICATION_STATE,
  KARMA_REWARDS,
  KARMA_COSTS,
  LAUNCH_CONFIG,
  getCurrentUnlockLevel,
  getEntriesUntilNextLevel,
  isTierUnlockedByEntryCount,
  getTopicTier,
  isToday,
  isYesterday,
  getSoulMappingProgress,
  shouldAutoGiftKarma,
} from "../lib/gamificationStorage";
import { toast } from "sonner";

// ==================== TYPES ====================

type KarmaAction = keyof typeof KARMA_REWARDS;
type KarmaCost = keyof typeof KARMA_COSTS;

interface KarmaContextValue {
  // State
  karma: number;
  unlockLevel: UnlockTier;
  completedSoulMappingTopics: string[];
  streakDays: number;
  totalEntriesLogged: number;

  // Derived state
  entriesUntilNextLevel: number;
  nextUnlockLevel: UnlockTier | null;
  soulMappingProgress: ReturnType<typeof getSoulMappingProgress>;

  // Actions
  earnKarma: (action: KarmaAction, silent?: boolean) => number;
  spendKarma: (cost: KarmaCost) => boolean;
  canAfford: (cost: KarmaCost | number) => boolean;
  isTierUnlocked: (tier: UnlockTier) => boolean;
  isTopicUnlocked: (topicId: string) => boolean;
  isTopicCompleted: (topicId: string) => boolean;
  recordSoulMappingCompletion: (topicId: string) => number;
  checkDailyDashboardBonus: () => number;
  updateStreak: () => void;
  syncWithServer: () => Promise<void>;

  // Admin functions
  giftKarma: (amount: number, reason?: string) => void;
  setKarma: (amount: number) => void;
  checkAutoGift: () => number;

  // For debugging
  resetGamification: () => void;
}

// ==================== CONTEXT ====================

const KarmaContext = createContext<KarmaContextValue | null>(null);

// ==================== PROVIDER ====================

interface KarmaProviderProps {
  children: React.ReactNode;
}

export function KarmaProvider({ children }: KarmaProviderProps) {
  const { user } = useAuth();
  const { data: entries = [] } = useEntries();

  // Load state from localStorage
  const [state, setState] = useState<GamificationState>(() => loadGamificationState());

  // Sync entry count from actual entries
  const entryCount = entries.length;

  // Computed values
  const unlockLevel = useMemo(() => getCurrentUnlockLevel(entryCount), [entryCount]);
  const { nextTier: nextUnlockLevel, entriesNeeded: entriesUntilNextLevel } = useMemo(
    () => getEntriesUntilNextLevel(entryCount),
    [entryCount]
  );
  const soulMappingProgress = useMemo(
    () => getSoulMappingProgress(state.completedSoulMappingTopics),
    [state.completedSoulMappingTopics]
  );

  // Save state changes to localStorage
  useEffect(() => {
    saveGamificationState(state);
  }, [state]);

  // Check for auto-gift when karma is low (launch period feature)
  useEffect(() => {
    if (!LAUNCH_CONFIG.AUTO_GIFT_ENABLED) return;

    const { shouldGift, amount, reason } = shouldAutoGiftKarma(state);
    if (shouldGift) {
      // Delay slightly to avoid immediate toast on load
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          karma: prev.karma + amount,
          lastAutoGift: new Date().toISOString(),
          totalGiftsReceived: prev.totalGiftsReceived + 1,
        }));

        toast.success(`+${amount} Karma Gift!`, {
          description: reason,
          duration: 5000,
        });

        console.log(`[Karma] Auto-gifted ${amount} Karma. Reason: ${reason}`);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.karma]); // Only check when karma changes

  // Sync with server when user logs in
  useEffect(() => {
    if (user) {
      // Load from server if available
      fetchServerState();
    }
  }, [user]);

  // Fetch gamification state from server
  const fetchServerState = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user-profile/${user.uid}`);
      const data = await response.json();

      if (data.success && data.profile?.gamification) {
        const serverState = data.profile.gamification;
        // Merge server state with local, preferring higher karma
        setState(prev => ({
          ...prev,
          karma: Math.max(prev.karma, serverState.karma || 0),
          completedSoulMappingTopics: Array.from(new Set([
            ...prev.completedSoulMappingTopics,
            ...(serverState.completedSoulMappingTopics || []),
          ])),
          streakDays: Math.max(prev.streakDays, serverState.streakDays || 0),
        }));
      }
    } catch (error) {
      console.error("[Karma] Failed to fetch server state:", error);
    }
  }, [user]);

  // Sync state to server
  const syncWithServer = useCallback(async () => {
    if (!user) return;

    try {
      await fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          gamification: {
            karma: state.karma,
            completedSoulMappingTopics: state.completedSoulMappingTopics,
            streakDays: state.streakDays,
            lastEntryDate: state.lastEntryDate,
            lastDailyDashboardBonus: state.lastDailyDashboardBonus,
            totalEntriesLogged: state.totalEntriesLogged,
          },
        }),
      });
    } catch (error) {
      console.error("[Karma] Failed to sync with server:", error);
    }
  }, [user, state]);

  // Earn karma for an action
  const earnKarma = useCallback((action: KarmaAction, silent = false): number => {
    const amount = KARMA_REWARDS[action];

    setState(prev => ({
      ...prev,
      karma: prev.karma + amount,
    }));

    if (!silent) {
      toast.success(`+${amount} Karma`, {
        description: getKarmaActionDescription(action),
        duration: 2000,
      });
    }

    return amount;
  }, []);

  // Spend karma for an action
  const spendKarma = useCallback((cost: KarmaCost): boolean => {
    const amount = KARMA_COSTS[cost];

    if (state.karma < amount) {
      return false;
    }

    setState(prev => ({
      ...prev,
      karma: prev.karma - amount,
    }));

    return true;
  }, [state.karma]);

  // Check if user can afford a cost
  const canAfford = useCallback((cost: KarmaCost | number): boolean => {
    const amount = typeof cost === "number" ? cost : KARMA_COSTS[cost];
    return state.karma >= amount;
  }, [state.karma]);

  // Check if a tier is unlocked
  const isTierUnlocked = useCallback((tier: UnlockTier): boolean => {
    return isTierUnlockedByEntryCount(tier, entryCount);
  }, [entryCount]);

  // Check if a topic is unlocked
  const isTopicUnlocked = useCallback((topicId: string): boolean => {
    const tier = getTopicTier(topicId);
    if (!tier) return false;
    return isTierUnlocked(tier);
  }, [isTierUnlocked]);

  // Check if a topic is completed
  const isTopicCompleted = useCallback((topicId: string): boolean => {
    return state.completedSoulMappingTopics.includes(topicId);
  }, [state.completedSoulMappingTopics]);

  // Record Soul Mapping topic completion
  const recordSoulMappingCompletion = useCallback((topicId: string): number => {
    // Check if already completed
    if (state.completedSoulMappingTopics.includes(topicId)) {
      return 0; // No karma for repeat completion
    }

    // Check if topic is unlocked
    if (!isTopicUnlocked(topicId)) {
      return 0;
    }

    // Add to completed topics
    setState(prev => ({
      ...prev,
      completedSoulMappingTopics: [...prev.completedSoulMappingTopics, topicId],
      karma: prev.karma + KARMA_REWARDS.SOUL_MAPPING_COMPLETE,
    }));

    toast.success(`+${KARMA_REWARDS.SOUL_MAPPING_COMPLETE} Karma`, {
      description: "Soul Mapping topic completed!",
      duration: 3000,
    });

    return KARMA_REWARDS.SOUL_MAPPING_COMPLETE;
  }, [state.completedSoulMappingTopics, isTopicUnlocked]);

  // Check and award daily dashboard bonus
  const checkDailyDashboardBonus = useCallback((): number => {
    // Already got bonus today?
    if (isToday(state.lastDailyDashboardBonus)) {
      return 0;
    }

    // Award bonus
    setState(prev => ({
      ...prev,
      karma: prev.karma + KARMA_REWARDS.DAILY_DASHBOARD_VIEW,
      lastDailyDashboardBonus: new Date().toISOString(),
    }));

    toast.success(`+${KARMA_REWARDS.DAILY_DASHBOARD_VIEW} Karma`, {
      description: "Daily dashboard visit bonus!",
      duration: 2000,
    });

    return KARMA_REWARDS.DAILY_DASHBOARD_VIEW;
  }, [state.lastDailyDashboardBonus]);

  // Update streak based on entry dates
  const updateStreak = useCallback(() => {
    const today = new Date().toISOString();

    // If last entry was today, no change
    if (isToday(state.lastEntryDate)) {
      return;
    }

    // If last entry was yesterday, increment streak
    if (isYesterday(state.lastEntryDate)) {
      setState(prev => ({
        ...prev,
        streakDays: prev.streakDays + 1,
        lastEntryDate: today,
        karma: prev.karma + KARMA_REWARDS.DAILY_STREAK_BONUS,
        totalEntriesLogged: prev.totalEntriesLogged + 1,
      }));

      toast.success(`+${KARMA_REWARDS.DAILY_STREAK_BONUS} Karma`, {
        description: `${state.streakDays + 1} day streak!`,
        duration: 2000,
      });
    } else {
      // Streak broken, start fresh
      setState(prev => ({
        ...prev,
        streakDays: 1,
        lastEntryDate: today,
        totalEntriesLogged: prev.totalEntriesLogged + 1,
      }));
    }
  }, [state.lastEntryDate, state.streakDays]);

  // Check and trigger auto-gift during launch period
  const checkAutoGift = useCallback((): number => {
    const { shouldGift, amount, reason } = shouldAutoGiftKarma(state);

    if (!shouldGift) {
      return 0;
    }

    setState(prev => ({
      ...prev,
      karma: prev.karma + amount,
      lastAutoGift: new Date().toISOString(),
      totalGiftsReceived: prev.totalGiftsReceived + 1,
    }));

    toast.success(`+${amount} Karma Gift!`, {
      description: reason,
      duration: 5000,
    });

    console.log(`[Karma] Auto-gifted ${amount} Karma. Reason: ${reason}`);
    return amount;
  }, [state]);

  // Admin: Gift Karma to user (for launch promotions, support, etc.)
  const giftKarma = useCallback((amount: number, reason?: string) => {
    if (amount <= 0) return;

    setState(prev => ({
      ...prev,
      karma: prev.karma + amount,
      totalGiftsReceived: prev.totalGiftsReceived + 1,
    }));

    toast.success(`+${amount} Karma Gift!`, {
      description: reason || "You received bonus Karma!",
      duration: 4000,
    });

    console.log(`[Karma] Gifted ${amount} Karma. Reason: ${reason || "No reason provided"}`);
  }, []);

  // Admin: Set Karma to specific amount (for support/debugging)
  const setKarma = useCallback((amount: number) => {
    if (amount < 0) return;

    setState(prev => ({
      ...prev,
      karma: amount,
    }));

    console.log(`[Karma] Set karma to ${amount}`);
  }, []);

  // Reset gamification (for testing)
  const resetGamification = useCallback(() => {
    setState(DEFAULT_GAMIFICATION_STATE);
    toast.success("Gamification reset");
  }, []);

  const value: KarmaContextValue = {
    // State
    karma: state.karma,
    unlockLevel,
    completedSoulMappingTopics: state.completedSoulMappingTopics,
    streakDays: state.streakDays,
    totalEntriesLogged: state.totalEntriesLogged,

    // Derived
    entriesUntilNextLevel,
    nextUnlockLevel,
    soulMappingProgress,

    // Actions
    earnKarma,
    spendKarma,
    canAfford,
    isTierUnlocked,
    isTopicUnlocked,
    isTopicCompleted,
    recordSoulMappingCompletion,
    checkDailyDashboardBonus,
    updateStreak,
    syncWithServer,

    // Admin
    giftKarma,
    setKarma,
    checkAutoGift,
    resetGamification,
  };

  return (
    <KarmaContext.Provider value={value}>
      {children}
    </KarmaContext.Provider>
  );
}

// ==================== HOOK ====================

export function useKarma(): KarmaContextValue {
  const context = useContext(KarmaContext);
  if (!context) {
    throw new Error("useKarma must be used within a KarmaProvider");
  }
  return context;
}

// ==================== HELPERS ====================

function getKarmaActionDescription(action: KarmaAction): string {
  switch (action) {
    case "JOURNAL_ENTRY":
      return "Journal entry logged";
    case "SOUL_MAPPING_COMPLETE":
      return "Soul Mapping topic completed";
    case "DAILY_DASHBOARD_VIEW":
      return "Daily dashboard visit";
    case "DAILY_STREAK_BONUS":
      return "Streak bonus";
    case "ONBOARDING_COMPLETE":
      return "Onboarding completed";
    default:
      return "Karma earned";
  }
}

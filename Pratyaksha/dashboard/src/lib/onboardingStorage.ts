// First-time onboarding profile storage
// localStorage key: pratyaksha-first-time-onboarding-profile

export type UserOnboardingProfile = {
  // Demographics (Slide 2)
  displayName: string;
  ageRange: "18-24" | "25-34" | "35-44" | "45-54" | "55+" | null;
  sex: "male" | "female" | "non-binary" | "prefer-not-to-say" | null;
  location: string | null;
  profession: string | null;

  // Key Memories (Slide 6)
  selectedMemoryTopics: string[];

  // Psychological Context (Slide 8)
  stressLevel: number | null; // 1-5
  emotionalOpenness: number | null; // 1-5
  reflectionFrequency: number | null; // 1-5
  lifeSatisfaction: number | null; // 1-5
  personalGoal: string | null;

  // Seed Entry (Slide 4)
  seedMemory: string | null;

  // Preferences (Slide 10)
  dailyReminderEnabled: boolean;
  reminderTime: string | null;
  defaultEntryMode: string | null;
  showFeatureTour: boolean;

  // Metadata
  completedAt: string | null;
  lastSlideCompleted: number;
  badges: string[];
};

export const ONBOARDING_STORAGE_KEY = "pratyaksha-first-time-onboarding-profile";
export const ONBOARDING_COMPLETED_KEY = "pratyaksha-first-time-onboarding-completed";

export const TOTAL_SLIDES = 10;

export const DEFAULT_PROFILE: UserOnboardingProfile = {
  displayName: "",
  ageRange: null,
  sex: null,
  location: null,
  profession: null,
  selectedMemoryTopics: [],
  stressLevel: null,
  emotionalOpenness: null,
  reflectionFrequency: null,
  lifeSatisfaction: null,
  personalGoal: null,
  seedMemory: null,
  dailyReminderEnabled: false,
  reminderTime: null,
  defaultEntryMode: null,
  showFeatureTour: true,
  completedAt: null,
  lastSlideCompleted: 0,
  badges: [],
};

// Memory topic options for Slide 6
export const MEMORY_TOPICS = [
  { id: "childhood", label: "Pivotal childhood memory", icon: "Baby" },
  { id: "relationship", label: "Relationship that changed me", icon: "Heart" },
  { id: "career", label: "Career turning point", icon: "Briefcase" },
  { id: "fear", label: "Overcoming fear", icon: "Shield" },
  { id: "alive", label: "Feeling truly alive", icon: "Sparkles" },
  { id: "loss", label: "Loss that affected me", icon: "Cloud" },
  { id: "decision", label: "Decision I'm processing", icon: "GitBranch" },
  { id: "gratitude", label: "Something I'm grateful for", icon: "Gift" },
  { id: "dream", label: "Dream I haven't pursued", icon: "Star" },
  { id: "discovery", label: "Moment of self-discovery", icon: "Lightbulb" },
] as const;

// Profession options for Slide 2
export const PROFESSION_OPTIONS = [
  "Student",
  "Technology",
  "Healthcare",
  "Arts & Creative",
  "Business & Finance",
  "Education",
  "Service Industry",
  "Government",
  "Self-Employed",
  "Retired",
  "Other",
] as const;

// Entry mode options for Slide 10
export const ENTRY_MODE_OPTIONS = [
  { value: "morning", label: "Morning Reflection" },
  { value: "evening", label: "Evening Review" },
  { value: "freewrite", label: "Free Write" },
  { value: "gratitude", label: "Gratitude Practice" },
  { value: "stress", label: "Stress Release" },
] as const;

// Badge definitions
export const BADGES = {
  early_explorer: {
    id: "early_explorer",
    name: "Early Explorer",
    description: "Completed the onboarding journey",
    icon: "Compass",
  },
  open_book: {
    id: "open_book",
    name: "Open Book",
    description: "Filled all optional fields",
    icon: "BookOpen",
  },
  deep_diver: {
    id: "deep_diver",
    name: "Deep Diver",
    description: "Selected 3 memory topics to explore",
    icon: "Anchor",
  },
  seeker: {
    id: "seeker",
    name: "Seeker",
    description: "Wrote 100+ character seed memory",
    icon: "Search",
  },
} as const;

export type BadgeId = keyof typeof BADGES;

/**
 * Load onboarding profile from localStorage
 */
export function loadOnboardingProfile(): UserOnboardingProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;

  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch (error) {
    console.error("Failed to load onboarding profile:", error);
  }

  return DEFAULT_PROFILE;
}

/**
 * Save onboarding profile to localStorage and trigger cloud sync
 */
export function saveOnboardingProfile(profile: UserOnboardingProfile): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(profile));

    // Trigger cloud sync (debounced in the sync hook)
    window.dispatchEvent(new StorageEvent("storage", {
      key: ONBOARDING_STORAGE_KEY,
      newValue: JSON.stringify(profile),
    }));
  } catch (error) {
    console.error("Failed to save onboarding profile:", error);
  }
}

/**
 * Check if onboarding has been completed
 */
export function hasCompletedFirstTimeOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
}

/**
 * Mark first-time onboarding as completed
 */
export function markOnboardingCompleted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
}

/**
 * Reset onboarding (for revisit)
 */
export function resetFirstTimeOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
}

/**
 * Clear all onboarding data (full reset)
 */
export function clearOnboardingData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
}

/**
 * Sync onboarding status from server (for cross-device consistency)
 * Called on login to check if user already completed onboarding on another device
 */
export async function syncOnboardingFromServer(uid: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch(`/api/user-profile/${uid}`);
    if (!response.ok) {
      // User profile doesn't exist yet - first time user
      return false;
    }

    const data = await response.json();

    if (data.success && data.profile?.onboardingCompleted) {
      // User completed onboarding on another device - sync to localStorage
      markOnboardingCompleted();

      // Also restore their profile data if available
      if (data.profile.personalization) {
        const restoredProfile: UserOnboardingProfile = {
          ...DEFAULT_PROFILE,
          displayName: data.profile.displayName || "",
          ageRange: data.profile.personalization.ageRange || null,
          sex: data.profile.personalization.sex || null,
          location: data.profile.personalization.location || null,
          profession: data.profile.personalization.profession || null,
          stressLevel: data.profile.personalization.stressLevel || null,
          emotionalOpenness: data.profile.personalization.emotionalOpenness || null,
          reflectionFrequency: data.profile.personalization.reflectionFrequency || null,
          lifeSatisfaction: data.profile.personalization.lifeSatisfaction || null,
          personalGoal: data.profile.personalization.personalGoal || null,
          selectedMemoryTopics: data.profile.personalization.selectedMemoryTopics || [],
          seedMemory: data.profile.personalization.seedMemory || null,
          dailyReminderEnabled: data.profile.dailyReminderEnabled || false,
          reminderTime: data.profile.reminderTime || null,
          defaultEntryMode: data.profile.personalization.defaultEntryMode || null,
          showFeatureTour: data.profile.personalization.showFeatureTour ?? true,
          completedAt: data.profile.createdAt || new Date().toISOString(),
          lastSlideCompleted: TOTAL_SLIDES,
          badges: data.profile.badges || [],
        };
        saveOnboardingProfile(restoredProfile);
      }

      console.log("[Onboarding] Synced completion status from server");
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Onboarding] Failed to sync from server:", error);
    return false;
  }
}

/**
 * Calculate earned badges based on profile
 */
export function calculateEarnedBadges(profile: UserOnboardingProfile): BadgeId[] {
  const badges: BadgeId[] = [];

  // Early Explorer - completed onboarding
  if (profile.completedAt) {
    badges.push("early_explorer");
  }

  // Open Book - filled all optional fields
  const hasAllOptional =
    profile.ageRange !== null &&
    profile.sex !== null &&
    profile.location !== null &&
    profile.profession !== null &&
    profile.stressLevel !== null &&
    profile.emotionalOpenness !== null &&
    profile.reflectionFrequency !== null &&
    profile.lifeSatisfaction !== null &&
    profile.personalGoal !== null;

  if (hasAllOptional) {
    badges.push("open_book");
  }

  // Deep Diver - selected 3 memory topics
  if (profile.selectedMemoryTopics.length >= 3) {
    badges.push("deep_diver");
  }

  // Seeker - wrote 100+ char seed memory
  if (profile.seedMemory && profile.seedMemory.length >= 100) {
    badges.push("seeker");
  }

  return badges;
}

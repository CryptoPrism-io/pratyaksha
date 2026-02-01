import { useState, useCallback, useEffect } from "react";
import {
  loadOnboardingProfile,
  saveOnboardingProfile,
  hasCompletedFirstTimeOnboarding,
  markOnboardingCompleted,
  resetFirstTimeOnboarding,
  calculateEarnedBadges,
  TOTAL_SLIDES,
} from "@/lib/onboardingStorage";
import type { UserOnboardingProfile, BadgeId } from "@/lib/onboardingStorage";

export interface UseOnboardingProfileReturn {
  profile: UserOnboardingProfile;
  currentSlide: number;
  totalSlides: number;
  isCompleted: boolean;
  earnedBadges: BadgeId[];
  newlyEarnedBadges: BadgeId[];

  // Navigation
  goToSlide: (slide: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  skipSlide: () => void;

  // Profile updates
  updateProfile: (updates: Partial<UserOnboardingProfile>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Validation
  canProceed: (slide: number) => boolean;
  isSlideSkipped: (slide: number) => boolean;
}

export function useOnboardingProfile(): UseOnboardingProfileReturn {
  const [profile, setProfile] = useState<UserOnboardingProfile>(() =>
    loadOnboardingProfile()
  );
  const [currentSlide, setCurrentSlide] = useState<number>(() => {
    const loaded = loadOnboardingProfile();
    // Resume from last slide + 1 if not completed
    return loaded.completedAt ? 1 : Math.min(loaded.lastSlideCompleted + 1, TOTAL_SLIDES);
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(() =>
    hasCompletedFirstTimeOnboarding()
  );
  const [previousBadges, setPreviousBadges] = useState<BadgeId[]>([]);

  // Calculate earned badges
  const earnedBadges = calculateEarnedBadges(profile);

  // Track newly earned badges (for animations)
  const newlyEarnedBadges = earnedBadges.filter(
    (badge) => !previousBadges.includes(badge)
  );

  // Persist profile changes
  useEffect(() => {
    saveOnboardingProfile(profile);
  }, [profile]);

  // Track badge changes
  useEffect(() => {
    if (earnedBadges.length > previousBadges.length) {
      // Badges earned, will trigger animation
      setTimeout(() => {
        setPreviousBadges(earnedBadges);
      }, 2000); // Clear newly earned after animation
    }
  }, [earnedBadges, previousBadges]);

  const updateProfile = useCallback((updates: Partial<UserOnboardingProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      return updated;
    });
  }, []);

  const goToSlide = useCallback((slide: number) => {
    if (slide >= 1 && slide <= TOTAL_SLIDES) {
      setCurrentSlide(slide);
      setProfile((prev) => ({
        ...prev,
        lastSlideCompleted: Math.max(prev.lastSlideCompleted, slide - 1),
      }));
    }
  }, []);

  const nextSlide = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES) {
      const nextSlideNum = currentSlide + 1;
      setCurrentSlide(nextSlideNum);
      setProfile((prev) => ({
        ...prev,
        lastSlideCompleted: Math.max(prev.lastSlideCompleted, currentSlide),
      }));
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  const skipSlide = useCallback(() => {
    // Skip current slide and move to next
    nextSlide();
  }, [nextSlide]);

  const completeOnboarding = useCallback(() => {
    const completedProfile = {
      ...profile,
      completedAt: new Date().toISOString(),
      lastSlideCompleted: TOTAL_SLIDES,
      badges: calculateEarnedBadges({
        ...profile,
        completedAt: new Date().toISOString(),
      }),
    };
    setProfile(completedProfile);
    saveOnboardingProfile(completedProfile);
    markOnboardingCompleted();
    setIsCompleted(true);
  }, [profile]);

  const resetOnboarding = useCallback(() => {
    resetFirstTimeOnboarding();
    setIsCompleted(false);
    setCurrentSlide(1);
    // Keep profile data but reset completion
    setProfile((prev) => ({
      ...prev,
      completedAt: null,
      lastSlideCompleted: 0,
    }));
  }, []);

  // Validation for each slide
  const canProceed = useCallback(
    (slide: number): boolean => {
      switch (slide) {
        case 1: // Welcome - always can proceed
          return true;
        case 2: // Demographics - name is required
          return profile.displayName.trim().length > 0;
        case 3: // Patterns - always can proceed
          return true;
        case 4: // Seed Entry - need at least 20 chars
          return (profile.seedMemory?.length ?? 0) >= 20;
        case 5: // Privacy - always can proceed
          return true;
        case 6: // Memories - need at least 1 selection (but allow skip)
          return true; // Optional
        case 7: // AI Pipeline - always can proceed
          return true;
        case 8: // Psych Context - at least one slider filled
          return true; // Optional
        case 9: // Feature Preview - always can proceed
          return true;
        case 10: // Commitment - always can proceed
          return true;
        default:
          return false;
      }
    },
    [profile]
  );

  const isSlideSkipped = useCallback(
    (slide: number): boolean => {
      // A slide is "skipped" if we've passed it but it has no data
      if (slide >= currentSlide) return false;

      switch (slide) {
        case 2:
          return !profile.displayName;
        case 4:
          return !profile.seedMemory || profile.seedMemory.length < 20;
        case 6:
          return profile.selectedMemoryTopics.length === 0;
        case 8:
          return (
            profile.stressLevel === null &&
            profile.emotionalOpenness === null &&
            profile.reflectionFrequency === null &&
            profile.lifeSatisfaction === null
          );
        default:
          return false;
      }
    },
    [profile, currentSlide]
  );

  return {
    profile,
    currentSlide,
    totalSlides: TOTAL_SLIDES,
    isCompleted,
    earnedBadges,
    newlyEarnedBadges,
    goToSlide,
    nextSlide,
    prevSlide,
    skipSlide,
    updateProfile,
    completeOnboarding,
    resetOnboarding,
    canProceed,
    isSlideSkipped,
  };
}

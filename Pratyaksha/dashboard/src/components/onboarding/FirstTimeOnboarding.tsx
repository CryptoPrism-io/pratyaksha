import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOnboardingProfile } from "@/hooks/useOnboardingProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useKarma } from "@/contexts/KarmaContext";
import { useEntries } from "@/hooks/useEntries";
import { hasCompletedFirstTimeOnboarding, calculateEarnedBadges, markOnboardingCompleted } from "@/lib/onboardingStorage";
import { OnboardingProgress } from "./OnboardingProgress";
import { BadgeRevealQueue } from "./BadgeReveal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Import all slides
import { SlideWelcome } from "./slides/SlideWelcome";
import { SlideDemographics } from "./slides/SlideDemographics";
import { SlidePatterns } from "./slides/SlidePatterns";
import { SlideSeedEntry } from "./slides/SlideSeedEntry";
import { SlidePrivacy } from "./slides/SlidePrivacy";
import { SlideMemories } from "./slides/SlideMemories";
import { SlideAIPipeline } from "./slides/SlideAIPipeline";
import { SlidePsychContext } from "./slides/SlidePsychContext";
import { SlideFeaturePreview } from "./slides/SlideFeaturePreview";
import { SlideCommitment } from "./slides/SlideCommitment";

interface FirstTimeOnboardingProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export function FirstTimeOnboarding({
  forceShow = false,
  onComplete,
}: FirstTimeOnboardingProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { earnKarma } = useKarma();
  const [isOpen, setIsOpen] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [earnedBadgesOnComplete, setEarnedBadgesOnComplete] = useState<string[]>([]);
  const [hasAwardedKarma, setHasAwardedKarma] = useState(false);

  const {
    profile,
    currentSlide,
    totalSlides,
    earnedBadges,
    goToSlide,
    nextSlide,
    prevSlide,
    updateProfile,
    completeOnboarding,
    canProceed,
  } = useOnboardingProfile();

  // Check if user has existing entries (existing user = skip onboarding)
  const { data: entries, isLoading: entriesLoading } = useEntries();

  // Check if should show onboarding
  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }

    // Only show onboarding after user logs in
    if (!user) {
      return;
    }

    // Check if first time user
    const hasCompleted = hasCompletedFirstTimeOnboarding();

    // Already completed - don't show
    if (hasCompleted) {
      return;
    }

    // Wait for entries to load before deciding
    if (entriesLoading) {
      return;
    }

    // If user has existing entries, they're not new - auto-complete onboarding
    if (entries && entries.length > 0) {
      console.log("[Onboarding] Existing user with entries - skipping onboarding");
      markOnboardingCompleted();
      return;
    }

    // New user with no entries - show onboarding after small delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [forceShow, user, entries, entriesLoading]);

  // Prefill name from Firebase user if available
  useEffect(() => {
    if (user?.displayName && !profile.displayName) {
      updateProfile({ displayName: user.displayName });
    }
  }, [user, profile.displayName, updateProfile]);

  const handleComplete = async () => {
    // Calculate badges that will be earned
    const badgesBeforeComplete = [...earnedBadges];
    completeOnboarding();

    // Award onboarding completion Karma (only once)
    if (!hasAwardedKarma && !forceShow) {
      earnKarma("ONBOARDING_COMPLETE");
      setHasAwardedKarma(true);
    }

    // Calculate newly earned badges
    const finalProfile = {
      ...profile,
      completedAt: new Date().toISOString(),
    };
    const allBadges = calculateEarnedBadges(finalProfile);
    const newBadges = allBadges.filter((b) => !badgesBeforeComplete.includes(b));

    // Sync profile to Airtable if user is logged in
    if (user) {
      try {
        await fetch("/api/user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firebaseUid: user.uid,
            email: user.email,
            displayName: profile.displayName || user.displayName,
            onboardingCompleted: true,
            badges: allBadges,
            dailyReminderEnabled: profile.dailyReminderEnabled,
            reminderTime: profile.reminderTime,
            personalization: {
              ageRange: profile.ageRange,
              sex: profile.sex,
              location: profile.location,
              profession: profile.profession,
              stressLevel: profile.stressLevel,
              emotionalOpenness: profile.emotionalOpenness,
              reflectionFrequency: profile.reflectionFrequency,
              lifeSatisfaction: profile.lifeSatisfaction,
              personalGoal: profile.personalGoal,
              selectedMemoryTopics: profile.selectedMemoryTopics,
              seedMemory: profile.seedMemory,
              defaultEntryMode: profile.defaultEntryMode,
              showFeatureTour: profile.showFeatureTour,
            },
          }),
        });
        console.log("[Onboarding] Profile synced to Airtable");
      } catch (error) {
        console.error("[Onboarding] Failed to sync profile:", error);
      }
    }

    if (newBadges.length > 0) {
      setEarnedBadgesOnComplete(newBadges);
      setShowBadges(true);
    } else {
      handleFinalComplete();
    }
  };

  const handleFinalComplete = () => {
    setShowBadges(false);
    setIsOpen(false);
    onComplete?.();

    // Navigate to logs if feature tour is enabled
    if (profile.showFeatureTour) {
      navigate("/logs");
    }
  };

  const handleSkipAll = () => {
    // Mark as completed without filling in data
    completeOnboarding();
    setIsOpen(false);
    onComplete?.();
  };

  const handleClose = () => {
    // Allow closing, but save progress
    setIsOpen(false);
  };

  // Render current slide
  const renderSlide = () => {
    switch (currentSlide) {
      case 1:
        return (
          <SlideWelcome
            onNext={nextSlide}
            onSkip={handleSkipAll}
          />
        );
      case 2:
        return (
          <SlideDemographics
            profile={profile}
            onUpdate={updateProfile}
            onNext={nextSlide}
            onBack={prevSlide}
            canProceed={canProceed(2)}
          />
        );
      case 3:
        return (
          <SlidePatterns
            onNext={nextSlide}
            onBack={prevSlide}
          />
        );
      case 4:
        return (
          <SlideSeedEntry
            profile={profile}
            onUpdate={updateProfile}
            onNext={nextSlide}
            onBack={prevSlide}
            canProceed={canProceed(4)}
          />
        );
      case 5:
        return (
          <SlidePrivacy
            onNext={nextSlide}
            onBack={prevSlide}
          />
        );
      case 6:
        return (
          <SlideMemories
            profile={profile}
            onUpdate={updateProfile}
            onNext={nextSlide}
            onBack={prevSlide}
          />
        );
      case 7:
        return (
          <SlideAIPipeline
            onNext={nextSlide}
            onBack={prevSlide}
          />
        );
      case 8:
        return (
          <SlidePsychContext
            profile={profile}
            onUpdate={updateProfile}
            onNext={nextSlide}
            onBack={prevSlide}
          />
        );
      case 9:
        return (
          <SlideFeaturePreview
            onNext={nextSlide}
            onBack={prevSlide}
          />
        );
      case 10:
        return (
          <SlideCommitment
            profile={profile}
            displayName={profile.displayName}
            earnedBadges={earnedBadges}
            onUpdate={updateProfile}
            onComplete={handleComplete}
            onBack={prevSlide}
          />
        );
      default:
        return null;
    }
  };

  // Show badge reveal overlay
  if (showBadges && earnedBadgesOnComplete.length > 0) {
    return (
      <BadgeRevealQueue
        badges={earnedBadgesOnComplete as any}
        onComplete={handleFinalComplete}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto",
          "bg-gradient-to-b from-background to-background/95",
          "border-border/50"
        )}
        aria-describedby="onboarding-description"
      >
        <DialogTitle className="sr-only">
          Welcome to Becoming - Step {currentSlide} of {totalSlides}
        </DialogTitle>
        <div id="onboarding-description" className="sr-only">
          Complete the onboarding to personalize your experience
        </div>

        {/* Progress indicator */}
        <OnboardingProgress
          currentSlide={currentSlide}
          totalSlides={totalSlides}
          lastCompletedSlide={profile.lastSlideCompleted}
          onSlideClick={goToSlide}
        />

        {/* Current slide content */}
        <div className="min-h-[400px] flex flex-col">
          {renderSlide()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

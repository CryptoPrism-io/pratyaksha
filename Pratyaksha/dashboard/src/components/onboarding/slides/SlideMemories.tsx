import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import {
  Baby,
  Heart,
  Briefcase,
  Shield,
  Sparkles,
  Cloud,
  GitBranch,
  Gift,
  Star,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MEMORY_TOPICS, type UserOnboardingProfile } from "@/lib/onboardingStorage";
import { BackgroundNumber, BrushUnderline } from "@/components/typography";

interface SlideMemoriesProps {
  profile: UserOnboardingProfile;
  onUpdate: (updates: Partial<UserOnboardingProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby,
  Heart,
  Briefcase,
  Shield,
  Sparkles,
  Cloud,
  GitBranch,
  Gift,
  Star,
  Lightbulb,
};

export function SlideMemories({
  profile,
  onUpdate,
  onNext,
  onBack,
}: SlideMemoriesProps) {
  const selectedCount = profile.selectedMemoryTopics.length;
  const maxSelections = 3;

  const toggleTopic = (topicId: string) => {
    const current = profile.selectedMemoryTopics;
    if (current.includes(topicId)) {
      // Remove
      onUpdate({
        selectedMemoryTopics: current.filter((id) => id !== topicId),
      });
    } else if (current.length < maxSelections) {
      // Add
      onUpdate({
        selectedMemoryTopics: [...current, topicId],
      });
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="06" position="top-right" variant="amber" size="sm" />

      {/* Header */}
      <div className="text-center mb-6 z-10">
        <img
          src="/images/onboarding/memories.png"
          alt="Firefly fragments forming constellations"
          className="w-20 h-20 object-cover rounded-2xl shadow-lg mx-auto mb-3"
        />
        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          Moments That <BrushUnderline variant="rose">Shaped</BrushUnderline> You
        </h2>
        <p className="text-muted-foreground text-sm">
          Select 2-3 life experiences you'd like to explore
        </p>
      </div>

      {/* Selection count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 z-10">
        <span
          className={cn(
            "font-medium transition-colors",
            selectedCount >= 2 ? "text-green-500" : "text-foreground"
          )}
        >
          {selectedCount}
        </span>
        <span>/ {maxSelections} selected</span>
        {selectedCount >= 3 && (
          <span className="text-xs text-amber-500 ml-2">
            Deep Diver badge!
          </span>
        )}
      </div>

      {/* Topic cards grid */}
      <div className="w-full max-w-md mb-6 z-10">
        <div className="grid grid-cols-2 gap-2">
          {MEMORY_TOPICS.map((topic) => {
            const Icon = iconMap[topic.icon];
            const isSelected = profile.selectedMemoryTopics.includes(topic.id);
            const isDisabled = !isSelected && selectedCount >= maxSelections;

            return (
              <button
                key={topic.id}
                onClick={() => !isDisabled && toggleTopic(topic.id)}
                disabled={isDisabled}
                className={cn(
                  "relative p-3 rounded-xl border text-left transition-all duration-300",
                  isSelected
                    ? "bg-primary/10 border-primary shadow-md scale-[1.02]"
                    : isDisabled
                      ? "bg-muted/20 border-border/50 opacity-50 cursor-not-allowed"
                      : "bg-muted/30 border-border hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                {/* Selected check */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                    isSelected ? "bg-primary/20" : "bg-muted/50"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    "text-xs font-medium leading-tight",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {topic.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground text-center max-w-xs mb-6 z-10">
        These topics help personalize your journaling prompts. You can always add more later.
      </p>

      {/* Navigation */}
      <div className="flex gap-3 w-full max-w-xs z-10">
        <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="flex-1 group"
        >
          {selectedCount === 0 ? "Skip" : "Continue"}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

import { ArrowRight, ArrowLeft, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type UserOnboardingProfile } from "@/lib/onboardingStorage";
import { useState } from "react";
import { BackgroundNumber, BrushUnderline } from "@/components/typography";

interface SlideSeedEntryProps {
  profile: UserOnboardingProfile;
  onUpdate: (updates: Partial<UserOnboardingProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

const STARTERS = [
  "I felt happy when...",
  "A small win today was...",
  "Something that made me smile...",
  "I'm grateful for...",
];

export function SlideSeedEntry({
  profile,
  onUpdate,
  onNext,
  onBack,
  canProceed,
}: SlideSeedEntryProps) {
  const [isRecording, setIsRecording] = useState(false);
  const charCount = profile.seedMemory?.length || 0;
  const minChars = 20;

  const handleStarterClick = (starter: string) => {
    const current = profile.seedMemory || "";
    if (!current.includes(starter)) {
      onUpdate({ seedMemory: starter + " " });
    }
  };

  const toggleRecording = () => {
    // Voice recording placeholder - would integrate with useSpeechToText hook
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col items-center px-4 py-6 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="04" position="top-right" variant="teal" size="sm" />

      {/* Header */}
      <div className="text-center mb-4 z-10">
        <img
          src="/images/onboarding/seed-entry.png"
          alt="Seed sprouting with new growth"
          className="w-24 h-24 object-cover rounded-2xl shadow-lg mx-auto mb-3"
        />
        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          Share a Moment of <BrushUnderline variant="amber">Joy</BrushUnderline>
        </h2>
        <p className="text-muted-foreground text-sm">
          Your first seed memory for AI to learn from
        </p>
      </div>

      {/* Starters */}
      <div className="w-full max-w-sm mb-4 z-10">
        <Label className="text-xs text-muted-foreground mb-2 block">
          Quick starters (tap to use):
        </Label>
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((starter) => (
            <button
              key={starter}
              onClick={() => handleStarterClick(starter)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs border transition-all",
                "bg-muted/30 border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {starter}
            </button>
          ))}
        </div>
      </div>

      {/* Text area */}
      <div className="w-full max-w-sm space-y-2 z-10">
        <div className="relative">
          <textarea
            placeholder="Describe a recent moment that made you smile..."
            value={profile.seedMemory || ""}
            onChange={(e) => onUpdate({ seedMemory: e.target.value })}
            className={cn(
              "w-full min-h-[140px] p-4 rounded-xl border bg-background/50 resize-none",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              charCount >= minChars
                ? "border-green-500/50"
                : "border-input"
            )}
          />
          {/* Voice button */}
          <button
            onClick={toggleRecording}
            className={cn(
              "absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Character count */}
        <div className="flex justify-between items-center text-xs">
          <span className={cn(
            "transition-colors",
            charCount >= minChars ? "text-green-500" : "text-muted-foreground"
          )}>
            {charCount >= minChars ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Looking good!
              </span>
            ) : (
              `${charCount}/${minChars} characters minimum`
            )}
          </span>
          <span className="text-muted-foreground">
            {charCount >= 100 && "Seeker badge unlocked!"}
          </span>
        </div>
      </div>

      {/* Encouragement */}
      {charCount > 0 && charCount < minChars && (
        <p className="text-xs text-muted-foreground mt-3 text-center max-w-xs z-10">
          Keep going! A few more words help the AI understand your style.
        </p>
      )}

      {/* Navigation */}
      <div className="flex gap-3 w-full max-w-xs mt-8 z-10">
        <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="flex-1 group"
          disabled={!canProceed}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

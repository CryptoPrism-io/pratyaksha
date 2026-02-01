import { ArrowRight, ArrowLeft, Frown, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type UserOnboardingProfile } from "@/lib/onboardingStorage";
import { BackgroundNumber, BrushUnderline } from "@/components/typography";

interface SlidePsychContextProps {
  profile: UserOnboardingProfile;
  onUpdate: (updates: Partial<UserOnboardingProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface SliderConfig {
  key: keyof Pick<
    UserOnboardingProfile,
    "stressLevel" | "emotionalOpenness" | "reflectionFrequency" | "lifeSatisfaction"
  >;
  label: string;
  lowLabel: string;
  highLabel: string;
  lowIcon?: React.ReactNode;
  highIcon?: React.ReactNode;
}

const sliders: SliderConfig[] = [
  {
    key: "stressLevel",
    label: "Current stress level",
    lowLabel: "Very calm",
    highLabel: "Very stressed",
    lowIcon: <Smile className="w-4 h-4 text-green-500" />,
    highIcon: <Frown className="w-4 h-4 text-red-500" />,
  },
  {
    key: "emotionalOpenness",
    label: "Emotional expression comfort",
    lowLabel: "Very private",
    highLabel: "Very open",
  },
  {
    key: "reflectionFrequency",
    label: "Self-reflection frequency",
    lowLabel: "Rarely",
    highLabel: "Constantly",
  },
  {
    key: "lifeSatisfaction",
    label: "Life satisfaction",
    lowLabel: "Struggling",
    highLabel: "Thriving",
    lowIcon: <Frown className="w-4 h-4 text-amber-500" />,
    highIcon: <Smile className="w-4 h-4 text-green-500" />,
  },
];

function SliderInput({
  value,
  onChange,
  config,
}: {
  value: number | null;
  onChange: (value: number) => void;
  config: SliderConfig;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{config.label}</Label>
      <div className="flex items-center gap-3">
        {/* Low label with optional icon */}
        <div className="flex items-center gap-1 min-w-[80px] justify-end">
          {config.lowIcon}
          <span className="text-xs text-muted-foreground">{config.lowLabel}</span>
        </div>

        {/* Slider buttons */}
        <div className="flex-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((level) => {
            const isSelected = value === level;
            const isLower = value !== null && level < value;
            const isHigher = value !== null && level > value;

            // Color gradient based on position
            const getColor = () => {
              if (!isSelected) return "bg-muted";
              const colors = [
                "bg-green-500",
                "bg-lime-500",
                "bg-yellow-500",
                "bg-orange-500",
                "bg-red-500",
              ];
              return colors[level - 1];
            };

            return (
              <button
                key={level}
                onClick={() => onChange(level)}
                className={cn(
                  "flex-1 h-10 rounded-lg transition-all duration-200 font-medium text-sm",
                  isSelected
                    ? `${getColor()} text-white shadow-md scale-105`
                    : isLower || isHigher
                      ? "bg-muted/50 text-muted-foreground hover:bg-muted"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {level}
              </button>
            );
          })}
        </div>

        {/* High label with optional icon */}
        <div className="flex items-center gap-1 min-w-[80px]">
          <span className="text-xs text-muted-foreground">{config.highLabel}</span>
          {config.highIcon}
        </div>
      </div>
    </div>
  );
}

export function SlidePsychContext({
  profile,
  onUpdate,
  onNext,
  onBack,
}: SlidePsychContextProps) {
  const filledCount = sliders.filter((s) => profile[s.key] !== null).length;

  return (
    <div className="flex flex-col items-center px-4 py-6 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="08" position="top-right" variant="teal" size="sm" />

      {/* Header */}
      <div className="text-center mb-6 z-10">
        <img
          src="/images/onboarding/psych-context.png"
          alt="Ripples in still water with lotus bud"
          className="w-20 h-20 object-cover rounded-2xl shadow-lg mx-auto mb-3"
        />
        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          Your Emotional <BrushUnderline variant="teal">Landscape</BrushUnderline>
        </h2>
        <p className="text-muted-foreground text-sm">
          Help calibrate your insights (all optional)
        </p>
      </div>

      {/* Sliders */}
      <div className="w-full max-w-md space-y-5 mb-6 z-10">
        {sliders.map((config) => (
          <SliderInput
            key={config.key}
            value={profile[config.key]}
            onChange={(value) => onUpdate({ [config.key]: value })}
            config={config}
          />
        ))}
      </div>

      {/* Optional text input */}
      <div className="w-full max-w-md mb-6 z-10">
        <Label className="text-sm font-medium mb-2 block">
          Anything specific you're hoping to work through?{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <textarea
          placeholder="e.g., Managing anxiety at work, processing a recent change..."
          value={profile.personalGoal || ""}
          onChange={(e) => onUpdate({ personalGoal: e.target.value })}
          className={cn(
            "w-full min-h-[80px] p-3 rounded-xl border border-input bg-background/50 resize-none",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          )}
        />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 z-10">
        <span
          className={cn(
            "font-medium transition-colors",
            filledCount === sliders.length ? "text-green-500" : "text-foreground"
          )}
        >
          {filledCount}
        </span>
        <span>/ {sliders.length} answered</span>
        {filledCount === sliders.length && profile.personalGoal && (
          <span className="text-xs text-amber-500 ml-2">
            Open Book badge progress!
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 w-full max-w-xs z-10">
        <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="flex-1 group">
          {filledCount === 0 ? "Skip" : "Continue"}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

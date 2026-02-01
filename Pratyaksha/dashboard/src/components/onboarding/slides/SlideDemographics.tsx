import { ArrowRight, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PROFESSION_OPTIONS, type UserOnboardingProfile } from "@/lib/onboardingStorage";
import { BackgroundNumber, BrushUnderline } from "@/components/typography";

interface SlideDemographicsProps {
  profile: UserOnboardingProfile;
  onUpdate: (updates: Partial<UserOnboardingProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"] as const;
const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
] as const;

export function SlideDemographics({
  profile,
  onUpdate,
  onNext,
  onBack,
  canProceed,
}: SlideDemographicsProps) {
  return (
    <div className="flex flex-col items-center px-4 py-6 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="02" position="top-right" variant="amber" size="sm" />

      {/* Header */}
      <div className="text-center mb-6 z-10">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          Let's Get to <BrushUnderline variant="teal">Know</BrushUnderline> You
        </h2>
        <p className="text-muted-foreground text-sm">
          This helps personalize your experience
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm space-y-5 z-10">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-sm font-medium">
            What should we call you? <span className="text-destructive">*</span>
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Your name"
            value={profile.displayName}
            onChange={(e) => onUpdate({ displayName: e.target.value })}
            className="bg-background/50"
          />
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Age Range</Label>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => onUpdate({ ageRange: range })}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-all",
                  profile.ageRange === range
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 border-border hover:border-primary/50"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Sex */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sex</Label>
          <div className="flex flex-wrap gap-2">
            {SEX_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onUpdate({ sex: option.value as UserOnboardingProfile["sex"] })}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-all",
                  profile.sex === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 border-border hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profession */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">What do you do?</Label>
          <select
            value={profile.profession || ""}
            onChange={(e) => onUpdate({ profession: e.target.value || null })}
            className={cn(
              "w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm",
              "focus:outline-none focus:ring-1 focus:ring-ring"
            )}
          >
            <option value="">Select profession...</option>
            {PROFESSION_OPTIONS.map((prof) => (
              <option key={prof} value={prof}>
                {prof}
              </option>
            ))}
          </select>
        </div>
      </div>

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

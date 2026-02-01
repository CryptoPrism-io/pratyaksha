import { ArrowLeft, Check, Compass, Clock, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ENTRY_MODE_OPTIONS, BADGES, type UserOnboardingProfile, type BadgeId } from "@/lib/onboardingStorage";
import { BackgroundNumber, StaggerText, UnderlineAccent } from "@/components/typography";

interface SlideCommitmentProps {
  profile: UserOnboardingProfile;
  displayName: string;
  earnedBadges: BadgeId[];
  onUpdate: (updates: Partial<UserOnboardingProfile>) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function SlideCommitment({
  profile,
  displayName,
  earnedBadges,
  onUpdate,
  onComplete,
  onBack,
}: SlideCommitmentProps) {
  // Will earn early_explorer on completion
  const willEarnExplorer = !earnedBadges.includes("early_explorer");

  return (
    <div className="flex flex-col items-center px-4 py-6 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* Giant background number */}
      <BackgroundNumber number="10" position="top-right" variant="teal" size="sm" />

      {/* Header */}
      <div className="text-center mb-4 z-10">
        <img
          src="/images/onboarding/complete.png"
          alt="Moth in flight, transformation complete"
          className="w-24 h-24 object-cover rounded-2xl shadow-lg mx-auto mb-2"
        />
        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          <UnderlineAccent>Ready to Begin</UnderlineAccent>
        </h2>
        <p className="text-muted-foreground text-sm">
          Set your preferences and start your journey
        </p>
      </div>

      {/* Settings */}
      <div className="w-full max-w-sm space-y-5 mb-6 z-10">
        {/* Daily Reminder */}
        <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-medium">Daily reminder</Label>
                <p className="text-xs text-muted-foreground">Get a nudge to reflect</p>
              </div>
            </div>
            <Switch
              checked={profile.dailyReminderEnabled}
              onCheckedChange={(checked) =>
                onUpdate({ dailyReminderEnabled: checked })
              }
            />
          </div>

          {/* Time picker (shown when enabled) */}
          {profile.dailyReminderEnabled && (
            <div className="flex items-center gap-2 pl-11 animate-in fade-in slide-in-from-top-2">
              <input
                type="time"
                value={profile.reminderTime || "20:00"}
                onChange={(e) => onUpdate({ reminderTime: e.target.value })}
                className={cn(
                  "px-3 py-1.5 rounded-lg border border-input bg-background/50 text-sm",
                  "focus:outline-none focus:ring-1 focus:ring-primary"
                )}
              />
              <span className="text-xs text-muted-foreground">daily</span>
            </div>
          )}
        </div>

        {/* Default Entry Mode */}
        <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary" />
            </div>
            <div>
              <Label className="text-sm font-medium">Default entry mode</Label>
              <p className="text-xs text-muted-foreground">Start each session with</p>
            </div>
          </div>
          <select
            value={profile.defaultEntryMode || ""}
            onChange={(e) => onUpdate({ defaultEntryMode: e.target.value || null })}
            className={cn(
              "w-full h-10 px-3 rounded-lg border border-input bg-background/50 text-sm",
              "focus:outline-none focus:ring-1 focus:ring-primary"
            )}
          >
            <option value="">No preference</option>
            {ENTRY_MODE_OPTIONS.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        {/* Feature Tour */}
        <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-medium">Show me around</Label>
                <p className="text-xs text-muted-foreground">Interactive app tour</p>
              </div>
            </div>
            <Switch
              checked={profile.showFeatureTour}
              onCheckedChange={(checked) => onUpdate({ showFeatureTour: checked })}
            />
          </div>
        </div>
      </div>

      {/* Badge preview */}
      {willEarnExplorer && (
        <div className="w-full max-w-sm mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-sm text-amber-600 dark:text-amber-400">
                {BADGES.early_explorer.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Complete to unlock this badge!
              </p>
            </div>
            <div className="ml-auto">
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-500/50 flex items-center justify-center">
                <Check className="w-4 h-4 text-amber-500/50" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalized welcome */}
      <div className="text-center mb-6 z-10">
        <p className="text-lg font-medium">
          Welcome, <span className="text-primary">{displayName || "Explorer"}</span>!
        </p>
        <p className="text-sm text-muted-foreground">
          Your cognitive journey begins now
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 w-full max-w-xs z-10">
        <Button onClick={onBack} variant="outline" size="lg" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onComplete}
          size="lg"
          className="flex-1 group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          Start Journaling
          <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

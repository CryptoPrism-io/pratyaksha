// Level Progress Card - Visual progress bar showing entries until next level
import { Lock, Unlock, TrendingUp, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKarma } from "../../contexts/KarmaContext";
import { useEntries } from "../../hooks/useEntries";
import type { UnlockTier } from "../../lib/gamificationStorage";
import { UNLOCK_THRESHOLDS } from "../../lib/gamificationStorage";
import { cn } from "../../lib/utils";

const TIER_INFO: Record<UnlockTier, { label: string; color: string; bgColor: string; borderColor: string; features: string[] }> = {
  surface: {
    label: "Surface",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    features: ["4 Soul Mapping topics", "Basic journaling", "Dashboard access"],
  },
  deep: {
    label: "Deep",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    features: ["+6 Soul Mapping topics", "Relationship insights", "Career reflection"],
  },
  core: {
    label: "Core",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    features: ["+7 Soul Mapping topics", "Deep vulnerability", "Full self-discovery"],
  },
};

interface LevelProgressCardProps {
  className?: string;
}

export function LevelProgressCard({ className }: LevelProgressCardProps) {
  const navigate = useNavigate();
  const { data: entries = [] } = useEntries();
  const { unlockLevel, entriesUntilNextLevel, nextUnlockLevel, isTierUnlocked } = useKarma();

  const entryCount = entries.length;

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    if (entryCount >= UNLOCK_THRESHOLDS.CORE) {
      return 100; // Max level reached
    }
    if (entryCount >= UNLOCK_THRESHOLDS.DEEP) {
      // Progress from Deep to Core
      const range = UNLOCK_THRESHOLDS.CORE - UNLOCK_THRESHOLDS.DEEP;
      const progress = entryCount - UNLOCK_THRESHOLDS.DEEP;
      return Math.round((progress / range) * 100);
    }
    // Progress from Surface to Deep
    const range = UNLOCK_THRESHOLDS.DEEP - UNLOCK_THRESHOLDS.SURFACE;
    const progress = entryCount - UNLOCK_THRESHOLDS.SURFACE;
    return Math.round((progress / range) * 100);
  };

  const progress = getProgressToNextLevel();
  const currentInfo = TIER_INFO[unlockLevel];
  const nextInfo = nextUnlockLevel ? TIER_INFO[nextUnlockLevel] : null;

  return (
    <div className={cn("rounded-md signal-card p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", currentInfo.bgColor)}>
            <TrendingUp className={cn("h-5 w-5", currentInfo.color)} />
          </div>
          <div>
            <h2 className="font-semibold">Level Progress</h2>
            <p className="text-sm text-muted-foreground">{entryCount} entries logged</p>
          </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          currentInfo.bgColor,
          currentInfo.color
        )}>
          {currentInfo.label} Level
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className={cn("font-medium", currentInfo.color)}>
            {currentInfo.label}
          </span>
          {nextInfo && (
            <span className="text-muted-foreground">
              {entriesUntilNextLevel} to {nextInfo.label}
            </span>
          )}
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              unlockLevel === "core"
                ? "bg-gradient-to-r from-violet-500 to-purple-500"
                : unlockLevel === "deep"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                : "bg-gradient-to-r from-sky-500 to-cyan-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Level Indicators */}
      <div className="flex items-center justify-between mb-6">
        {(["surface", "deep", "core"] as UnlockTier[]).map((tier, index) => {
          const isUnlocked = isTierUnlocked(tier);
          const isCurrent = tier === unlockLevel;
          const info = TIER_INFO[tier];

          return (
            <div key={tier} className="flex items-center">
              <div className={cn(
                "flex flex-col items-center",
                index > 0 && "ml-4"
              )}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                  isUnlocked ? info.borderColor : "border-muted",
                  isUnlocked ? info.bgColor : "bg-muted/30",
                  isCurrent && "ring-2 ring-offset-2 ring-offset-background",
                  isCurrent && (tier === "core" ? "ring-violet-500" : tier === "deep" ? "ring-amber-500" : "ring-sky-500")
                )}>
                  {isUnlocked ? (
                    <Unlock className={cn("h-4 w-4", info.color)} />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-1 font-medium",
                  isUnlocked ? info.color : "text-muted-foreground"
                )}>
                  {UNLOCK_THRESHOLDS[tier.toUpperCase() as keyof typeof UNLOCK_THRESHOLDS]}
                </span>
              </div>
              {index < 2 && (
                <div className={cn(
                  "h-0.5 w-8 mx-2",
                  isTierUnlocked((["surface", "deep", "core"] as UnlockTier[])[index + 1])
                    ? "bg-gradient-to-r from-current to-current"
                    : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Next Level Preview */}
      {nextInfo && (
        <div className={cn(
          "p-4 rounded-lg border",
          nextInfo.bgColor,
          nextInfo.borderColor
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock className={cn("h-4 w-4", nextInfo.color)} />
              <span className={cn("text-sm font-medium", nextInfo.color)}>
                Unlock {nextInfo.label} Level
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              +{entriesUntilNextLevel} entries
            </span>
          </div>
          <ul className="space-y-1">
            {nextInfo.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <ChevronRight className="h-3 w-3" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All unlocked message */}
      {!nextInfo && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 text-center">
          <p className={cn("text-sm font-medium", TIER_INFO.core.color)}>
            All levels unlocked!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You have full access to all Soul Mapping topics
          </p>
        </div>
      )}

      {/* CTA */}
      {nextInfo && (
        <button
          onClick={() => navigate("/logs")}
          className={cn(
            "w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors"
          )}
        >
          Write an Entry
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

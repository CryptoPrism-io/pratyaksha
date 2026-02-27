// Karma Display - Shows current Karma balance in header or expanded view
import { Sparkles, TrendingUp } from "lucide-react";
import { useKarma } from "../../contexts/KarmaContext";
import { KARMA_REWARDS, KARMA_COSTS } from "../../lib/gamificationStorage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "../../lib/utils";

interface KarmaDisplayProps {
  compact?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function KarmaDisplay({ compact = false, showTooltip = true, className }: KarmaDisplayProps) {
  const { karma, unlockLevel, soulMappingProgress, streakDays } = useKarma();

  const levelColors = {
    surface: "text-sky-500",
    deep: "text-amber-500",
    core: "text-violet-500",
  };

  const levelLabels = {
    surface: "Surface",
    deep: "Deep",
    core: "Core",
  };

  const content = (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all",
        "bg-gradient-to-r from-amber-500/10 to-yellow-500/10",
        "border border-amber-500/20",
        "hover:border-amber-500/40 hover:from-amber-500/15 hover:to-yellow-500/15",
        className
      )}
    >
      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
        {karma.toLocaleString()}
      </span>
      {!compact && (
        <span className="text-xs text-muted-foreground">Karma</span>
      )}
    </div>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-64 p-0">
          <div className="p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="font-semibold">{karma} Karma</span>
              </div>
              <span className={cn("text-xs font-medium", levelColors[unlockLevel])}>
                {levelLabels[unlockLevel]} Level
              </span>
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Soul Mapping</span>
                <span>{soulMappingProgress.completed}/{soulMappingProgress.total}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                  style={{ width: `${soulMappingProgress.percentage}%` }}
                />
              </div>
            </div>

            {/* Streak */}
            {streakDays > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>{streakDays} day streak</span>
              </div>
            )}

            {/* Separator */}
            <div className="border-t" />

            {/* Earn/Spend guide */}
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Earn Karma:</p>
                <ul className="space-y-0.5">
                  <li className="flex justify-between">
                    <span>Journal entry</span>
                    <span className="text-emerald-500">+{KARMA_REWARDS.JOURNAL_ENTRY}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Soul Mapping topic</span>
                    <span className="text-emerald-500">+{KARMA_REWARDS.SOUL_MAPPING_COMPLETE}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Daily dashboard</span>
                    <span className="text-emerald-500">+{KARMA_REWARDS.DAILY_DASHBOARD_VIEW}</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Spend Karma:</p>
                <ul className="space-y-0.5">
                  <li className="flex justify-between">
                    <span>AI Chat message</span>
                    <span className="text-rose-500">-{KARMA_COSTS.AI_CHAT_MESSAGE}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Chart explainer</span>
                    <span className="text-rose-500">-{KARMA_COSTS.AI_CHART_EXPLAINER}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Expanded version for Profile page
export function KarmaDisplayExpanded({ className }: { className?: string }) {
  const { karma, unlockLevel, soulMappingProgress, streakDays, entriesUntilNextLevel, nextUnlockLevel } = useKarma();

  const levelColors = {
    surface: { text: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/30" },
    deep: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    core: { text: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  };

  const levelLabels = {
    surface: "Surface",
    deep: "Deep",
    core: "Core",
  };

  return (
    <div className={cn("rounded-md signal-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="font-semibold">Karma Points</h2>
            <p className="text-sm text-muted-foreground">Your journaling currency</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {karma.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">available</p>
        </div>
      </div>

      {/* Level Badge */}
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg mb-4",
        levelColors[unlockLevel].bg,
        "border",
        levelColors[unlockLevel].border
      )}>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", levelColors[unlockLevel].text)}>
            {levelLabels[unlockLevel]} Level
          </span>
        </div>
        {nextUnlockLevel && (
          <span className="text-xs text-muted-foreground">
            {entriesUntilNextLevel} entries to {levelLabels[nextUnlockLevel]}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-lg font-semibold">{soulMappingProgress.completed}</p>
          <p className="text-xs text-muted-foreground">Topics Done</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-lg font-semibold">{streakDays}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-lg font-semibold">{soulMappingProgress.percentage}%</p>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
      </div>
    </div>
  );
}

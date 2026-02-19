// Soul Mapping Progress - Shows all 17 topics with completion status and tier locks
import { Check, Lock, ChevronDown, Sparkles, Baby, Heart, Smile, Users, Target, Flame, User, CloudRain, Moon, PenLine } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKarma } from "../../contexts/KarmaContext";
import type { UnlockTier } from "../../lib/gamificationStorage";
import {
  SOUL_MAPPING_TOPICS,
  UNLOCK_THRESHOLDS,
} from "../../lib/gamificationStorage";
import { cn } from "../../lib/utils";

// Topic metadata - matching PROFILE_CATEGORIES from GuidedEntryForm
const TOPIC_META: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  // Surface
  childhood: { name: "Childhood Memories", icon: <Baby className="h-4 w-4" />, color: "text-sky-400" },
  joys: { name: "Peak Joys", icon: <Sparkles className="h-4 w-4" />, color: "text-yellow-400" },
  friendships: { name: "Friendships", icon: <Smile className="h-4 w-4" />, color: "text-pink-400" },
  interests: { name: "Passions & Hobbies", icon: <Heart className="h-4 w-4" />, color: "text-rose-400" },
  // Deep
  parents: { name: "Parental Bond", icon: <Users className="h-4 w-4" />, color: "text-orange-400" },
  siblings: { name: "Siblings & Family", icon: <Users className="h-4 w-4" />, color: "text-teal-400" },
  love: { name: "Love & Romance", icon: <Heart className="h-4 w-4" />, color: "text-red-400" },
  career: { name: "Work & Purpose", icon: <Target className="h-4 w-4" />, color: "text-emerald-400" },
  "turning-points": { name: "Turning Points", icon: <Flame className="h-4 w-4" />, color: "text-amber-400" },
  body: { name: "Body & Health", icon: <User className="h-4 w-4" />, color: "text-lime-400" },
  // Core
  wounds: { name: "Emotional Wounds", icon: <Flame className="h-4 w-4" />, color: "text-red-500" },
  fears: { name: "Deepest Fears", icon: <CloudRain className="h-4 w-4" />, color: "text-slate-400" },
  regrets: { name: "Regrets & What-Ifs", icon: <Moon className="h-4 w-4" />, color: "text-indigo-400" },
  shadow: { name: "Shadow Self", icon: <Moon className="h-4 w-4" />, color: "text-zinc-400" },
  identity: { name: "Core Identity", icon: <User className="h-4 w-4" />, color: "text-violet-400" },
  beliefs: { name: "Beliefs & Spirituality", icon: <Sparkles className="h-4 w-4" />, color: "text-purple-400" },
  mortality: { name: "Death & Legacy", icon: <Moon className="h-4 w-4" />, color: "text-gray-400" },
};

const TIER_INFO: Record<UnlockTier, { label: string; color: string; bgColor: string; description: string; threshold: number }> = {
  surface: {
    label: "Surface",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    description: "Easy starting points",
    threshold: UNLOCK_THRESHOLDS.SURFACE,
  },
  deep: {
    label: "Deep",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    description: "Requires reflection",
    threshold: UNLOCK_THRESHOLDS.DEEP,
  },
  core: {
    label: "Core",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    description: "Deepest vulnerability",
    threshold: UNLOCK_THRESHOLDS.CORE,
  },
};

interface SoulMappingProgressProps {
  className?: string;
  compact?: boolean;
}

export function SoulMappingProgress({ className, compact = false }: SoulMappingProgressProps) {
  const { soulMappingProgress, isTierUnlocked, isTopicCompleted, entriesUntilNextLevel, nextUnlockLevel } = useKarma();
  const [expandedTiers, setExpandedTiers] = useState<Set<UnlockTier>>(new Set(["surface"]));
  const navigate = useNavigate();

  const toggleTier = (tier: UnlockTier) => {
    setExpandedTiers(prev => {
      const next = new Set(prev);
      if (next.has(tier)) {
        next.delete(tier);
      } else {
        next.add(tier);
      }
      return next;
    });
  };

  const renderTier = (tier: UnlockTier, topics: readonly string[]) => {
    const info = TIER_INFO[tier];
    const isUnlocked = isTierUnlocked(tier);
    const isExpanded = expandedTiers.has(tier);
    const tierProgress = soulMappingProgress.byTier[tier];

    return (
      <div key={tier} className="space-y-2">
        {/* Tier Header */}
        <button
          onClick={() => toggleTier(tier)}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-lg transition-all",
            info.bgColor,
            "hover:opacity-90",
            !isUnlocked && "opacity-60"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center h-6 w-6 rounded-full",
              isUnlocked ? "bg-background" : "bg-muted"
            )}>
              {isUnlocked ? (
                <span className={cn("text-xs font-bold", info.color)}>
                  {tierProgress.completed}
                </span>
              ) : (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", info.color)}>{info.label}</span>
                {!isUnlocked && (
                  <span className="text-xs text-muted-foreground">
                    ({info.threshold} entries)
                  </span>
                )}
              </div>
              {!compact && (
                <p className="text-xs text-muted-foreground">{info.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {tierProgress.completed}/{tierProgress.total}
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )} />
          </div>
        </button>

        {/* Topics List */}
        {isExpanded && (
          <div className={cn(
            "grid gap-2 pl-4",
            compact ? "grid-cols-1" : "grid-cols-2"
          )}>
            {topics.map(topicId => {
              const meta = TOPIC_META[topicId];
              const isCompleted = isTopicCompleted(topicId);

              const cardContent = (
                <>
                  {/* Status Icon */}
                  <div className={cn(
                    "flex items-center justify-center h-5 w-5 rounded-full flex-shrink-0",
                    isCompleted ? "bg-emerald-500" : isUnlocked ? "bg-muted" : "bg-muted/50"
                  )}>
                    {isCompleted ? (
                      <Check className="h-3 w-3 text-white" />
                    ) : isUnlocked ? (
                      <span className={meta.color}>{meta.icon}</span>
                    ) : (
                      <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Topic Name */}
                  <span className={cn(
                    "text-xs font-medium truncate flex-1 text-left",
                    isCompleted ? "text-emerald-600 dark:text-emerald-400" : ""
                  )}>
                    {meta?.name || topicId}
                  </span>

                  {/* Write hint — only for unlocked uncompleted topics */}
                  {isUnlocked && !isCompleted && (
                    <PenLine className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  )}
                </>
              );

              if (isUnlocked) {
                return (
                  <button
                    key={topicId}
                    onClick={() => navigate(`/logs?topic=${topicId}`)}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg border transition-all text-left w-full",
                      isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15"
                        : "bg-muted/30 border-border/50 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                    )}
                  >
                    {cardContent}
                  </button>
                );
              }

              return (
                <div
                  key={topicId}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-muted/20 border-transparent opacity-50"
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Soul Mapping</h3>
          <p className="text-xs text-muted-foreground">
            {soulMappingProgress.completed} of {soulMappingProgress.total} topics completed
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{soulMappingProgress.percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-amber-500 to-violet-500 transition-all duration-500"
          style={{ width: `${soulMappingProgress.percentage}%` }}
        />
      </div>

      {/* Next unlock hint */}
      {nextUnlockLevel && entriesUntilNextLevel > 0 && (
        <div className={cn(
          "flex items-center gap-2 p-2 rounded-lg text-xs",
          TIER_INFO[nextUnlockLevel].bgColor
        )}>
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            <span className="font-medium">{entriesUntilNextLevel}</span> more{" "}
            {entriesUntilNextLevel === 1 ? "entry" : "entries"} to unlock{" "}
            <span className={cn("font-medium", TIER_INFO[nextUnlockLevel].color)}>
              {TIER_INFO[nextUnlockLevel].label}
            </span>{" "}
            level
          </span>
        </div>
      )}

      {/* Tiers */}
      <div className="space-y-3">
        {renderTier("surface", SOUL_MAPPING_TOPICS.surface)}
        {renderTier("deep", SOUL_MAPPING_TOPICS.deep)}
        {renderTier("core", SOUL_MAPPING_TOPICS.core)}
      </div>
    </div>
  );
}

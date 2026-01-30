// Insufficient Karma Dialog - Shows when user can't afford an AI action
import { Sparkles, PenLine, MapPin, LayoutDashboard, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKarma } from "../../contexts/KarmaContext";
import { KARMA_REWARDS, KARMA_COSTS } from "../../lib/gamificationStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface InsufficientKarmaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredCost: keyof typeof KARMA_COSTS | number;
  action?: string;
}

export function InsufficientKarmaDialog({
  open,
  onOpenChange,
  requiredCost,
  action = "this AI feature",
}: InsufficientKarmaDialogProps) {
  const navigate = useNavigate();
  const { karma, soulMappingProgress } = useKarma();

  const costAmount = typeof requiredCost === "number" ? requiredCost : KARMA_COSTS[requiredCost];
  const shortage = costAmount - karma;

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-amber-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-rose-500 flex items-center justify-center">
                <X className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center">Not Enough Karma</DialogTitle>
          <DialogDescription className="text-center">
            You need <span className="font-semibold text-foreground">{costAmount} Karma</span> to use {action}.
            You currently have <span className="font-semibold text-amber-600 dark:text-amber-400">{karma} Karma</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Shortage indicator */}
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{karma}</span>
            <span className="text-xs text-muted-foreground">have</span>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
            <span className="text-sm font-medium text-rose-600 dark:text-rose-400">{costAmount}</span>
            <span className="text-xs text-muted-foreground">need</span>
          </div>
        </div>

        {/* Ways to earn Karma */}
        <div className="space-y-3 pt-2">
          <p className="text-sm font-medium text-center">Earn Karma by:</p>

          <div className="space-y-2">
            {/* Write entry */}
            <button
              onClick={() => handleNavigate("/logs")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                "border border-emerald-500/30 bg-emerald-500/5",
                "hover:bg-emerald-500/10 hover:border-emerald-500/50"
              )}
            >
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <PenLine className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Write a journal entry</p>
                <p className="text-xs text-muted-foreground">Quick way to earn Karma</p>
              </div>
              <span className="text-sm font-semibold text-emerald-500">
                +{KARMA_REWARDS.JOURNAL_ENTRY}
              </span>
            </button>

            {/* Soul Mapping - only show if not all completed */}
            {soulMappingProgress.completed < soulMappingProgress.total && (
              <button
                onClick={() => handleNavigate("/logs")}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                  "border border-violet-500/30 bg-violet-500/5",
                  "hover:bg-violet-500/10 hover:border-violet-500/50"
                )}
              >
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <MapPin className="h-4 w-4 text-violet-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Complete a Soul Mapping topic</p>
                  <p className="text-xs text-muted-foreground">
                    {soulMappingProgress.total - soulMappingProgress.completed} topics remaining
                  </p>
                </div>
                <span className="text-sm font-semibold text-violet-500">
                  +{KARMA_REWARDS.SOUL_MAPPING_COMPLETE}
                </span>
              </button>
            )}

            {/* Daily dashboard */}
            <button
              onClick={() => handleNavigate("/dashboard")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                "border border-sky-500/30 bg-sky-500/5",
                "hover:bg-sky-500/10 hover:border-sky-500/50"
              )}
            >
              <div className="p-2 rounded-lg bg-sky-500/20">
                <LayoutDashboard className="h-4 w-4 text-sky-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Visit your dashboard</p>
                <p className="text-xs text-muted-foreground">Once per day bonus</p>
              </div>
              <span className="text-sm font-semibold text-sky-500">
                +{KARMA_REWARDS.DAILY_DASHBOARD_VIEW}
              </span>
            </button>
          </div>
        </div>

        {/* Dismiss button */}
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </div>

        {/* Tip */}
        <p className="text-xs text-center text-muted-foreground pt-2">
          Writing just {Math.ceil(shortage / KARMA_REWARDS.JOURNAL_ENTRY)} entr{Math.ceil(shortage / KARMA_REWARDS.JOURNAL_ENTRY) === 1 ? "y" : "ies"} will give you enough Karma!
        </p>
      </DialogContent>
    </Dialog>
  );
}

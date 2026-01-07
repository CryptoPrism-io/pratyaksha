import { useState } from "react"
import {
  RefreshCw,
  Sparkles,
  Lightbulb,
  Target,
  CheckCircle2,
  AlertCircle,
  FileText,
  Tag,
} from "lucide-react"
import { useWeeklySummary, useRegenerateWeeklySummary } from "../../hooks/useWeeklySummary"
import { WeekPicker } from "./WeekPicker"
import { MoodTrendIndicator } from "./MoodTrendIndicator"
import { getCurrentWeekId } from "../../lib/weekUtils"
import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton"

export function WeeklySummaryCard() {
  const [weekId, setWeekId] = useState(getCurrentWeekId())
  const { data, isLoading, error } = useWeeklySummary(weekId)
  const regenerate = useRegenerateWeeklySummary()

  const summary = data?.summary
  const isGenerating = isLoading || regenerate.isPending

  const handleRegenerate = () => {
    regenerate.mutate(weekId)
  }

  return (
    <div className="rounded-xl glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Weekly Summary</h3>
            <p className="text-xs text-muted-foreground">
              AI-generated insights from your entries
            </p>
          </div>
        </div>

        {/* Regenerate button */}
        {summary && summary.entryCount > 0 && (
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
              isGenerating
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
            {isGenerating ? "Generating..." : "Regenerate"}
          </button>
        )}
      </div>

      {/* Week picker */}
      <div className="flex justify-center mb-6">
        <WeekPicker
          weekId={weekId}
          onWeekChange={setWeekId}
          disabled={isGenerating}
        />
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <div className="pt-4 space-y-2">
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Failed to load weekly summary
          </p>
          <button
            onClick={() => regenerate.mutate(weekId)}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isGenerating && summary && summary.entryCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm font-medium mb-1">No entries this week</p>
          <p className="text-xs text-muted-foreground">
            Start journaling to get personalized insights
          </p>
        </div>
      )}

      {/* Summary content */}
      {!isGenerating && summary && summary.entryCount > 0 && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
            <div className="text-center">
              <p className="text-2xl font-bold">{summary.entryCount}</p>
              <p className="text-xs text-muted-foreground">Entries</p>
            </div>
            {summary.moodTrend && (
              <MoodTrendIndicator trend={summary.moodTrend} size="md" />
            )}
            {summary.dominantMode && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary text-sm">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-medium">{summary.dominantMode}</span>
              </div>
            )}
            {summary.positiveRatio > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-sm">
                {summary.positiveRatio.toFixed(0)}% positive
              </div>
            )}
          </div>

          {/* Narrative */}
          {summary.narrative && (
            <div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {summary.narrative}
              </p>
            </div>
          )}

          {/* Weekly insight */}
          {summary.weeklyInsight && (
            <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Key Insight</p>
                <p className="text-sm text-muted-foreground">
                  {summary.weeklyInsight}
                </p>
              </div>
            </div>
          )}

          {/* Top themes */}
          {summary.topThemes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Top Themes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.topThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-secondary text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recommendations</span>
              </div>
              <ul className="space-y-2">
                {summary.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next week focus */}
          {summary.nextWeekFocus && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm font-medium text-amber-600 mb-1">
                Focus for Next Week
              </p>
              <p className="text-sm">{summary.nextWeekFocus}</p>
            </div>
          )}

          {/* Cached indicator */}
          {summary.cached && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Cached summary from {summary.generatedAt ? new Date(summary.generatedAt).toLocaleDateString() : "earlier"}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

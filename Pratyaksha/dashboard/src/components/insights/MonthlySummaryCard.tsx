import { useState } from "react"
import {
  RefreshCw,
  Calendar,
  Lightbulb,
  Target,
  CheckCircle2,
  AlertCircle,
  FileText,
  Tag,
  Smile,
  Frown,
  Meh,
  Star,
  CalendarDays,
  BarChart3,
} from "lucide-react"
import { useMonthlySummary, useRegenerateMonthlySummary } from "../../hooks/useMonthlySummary"
import { MonthPicker } from "./MonthPicker"
import { MoodTrendIndicator } from "./MoodTrendIndicator"
import { getCurrentMonthId } from "../../lib/monthUtils"
import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton"

export function MonthlySummaryCard() {
  const [monthId, setMonthId] = useState(getCurrentMonthId())
  const { data, isLoading, error } = useMonthlySummary(monthId)
  const regenerate = useRegenerateMonthlySummary()

  const summary = data?.summary
  const isGenerating = isLoading || regenerate.isPending

  const handleRegenerate = () => {
    regenerate.mutate(monthId)
  }

  return (
    <div className="rounded-xl glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
            <Calendar className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-semibold">Monthly Summary</h3>
            <p className="text-xs text-muted-foreground">
              Long-term patterns and insights
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

      {/* Month picker */}
      <div className="flex justify-center mb-6">
        <MonthPicker
          monthId={monthId}
          onMonthChange={setMonthId}
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
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Failed to load monthly summary
          </p>
          <button
            onClick={() => regenerate.mutate(monthId)}
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
          <p className="text-sm font-medium mb-1">No entries this month</p>
          <p className="text-xs text-muted-foreground">
            Start journaling to get monthly insights
          </p>
        </div>
      )}

      {/* Summary content */}
      {!isGenerating && summary && summary.entryCount > 0 && (
        <div className="space-y-6">
          {/* Stats row - 3 columns for monthly */}
          <div className="grid grid-cols-3 gap-3 pb-4 border-b">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold">{summary.entryCount}</p>
              <p className="text-xs text-muted-foreground">Entries</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-center gap-1">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <p className="text-2xl font-bold">{summary.activeDays || "-"}</p>
              </div>
              <p className="text-xs text-muted-foreground">Active Days</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-center gap-1">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-2xl font-bold">{summary.activeWeeks || "-"}</p>
              </div>
              <p className="text-xs text-muted-foreground">Active Weeks</p>
            </div>
          </div>

          {/* Mood + Mode indicators */}
          <div className="flex flex-wrap items-center gap-3">
            {summary.moodTrend && (
              <MoodTrendIndicator trend={summary.moodTrend} size="md" />
            )}
            {summary.dominantSentiment && (
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-sm",
                summary.dominantSentiment === "Positive" && "bg-green-500/10 text-green-600",
                summary.dominantSentiment === "Negative" && "bg-red-500/10 text-red-600",
                summary.dominantSentiment === "Neutral" && "bg-slate-500/10 text-slate-600"
              )}>
                {summary.dominantSentiment === "Positive" && <Smile className="h-4 w-4" />}
                {summary.dominantSentiment === "Negative" && <Frown className="h-4 w-4" />}
                {summary.dominantSentiment === "Neutral" && <Meh className="h-4 w-4" />}
                <span className="font-medium">{summary.dominantSentiment}</span>
              </div>
            )}
            {summary.dominantMode && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary text-sm">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-medium">{summary.dominantMode}</span>
              </div>
            )}
          </div>

          {/* Sentiment breakdown bar */}
          {summary.sentimentBreakdown && summary.entryCount > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Sentiment Distribution</span>
                <span>
                  {summary.sentimentBreakdown.positive}+ / {summary.sentimentBreakdown.neutral}○ / {summary.sentimentBreakdown.negative}−
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
                {summary.sentimentBreakdown.positive > 0 && (
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${(summary.sentimentBreakdown.positive / summary.entryCount) * 100}%` }}
                  />
                )}
                {summary.sentimentBreakdown.neutral > 0 && (
                  <div
                    className="bg-slate-400 transition-all"
                    style={{ width: `${(summary.sentimentBreakdown.neutral / summary.entryCount) * 100}%` }}
                  />
                )}
                {summary.sentimentBreakdown.negative > 0 && (
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${(summary.sentimentBreakdown.negative / summary.entryCount) * 100}%` }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Narrative */}
          {summary.narrative && (
            <div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {summary.narrative}
              </p>
            </div>
          )}

          {/* Month highlight */}
          {summary.monthHighlight && (
            <div className="flex gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Star className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">Month Highlight</p>
                <p className="text-sm">{summary.monthHighlight}</p>
              </div>
            </div>
          )}

          {/* Monthly insight */}
          {summary.monthlyInsight && (
            <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Key Insight</p>
                <p className="text-sm text-muted-foreground">
                  {summary.monthlyInsight}
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

          {/* Next month focus */}
          {summary.nextMonthFocus && (
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-sm font-medium text-indigo-600 mb-1">
                Focus for Next Month
              </p>
              <p className="text-sm">{summary.nextMonthFocus}</p>
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

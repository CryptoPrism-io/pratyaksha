import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Calendar,
  Smile,
  Frown,
  Meh,
  Brain,
  Tag,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { useWeekOverWeek } from "../../hooks/useWeekOverWeek"
import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton"

interface TrendBadgeProps {
  value: number
  percent: number
  trend: "up" | "down" | "same"
  suffix?: string
  positiveIsGood?: boolean
}

function TrendBadge({ value, percent, trend, suffix = "", positiveIsGood = true }: TrendBadgeProps) {
  const isGood = positiveIsGood ? trend === "up" : trend === "down"
  const isBad = positiveIsGood ? trend === "down" : trend === "up"

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        isGood && "bg-green-500/10 text-green-600",
        isBad && "bg-red-500/10 text-red-600",
        trend === "same" && "bg-slate-500/10 text-slate-700 dark:text-slate-400"
      )}
    >
      {trend === "up" && <TrendingUp className="h-3 w-3" />}
      {trend === "down" && <TrendingDown className="h-3 w-3" />}
      {trend === "same" && <Minus className="h-3 w-3" />}
      <span>
        {value > 0 ? "+" : ""}
        {value}
        {suffix}
        {percent !== 0 && ` (${percent > 0 ? "+" : ""}${percent}%)`}
      </span>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  current,
  previous,
  trend,
  change,
  percent,
  suffix = "",
  positiveIsGood = true,
}: {
  icon: React.ElementType
  label: string
  current: string | number
  previous: string | number | null
  trend: "up" | "down" | "same"
  change: number
  percent: number
  suffix?: string
  positiveIsGood?: boolean
}) {
  return (
    <div className="flex flex-col p-4 rounded-lg bg-secondary/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{current}</span>
        {previous !== null && (
          <span className="text-sm text-muted-foreground">vs {previous}</span>
        )}
      </div>
      {previous !== null && (
        <div className="mt-2">
          <TrendBadge
            value={change}
            percent={percent}
            trend={trend}
            suffix={suffix}
            positiveIsGood={positiveIsGood}
          />
        </div>
      )}
    </div>
  )
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium",
        sentiment === "Positive" && "bg-green-500/10 text-green-600",
        sentiment === "Negative" && "bg-red-500/10 text-red-600",
        sentiment === "Neutral" && "bg-slate-500/10 text-slate-700 dark:text-slate-400"
      )}
    >
      {sentiment === "Positive" && <Smile className="h-4 w-4" />}
      {sentiment === "Negative" && <Frown className="h-4 w-4" />}
      {sentiment === "Neutral" && <Meh className="h-4 w-4" />}
      {sentiment}
    </div>
  )
}

export function WeekOverWeekCard() {
  const { data, isLoading, error } = useWeekOverWeek()

  // Format date range
  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`
  }

  return (
    <div className="rounded-xl glass-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold">Week over Week</h3>
          <p className="text-xs text-muted-foreground">
            Compare this week vs last week
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground">Failed to load comparison data</p>
        </div>
      )}

      {/* No data state */}
      {!isLoading && !error && !data.current && !data.previous && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm font-medium mb-1">No entries yet</p>
          <p className="text-xs text-muted-foreground">
            Start journaling to see week-over-week comparisons
          </p>
        </div>
      )}

      {/* First week - no previous data */}
      {!isLoading && !error && data.current && !data.previous && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This Week</span>
            <span className="font-medium">
              {formatDateRange(data.current.weekStart, data.current.weekEnd)}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-6 text-center bg-primary/5 rounded-lg border border-primary/10">
            <Sparkles className="h-8 w-8 text-primary mb-3" />
            <p className="text-sm font-medium mb-1">Your first week!</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              You have {data.current.entryCount} entries this week. Keep journaling to see
              comparison insights next week!
            </p>
          </div>

          {/* Current week stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-2xl font-bold">{data.current.entryCount}</p>
              <p className="text-xs text-muted-foreground">Entries</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-2xl font-bold">{data.current.activeDays}</p>
              <p className="text-xs text-muted-foreground">Active Days</p>
            </div>
          </div>
        </div>
      )}

      {/* No current week data but has previous */}
      {!isLoading && !error && !data.current && data.previous && (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-6 text-center bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Calendar className="h-8 w-8 text-amber-600 mb-3" />
            <p className="text-sm font-medium mb-1">No entries this week yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Last week you had {data.previous.entryCount} entries. Start journaling to continue
              your progress!
            </p>
          </div>

          {/* Last week stats */}
          <div className="text-sm text-muted-foreground mb-2">Last Week's Stats:</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-xl font-bold text-muted-foreground">{data.previous.entryCount}</p>
              <p className="text-xs text-muted-foreground">Entries</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-xl font-bold text-muted-foreground">{data.previous.activeDays}</p>
              <p className="text-xs text-muted-foreground">Active Days</p>
            </div>
          </div>
        </div>
      )}

      {/* Full comparison view */}
      {!isLoading && !error && data.current && data.previous && data.changes && (
        <div className="space-y-6">
          {/* Date ranges */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">This Week: </span>
              <span className="font-medium">
                {formatDateRange(data.current.weekStart, data.current.weekEnd)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">vs Last: </span>
              <span className="font-medium">
                {formatDateRange(data.previous.weekStart, data.previous.weekEnd)}
              </span>
            </div>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={FileText}
              label="Entries"
              current={data.current.entryCount}
              previous={data.previous.entryCount}
              trend={data.changes.entryCount.trend}
              change={data.changes.entryCount.value}
              percent={data.changes.entryCount.percent}
              positiveIsGood={true}
            />
            <MetricCard
              icon={Calendar}
              label="Active Days"
              current={data.current.activeDays}
              previous={data.previous.activeDays}
              trend={data.changes.activeDays.trend}
              change={data.changes.activeDays.value}
              percent={0}
              positiveIsGood={true}
            />
          </div>

          {/* Sentiment comparison */}
          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">Mood Trend</span>
              {data.changes.sentiment.improved === true && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                  Improving
                </span>
              )}
              {data.changes.sentiment.improved === false && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                  Needs attention
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <SentimentBadge sentiment={data.changes.sentiment.previous} />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <SentimentBadge sentiment={data.changes.sentiment.current} />
            </div>
          </div>

          {/* Mode shift */}
          {data.changes.modeShift.changed && (
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Mode Shift</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 rounded bg-secondary">
                  {data.changes.modeShift.previous}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                  {data.changes.modeShift.current}
                </span>
              </div>
            </div>
          )}

          {/* Theme changes */}
          {(data.changes.newThemes.length > 0 || data.changes.droppedThemes.length > 0) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Theme Changes</span>
              </div>

              {data.changes.newThemes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-green-600">New:</span>
                  {data.changes.newThemes.map((theme) => (
                    <span
                      key={theme}
                      className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-600"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              {data.changes.droppedThemes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Gone:</span>
                  {data.changes.droppedThemes.map((theme) => (
                    <span
                      key={theme}
                      className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sentiment breakdown comparison */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Sentiment Distribution</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-16 text-muted-foreground">This week</span>
                <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-secondary">
                  {data.current.sentimentBreakdown.positive > 0 && (
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${(data.current.sentimentBreakdown.positive / data.current.entryCount) * 100}%`,
                      }}
                    />
                  )}
                  {data.current.sentimentBreakdown.neutral > 0 && (
                    <div
                      className="bg-slate-400"
                      style={{
                        width: `${(data.current.sentimentBreakdown.neutral / data.current.entryCount) * 100}%`,
                      }}
                    />
                  )}
                  {data.current.sentimentBreakdown.negative > 0 && (
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${(data.current.sentimentBreakdown.negative / data.current.entryCount) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-16 text-muted-foreground">Last week</span>
                <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-secondary">
                  {data.previous.sentimentBreakdown.positive > 0 && (
                    <div
                      className="bg-green-500/60"
                      style={{
                        width: `${(data.previous.sentimentBreakdown.positive / data.previous.entryCount) * 100}%`,
                      }}
                    />
                  )}
                  {data.previous.sentimentBreakdown.neutral > 0 && (
                    <div
                      className="bg-slate-400/60"
                      style={{
                        width: `${(data.previous.sentimentBreakdown.neutral / data.previous.entryCount) * 100}%`,
                      }}
                    />
                  )}
                  {data.previous.sentimentBreakdown.negative > 0 && (
                    <div
                      className="bg-red-500/60"
                      style={{
                        width: `${(data.previous.sentimentBreakdown.negative / data.previous.entryCount) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

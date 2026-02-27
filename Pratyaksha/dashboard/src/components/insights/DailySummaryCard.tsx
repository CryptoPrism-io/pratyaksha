import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sun,
  Lightbulb,
  Zap,
  MessageCircle,
  Tag,
  AlertCircle,
  FileText,
} from "lucide-react"
import { useDailySummary } from "../../hooks/useDailySummary"
import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton"

function formatDateForAPI(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isToday(date: Date): boolean {
  const today = new Date()
  return formatDateForAPI(date) === formatDateForAPI(today)
}

function isFuture(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date > today
}

export function DailySummaryCard() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateStr = formatDateForAPI(selectedDate)
  const { data, isLoading, error } = useDailySummary(dateStr)

  const summary = data?.summary

  const handlePrevDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    setSelectedDate(prev)
  }

  const handleNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    if (!isFuture(next)) {
      setSelectedDate(next)
    }
  }

  const canGoNext = !isToday(selectedDate)

  return (
    <div className="rounded-md signal-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
          <Sun className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-semibold">Daily Summary</h3>
          <p className="text-xs text-muted-foreground">
            Your day at a glance
          </p>
        </div>
      </div>

      {/* Date picker */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={handlePrevDay}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 min-w-[180px] justify-center">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {summary?.displayDate || selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
          {isToday(selectedDate) && (
            <span className="text-xs bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
              Today
            </span>
          )}
        </div>

        <button
          onClick={handleNextDay}
          disabled={!canGoNext}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            canGoNext ? "hover:bg-muted" : "opacity-50 cursor-not-allowed"
          )}
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="pt-3 space-y-2">
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="text-sm text-muted-foreground">
            Failed to load daily summary
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && summary && summary.entryCount === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium mb-1">No entries this day</p>
          <p className="text-xs text-muted-foreground">
            Journal entries will appear here
          </p>
        </div>
      )}

      {/* Summary content */}
      {!isLoading && summary && summary.entryCount > 0 && (
        <div className="space-y-4">
          {/* Entry count */}
          <div className="flex items-center gap-2 pb-3 border-b">
            <span className="text-lg font-bold">{summary.entryCount}</span>
            <span className="text-sm text-muted-foreground">
              {summary.entryCount === 1 ? "entry" : "entries"}
            </span>
            {summary.dominantMode && (
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-secondary">
                {summary.dominantMode}
              </span>
            )}
          </div>

          {/* Narrative */}
          {summary.narrative && (
            <p className="text-sm leading-relaxed">
              {summary.narrative}
            </p>
          )}

          {/* Mood & Energy */}
          <div className="grid gap-3 grid-cols-2">
            {summary.moodSummary && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-medium">Mood</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.moodSummary}
                </p>
              </div>
            )}
            {summary.energyPattern && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs font-medium">Energy</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.energyPattern}
                </p>
              </div>
            )}
          </div>

          {/* Key Takeaway */}
          {summary.keyTakeaway && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">Key Takeaway</span>
              </div>
              <p className="text-sm">
                {summary.keyTakeaway}
              </p>
            </div>
          )}

          {/* Themes */}
          {summary.themes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">Themes</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.themes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-secondary text-xs"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Evening Reflection */}
          {summary.eveningReflection && (
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageCircle className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-xs font-medium">Evening Reflection</span>
              </div>
              <p className="text-sm italic text-muted-foreground">
                "{summary.eveningReflection}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

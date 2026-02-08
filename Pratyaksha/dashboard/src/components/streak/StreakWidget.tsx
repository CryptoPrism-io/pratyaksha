import { useState, useEffect, useCallback } from "react"
import { Flame, ChevronLeft, ChevronRight, Trophy, Zap, Star, X, FileText, Check, Clock, PartyPopper } from "lucide-react"
import confetti from "canvas-confetti"
import { useStreak, type CalendarDay } from "../../hooks/useStreak"
import { useEntries } from "../../hooks/useEntries"
import { cn } from "../../lib/utils"
import type { Entry } from "../../lib/airtable"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

function getMilestoneIcon(milestone: number) {
  if (milestone >= 100) return <Trophy className="h-4 w-4" />
  if (milestone >= 30) return <Star className="h-4 w-4" />
  return <Zap className="h-4 w-4" />
}

function getMilestoneMessage(streak: number): string | null {
  if (streak === 7) return "One week strong!"
  if (streak === 14) return "Two weeks of consistency!"
  if (streak === 30) return "One month champion!"
  if (streak === 60) return "Two months incredible!"
  if (streak === 100) return "100 day legend!"
  if (streak === 365) return "One year unstoppable!"
  return null
}

// Milestone values that trigger celebration (#13 Quick Win)
const MILESTONE_VALUES = [7, 14, 30, 60, 100, 365]

function isMilestone(streak: number): boolean {
  return MILESTONE_VALUES.includes(streak)
}

// Check if we've already celebrated this milestone (uses gamification storage)
function hasAlreadyCelebrated(streak: number): boolean {
  try {
    const state = JSON.parse(localStorage.getItem("pratyaksha-gamification") || "{}")
    return (state.celebratedMilestones || []).includes(streak)
  } catch {
    return false
  }
}

// Mark milestone as celebrated (updates gamification storage for cloud sync)
function markCelebrated(streak: number): void {
  try {
    const raw = localStorage.getItem("pratyaksha-gamification")
    const state = raw ? JSON.parse(raw) : {}
    const milestones = state.celebratedMilestones || []
    if (!milestones.includes(streak)) {
      milestones.push(streak)
      state.celebratedMilestones = milestones
      state.lastUpdatedAt = new Date().toISOString()
      localStorage.setItem("pratyaksha-gamification", JSON.stringify(state))
    }
  } catch {
    // Fallback: silently ignore
  }
}

// Fire confetti celebration
function fireConfetti() {
  // First burst - center
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ff6b35", "#f7c59f", "#efefef", "#ffd93d", "#6bcb77"]
  })

  // Second burst - left
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#ff6b35", "#f7c59f", "#ffd93d"]
    })
  }, 150)

  // Third burst - right
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#ff6b35", "#f7c59f", "#ffd93d"]
    })
  }, 300)
}

/**
 * Format date as YYYY-MM-DD using LOCAL timezone (not UTC)
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

// Group entries by date
function groupEntriesByDate(entries: Entry[]): Map<string, Entry[]> {
  const grouped = new Map<string, Entry[]>()

  entries.forEach((entry) => {
    if (entry.date) {
      const dateKey = formatDateKey(new Date(entry.date))
      const existing = grouped.get(dateKey) || []
      grouped.set(dateKey, [...existing, entry])
    }
  })

  return grouped
}

export function StreakWidget() {
  const { data: entries = [] } = useEntries()

  // Pass entries to useStreak for real data calculation
  const {
    streak,
    loggedToday,
    nextMilestone,
    daysToMilestone,
    progressToNextMilestone,
    getStreakCalendar,
  } = useStreak(entries)

  const entriesByDate = groupEntriesByDate(entries)

  const [viewMonth, setViewMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const calendarDays = getStreakCalendar(viewMonth)

  // Milestone celebration effect (#13 Quick Win)
  useEffect(() => {
    if (streak > 0 && isMilestone(streak) && !hasAlreadyCelebrated(streak)) {
      // Trigger celebration
      setShowCelebration(true)
      fireConfetti()
      markCelebrated(streak)

      // Hide celebration banner after 5 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [streak])

  // Manual celebration trigger for testing
  const triggerCelebration = useCallback(() => {
    fireConfetti()
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 3000)
  }, [])

  // Get entries for selected date
  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null
  const selectedEntries = selectedDateKey ? entriesByDate.get(selectedDateKey) || [] : []

  const prevMonth = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    const today = new Date()
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
    if (next <= new Date(today.getFullYear(), today.getMonth() + 1, 0)) {
      setViewMonth(next)
      setSelectedDate(null)
    }
  }

  const canGoNext = () => {
    const today = new Date()
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
    return next <= new Date(today.getFullYear(), today.getMonth() + 1, 0)
  }

  const handleDateClick = (day: CalendarDay) => {
    if (day.isFuture || !day.isCurrentMonth) return

    const dateKey = formatDateKey(day.date)
    const hasEntries = entriesByDate.has(dateKey)

    if (hasEntries) {
      // Toggle: if already selected, close; otherwise open
      const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null
      if (selectedDateKey === dateKey) {
        setSelectedDate(null)
      } else {
        setSelectedDate(day.date)
      }
    } else {
      setSelectedDate(null)
    }
  }

  const milestoneMessage = getMilestoneMessage(streak)

  return (
    <div className="rounded-xl glass-card p-5">
      {/* Streak Counter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            streak > 0
              ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
              : "bg-muted text-muted-foreground"
          )}>
            <Flame className={cn("h-6 w-6", streak > 0 && "animate-pulse")} />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold">{streak}</span>
              <span className="text-sm text-muted-foreground">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {loggedToday ? "Logged today!" : "Log today to extend streak"}
            </p>
          </div>
        </div>

        {/* Status indicator - shows check if logged, clock if pending */}
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            loggedToday
              ? "bg-green-500/20 text-green-500"
              : "bg-amber-500/20 text-amber-500"
          )}
          title={loggedToday ? "You've logged today!" : "No entry today yet"}
        >
          {loggedToday ? (
            <Check className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Milestone Celebration Banner (#13 Quick Win) */}
      {showCelebration && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white animate-pulse">
          <PartyPopper className="h-6 w-6 animate-bounce" />
          <div className="flex-1">
            <p className="font-bold text-lg">Milestone Reached!</p>
            <p className="text-sm text-white/90">{milestoneMessage}</p>
          </div>
          <button
            onClick={() => setShowCelebration(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Milestone message (shows when not celebrating) */}
      {milestoneMessage && !showCelebration && (
        <button
          onClick={triggerCelebration}
          className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary w-full hover:bg-primary/20 transition-colors"
        >
          <Trophy className="h-4 w-4" />
          <span className="flex-1 text-left">{milestoneMessage}</span>
          <PartyPopper className="h-4 w-4 opacity-50" />
        </button>
      )}

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Next milestone</span>
            <span className="text-xs font-medium flex items-center gap-1">
              {getMilestoneIcon(nextMilestone)}
              {nextMilestone} days
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${progressToNextMilestone}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground text-right">
            {daysToMilestone} {daysToMilestone === 1 ? "day" : "days"} to go
          </p>
        </div>
      )}

      {/* Calendar */}
      <div className="border-t pt-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">
            {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            disabled={!canGoNext()}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              canGoNext() ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
            )}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((day, i) => (
            <div
              key={i}
              className="flex h-6 items-center justify-center text-xs text-muted-foreground font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const dateKey = formatDateKey(day.date)
            const dayEntries = entriesByDate.get(dateKey) || []
            const entryCount = dayEntries.length
            const isSelected = selectedDate !== null && formatDateKey(selectedDate) === dateKey

            return (
              <CalendarCell
                key={i}
                day={day}
                entryCount={entryCount}
                isSelected={isSelected}
                onClick={() => handleDateClick(day)}
              />
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded-sm bg-primary" />
          Has entries
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          No entries
        </div>
      </div>

      {/* Selected Date Entries Panel */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">
              {formatDisplayDate(selectedDate)}
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedEntries.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {selectedEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No entries on this day
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface CalendarCellProps {
  day: CalendarDay
  entryCount: number
  isSelected: boolean
  onClick: () => void
}

function CalendarCell({ day, entryCount, isSelected, onClick }: CalendarCellProps) {
  const dateNum = day.date.getDate()
  const hasEntries = entryCount > 0
  const isClickable = !day.isFuture && day.isCurrentMonth && hasEntries

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        "relative flex h-8 w-full items-center justify-center rounded-md text-xs transition-all",
        !day.isCurrentMonth && "opacity-30",
        day.isFuture && "opacity-20",
        day.isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
        isSelected && "ring-2 ring-orange-500 ring-offset-1 ring-offset-background",
        hasEntries
          ? "bg-primary text-primary-foreground font-medium"
          : "bg-muted/50",
        isClickable && "cursor-pointer hover:scale-110 hover:shadow-md",
        !isClickable && "cursor-default"
      )}
    >
      {dateNum}
      {/* Entry count badge */}
      {entryCount > 1 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white font-bold">
          {entryCount > 9 ? "9+" : entryCount}
        </span>
      )}
    </button>
  )
}

interface EntryCardProps {
  entry: Entry
}

function EntryCard({ entry }: EntryCardProps) {
  const time = entry.timestamp
    ? new Date(entry.timestamp).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : ""

  return (
    <div className="rounded-lg bg-muted/50 p-3 hover:bg-muted/70 transition-colors">
      <div className="flex items-start gap-2">
        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate">{entry.name}</span>
            {time && (
              <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {entry.type}
            </span>
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
              {entry.inferredMode}
            </span>
            {entry.sentimentAI && (
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                entry.sentimentAI === "Positive" && "bg-green-500/10 text-green-600",
                entry.sentimentAI === "Negative" && "bg-red-500/10 text-red-600",
                entry.sentimentAI === "Neutral" && "bg-gray-500/10 text-gray-600"
              )}>
                {entry.sentimentAI}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

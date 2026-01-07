import { useMemo, useCallback } from "react"
import type { Entry } from "../lib/airtable"

// Milestone thresholds
export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365] as const

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  hasEntry: boolean
  isToday: boolean
  isFuture: boolean
}

interface UseStreakReturn {
  streak: number
  loggedToday: boolean
  nextMilestone: number | null
  daysToMilestone: number
  progressToNextMilestone: number
  getStreakCalendar: (month: Date) => CalendarDay[]
  entryDates: Set<string>
}

/**
 * Format date as YYYY-MM-DD using LOCAL timezone (not UTC)
 * This ensures dates match the user's local calendar
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateKey(date1) === formatDateKey(date2)
}

/**
 * Calculate streak from actual entry data
 * Counts consecutive days with entries going backwards from today
 */
function calculateStreak(entryDates: Set<string>): { streak: number; loggedToday: boolean } {
  const today = new Date()
  const todayKey = formatDateKey(today)

  const loggedToday = entryDates.has(todayKey)

  // Start from today if logged, otherwise from yesterday
  let currentDate = new Date(today)
  if (!loggedToday) {
    currentDate.setDate(currentDate.getDate() - 1)
  }

  let streak = 0

  // Count consecutive days going backwards
  while (true) {
    const dateKey = formatDateKey(currentDate)
    if (entryDates.has(dateKey)) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return { streak, loggedToday }
}

/**
 * Hook to calculate journaling streak from actual entry data
 * @param entries - Array of entries from Airtable
 */
export function useStreak(entries: Entry[] = []): UseStreakReturn {
  // Build set of dates with entries
  const entryDates = useMemo(() => {
    const dates = new Set<string>()
    entries.forEach((entry) => {
      if (entry.date) {
        const dateKey = formatDateKey(new Date(entry.date))
        dates.add(dateKey)
      }
    })
    return dates
  }, [entries])

  // Calculate streak from entry dates
  const { streak, loggedToday } = useMemo(() => {
    return calculateStreak(entryDates)
  }, [entryDates])

  // Calculate next milestone
  const nextMilestone = useMemo(() => {
    return STREAK_MILESTONES.find((m) => m > streak) ?? null
  }, [streak])

  const daysToMilestone = nextMilestone ? nextMilestone - streak : 0

  const progressToNextMilestone = useMemo(() => {
    if (!nextMilestone) return 100
    const prevMilestone = [...STREAK_MILESTONES].reverse().find((m) => m <= streak) ?? 0
    return ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
  }, [streak, nextMilestone])

  // Generate calendar data for a given month
  const getStreakCalendar = useCallback((month: Date): CalendarDay[] => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const today = new Date()

    // First day of the month
    const firstDay = new Date(year, monthIndex, 1)
    // Last day of the month
    const lastDay = new Date(year, monthIndex + 1, 0)

    // Start from Sunday of the first week
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    // End at Saturday of the last week
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

    const days: CalendarDay[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateKey = formatDateKey(currentDate)
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === monthIndex,
        hasEntry: entryDates.has(dateKey),
        isToday: isSameDay(currentDate, today),
        isFuture: currentDate > today,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }, [entryDates])

  return {
    streak,
    loggedToday,
    nextMilestone,
    daysToMilestone,
    progressToNextMilestone,
    getStreakCalendar,
    entryDates,
  }
}

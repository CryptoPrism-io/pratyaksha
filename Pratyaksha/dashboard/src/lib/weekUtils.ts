// Client-side week utilities for ISO 8601 week handling

/**
 * Get ISO week ID for a given date
 */
export function getWeekId(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  // Thursday of the current week determines the year
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))

  const year = d.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const week1Monday = new Date(jan4)
  week1Monday.setDate(jan4.getDate() - dayOfWeek + 1)

  const weekNum = Math.ceil(((d.getTime() - week1Monday.getTime()) / 86400000 + 1) / 7)

  return `${year}-W${String(weekNum).padStart(2, "0")}`
}

/**
 * Get the current week ID
 */
export function getCurrentWeekId(): string {
  return getWeekId(new Date())
}

/**
 * Parse ISO 8601 week format to year and week number
 */
export function parseWeekId(weekId: string): { year: number; week: number } {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/)
  if (!match) {
    throw new Error(`Invalid week format: ${weekId}`)
  }
  return {
    year: parseInt(match[1], 10),
    week: parseInt(match[2], 10),
  }
}

/**
 * Get the start (Monday) and end (Sunday) dates for an ISO week
 */
export function getWeekDateRange(weekId: string): { start: Date; end: Date } {
  const { year, week } = parseWeekId(weekId)

  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const week1Monday = new Date(jan4)
  week1Monday.setDate(jan4.getDate() - dayOfWeek + 1)

  const targetMonday = new Date(week1Monday)
  targetMonday.setDate(week1Monday.getDate() + (week - 1) * 7)

  const targetSunday = new Date(targetMonday)
  targetSunday.setDate(targetMonday.getDate() + 6)

  targetMonday.setHours(0, 0, 0, 0)
  targetSunday.setHours(23, 59, 59, 999)

  return { start: targetMonday, end: targetSunday }
}

/**
 * Format a week for display (e.g., "Jan 1 - 7, 2026")
 */
export function formatWeekLabel(weekId: string): string {
  const { start, end } = getWeekDateRange(weekId)

  const startMonth = start.toLocaleDateString("en-US", { month: "short" })
  const endMonth = end.toLocaleDateString("en-US", { month: "short" })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = end.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}

/**
 * Get previous week ID
 */
export function getPreviousWeekId(weekId: string): string {
  const { start } = getWeekDateRange(weekId)
  const prevWeek = new Date(start)
  prevWeek.setDate(prevWeek.getDate() - 7)
  return getWeekId(prevWeek)
}

/**
 * Get next week ID
 */
export function getNextWeekId(weekId: string): string {
  const { start } = getWeekDateRange(weekId)
  const nextWeek = new Date(start)
  nextWeek.setDate(nextWeek.getDate() + 7)
  return getWeekId(nextWeek)
}

/**
 * Check if a week is in the future
 */
export function isWeekInFuture(weekId: string): boolean {
  const { start } = getWeekDateRange(weekId)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return start > today
}

/**
 * Check if a week is the current week
 */
export function isCurrentWeek(weekId: string): boolean {
  return weekId === getCurrentWeekId()
}

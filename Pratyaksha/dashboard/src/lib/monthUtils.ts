// Client-side month utilities for YYYY-MM format handling

/**
 * Get month ID for a given date (format: YYYY-MM)
 */
export function getMonthId(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // JavaScript months are 0-indexed
  return `${year}-${String(month).padStart(2, "0")}`
}

/**
 * Get the current month ID
 */
export function getCurrentMonthId(): string {
  return getMonthId(new Date())
}

/**
 * Parse month ID to year and month number
 */
export function parseMonthId(monthId: string): { year: number; month: number } {
  const match = monthId.match(/^(\d{4})-(\d{2})$/)
  if (!match) {
    throw new Error(`Invalid month format: ${monthId}`)
  }
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
  }
}

/**
 * Get the start (1st) and end (last day) dates for a month
 */
export function getMonthDateRange(monthId: string): { start: Date; end: Date } {
  const { year, month } = parseMonthId(monthId)

  // First day of month at 00:00:00
  const start = new Date(year, month - 1, 1)
  start.setHours(0, 0, 0, 0)

  // Last day of month at 23:59:59
  const end = new Date(year, month, 0) // Day 0 of next month = last day of current month
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Format a month for display (e.g., "January 2026")
 */
export function formatMonthLabel(monthId: string): string {
  const { year, month } = parseMonthId(monthId)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

/**
 * Format a month for short display (e.g., "Jan 2026")
 */
export function formatMonthLabelShort(monthId: string): string {
  const { year, month } = parseMonthId(monthId)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

/**
 * Get previous month ID
 */
export function getPreviousMonthId(monthId: string): string {
  const { year, month } = parseMonthId(monthId)
  const prevDate = new Date(year, month - 2, 1) // month - 1 for 0-index, -1 more for previous
  return getMonthId(prevDate)
}

/**
 * Get next month ID
 */
export function getNextMonthId(monthId: string): string {
  const { year, month } = parseMonthId(monthId)
  const nextDate = new Date(year, month, 1) // month - 1 + 1 = month for 0-index
  return getMonthId(nextDate)
}

/**
 * Check if a month is in the future
 */
export function isMonthInFuture(monthId: string): boolean {
  const { start } = getMonthDateRange(monthId)
  const today = new Date()
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  return start > currentMonthStart
}

/**
 * Check if a month is the current month
 */
export function isCurrentMonth(monthId: string): boolean {
  return monthId === getCurrentMonthId()
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(monthId: string): number {
  const { year, month } = parseMonthId(monthId)
  return new Date(year, month, 0).getDate()
}

/**
 * Get the number of weeks (or partial weeks) in a month
 */
export function getWeeksInMonth(monthId: string): number {
  const days = getDaysInMonth(monthId)
  return Math.ceil(days / 7)
}

/**
 * Get an array of the last N month IDs including the given month
 */
export function getLastNMonthIds(monthId: string, count: number): string[] {
  const months: string[] = []
  let current = monthId

  for (let i = 0; i < count; i++) {
    months.unshift(current) // Add to front to maintain chronological order
    current = getPreviousMonthId(current)
  }

  return months
}

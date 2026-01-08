// Month utilities for YYYY-MM format handling (server-side)

/**
 * Parse month ID (YYYY-MM) to year and month number
 */
export function parseMonthId(monthId: string): { year: number; month: number } {
  const match = monthId.match(/^(\d{4})-(\d{2})$/)
  if (!match) {
    throw new Error(`Invalid month format: ${monthId}. Expected YYYY-MM`)
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
 * Format a month for display (e.g., "January 2026")
 */
export function formatMonthRange(monthId: string): string {
  const { year, month } = parseMonthId(monthId)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
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
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

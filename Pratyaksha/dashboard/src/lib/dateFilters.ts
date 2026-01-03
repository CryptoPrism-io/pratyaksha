// Date filter utilities

export type DateRangePreset =
  | "all"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "7"
  | "30"
  | "custom"

export interface DateRange {
  start: Date
  end: Date
}

/**
 * Get start of day (midnight)
 */
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get end of day (23:59:59.999)
 */
function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Get start of week (Monday)
 */
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  d.setDate(diff)
  return startOfDay(d)
}

/**
 * Get end of week (Sunday)
 */
function endOfWeek(date: Date): Date {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return endOfDay(end)
}

/**
 * Get start of month
 */
function startOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return startOfDay(d)
}

/**
 * Get end of month
 */
function endOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return endOfDay(d)
}

/**
 * Convert a date range preset to actual start/end dates
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange | null {
  const now = new Date()
  const today = startOfDay(now)

  switch (preset) {
    case "all":
      return null // No filtering

    case "today":
      return {
        start: today,
        end: endOfDay(now),
      }

    case "yesterday": {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      }
    }

    case "thisWeek":
      return {
        start: startOfWeek(now),
        end: endOfWeek(now),
      }

    case "lastWeek": {
      const lastWeekDate = new Date(now)
      lastWeekDate.setDate(lastWeekDate.getDate() - 7)
      return {
        start: startOfWeek(lastWeekDate),
        end: endOfWeek(lastWeekDate),
      }
    }

    case "thisMonth":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      }

    case "lastMonth": {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return {
        start: startOfMonth(lastMonthDate),
        end: endOfMonth(lastMonthDate),
      }
    }

    case "7": {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return {
        start: sevenDaysAgo,
        end: endOfDay(now),
      }
    }

    case "30": {
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return {
        start: thirtyDaysAgo,
        end: endOfDay(now),
      }
    }

    case "custom":
      return null // Custom range handled separately

    default:
      return null
  }
}

/**
 * Check if a date falls within a date range
 */
export function isDateInRange(date: Date | string, range: DateRange | null): boolean {
  if (!range) return true // No range = include all

  const d = typeof date === "string" ? new Date(date) : date
  return d >= range.start && d <= range.end
}

/**
 * Format date range for display
 */
export function formatDateRange(range: DateRange): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  const startStr = range.start.toLocaleDateString(undefined, options)
  const endStr = range.end.toLocaleDateString(undefined, options)

  if (startStr === endStr) {
    return startStr
  }
  return `${startStr} - ${endStr}`
}

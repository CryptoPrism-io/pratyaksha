/**
 * User-friendly error messages
 * These messages provide actionable context for users
 */

export const ERROR_MESSAGES = {
  // Data loading errors
  LOAD_ENTRIES: "Unable to load entries. Check your connection and try again.",
  LOAD_TIMELINE: "Unable to load emotional timeline. Try refreshing the page.",
  LOAD_MODES: "Unable to load mode distribution. Check your connection.",
  LOAD_CALENDAR: "Unable to load activity calendar. Try again in a moment.",
  LOAD_THEMES: "Unable to load theme data. Refresh to try again.",
  LOAD_ENERGY: "Unable to load energy patterns. Check your connection.",
  LOAD_CONTRADICTIONS: "Unable to load contradiction data. Try refreshing.",
  LOAD_RHYTHM: "Unable to load daily rhythm data. Try again.",
  LOAD_CHART: "Unable to load chart data. Check your connection and refresh.",

  // Entry processing errors
  PROCESS_ENTRY: "AI processing failed. Your entry text is preserved - try submitting again.",
  SAVE_ENTRY: "Unable to save entry. Check your connection and try again.",
  EMPTY_ENTRY: "Please enter some text before submitting.",

  // Export errors
  EXPORT_FAILED: "Export failed. Please try again or contact support if the issue persists.",
  EXPORT_NO_DATA: "No entries available to export. Create some entries first!",

  // Voice recording errors
  VOICE_ERROR: "Voice recording encountered an issue. Please try again or type your entry.",
  VOICE_NOT_SUPPORTED: "Voice recording is not supported in your browser.",

  // Network errors
  NETWORK_ERROR: "Unable to connect to the server. Check your internet connection.",
  TIMEOUT_ERROR: "Request timed out. The server may be busy - try again in a moment.",

  // Authentication errors
  AUTH_ERROR: "Authentication failed. Please refresh the page and try again.",

  // Generic fallback
  GENERIC: "Something went wrong. Please try again.",
} as const

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES

/**
 * Get a user-friendly error message
 */
export function getErrorMessage(key: ErrorMessageKey): string {
  return ERROR_MESSAGES[key]
}

/**
 * Get error message with retry action hint
 */
export function getErrorWithRetry(key: ErrorMessageKey): string {
  const message = ERROR_MESSAGES[key]
  if (!message.includes("try again") && !message.includes("refresh")) {
    return `${message} Try again or refresh the page.`
  }
  return message
}

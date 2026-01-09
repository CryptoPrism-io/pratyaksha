import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type DateRangePreset, type DateRange, getDateRangeFromPreset, formatDateRange } from "../lib/dateFilters"

const STORAGE_KEY = "pratyaksha-date-filter"

interface DateFilterContextValue {
  preset: DateRangePreset
  dateRange: DateRange | null
  setPreset: (preset: DateRangePreset) => void
  setCustomRange: (range: DateRange) => void
  getDateRangeLabel: () => string
}

const DateFilterContext = createContext<DateFilterContextValue | null>(null)

// Load saved preset from localStorage
function getStoredPreset(defaultPreset: DateRangePreset): DateRangePreset {
  if (typeof window === "undefined") return defaultPreset
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && ["today", "yesterday", "thisWeek", "lastWeek", "thisMonth", "lastMonth", "30", "all"].includes(stored)) {
    return stored as DateRangePreset
  }
  return defaultPreset
}

interface DateFilterProviderProps {
  children: ReactNode
  defaultPreset?: DateRangePreset
}

export function DateFilterProvider({
  children,
  defaultPreset = "30",
}: DateFilterProviderProps) {
  const [preset, setPresetState] = useState<DateRangePreset>(() => getStoredPreset(defaultPreset))
  const [customRange, setCustomRangeState] = useState<DateRange | null>(null)

  const dateRange = preset === "custom" ? customRange : getDateRangeFromPreset(preset)

  const setPreset = useCallback((newPreset: DateRangePreset) => {
    setPresetState(newPreset)
    // Persist to localStorage (except custom which needs date range)
    if (newPreset !== "custom") {
      localStorage.setItem(STORAGE_KEY, newPreset)
    }
  }, [])

  const setCustomRange = useCallback((range: DateRange) => {
    setCustomRangeState(range)
    setPresetState("custom")
    // Don't persist custom ranges (they're session-specific)
  }, [])

  // Human-readable label for the current date range
  const getDateRangeLabel = useCallback(() => {
    const presetLabels: Record<DateRangePreset, string> = {
      all: "All Time",
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      lastWeek: "Last Week",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      "7": "Last 7 Days",
      "30": "Last 30 Days",
      custom: dateRange ? formatDateRange(dateRange) : "Custom Range",
    }
    return presetLabels[preset] || "Unknown"
  }, [preset, dateRange])

  return (
    <DateFilterContext.Provider
      value={{
        preset,
        dateRange,
        setPreset,
        setCustomRange,
        getDateRangeLabel,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  )
}

export function useDateFilter() {
  const context = useContext(DateFilterContext)
  if (!context) {
    throw new Error("useDateFilter must be used within a DateFilterProvider")
  }
  return context
}

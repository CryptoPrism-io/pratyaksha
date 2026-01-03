import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type DateRangePreset, type DateRange, getDateRangeFromPreset } from "../lib/dateFilters"

interface DateFilterContextValue {
  preset: DateRangePreset
  dateRange: DateRange | null
  setPreset: (preset: DateRangePreset) => void
  setCustomRange: (range: DateRange) => void
}

const DateFilterContext = createContext<DateFilterContextValue | null>(null)

interface DateFilterProviderProps {
  children: ReactNode
  defaultPreset?: DateRangePreset
}

export function DateFilterProvider({
  children,
  defaultPreset = "thisWeek",
}: DateFilterProviderProps) {
  const [preset, setPresetState] = useState<DateRangePreset>(defaultPreset)
  const [customRange, setCustomRangeState] = useState<DateRange | null>(null)

  const dateRange = preset === "custom" ? customRange : getDateRangeFromPreset(preset)

  const setPreset = useCallback((newPreset: DateRangePreset) => {
    setPresetState(newPreset)
  }, [])

  const setCustomRange = useCallback((range: DateRange) => {
    setCustomRangeState(range)
    setPresetState("custom")
  }, [])

  return (
    <DateFilterContext.Provider
      value={{
        preset,
        dateRange,
        setPreset,
        setCustomRange,
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

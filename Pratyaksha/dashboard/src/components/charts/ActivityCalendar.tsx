import * as React from "react"
import { Calendar } from "../ui/calendar"
import { useEntries } from "../../hooks/useEntries"
import { cn } from "../../lib/utils"

// Helper to format date as YYYY-MM-DD in local timezone (not UTC)
function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Entry type color mapping - Teal, Rose, Amber brand palette
const TYPE_COLORS: Record<string, string> = {
  Emotional: "bg-rose-500",
  Cognitive: "bg-teal-600",
  Family: "bg-amber-500",
  Work: "bg-teal-500",
  Relationship: "bg-rose-400",
  Health: "bg-teal-400",
  Creativity: "bg-amber-400",
  Social: "bg-teal-300",
  Reflection: "bg-amber-600",
  Decision: "bg-amber-300",
  Avoidance: "bg-rose-600",
  Growth: "bg-teal-500",
  Stress: "bg-rose-500",
  Communication: "bg-teal-500",
  Routine: "bg-amber-500",
}

// Get a consistent color for any type
function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || "bg-primary"
}

export function ActivityCalendar() {
  const { data: entries, isLoading, error } = useEntries()
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)

  // Group entries by date
  const entriesByDate = React.useMemo(() => {
    if (!entries) return new Map<string, { types: string[]; count: number }>()

    const map = new Map<string, { types: string[]; count: number }>()

    entries.forEach((entry) => {
      if (!entry.date) return

      // Normalize date to YYYY-MM-DD
      const dateKey = entry.date.split("T")[0]
      const existing = map.get(dateKey) || { types: [], count: 0 }

      if (entry.type && !existing.types.includes(entry.type)) {
        existing.types.push(entry.type)
      }
      existing.count++

      map.set(dateKey, existing)
    })

    return map
  }, [entries])

  // Get dates that have entries for highlighting
  const datesWithEntries = React.useMemo(() => {
    return Array.from(entriesByDate.keys()).map((dateStr) => new Date(dateStr))
  }, [entriesByDate])

  // Get entry info for selected date
  const selectedDateInfo = React.useMemo(() => {
    if (!selectedDate) return null
    const dateKey = formatDateLocal(selectedDate)
    return entriesByDate.get(dateKey)
  }, [selectedDate, entriesByDate])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Failed to load data
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start w-full h-full">
      {/* Calendar - shrinks to 70% when details shown */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out w-full",
          selectedDateInfo ? "lg:w-[70%]" : "w-full"
        )}
      >
        {/* Force full-width calendar with CSS */}
        <style>{`
          .full-width-calendar { width: 100% !important; }
          .full-width-calendar > div { width: 100% !important; }
          .full-width-calendar table { width: 100% !important; table-layout: fixed; }
          .full-width-calendar thead { width: 100% !important; }
          .full-width-calendar tbody { width: 100% !important; }
          .full-width-calendar tr { width: 100% !important; display: flex !important; }
          .full-width-calendar th, .full-width-calendar td { flex: 1 !important; display: flex !important; justify-content: center !important; align-items: center !important; }
          .full-width-calendar th { padding: 0.5rem 0 !important; }
          .full-width-calendar td { padding: 0.25rem !important; }
          .full-width-calendar td button { width: 100% !important; aspect-ratio: 1 !important; max-width: 3rem !important; }
        `}</style>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border-0 p-0 w-full full-width-calendar"
          classNames={{
            root: "w-full",
            months: "w-full flex flex-col",
            month: "w-full",
            month_caption: "w-full flex justify-center",
            table: "w-full border-collapse",
            weekdays: "w-full flex",
            weekday: "flex-1 text-center",
            week: "w-full flex mt-1",
            day: "flex-1 p-0",
          }}
          modifiers={{
            hasEntry: datesWithEntries,
          }}
          modifiersClassNames={{
            hasEntry: "relative",
          }}
          components={{
            DayButton: ({ day, modifiers, ...props }) => {
              const dateKey = formatDateLocal(day.date)
              const dayInfo = entriesByDate.get(dateKey)
              const hasEntries = dayInfo && dayInfo.count > 0

              return (
                <button
                  {...props}
                  className={cn(
                    "relative flex w-full aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    modifiers.today && !modifiers.selected && "bg-accent text-accent-foreground",
                    modifiers.outside && "text-muted-foreground opacity-50",
                    modifiers.disabled && "text-muted-foreground opacity-50"
                  )}
                >
                  {day.date.getDate()}
                  {/* Entry type indicators */}
                  {hasEntries && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayInfo.types.slice(0, 3).map((type, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            getTypeColor(type)
                          )}
                          title={type}
                        />
                      ))}
                      {dayInfo.types.length > 3 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" title={`+${dayInfo.types.length - 3} more`} />
                      )}
                    </div>
                  )}
                </button>
              )
            },
          }}
        />
      </div>

      {/* Selected Day Info - 30% with slide-in animation */}
      {selectedDateInfo && (
        <div className="lg:w-[30%] min-w-0 animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-1">
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric"
              })}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              {selectedDateInfo.count} {selectedDateInfo.count === 1 ? "entry" : "entries"}
            </p>
            <div className="flex flex-wrap gap-1">
              {selectedDateInfo.types.map((type) => (
                <span
                  key={type}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white",
                    getTypeColor(type)
                  )}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

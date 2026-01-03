import { Calendar } from "lucide-react"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useDateFilter } from "../../contexts/DateFilterContext"
import type { DateRangePreset } from "../../lib/dateFilters"
import { cn } from "../../lib/utils"

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisWeek", label: "This Week" },
  { value: "lastWeek", label: "Last Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "30", label: "Last 30 days" },
  { value: "all", label: "All time" },
]

// Quick access presets shown as buttons
const QUICK_PRESETS: DateRangePreset[] = ["today", "thisWeek", "thisMonth"]

interface DateFilterBarProps {
  className?: string
  compact?: boolean
}

export function DateFilterBar({ className, compact = false }: DateFilterBarProps) {
  const { preset, setPreset } = useDateFilter()

  // Compact mode: Quick buttons + dropdown for others
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Quick access buttons */}
        <div className="hidden sm:flex items-center gap-1">
          {QUICK_PRESETS.map((p) => {
            const option = DATE_PRESETS.find((o) => o.value === p)!
            return (
              <Button
                key={p}
                variant={preset === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPreset(p)}
                className="h-8 text-xs px-3"
              >
                {option.label}
              </Button>
            )
          })}
        </div>

        {/* Dropdown for all options */}
        <Select
          value={preset}
          onValueChange={(value) => setPreset(value as DateRangePreset)}
        >
          <SelectTrigger className="w-[140px] h-8" aria-label="Select date range">
            <Calendar className="mr-2 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // Default mode: All buttons on desktop, dropdown on mobile
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Desktop: Button group */}
      <div className="hidden md:flex items-center gap-1 flex-wrap">
        {DATE_PRESETS.map((option) => (
          <Button
            key={option.value}
            variant={preset === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPreset(option.value)}
            className="min-h-[32px] text-xs"
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Mobile: Dropdown */}
      <div className="flex md:hidden w-full">
        <Select
          value={preset}
          onValueChange={(value) => setPreset(value as DateRangePreset)}
        >
          <SelectTrigger className="w-full" aria-label="Select date range">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

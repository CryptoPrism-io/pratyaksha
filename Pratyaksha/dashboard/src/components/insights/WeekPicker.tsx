import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { cn } from "../../lib/utils"
import {
  formatWeekLabel,
  getPreviousWeekId,
  getNextWeekId,
  isWeekInFuture,
  isCurrentWeek,
} from "../../lib/weekUtils"

interface WeekPickerProps {
  weekId: string
  onWeekChange: (weekId: string) => void
  disabled?: boolean
}

export function WeekPicker({ weekId, onWeekChange, disabled }: WeekPickerProps) {
  const canGoNext = !isWeekInFuture(getNextWeekId(weekId))
  const isCurrent = isCurrentWeek(weekId)

  const handlePrev = () => {
    if (!disabled) {
      onWeekChange(getPreviousWeekId(weekId))
    }
  }

  const handleNext = () => {
    if (!disabled && canGoNext) {
      onWeekChange(getNextWeekId(weekId))
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Previous week button */}
      <button
        onClick={handlePrev}
        disabled={disabled}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-muted"
        )}
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Week label */}
      <div className="flex items-center gap-2 min-w-[180px] justify-center">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {formatWeekLabel(weekId)}
        </span>
        {isCurrent && (
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            This Week
          </span>
        )}
      </div>

      {/* Next week button */}
      <button
        onClick={handleNext}
        disabled={disabled || !canGoNext}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          disabled || !canGoNext
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-muted"
        )}
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

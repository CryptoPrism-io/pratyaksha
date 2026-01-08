import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { cn } from "../../lib/utils"
import {
  formatMonthLabel,
  getPreviousMonthId,
  getNextMonthId,
  isMonthInFuture,
  isCurrentMonth,
} from "../../lib/monthUtils"

interface MonthPickerProps {
  monthId: string
  onMonthChange: (monthId: string) => void
  disabled?: boolean
}

export function MonthPicker({ monthId, onMonthChange, disabled }: MonthPickerProps) {
  const canGoNext = !isMonthInFuture(getNextMonthId(monthId))
  const isCurrent = isCurrentMonth(monthId)

  const handlePrev = () => {
    if (!disabled) {
      onMonthChange(getPreviousMonthId(monthId))
    }
  }

  const handleNext = () => {
    if (!disabled && canGoNext) {
      onMonthChange(getNextMonthId(monthId))
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Previous month button */}
      <button
        onClick={handlePrev}
        disabled={disabled}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-muted"
        )}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Month label */}
      <div className="flex items-center gap-2 min-w-[160px] justify-center">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {formatMonthLabel(monthId)}
        </span>
        {isCurrent && (
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            This Month
          </span>
        )}
      </div>

      {/* Next month button */}
      <button
        onClick={handleNext}
        disabled={disabled || !canGoNext}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          disabled || !canGoNext
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-muted"
        )}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

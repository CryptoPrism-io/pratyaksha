import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import {
  type Granularity,
  formatPeriodLabel,
  navigatePeriod,
} from "../../hooks/useComparisonData"

interface PeriodSelectorProps {
  date: Date
  granularity: Granularity
  onChange: (date: Date) => void
  maxDate?: Date
  minDate?: Date
  className?: string
}

export function PeriodSelector({
  date,
  granularity,
  onChange,
  maxDate,
  minDate,
  className,
}: PeriodSelectorProps) {
  const label = formatPeriodLabel(date, granularity)

  const canGoPrev = !minDate || navigatePeriod(date, granularity, -1) >= minDate
  const canGoNext = !maxDate || navigatePeriod(date, granularity, 1) <= maxDate

  const handlePrev = () => {
    if (canGoPrev) {
      onChange(navigatePeriod(date, granularity, -1))
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      onChange(navigatePeriod(date, granularity, 1))
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={handlePrev}
        disabled={!canGoPrev}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          "transition-colors",
          canGoPrev
            ? "hover:bg-muted text-foreground"
            : "text-muted-foreground/50 cursor-not-allowed"
        )}
        aria-label="Previous period"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex-1 text-center">
        <span className="text-sm font-medium">{label}</span>
      </div>

      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          "transition-colors",
          canGoNext
            ? "hover:bg-muted text-foreground"
            : "text-muted-foreground/50 cursor-not-allowed"
        )}
        aria-label="Next period"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

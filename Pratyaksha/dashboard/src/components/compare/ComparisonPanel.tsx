import { useMemo } from "react"
import { cn } from "../../lib/utils"
import { PeriodSelector } from "./PeriodSelector"
import { ComparisonSummary } from "./ComparisonSummary"
import {
  type Granularity,
  useComparisonData,
  getDateRangeForPeriod,
} from "../../hooks/useComparisonData"
import type { ContentType } from "./ContentToggle"

// Import chart components for rendering
import { ModeDistributionMini } from "./charts/ModeDistributionMini"
import { EnergyShapeMini } from "./charts/EnergyShapeMini"
import { TimelineMini } from "./charts/TimelineMini"
import { ContradictionFlowMini } from "./charts/ContradictionFlowMini"

interface ComparisonPanelProps {
  side: "left" | "right"
  date: Date
  granularity: Granularity
  contentType: ContentType
  onDateChange: (date: Date) => void
  maxDate?: Date
  minDate?: Date
  className?: string
}

export function ComparisonPanel({
  side,
  date,
  granularity,
  contentType,
  onDateChange,
  maxDate,
  minDate,
  className,
}: ComparisonPanelProps) {
  const dateRange = useMemo(
    () => getDateRangeForPeriod(date, granularity),
    [date, granularity]
  )

  const {
    summary,
    modeData,
    energyData,
    timelineData,
    isLoading,
  } = useComparisonData(dateRange)

  const renderContent = () => {
    switch (contentType) {
      case "summary":
        return <ComparisonSummary summary={summary} isLoading={isLoading} />
      case "energy":
        return <EnergyShapeMini data={energyData} isLoading={isLoading} />
      case "modes":
        return <ModeDistributionMini data={modeData} isLoading={isLoading} />
      case "timeline":
        return <TimelineMini data={timelineData} isLoading={isLoading} />
      case "contradictions":
        return <ContradictionFlowMini dateRange={dateRange} isLoading={isLoading} />
      default:
        return <ComparisonSummary summary={summary} isLoading={isLoading} />
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-xl border bg-card p-4",
        side === "left" ? "border-teal-500/30" : "border-violet-500/30",
        className
      )}
    >
      {/* Period Selector */}
      <div className="mb-4 pb-3 border-b border-border/60">
        <PeriodSelector
          date={date}
          granularity={granularity}
          onChange={onDateChange}
          maxDate={maxDate}
          minDate={minDate}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  )
}

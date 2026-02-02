import { useState, type ReactNode } from "react"
import { cn } from "../../lib/utils"
import { Info, ChevronDown, X, type LucideIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { useIsMobile } from "../../hooks/useMediaQuery"
import { ChartExplainer } from "../charts/ChartExplainer"
import type { ChartType } from "../../hooks/useChartExplainer"
import { useDateFilter } from "../../contexts/DateFilterContext"

interface DashboardGridProps {
  children: ReactNode
  className?: string
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2 p-2 sm:gap-4 sm:p-4 md:gap-6 md:p-6",
        "grid-cols-2 md:grid-cols-2 lg:grid-cols-12",
        "overflow-x-hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

interface ChartCardProps {
  children: ReactNode
  title: string
  description?: string
  tooltip?: string
  className?: string
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  rowSpan?: 1 | 2
  "data-tour"?: string
  /** Icon to display next to the title (#1 Quick Win) */
  icon?: LucideIcon
  /** Allow collapsing on mobile (#14 Quick Win) */
  collapsible?: boolean
  /** Start collapsed on mobile */
  defaultCollapsed?: boolean
  /** AI Explainer - chart type for AI explanations (Sprint 14) */
  aiExplainer?: ChartType
  /** AI Explainer - chart data for AI analysis */
  aiExplainerData?: Record<string, unknown>
  /** AI Explainer - summary context */
  aiExplainerSummary?: {
    totalEntries: number
    dateRange: string
    topItems?: string[]
  }
}

export function ChartCard({
  children,
  title,
  description,
  tooltip,
  className,
  colSpan = 6,
  rowSpan = 1,
  "data-tour": dataTour,
  icon: Icon,
  collapsible = true,
  defaultCollapsed = false,
  aiExplainer,
  aiExplainerData,
  aiExplainerSummary,
}: ChartCardProps) {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const { preset, getDateRangeLabel, setPreset } = useDateFilter()

  // Show filter indicator when not "all" (i.e., a filter is applied)
  const hasActiveFilter = preset !== "all"
  const filterLabel = getDateRangeLabel()

  // Only allow collapse on mobile when collapsible is true
  const canCollapse = isMobile && collapsible
  const showContent = !canCollapse || !isCollapsed

  // Desktop (lg) column spans
  const colSpanClass = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
    9: "lg:col-span-9",
    10: "lg:col-span-10",
    11: "lg:col-span-11",
    12: "lg:col-span-12",
  }

  const rowSpanClass = {
    1: "",
    2: "lg:row-span-2",
  }

  // Mobile: only truly full-width cards (colSpan >= 10) span both columns
  const mobileSpanClass = colSpan >= 10 ? "col-span-2" : "col-span-1"

  return (
    <div
      data-tour={dataTour}
      className={cn(
        "rounded-lg sm:rounded-xl glass-card p-2 sm:p-4 card-hover",
        mobileSpanClass,
        "md:col-span-1",
        colSpanClass[colSpan],
        rowSpanClass[rowSpan],
        className
      )}
    >
      {/* Header with mobile collapse toggle (#14 Quick Win) */}
      <div
        className={cn("mb-1 sm:mb-4", canCollapse && "cursor-pointer")}
        onClick={canCollapse ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center gap-1 sm:gap-2">
          {Icon && <Icon className="h-3 w-3 sm:h-5 sm:w-5 text-primary flex-shrink-0" />}
          <h3 className="text-[11px] sm:text-lg font-semibold tracking-tight leading-tight">{title}</h3>
          {/* AI Explainer button with glow effect */}
          {aiExplainer && aiExplainerData && (
            <div className="relative group" onClick={(e) => e.stopPropagation()}>
              {/* Glow effect behind the button */}
              <div className="absolute inset-0 bg-violet-500/30 rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
              <ChartExplainer
                chartType={aiExplainer}
                chartData={aiExplainerData}
                summary={aiExplainerSummary}
                className="relative transition-transform duration-200 group-hover:scale-110"
              />
            </div>
          )}
          {/* Filter indicator - shows when filter is not "All Time" */}
          {hasActiveFilter && (
            <div className="flex items-center gap-1 ml-1">
              <span className="text-[9px] sm:text-xs text-muted-foreground/60 font-normal">
                // {filterLabel}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPreset("all")
                }}
                className="p-0.5 rounded-full hover:bg-muted/80 text-muted-foreground/60 hover:text-foreground transition-colors"
                aria-label="Clear filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex-1" />
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="hidden sm:inline-block text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="More information"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* Mobile collapse button */}
          {canCollapse && (
            <button
              className="sm:hidden flex items-center justify-center h-5 w-5 rounded-full bg-muted/50"
              aria-label={isCollapsed ? "Expand chart" : "Collapse chart"}
            >
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform duration-200",
                isCollapsed ? "" : "rotate-180"
              )} />
            </button>
          )}
        </div>
        {description && !isCollapsed && (
          <p className="text-[9px] sm:text-sm text-muted-foreground leading-tight">{description}</p>
        )}
      </div>
      {/* Content with collapse animation */}
      <div className={cn(
        "overflow-hidden transition-all duration-200",
        showContent ? "min-h-[100px] sm:min-h-[200px] opacity-100" : "max-h-0 opacity-0"
      )}>
        {children}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: ReactNode
}

export function StatCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
}: StatCardProps) {
  const trendColor = {
    up: "text-positive",
    down: "text-negative",
    neutral: "text-neutral",
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {(description || trendValue) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {trendValue && trend && (
              <span className={cn("font-medium", trendColor[trend])}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            )}{" "}
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

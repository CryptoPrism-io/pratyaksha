import type { ReactNode } from "react"
import { cn } from "../../lib/utils"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

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
}: ChartCardProps) {
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
      <div className="mb-1 sm:mb-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <h3 className="text-[11px] sm:text-lg font-semibold tracking-tight leading-tight">{title}</h3>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="hidden sm:inline-block text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {description && (
          <p className="text-[9px] sm:text-sm text-muted-foreground leading-tight">{description}</p>
        )}
      </div>
      <div className="min-h-[100px] sm:min-h-[200px] overflow-hidden">{children}</div>
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

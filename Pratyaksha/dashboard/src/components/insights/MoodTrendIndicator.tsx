import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import { cn } from "../../lib/utils"

interface MoodTrendIndicatorProps {
  trend: "improving" | "declining" | "stable" | "volatile" | null
  size?: "sm" | "md" | "lg"
}

const trendConfig = {
  improving: {
    icon: TrendingUp,
    label: "Improving",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  declining: {
    icon: TrendingDown,
    label: "Declining",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  stable: {
    icon: Minus,
    label: "Stable",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  volatile: {
    icon: Activity,
    label: "Volatile",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
}

const sizeConfig = {
  sm: {
    container: "h-6 px-2 gap-1 text-xs",
    icon: "h-3 w-3",
  },
  md: {
    container: "h-8 px-3 gap-1.5 text-sm",
    icon: "h-4 w-4",
  },
  lg: {
    container: "h-10 px-4 gap-2 text-base",
    icon: "h-5 w-5",
  },
}

export function MoodTrendIndicator({ trend, size = "md" }: MoodTrendIndicatorProps) {
  if (!trend) return null

  const config = trendConfig[trend]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.bgColor,
        config.color,
        sizes.container
      )}
    >
      <Icon className={sizes.icon} />
      <span>{config.label}</span>
    </div>
  )
}

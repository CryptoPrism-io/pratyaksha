import { Activity, TrendingUp, TrendingDown, Minus, Zap, Heart, CircleDot, Waves, RefreshCw, AlertTriangle, Shrink, Scale } from "lucide-react"
import { cn } from "../../lib/utils"

// Energy Shapes with descriptions and icons - Teal/Rose/Amber brand palette
// Positive = Teal, Neutral = Amber, Challenge = Rose
const ENERGY_SHAPE_CONFIG = {
  Flat: {
    icon: Minus,
    color: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
    description: "Low variation, steady state"
  },
  Heavy: {
    icon: TrendingDown,
    color: "bg-rose-400/20 text-rose-700 dark:text-rose-400 border-rose-400/30",
    description: "Weighed down, burdened"
  },
  Chaotic: {
    icon: AlertTriangle,
    color: "bg-rose-500/20 text-rose-600 border-rose-500/30",
    description: "Unpredictable, scattered energy"
  },
  Rising: {
    icon: TrendingUp,
    color: "bg-teal-500/20 text-teal-600 border-teal-500/30",
    description: "Building momentum, growth"
  },
  Collapsing: {
    icon: TrendingDown,
    color: "bg-rose-400/20 text-rose-600 border-rose-400/30",
    description: "Energy declining, depleting"
  },
  Expanding: {
    icon: Zap,
    color: "bg-teal-400/20 text-teal-600 border-teal-400/30",
    description: "Growing outward, energized"
  },
  Contracted: {
    icon: Shrink,
    color: "bg-rose-300/20 text-rose-600 border-rose-300/30",
    description: "Pulled inward, contained"
  },
  Uneven: {
    icon: Waves,
    color: "bg-amber-400/20 text-amber-600 border-amber-400/30",
    description: "Inconsistent, fluctuating"
  },
  Centered: {
    icon: CircleDot,
    color: "bg-teal-500/20 text-teal-600 border-teal-500/30",
    description: "Balanced, grounded"
  },
  Cyclical: {
    icon: RefreshCw,
    color: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    description: "Repeating pattern, rhythmic"
  },
  Stabilized: {
    icon: Scale,
    color: "bg-teal-600/20 text-teal-700 border-teal-600/30",
    description: "Steady, equilibrium reached"
  },
  Pulsing: {
    icon: Heart,
    color: "bg-teal-300/20 text-teal-600 border-teal-300/30",
    description: "Rhythmic bursts of energy"
  },
} as const

type EnergyShape = keyof typeof ENERGY_SHAPE_CONFIG

interface EnergyShapeLegendProps {
  /** Show only specific shapes */
  shapes?: EnergyShape[]
  /** Compact mode - less spacing */
  compact?: boolean
  /** Show descriptions */
  showDescriptions?: boolean
  /** Additional class name */
  className?: string
}

export function EnergyShapeLegend({
  shapes,
  compact = false,
  showDescriptions = false,
  className
}: EnergyShapeLegendProps) {
  const shapesToShow = shapes || (Object.keys(ENERGY_SHAPE_CONFIG) as EnergyShape[])

  return (
    <div className={cn(
      "flex flex-wrap gap-2",
      compact && "gap-1",
      className
    )}>
      {shapesToShow.map((shape) => {
        const config = ENERGY_SHAPE_CONFIG[shape]
        if (!config) return null
        const Icon = config.icon

        return (
          <div
            key={shape}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1",
              config.color,
              compact && "px-2 py-0.5"
            )}
            title={config.description}
          >
            <Icon className={cn("h-3 w-3", compact && "h-2.5 w-2.5")} />
            <span className={cn("text-xs font-medium", compact && "text-[10px]")}>
              {shape}
            </span>
            {showDescriptions && (
              <span className="hidden sm:inline text-[10px] text-muted-foreground ml-1">
                - {config.description}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Export for use in other components
export function getEnergyShapeConfig(shape: string) {
  return ENERGY_SHAPE_CONFIG[shape as EnergyShape] || {
    icon: Activity,
    color: "bg-muted text-muted-foreground border-muted",
    description: "Unknown shape"
  }
}

export { ENERGY_SHAPE_CONFIG }
export type { EnergyShape }

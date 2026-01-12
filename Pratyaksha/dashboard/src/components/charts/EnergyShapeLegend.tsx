import { Activity, TrendingUp, TrendingDown, Minus, Zap, Heart, CircleDot, Waves, RefreshCw, AlertTriangle, Shrink, Scale } from "lucide-react"
import { cn } from "../../lib/utils"

// Energy Shapes with descriptions and icons (#11 Quick Win)
const ENERGY_SHAPE_CONFIG = {
  Flat: {
    icon: Minus,
    color: "bg-slate-500/20 text-slate-600 border-slate-500/30",
    description: "Low variation, steady state"
  },
  Heavy: {
    icon: TrendingDown,
    color: "bg-gray-600/20 text-gray-700 border-gray-600/30",
    description: "Weighed down, burdened"
  },
  Chaotic: {
    icon: AlertTriangle,
    color: "bg-red-500/20 text-red-600 border-red-500/30",
    description: "Unpredictable, scattered energy"
  },
  Rising: {
    icon: TrendingUp,
    color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
    description: "Building momentum, growth"
  },
  Collapsing: {
    icon: TrendingDown,
    color: "bg-orange-500/20 text-orange-600 border-orange-500/30",
    description: "Energy declining, depleting"
  },
  Expanding: {
    icon: Zap,
    color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    description: "Growing outward, energized"
  },
  Contracted: {
    icon: Shrink,
    color: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    description: "Pulled inward, contained"
  },
  Uneven: {
    icon: Waves,
    color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    description: "Inconsistent, fluctuating"
  },
  Centered: {
    icon: CircleDot,
    color: "bg-green-500/20 text-green-600 border-green-500/30",
    description: "Balanced, grounded"
  },
  Cyclical: {
    icon: RefreshCw,
    color: "bg-cyan-500/20 text-cyan-600 border-cyan-500/30",
    description: "Repeating pattern, rhythmic"
  },
  Stabilized: {
    icon: Scale,
    color: "bg-teal-500/20 text-teal-600 border-teal-500/30",
    description: "Steady, equilibrium reached"
  },
  Pulsing: {
    icon: Heart,
    color: "bg-pink-500/20 text-pink-600 border-pink-500/30",
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

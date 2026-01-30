import { useMemo } from "react"
import { useEntries } from "../../hooks/useEntries"
import { loadLifeBlueprint, hasBlueprintForAI, VISION_CATEGORIES } from "../../lib/lifeBlueprintStorage"
import {
  calculateVisionAlignment,
  getAlignmentSummary,
  getSortedCategories,
  getDriftWarningLevel,
  type AlignmentScore
} from "../../lib/visionAlignment"
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Compass
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useNavigate } from "react-router-dom"

// Circular progress component
function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  color = "primary"
}: {
  value: number
  size?: number
  strokeWidth?: number
  color?: "primary" | "positive" | "warning" | "negative"
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const strokeColor = color === "positive" ? "stroke-emerald-500" :
                      color === "warning" ? "stroke-amber-500" :
                      color === "negative" ? "stroke-red-500" :
                      "stroke-primary"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-500", strokeColor)}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">{value}%</span>
      </div>
    </div>
  )
}

// Category badge
function CategoryBadge({
  category,
  score,
  trend
}: {
  category: string
  score: number
  trend: "improving" | "stable" | "declining" | "no-data"
}) {
  const categoryInfo = VISION_CATEGORIES.find(c => c.value === category)
  const label = categoryInfo?.label || category

  const TrendIcon = trend === "improving" ? TrendingUp :
                    trend === "declining" ? TrendingDown :
                    Minus

  const trendColor = trend === "improving" ? "text-emerald-500" :
                     trend === "declining" ? "text-red-500" :
                     "text-muted-foreground"

  const bgColor = score >= 70 ? "bg-emerald-500/10 border-emerald-500/20" :
                  score >= 40 ? "bg-amber-500/10 border-amber-500/20" :
                  "bg-red-500/10 border-red-500/20"

  return (
    <div className={cn(
      "flex items-center justify-between px-3 py-2 rounded-lg border",
      bgColor
    )}>
      <span className="text-sm font-medium truncate">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold">{score}</span>
        <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} />
      </div>
    </div>
  )
}

export function VisionAlignmentCard() {
  const navigate = useNavigate()
  const { data: entries = [] } = useEntries()

  // Load blueprint and calculate alignment
  const alignmentData = useMemo(() => {
    const blueprint = loadLifeBlueprint()

    // Check if user has any vision/goals set
    if (!hasBlueprintForAI(blueprint)) {
      return null
    }

    // Calculate alignment for last 30 days
    const alignment = calculateVisionAlignment(entries, blueprint)
    const sortedCategories = getSortedCategories(alignment)
    const driftLevel = getDriftWarningLevel(alignment)
    const summary = getAlignmentSummary(alignment)

    return {
      alignment,
      sortedCategories,
      driftLevel,
      summary,
      blueprint
    }
  }, [entries])

  // Don't show if no blueprint data
  if (!alignmentData) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <Compass className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">Set Your Vision</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">
            Define your goals and vision to see how your journaling aligns with where you want to go.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Open Life Blueprint
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  const { alignment, sortedCategories, driftLevel, summary } = alignmentData

  // Determine progress color
  const progressColor = alignment.overall >= 70 ? "positive" :
                        alignment.overall >= 40 ? "warning" :
                        "negative"

  // Show warning icon if drift detected
  const showDriftWarning = driftLevel === "medium" || driftLevel === "high"

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Vision Alignment</h3>
          </div>
          {showDriftWarning && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Drift detected</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {alignment.totalEntriesAnalyzed === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No entries in the last 30 days to analyze.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Main score */}
            <div className="flex items-center gap-4">
              <CircularProgress value={alignment.overall} color={progressColor} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">{summary}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {alignment.alignedEntries.length} aligned
                  </span>
                  {alignment.driftEntries.length > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <XCircle className="h-3.5 w-3.5" />
                      {alignment.driftEntries.length} drift
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            {sortedCategories.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  By Category
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {sortedCategories.slice(0, 4).map(({ category, alignment: catAlign }) => (
                    <CategoryBadge
                      key={category}
                      category={category}
                      score={catAlign.score}
                      trend={catAlign.trend}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Missing areas warning */}
            {alignment.missingAreas.length > 0 && (
              <div className="px-3 py-2 rounded-lg bg-muted/50 border border-muted">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Missing:</span>{" "}
                  {alignment.missingAreas
                    .map(cat => VISION_CATEGORIES.find(c => c.value === cat)?.label || cat)
                    .slice(0, 3)
                    .join(", ")}
                  {alignment.missingAreas.length > 3 && ` +${alignment.missingAreas.length - 3} more`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-muted/30">
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Update Vision & Goals
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

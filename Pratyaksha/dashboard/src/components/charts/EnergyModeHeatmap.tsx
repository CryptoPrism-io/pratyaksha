import { useEntries } from "../../hooks/useEntries"
import { cn } from "../../lib/utils"

// All actual modes from the data
const MODES = [
  "Hopeful",
  "Calm",
  "Grounded",
  "Curious",
  "Reflective",
  "Conflicted",
  "Agitated",
  "Overthinking",
  "Self-critical",
]

// All actual energy levels from the data (ordered low to high)
const ENERGY_LEVELS = [
  "Drained",
  "Low",
  "Scattered",
  "Moderate",
  "Balanced",
  "Elevated",
  "High",
]

// Color scale for heatmap (0 = empty, higher = more intense)
function getHeatColor(count: number, maxCount: number): string {
  if (count === 0) return "bg-muted/30"
  const intensity = count / maxCount
  if (intensity <= 0.25) return "bg-primary/20"
  if (intensity <= 0.5) return "bg-primary/40"
  if (intensity <= 0.75) return "bg-primary/60"
  return "bg-primary/90"
}

function getTextColor(count: number, maxCount: number): string {
  if (count === 0) return "text-muted-foreground/50"
  const intensity = count / maxCount
  if (intensity <= 0.5) return "text-foreground"
  return "text-primary-foreground"
}

export function EnergyModeHeatmap() {
  const { data: entries, isLoading, error } = useEntries()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Failed to load data
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  // Build the matrix: mode -> energy -> count
  const matrix: Record<string, Record<string, number>> = {}
  MODES.forEach(mode => {
    matrix[mode] = {}
    ENERGY_LEVELS.forEach(energy => {
      matrix[mode][energy] = 0
    })
  })

  // Count entries
  let maxCount = 0
  entries.forEach((entry) => {
    const mode = entry.inferredMode
    const energy = entry.inferredEnergy
    if (mode && energy && matrix[mode] && matrix[mode][energy] !== undefined) {
      matrix[mode][energy]++
      maxCount = Math.max(maxCount, matrix[mode][energy])
    }
  })

  // Find the most common combination
  let topCombo = { mode: "", energy: "", count: 0 }
  MODES.forEach(mode => {
    ENERGY_LEVELS.forEach(energy => {
      if (matrix[mode][energy] > topCombo.count) {
        topCombo = { mode, energy, count: matrix[mode][energy] }
      }
    })
  })

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Summary */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {entries.length} entries mapped
        </span>
        {topCombo.count > 0 && (
          <span className="text-muted-foreground">
            Most common: <span className="font-medium text-foreground">{topCombo.mode}</span> + <span className="font-medium text-foreground">{topCombo.energy}</span> ({topCombo.count})
          </span>
        )}
      </div>

      {/* Heatmap grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[500px]">
          {/* Header row - Energy levels */}
          <div className="flex">
            <div className="w-24 shrink-0" /> {/* Empty corner */}
            {ENERGY_LEVELS.map((energy) => (
              <div
                key={energy}
                className="flex-1 text-center text-[10px] font-medium text-muted-foreground pb-1 px-0.5"
              >
                {energy}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {MODES.map((mode) => (
            <div key={mode} className="flex">
              {/* Row label */}
              <div className="w-24 shrink-0 text-[11px] font-medium text-right pr-2 py-1.5 flex items-center justify-end">
                {mode}
              </div>
              {/* Cells */}
              {ENERGY_LEVELS.map((energy) => {
                const count = matrix[mode][energy]
                return (
                  <div
                    key={`${mode}-${energy}`}
                    className={cn(
                      "flex-1 aspect-square m-0.5 rounded-md flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-default",
                      getHeatColor(count, maxCount),
                      getTextColor(count, maxCount)
                    )}
                    title={`${mode} + ${energy}: ${count} entries`}
                  >
                    {count > 0 ? count : ""}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground pt-1">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-4 h-4 rounded bg-muted/30" />
          <div className="w-4 h-4 rounded bg-primary/20" />
          <div className="w-4 h-4 rounded bg-primary/40" />
          <div className="w-4 h-4 rounded bg-primary/60" />
          <div className="w-4 h-4 rounded bg-primary/90" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

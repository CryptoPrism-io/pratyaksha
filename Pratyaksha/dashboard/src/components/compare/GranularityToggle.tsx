import { cn } from "../../lib/utils"
import type { Granularity } from "../../hooks/useComparisonData"

interface GranularityToggleProps {
  value: Granularity
  onChange: (granularity: Granularity) => void
}

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
]

export function GranularityToggle({ value, onChange }: GranularityToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-1">
      {GRANULARITIES.map(({ value: g, label }) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all",
            "min-w-[70px] min-h-[40px]",
            value === g
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

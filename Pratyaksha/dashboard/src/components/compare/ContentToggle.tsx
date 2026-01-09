import { cn } from "../../lib/utils"
import { FileText, Activity, Brain, TrendingUp, GitBranch } from "lucide-react"

export type ContentType = "summary" | "energy" | "modes" | "timeline" | "contradictions"

interface ContentToggleProps {
  value: ContentType
  onChange: (type: ContentType) => void
}

const CONTENT_TYPES: { value: ContentType; label: string; icon: typeof FileText }[] = [
  { value: "summary", label: "Summary", icon: FileText },
  { value: "energy", label: "Energy", icon: Activity },
  { value: "modes", label: "Modes", icon: Brain },
  { value: "timeline", label: "Timeline", icon: TrendingUp },
  { value: "contradictions", label: "Flow", icon: GitBranch },
]

export function ContentToggle({ value, onChange }: ContentToggleProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
      {CONTENT_TYPES.map(({ value: type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
            "min-h-[40px]",
            value === type
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

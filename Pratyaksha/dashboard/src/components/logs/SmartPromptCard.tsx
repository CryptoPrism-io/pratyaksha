import { useMemo, useState } from "react"
import { useEntries } from "../../hooks/useEntries"
import { loadLifeBlueprint, hasContent } from "../../lib/lifeBlueprintStorage"
import { loadGamificationState } from "../../lib/gamificationStorage"
import { generateSmartPrompts, dismissPrompt, type SmartPrompt } from "../../lib/smartPrompts"
import {
  Target,
  Compass,
  Zap,
  AlertTriangle,
  User,
  Clock,
  X,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { cn } from "../../lib/utils"

// Icon map for prompt types
const ICON_MAP: Record<string, React.ElementType> = {
  Target,
  Compass,
  Zap,
  AlertTriangle,
  User,
  Clock
}

interface SmartPromptCardProps {
  onSelectPrompt?: (promptText: string) => void
}

export function SmartPromptCard({ onSelectPrompt }: SmartPromptCardProps) {
  const { data: entries = [] } = useEntries()
  const [dismissedLocally, setDismissedLocally] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState(true)

  // Generate prompts
  const prompts = useMemo(() => {
    const blueprint = loadLifeBlueprint()
    const gamification = loadGamificationState()

    // Only generate prompts if user has some blueprint data
    if (!hasContent(blueprint)) {
      return []
    }

    return generateSmartPrompts(blueprint, entries, gamification, {
      maxPrompts: 4,
      includeGoalChecks: true,
      includeMissingAreas: true,
      includeLeverReminders: true,
      includeAntiVisionChecks: true,
      includeSoulMapping: true,
      includeTimeHorizon: true
    })
  }, [entries])

  // Filter out locally dismissed prompts
  const visiblePrompts = prompts.filter(p => !dismissedLocally.has(p.id))

  // Handle prompt dismissal
  const handleDismiss = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dismissPrompt(promptId) // Persist dismissal
    setDismissedLocally(prev => new Set([...prev, promptId]))
  }

  // Handle prompt selection
  const handleSelectPrompt = (prompt: SmartPrompt) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt.text)
    }
  }

  // Don't render if no prompts
  if (visiblePrompts.length === 0) {
    return null
  }

  // Color based on priority
  const getPromptStyle = (prompt: SmartPrompt) => {
    switch (prompt.type) {
      case "goal-check":
        return {
          bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
          border: "border-emerald-500/20",
          iconBg: "bg-emerald-500/10",
          iconColor: "text-emerald-500"
        }
      case "anti-vision-check":
        return {
          bg: "bg-amber-500/5 hover:bg-amber-500/10",
          border: "border-amber-500/20",
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-500"
        }
      case "missing-area":
        return {
          bg: "bg-blue-500/5 hover:bg-blue-500/10",
          border: "border-blue-500/20",
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-500"
        }
      case "lever-reminder":
        return {
          bg: "bg-purple-500/5 hover:bg-purple-500/10",
          border: "border-purple-500/20",
          iconBg: "bg-purple-500/10",
          iconColor: "text-purple-500"
        }
      case "time-horizon":
        return {
          bg: "bg-orange-500/5 hover:bg-orange-500/10",
          border: "border-orange-500/20",
          iconBg: "bg-orange-500/10",
          iconColor: "text-orange-500"
        }
      case "soul-mapping":
      default:
        return {
          bg: "bg-violet-500/5 hover:bg-violet-500/10",
          border: "border-violet-500/20",
          iconBg: "bg-violet-500/10",
          iconColor: "text-violet-500"
        }
    }
  }

  return (
    <div className="rounded-xl glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">Suggested Prompts</h3>
            <p className="text-xs text-muted-foreground">
              Based on your vision & goals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {visiblePrompts.length}
          </span>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-90"
          )} />
        </div>
      </button>

      {/* Prompts List */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-2">
          {visiblePrompts.map((prompt) => {
            const style = getPromptStyle(prompt)
            const IconComponent = ICON_MAP[prompt.icon || "Sparkles"] || Sparkles

            return (
              <div
                key={prompt.id}
                onClick={() => handleSelectPrompt(prompt)}
                className={cn(
                  "group relative flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                  style.bg,
                  style.border
                )}
              >
                {/* Icon */}
                <div className={cn("p-1.5 rounded-lg flex-shrink-0", style.iconBg)}>
                  <IconComponent className={cn("h-4 w-4", style.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-medium leading-snug">{prompt.text}</p>
                  {prompt.relatedGoal && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {prompt.relatedGoal}
                    </p>
                  )}
                </div>

                {/* Dismiss button */}
                <button
                  onClick={(e) => handleDismiss(prompt.id, e)}
                  className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted/80 transition-opacity"
                  aria-label="Dismiss prompt"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {/* Click indicator */}
                <ChevronRight className="absolute right-2 bottom-2 h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )
          })}

          {/* Tip */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Click a prompt to start your entry
          </p>
        </div>
      )}
    </div>
  )
}

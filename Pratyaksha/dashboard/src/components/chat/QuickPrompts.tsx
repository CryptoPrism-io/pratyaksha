import { Sparkles, TrendingUp, AlertTriangle, Target, Calendar, Brain } from "lucide-react"
import { cn } from "../../lib/utils"

interface QuickPromptsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: "Patterns",
    prompt: "What patterns do you notice in my recent journal entries? Are there recurring themes or behaviors?",
    color: "text-green-500",
  },
  {
    icon: AlertTriangle,
    label: "Contradictions",
    prompt: "What inner contradictions appear most often in my journaling? How might I work through them?",
    color: "text-amber-500",
  },
  {
    icon: Brain,
    label: "Emotional Trends",
    prompt: "How has my emotional state evolved over time? What triggers seem to affect my mood?",
    color: "text-blue-500",
  },
  {
    icon: Target,
    label: "Focus Areas",
    prompt: "Based on my journal entries, what should I focus on for personal growth?",
    color: "text-purple-500",
  },
  {
    icon: Calendar,
    label: "Weekly Summary",
    prompt: "Give me a summary of my week - key themes, emotional highs and lows, and any insights.",
    color: "text-cyan-500",
  },
  {
    icon: Sparkles,
    label: "Insights",
    prompt: "What insights can you share that I might not have noticed about myself from my journaling?",
    color: "text-pink-500",
  },
]

export function QuickPrompts({ onSelect, disabled }: QuickPromptsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        Quick prompts to get started
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {QUICK_PROMPTS.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect(item.prompt)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg border bg-card",
              "hover:bg-muted/50 hover:border-primary/50 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "text-left"
            )}
          >
            <item.icon className={cn("h-4 w-4 flex-shrink-0", item.color)} />
            <span className="text-sm font-medium truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

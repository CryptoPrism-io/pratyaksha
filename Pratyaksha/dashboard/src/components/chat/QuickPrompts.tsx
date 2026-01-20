import { Sparkles, TrendingUp, AlertTriangle, Target, Calendar, Brain, ArrowRight } from "lucide-react"
import { cn } from "../../lib/utils"

interface QuickPromptsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: "Patterns",
    description: "Recurring themes & behaviors",
    prompt: "What patterns do you notice in my recent journal entries? Are there recurring themes or behaviors?",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-600",
  },
  {
    icon: AlertTriangle,
    label: "Contradictions",
    description: "Inner tensions & conflicts",
    prompt: "What inner contradictions appear most often in my journaling? How might I work through them?",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-600",
  },
  {
    icon: Brain,
    label: "Emotional Trends",
    description: "Mood evolution & triggers",
    prompt: "How has my emotional state evolved over time? What triggers seem to affect my mood?",
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    hoverBorder: "hover:border-blue-400 dark:hover:border-blue-600",
  },
  {
    icon: Target,
    label: "Focus Areas",
    description: "Growth opportunities",
    prompt: "Based on my journal entries, what should I focus on for personal growth?",
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20",
    borderColor: "border-violet-200 dark:border-violet-800",
    hoverBorder: "hover:border-violet-400 dark:hover:border-violet-600",
  },
  {
    icon: Calendar,
    label: "Weekly Summary",
    description: "Themes, highs & lows",
    prompt: "Give me a summary of my week - key themes, emotional highs and lows, and any insights.",
    gradient: "from-cyan-500 to-sky-500",
    bgGradient: "from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    hoverBorder: "hover:border-cyan-400 dark:hover:border-cyan-600",
  },
  {
    icon: Sparkles,
    label: "Hidden Insights",
    description: "What you might've missed",
    prompt: "What insights can you share that I might not have noticed about myself from my journaling?",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
    borderColor: "border-pink-200 dark:border-pink-800",
    hoverBorder: "hover:border-pink-400 dark:hover:border-pink-600",
  },
]

export function QuickPrompts({ onSelect, disabled }: QuickPromptsProps) {
  return (
    <div className="space-y-3 w-full max-w-lg">
      <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider">
        Quick prompts to get started
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {QUICK_PROMPTS.map((item, index) => (
          <button
            key={item.label}
            onClick={() => onSelect(item.prompt)}
            disabled={disabled}
            className={cn(
              "group relative flex flex-col items-start gap-2 p-3 rounded-xl",
              "bg-gradient-to-br", item.bgGradient,
              "border", item.borderColor, item.hoverBorder,
              "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
              "text-left overflow-hidden"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon with gradient background */}
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              "bg-gradient-to-br", item.gradient,
              "shadow-sm group-hover:scale-110 transition-transform duration-300"
            )}>
              <item.icon className="h-4 w-4 text-white" />
            </div>

            {/* Text content */}
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-foreground block">
                {item.label}
              </span>
              <span className="text-[10px] text-muted-foreground line-clamp-1">
                {item.description}
              </span>
            </div>

            {/* Arrow indicator on hover */}
            <ArrowRight className="absolute bottom-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        ))}
      </div>
    </div>
  )
}

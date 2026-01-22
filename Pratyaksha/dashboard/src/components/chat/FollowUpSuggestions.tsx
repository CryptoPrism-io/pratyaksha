import { ArrowRight, Zap, HelpCircle, Lightbulb, BarChart3 } from "lucide-react"
import { cn } from "../../lib/utils"

interface FollowUpSuggestionsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
  context?: "patterns" | "emotions" | "insights" | "general"
}

// Context-aware follow-up suggestions
const FOLLOW_UPS: Record<string, Array<{ icon: React.ElementType; label: string; prompt: string }>> = {
  patterns: [
    { icon: Zap, label: "What triggers these patterns?", prompt: "What situations or triggers seem to activate these patterns?" },
    { icon: Lightbulb, label: "How can I break this cycle?", prompt: "What specific steps can I take to break or improve these patterns?" },
    { icon: BarChart3, label: "Show me the data", prompt: "Can you show me specific entries that demonstrate these patterns?" },
  ],
  emotions: [
    { icon: HelpCircle, label: "Why do I feel this way?", prompt: "What might be the root causes of these emotional patterns?" },
    { icon: Zap, label: "Coping strategies?", prompt: "What coping strategies would work best for these emotional patterns?" },
    { icon: Lightbulb, label: "Positive moments", prompt: "When have I felt most positive and content? What was different?" },
  ],
  insights: [
    { icon: Zap, label: "Dig deeper", prompt: "Can you dig deeper into the most significant insight you shared?" },
    { icon: HelpCircle, label: "What should I do?", prompt: "Based on these insights, what's one thing I should start doing this week?" },
    { icon: BarChart3, label: "Track progress", prompt: "How can I track progress on improving these areas?" },
  ],
  general: [
    { icon: Lightbulb, label: "Tell me more", prompt: "Can you elaborate on that with more specific examples from my entries?" },
    { icon: HelpCircle, label: "What else?", prompt: "What else have you noticed that might be relevant?" },
    { icon: Zap, label: "Action plan", prompt: "Can you create a simple action plan based on this discussion?" },
  ],
}

export function FollowUpSuggestions({ onSelect, disabled, context = "general" }: FollowUpSuggestionsProps) {
  const suggestions = FOLLOW_UPS[context] || FOLLOW_UPS.general

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300 ml-13 pl-[52px]">
      <p className="text-xs text-muted-foreground mb-2">Continue the conversation:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect(item.prompt)}
            disabled={disabled}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
              "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300",
              "border border-violet-200 dark:border-violet-800",
              "hover:bg-violet-100 dark:hover:bg-violet-900/40 hover:border-violet-300 dark:hover:border-violet-700",
              "transition-all duration-200 hover:shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "group"
            )}
          >
            <item.icon className="h-3 w-3" />
            <span>{item.label}</span>
            <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
          </button>
        ))}
      </div>
    </div>
  )
}

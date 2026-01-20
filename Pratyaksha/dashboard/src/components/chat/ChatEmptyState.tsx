import { MessageSquare, BookOpen, Brain, Sparkles, TrendingUp, Heart } from "lucide-react"
import { QuickPrompts } from "./QuickPrompts"
import { useStats } from "../../hooks/useEntries"

interface ChatEmptyStateProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function ChatEmptyState({ onSelect, disabled }: ChatEmptyStateProps) {
  const { data: stats } = useStats()

  return (
    <div className="h-full flex flex-col items-center justify-center py-8 px-4">
      {/* Animated Logo Section */}
      <div className="relative mb-6">
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute inset-2 rounded-full bg-purple-500/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />

        {/* Main icon container */}
        <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-xl shadow-violet-500/25">
          <MessageSquare className="h-10 w-10 text-white" />

          {/* Sparkle decorations */}
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-400 animate-pulse" />
          <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>

      {/* Welcome Text */}
      <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
        Hi! I'm Pratyaksha AI
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        Your personal journal companion. I can help you discover patterns,
        understand emotions, and uncover insights from your reflections.
      </p>

      {/* Context Cards - What AI knows */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-md">
          <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800">
            <BookOpen className="h-5 w-5 text-violet-500 mb-1" />
            <span className="text-lg font-bold text-violet-700 dark:text-violet-300">{stats.totalEntries}</span>
            <span className="text-[10px] text-muted-foreground">Entries</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800">
            <Brain className="h-5 w-5 text-emerald-500 mb-1" />
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{stats.uniqueModes}</span>
            <span className="text-[10px] text-muted-foreground">Moods</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-100 dark:border-rose-800">
            <Heart className="h-5 w-5 text-rose-500 mb-1" />
            <span className="text-lg font-bold text-rose-700 dark:text-rose-300">
              {Math.round((stats.sentimentBreakdown.positive / Math.max(stats.totalEntries, 1)) * 100)}%
            </span>
            <span className="text-[10px] text-muted-foreground">Positive</span>
          </div>
        </div>
      )}

      {/* Capabilities Section */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
        {[
          { icon: TrendingUp, label: "Find patterns" },
          { icon: Brain, label: "Analyze emotions" },
          { icon: Sparkles, label: "Discover insights" },
        ].map((cap) => (
          <div
            key={cap.label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground"
          >
            <cap.icon className="h-3 w-3" />
            {cap.label}
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <QuickPrompts onSelect={onSelect} disabled={disabled} />
    </div>
  )
}

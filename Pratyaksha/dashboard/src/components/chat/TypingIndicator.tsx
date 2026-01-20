import { Bot, Sparkles } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 mr-8 border border-violet-200/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar with pulse effect */}
      <div className="relative flex-shrink-0">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Bot className="h-5 w-5 text-white" />
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-2xl bg-violet-500 animate-ping opacity-20" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
            Pratyaksha AI
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-[10px] font-medium text-violet-600 dark:text-violet-400">
            <Sparkles className="h-2.5 w-2.5 animate-pulse" />
            AI
          </span>
        </div>

        {/* Animated typing dots */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" />
          </div>
          <span className="text-sm text-muted-foreground animate-pulse">
            Analyzing your journal insights...
          </span>
        </div>

        {/* Progress shimmer bar */}
        <div className="h-1 w-32 rounded-full bg-violet-100 dark:bg-violet-900/30 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-violet-400 via-purple-500 to-violet-400 animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

// ChartExplainer - AI-powered chart explanations with popover UI
import { useState } from "react"
import { Brain, Loader2, RefreshCw, X, Sparkles, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { useChartExplainer, type ChartType } from "../../hooks/useChartExplainer"
import { useIsMobile } from "../../hooks/useMediaQuery"

interface ChartExplainerProps {
  chartType: ChartType
  chartData: Record<string, unknown>
  summary?: {
    totalEntries: number
    dateRange: string
    topItems?: string[]
  }
  userContext?: {
    recentModes?: string[]
    dominantEnergy?: string
    streakDays?: number
  }
  className?: string
}

export function ChartExplainer({
  chartType,
  chartData,
  summary,
  userContext,
  className
}: ChartExplainerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const {
    explanation,
    isLoading,
    error,
    isFromCache,
    fetchExplanation,
    clearCache
  } = useChartExplainer({
    chartType,
    chartData,
    summary,
    userContext
  })

  // Fetch explanation when popover opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && !explanation && !isLoading) {
      fetchExplanation()
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    clearCache()
    fetchExplanation()
  }

  // Format explanation with markdown-like styling
  const formatExplanation = (text: string) => {
    // Convert **bold** to styled spans
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center rounded-full p-1.5 sm:p-2",
            "bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
            className
          )}
          aria-label="Get AI explanation for this chart"
        >
          <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "center" : "start"}
        className={cn(
          "w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] overflow-y-auto",
          "p-0 border-violet-200 dark:border-violet-800"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-3 border-b bg-violet-50 dark:bg-violet-950/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="font-medium text-sm">AI Insight</span>
            {isFromCache && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                cached
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {explanation && !isLoading && (
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Refresh explanation"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
              <p className="text-sm text-muted-foreground">Analyzing your patterns...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <p className="text-sm text-muted-foreground text-center">{error}</p>
              <button
                onClick={fetchExplanation}
                className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          )}

          {explanation && !isLoading && (
            <div className="space-y-3">
              {/* Title */}
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                <Brain className="h-4 w-4" />
                <span className="font-medium text-sm">What This Means For You</span>
              </div>

              {/* Explanation text */}
              <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
                {explanation.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{formatExplanation(paragraph)}</p>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 mt-3 border-t flex items-center gap-2 text-[10px] text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>Powered by AI analysis of your journal patterns</span>
              </div>
            </div>
          )}

          {!explanation && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Brain className="h-8 w-8 text-violet-500/50" />
              <p className="text-sm text-muted-foreground text-center">
                Click to get an AI-powered explanation of this chart
              </p>
              <button
                onClick={fetchExplanation}
                className="flex items-center gap-2 text-sm bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Analyze My Patterns
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Compact version for inline use
export function ChartExplainerButton({
  chartType,
  chartData,
  summary,
  userContext,
  label = "AI Insight",
  className
}: ChartExplainerProps & { label?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const {
    explanation,
    isLoading,
    error,
    isFromCache,
    fetchExplanation,
    clearCache
  } = useChartExplainer({
    chartType,
    chartData,
    summary,
    userContext
  })

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && !explanation && !isLoading) {
      fetchExplanation()
    }
  }

  const handleRefresh = () => {
    clearCache()
    fetchExplanation()
  }

  const formatExplanation = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1",
            "bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400",
            "text-xs font-medium transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
            className
          )}
          aria-label="Get AI explanation"
        >
          <Brain className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "center" : "start"}
        className={cn(
          "w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] overflow-y-auto",
          "p-0 border-violet-200 dark:border-violet-800"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-3 border-b bg-violet-50 dark:bg-violet-950/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="font-medium text-sm">AI Insight</span>
            {isFromCache && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                cached
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {explanation && !isLoading && (
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Refresh explanation"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
              <p className="text-sm text-muted-foreground">Analyzing your patterns...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <p className="text-sm text-muted-foreground text-center">{error}</p>
              <button
                onClick={fetchExplanation}
                className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          )}

          {explanation && !isLoading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                <Brain className="h-4 w-4" />
                <span className="font-medium text-sm">What This Means For You</span>
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
                {explanation.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{formatExplanation(paragraph)}</p>
                ))}
              </div>
              <div className="pt-3 mt-3 border-t flex items-center gap-2 text-[10px] text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>Powered by AI analysis of your journal patterns</span>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

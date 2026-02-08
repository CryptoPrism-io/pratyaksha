// Chart Explainer Hook - AI explanations with server-side caching
// Server caches responses in prompt_cache table (PostgreSQL)
import { useState, useCallback } from "react"

export type ChartType =
  | "energyRadar"
  | "modeDistribution"
  | "emotionalTimeline"
  | "contradictionFlow"
  | "themeCloud"
  | "activityCalendar"
  | "dailyRhythm"

interface ChartDataSummary {
  totalEntries: number
  dateRange: string
  topItems?: string[]
}

interface UserContext {
  recentModes?: string[]
  dominantEnergy?: string
  streakDays?: number
}

interface UseChartExplainerOptions {
  chartType: ChartType
  chartData: Record<string, unknown>
  summary?: ChartDataSummary
  userContext?: UserContext
  canAffordKarma?: () => boolean
  spendKarma?: () => boolean
}

interface UseChartExplainerReturn {
  explanation: string | null
  isLoading: boolean
  error: string | null
  isFromCache: boolean
  insufficientKarma: boolean
  fetchExplanation: () => Promise<void>
  clearCache: () => void
}

export function useChartExplainer({
  chartType,
  chartData,
  summary,
  userContext,
  canAffordKarma,
  spendKarma
}: UseChartExplainerOptions): UseChartExplainerReturn {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [insufficientKarma, setInsufficientKarma] = useState(false)

  const fetchExplanation = useCallback(async () => {
    // Check Karma if callback provided
    if (canAffordKarma && !canAffordKarma()) {
      setInsufficientKarma(true)
      setError("Insufficient Karma")
      return
    }

    // Spend Karma before API call
    if (spendKarma) {
      spendKarma()
    }

    setIsLoading(true)
    setError(null)
    setIsFromCache(false)
    setInsufficientKarma(false)

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chartType,
          chartData,
          summary,
          userContext
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to get explanation")
      }

      setExplanation(result.explanation)
      // Server uses prompt_cache — if tokens were 0, it was a cache hit
      setIsFromCache(result.tokensUsed === 0)

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to get explanation"
      setError(errorMessage)
      console.error("[ChartExplainer] Error:", e)
    } finally {
      setIsLoading(false)
    }
  }, [chartType, chartData, summary, userContext])

  const clearCache = useCallback(() => {
    setExplanation(null)
    setIsFromCache(false)
  }, [])

  return {
    explanation,
    isLoading,
    error,
    isFromCache,
    insufficientKarma,
    fetchExplanation,
    clearCache
  }
}

// Utility to clear all explainer caches (now a no-op since server handles caching)
export function clearAllExplainerCaches(): void {
  // Server-side cache is managed via /api/cache/clean endpoint
  // Client-side clearing is no longer needed
}

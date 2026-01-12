// Chart Explainer Hook - AI explanations with localStorage caching
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

interface ExplainerCache {
  explanation: string
  timestamp: number
  dataHash: string
}

interface UseChartExplainerOptions {
  chartType: ChartType
  chartData: Record<string, unknown>
  summary?: ChartDataSummary
  userContext?: UserContext
}

interface UseChartExplainerReturn {
  explanation: string | null
  isLoading: boolean
  error: string | null
  isFromCache: boolean
  fetchExplanation: () => Promise<void>
  clearCache: () => void
}

// Cache TTL: 1 hour
const CACHE_TTL = 60 * 60 * 1000

// Generate a simple hash from chart data for cache key
function generateDataHash(data: Record<string, unknown>): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

// Get cache key for a chart type
function getCacheKey(chartType: ChartType): string {
  return `pratyaksha_explainer_${chartType}`
}

// Read from cache
function readCache(chartType: ChartType, currentDataHash: string): string | null {
  try {
    const key = getCacheKey(chartType)
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const parsed: ExplainerCache = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is expired
    if (now - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }

    // Check if data has changed
    if (parsed.dataHash !== currentDataHash) {
      localStorage.removeItem(key)
      return null
    }

    return parsed.explanation
  } catch {
    return null
  }
}

// Write to cache
function writeCache(chartType: ChartType, explanation: string, dataHash: string): void {
  try {
    const key = getCacheKey(chartType)
    const cache: ExplainerCache = {
      explanation,
      timestamp: Date.now(),
      dataHash
    }
    localStorage.setItem(key, JSON.stringify(cache))
  } catch (e) {
    console.warn("[ChartExplainer] Failed to write to cache:", e)
  }
}

// Clear cache for a chart type
function clearCacheForChart(chartType: ChartType): void {
  try {
    localStorage.removeItem(getCacheKey(chartType))
  } catch {
    // Ignore errors
  }
}

export function useChartExplainer({
  chartType,
  chartData,
  summary,
  userContext
}: UseChartExplainerOptions): UseChartExplainerReturn {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  const fetchExplanation = useCallback(async () => {
    // Generate hash from current data
    const dataHash = generateDataHash(chartData)

    // Check cache first
    const cachedExplanation = readCache(chartType, dataHash)
    if (cachedExplanation) {
      setExplanation(cachedExplanation)
      setIsFromCache(true)
      setError(null)
      return
    }

    // Fetch from API
    setIsLoading(true)
    setError(null)
    setIsFromCache(false)

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

      // Cache the result
      writeCache(chartType, result.explanation, dataHash)
      setExplanation(result.explanation)

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to get explanation"
      setError(errorMessage)
      console.error("[ChartExplainer] Error:", e)
    } finally {
      setIsLoading(false)
    }
  }, [chartType, chartData, summary, userContext])

  const clearCache = useCallback(() => {
    clearCacheForChart(chartType)
    setExplanation(null)
    setIsFromCache(false)
  }, [chartType])

  return {
    explanation,
    isLoading,
    error,
    isFromCache,
    fetchExplanation,
    clearCache
  }
}

// Utility to clear all explainer caches
export function clearAllExplainerCaches(): void {
  const chartTypes: ChartType[] = [
    "energyRadar",
    "modeDistribution",
    "emotionalTimeline",
    "contradictionFlow",
    "themeCloud",
    "activityCalendar",
    "dailyRhythm"
  ]
  chartTypes.forEach(type => clearCacheForChart(type))
}

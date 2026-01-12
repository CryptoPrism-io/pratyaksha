// Chart Explainer Route - AI-powered chart explanations
import { Request, Response } from "express"
import { callOpenRouter, MODELS } from "../lib/openrouter"
import {
  ChartType,
  ChartDataContext,
  getExplainerPrompt,
  generateUserPrompt
} from "../lib/explainerPrompts"

interface ExplainRequest {
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
}

interface ExplainerOutput {
  explanation: string
}

interface ExplainResponse {
  success: boolean
  explanation?: string
  chartType?: ChartType
  tokensUsed?: number
  error?: string
}

export async function explainChart(
  req: Request<object, object, ExplainRequest>,
  res: Response<ExplainResponse>
) {
  const { chartType, chartData, summary, userContext } = req.body

  // Validate chart type
  const validChartTypes: ChartType[] = [
    "energyRadar",
    "modeDistribution",
    "emotionalTimeline",
    "contradictionFlow",
    "themeCloud",
    "activityCalendar",
    "dailyRhythm"
  ]

  if (!chartType || !validChartTypes.includes(chartType)) {
    return res.status(400).json({
      success: false,
      error: `Invalid chart type. Must be one of: ${validChartTypes.join(", ")}`
    })
  }

  if (!chartData || typeof chartData !== "object") {
    return res.status(400).json({
      success: false,
      error: "chartData is required and must be an object"
    })
  }

  try {
    console.log(`[Explainer] Generating explanation for ${chartType}...`)

    // Get the prompt configuration
    const promptConfig = getExplainerPrompt(chartType)
    if (!promptConfig) {
      return res.status(400).json({
        success: false,
        error: `No prompt configuration found for chart type: ${chartType}`
      })
    }

    // Build the data context
    const dataContext: ChartDataContext = {
      chartData,
      summary,
      userContext
    }

    // Generate the user prompt
    const userPrompt = generateUserPrompt(chartType, dataContext)
    if (!userPrompt) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate user prompt"
      })
    }

    // Call OpenRouter with the chart-specific prompts
    const response = await callOpenRouter<ExplainerOutput>(
      userPrompt,
      MODELS.CHEAP, // gpt-4o-mini for cost efficiency
      promptConfig.systemPrompt,
      {
        maxTokens: 600,
        temperature: 0.7 // Slightly more creative for explanations
      }
    )

    console.log(`[Explainer] Generated explanation for ${chartType} (${response.tokens} tokens)`)

    return res.json({
      success: true,
      explanation: response.data.explanation,
      chartType,
      tokensUsed: response.tokens
    })

  } catch (error) {
    console.error("[Explainer] Error:", error)

    // Handle OpenRouter API key missing
    if (error instanceof Error && error.message.includes("OPENROUTER_API_KEY")) {
      return res.status(503).json({
        success: false,
        error: "AI service not configured. Please set up your OpenRouter API key."
      })
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate explanation"
    })
  }
}

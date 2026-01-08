// OpenRouter API Client
// https://openrouter.ai/docs

export interface OpenRouterResponse {
  id: string
  choices: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AgentResponse<T> {
  data: T
  tokens: number
  model: string
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

// Model options - using GPT models for better performance
export const MODELS = {
  CHEAP: "openai/gpt-4o-mini", // Fast, cheap, good for simple classification
  BALANCED: "openai/gpt-4o", // Best balance of speed and quality
  QUALITY: "openai/gpt-4o", // Same as balanced, GPT-4o is excellent
} as const

export interface CallOptions {
  maxTokens?: number
  temperature?: number
}

export async function callOpenRouter<T>(
  prompt: string,
  model: string = MODELS.CHEAP,
  systemPrompt?: string,
  options?: CallOptions
): Promise<AgentResponse<T>> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set")
  }

  const messages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    { role: "user", content: prompt },
  ]

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://pratyaksha.app",
      "X-Title": "Pratyaksha Cognitive Journal",
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: options?.temperature ?? 0.3, // Lower for more consistent outputs
      max_tokens: options?.maxTokens ?? 500,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  const result: OpenRouterResponse = await response.json()

  if (!result.choices?.[0]?.message?.content) {
    throw new Error("No response from OpenRouter")
  }

  try {
    const data = JSON.parse(result.choices[0].message.content) as T
    return {
      data,
      tokens: result.usage?.total_tokens || 0,
      model,
    }
  } catch (e) {
    throw new Error(`Failed to parse JSON response: ${result.choices[0].message.content}`)
  }
}

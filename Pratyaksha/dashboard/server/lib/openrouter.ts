// =============================================================================
// BECOMING — LangChain AI Client (replaces raw OpenRouter fetch)
// Uses ChatOpenAI pointed at OpenRouter's endpoint for model routing
// =============================================================================
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages"
import { getCachedResponse, setCachedResponse } from "./cache"

// ── Re-exports for backward compat ──────────────────────────────────────────

export interface AgentResponse<T> {
  data: T
  tokens: number
  model: string
}

export interface CallOptions {
  maxTokens?: number
  temperature?: number
  /** Enable PostgreSQL response cache (default: false) */
  cache?: boolean
  /** Cache TTL in milliseconds (default: 24h for agents, 1h for chat) */
  cacheTtlMs?: number
}

// Model aliases — OpenRouter model IDs
export const MODELS = {
  CHEAP: "openai/gpt-4o-mini",
  BALANCED: "openai/gpt-4o",
  QUALITY: "openai/gpt-4o",
} as const

// ── LangChain model factory ─────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

/** Create a ChatOpenAI instance routed through OpenRouter */
export function getModel(
  modelName: string = MODELS.CHEAP,
  opts?: { maxTokens?: number; temperature?: number }
): ChatOpenAI {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set")
  }

  return new ChatOpenAI({
    modelName,
    temperature: opts?.temperature ?? 0.3,
    maxTokens: opts?.maxTokens ?? 500,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://pratyaksha.app",
        "X-Title": "Pratyaksha Cognitive Journal",
      },
    },
    apiKey: OPENROUTER_API_KEY,
  })
}

// ── callOpenRouter — drop-in replacement using LangChain ────────────────────

/**
 * Call an LLM via LangChain + OpenRouter and parse JSON response.
 * Same signature as the old raw-fetch version so all agents keep working.
 */
export async function callOpenRouter<T>(
  prompt: string,
  model: string = MODELS.CHEAP,
  systemPrompt?: string,
  options?: CallOptions
): Promise<AgentResponse<T>> {
  // Check cache first if enabled
  if (options?.cache) {
    const cached = await getCachedResponse<T>(systemPrompt, prompt, model)
    if (cached) {
      return { data: cached.data, tokens: cached.tokens, model }
    }
  }

  const llm = new ChatOpenAI({
    modelName: model,
    temperature: options?.temperature ?? 0.3,
    maxTokens: options?.maxTokens ?? 500,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://pratyaksha.app",
        "X-Title": "Pratyaksha Cognitive Journal",
      },
    },
    apiKey: OPENROUTER_API_KEY!,
    modelKwargs: { response_format: { type: "json_object" } },
  })

  const messages: BaseMessage[] = []
  if (systemPrompt) {
    messages.push(new SystemMessage(systemPrompt))
  }
  messages.push(new HumanMessage(prompt))

  const result = await llm.invoke(messages)

  const content = typeof result.content === "string"
    ? result.content
    : JSON.stringify(result.content)

  if (!content) {
    throw new Error("No response from LLM")
  }

  // Parse usage metadata
  const usage = result.usage_metadata
  const tokens = (usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0)

  try {
    const data = JSON.parse(content) as T

    // Store in cache if enabled
    if (options?.cache) {
      await setCachedResponse(systemPrompt, prompt, model, data, tokens, options.cacheTtlMs)
    }

    return { data, tokens, model }
  } catch {
    throw new Error(`Failed to parse JSON response: ${content}`)
  }
}

// ── callChat — text (non-JSON) responses for chat / explanations ────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

/**
 * Call an LLM for plain-text (non-JSON) responses.
 * Used by chat route and any future conversational features.
 */
export async function callChat(
  messages: ChatMessage[],
  model: string = MODELS.CHEAP,
  options?: CallOptions
): Promise<{ text: string; tokens: number }> {
  const llm = getModel(model, {
    maxTokens: options?.maxTokens ?? 800,
    temperature: options?.temperature ?? 0.7,
  })

  const langchainMessages: BaseMessage[] = messages.map((m) => {
    switch (m.role) {
      case "system":
        return new SystemMessage(m.content)
      case "user":
        return new HumanMessage(m.content)
      case "assistant":
        return new AIMessage(m.content)
    }
  })

  const result = await llm.invoke(langchainMessages)

  const text = typeof result.content === "string"
    ? result.content
    : JSON.stringify(result.content)

  const usage = result.usage_metadata
  const tokens = (usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0)

  return { text, tokens }
}

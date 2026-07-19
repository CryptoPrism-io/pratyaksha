import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import type { Message, MessageSource } from "../components/chat/ChatMessage"
import { useAuth } from "../contexts/AuthContext"
import { loadLifeBlueprint, getBlueprintForAI, hasBlueprintForAI } from "../lib/lifeBlueprintStorage"
import { loadGamificationState, getCurrentUnlockLevel } from "../lib/gamificationStorage"
import { loadOnboardingProfile } from "../lib/onboardingStorage"
import { apiFetch } from "@/lib/api"
import { DEFAULT_MODE_ID, type ChatModeId } from "../config/chatModes"
import {
  listThreads,
  saveThread,
  deleteThread as removeThread,
  newThreadId,
  deriveTitle,
  type ChatThread,
  type StoredMessage,
} from "../lib/chatStorage"

// UserContext type that matches server's expected format
interface UserContext {
  soulMapping: {
    completedTopics: string[];
    totalCompleted: number;
    currentTier: "surface" | "deep" | "core";
  };
  blueprint: {
    vision: Array<{ text: string; category: string }>;
    antiVision: Array<{ text: string; category: string }>;
    levers: Array<{ name: string; description: string; pushesToward: string }>;
    timeHorizonGoals: {
      sixMonths: string[];
      oneYear: string[];
      threeYears: string[];
      fiveYears: string[];
      tenYears: string[];
    };
    keyReflections: Record<string, string>;
    completedSections: string[];
  };
  profile: {
    displayName: string;
    ageRange: string | null;
    profession: string | null;
    stressLevel: number | null;
    emotionalOpenness: number | null;
    personalGoal: string | null;
    selectedMemoryTopics: string[];
  };
  stats: {
    totalEntries: number;
    streakDays: number;
    karmaPoints: number;
  };
}

/**
 * Build user context from localStorage data for personalized AI chat
 */
function buildUserContext(): UserContext | null {
  try {
    const blueprint = loadLifeBlueprint();
    const gamification = loadGamificationState();
    const profile = loadOnboardingProfile();

    const hasBlueprint = hasBlueprintForAI(blueprint);
    const hasSoulMapping = gamification.completedSoulMappingTopics.length > 0;
    const hasProfile = profile.displayName || profile.personalGoal || profile.stressLevel;

    if (!hasBlueprint && !hasSoulMapping && !hasProfile) {
      return null;
    }

    const blueprintData = getBlueprintForAI(blueprint);

    return {
      soulMapping: {
        completedTopics: gamification.completedSoulMappingTopics,
        totalCompleted: gamification.completedSoulMappingTopics.length,
        currentTier: getCurrentUnlockLevel(gamification.totalEntriesLogged),
      },
      blueprint: blueprintData,
      profile: {
        displayName: profile.displayName || "",
        ageRange: profile.ageRange,
        profession: profile.profession,
        stressLevel: profile.stressLevel,
        emotionalOpenness: profile.emotionalOpenness,
        personalGoal: profile.personalGoal,
        selectedMemoryTopics: profile.selectedMemoryTopics,
      },
      stats: {
        totalEntries: gamification.totalEntriesLogged,
        streakDays: gamification.streakDays,
        karmaPoints: gamification.karma,
      },
    };
  } catch (error) {
    console.error("[useChat] Failed to build user context:", error);
    return null;
  }
}

// ── message <-> storage conversion ──────────────────────────────────────────

function toStored(m: Message): StoredMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp.getTime(),
    sources: m.sources,
    reaction: m.reaction ?? null,
  }
}

function fromStored(m: StoredMessage): Message {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date(m.timestamp),
    sources: m.sources,
    reaction: m.reaction ?? null,
  }
}

interface UseChatOptions {
  onError?: (error: Error) => void
}

export function useChat(options: UseChatOptions = {}) {
  const { user } = useAuth()
  const uid = user?.uid

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)   // waiting for first token
  const [isStreaming, setIsStreaming] = useState(false) // tokens actively arriving
  const [error, setError] = useState<Error | null>(null)
  const [mode, setMode] = useState<ChatModeId>(DEFAULT_MODE_ID)

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [followups, setFollowups] = useState<string[]>([]) // AI-generated next prompts

  const abortRef = useRef<AbortController | null>(null)
  const createdAtRef = useRef<number>(Date.now())

  // keep the latest onError without re-creating sendMessage every render
  const onErrorRef = useRef(options.onError)
  useEffect(() => { onErrorRef.current = options.onError }, [options.onError])

  const userContext = useMemo(() => buildUserContext(), [])

  const refreshThreads = useCallback(() => {
    setThreads(listThreads(uid))
  }, [uid])

  useEffect(() => { refreshThreads() }, [refreshThreads])

  // Persist the current conversation to localStorage.
  const persist = useCallback(
    (msgs: Message[], threadId: string, modeId: ChatModeId) => {
      if (msgs.length === 0) return
      const stored = msgs.map(toStored)
      const thread: ChatThread = {
        id: threadId,
        title: deriveTitle(stored),
        modeId,
        messages: stored,
        createdAt: createdAtRef.current,
        updatedAt: Date.now(),
      }
      saveThread(uid, thread)
      refreshThreads()
    },
    [uid, refreshThreads]
  )

  // Fetch AI-generated follow-up prompts based on the last exchange.
  const fetchFollowups = useCallback(
    async (userMessage: string, assistantMessage: string) => {
      try {
        const res = await apiFetch("/api/chat/followups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(uid ? { "x-firebase-uid": uid } : {}),
          },
          body: JSON.stringify({ userMessage, assistantMessage }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.suggestions)) {
          setFollowups(
            data.suggestions.filter((s: unknown) => typeof s === "string" && s).slice(0, 3)
          )
        }
      } catch {
        /* best-effort — UI falls back to static suggestions */
      }
    },
    [uid]
  )

  // Toggle 👍/👎 on a message and persist it.
  const setReaction = useCallback(
    (messageId: string, reaction: "up" | "down") => {
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === messageId
            ? { ...m, reaction: m.reaction === reaction ? null : reaction }
            : m
        )
        if (activeThreadId) persist(next, activeThreadId, mode)
        return next
      })
    },
    [activeThreadId, mode, persist]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      // Ensure we have a thread id for this conversation.
      let threadId = activeThreadId
      if (!threadId) {
        threadId = newThreadId()
        createdAtRef.current = Date.now()
        setActiveThreadId(threadId)
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      }
      const assistantId = `assistant-${Date.now()}`
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      // History = everything before this exchange (last 10), excluding empties.
      const history = messages
        .filter((m) => m.content.trim().length > 0)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }))

      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setIsLoading(true)
      setIsStreaming(false)
      setError(null)
      setFollowups([])

      const controller = new AbortController()
      abortRef.current = controller

      let assistantText = ""

      const updateAssistant = (updater: (c: string) => string) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: updater(m.content) } : m))
        )
      }
      const setAssistantSources = (sources: MessageSource[]) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, sources } : m))
        )
      }

      try {
        const response = await apiFetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            ...(uid ? { "x-firebase-uid": uid } : {}),
          },
          body: JSON.stringify({
            message: trimmed,
            history,
            userContext,
            mode,
            stream: true,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || `Chat request failed: ${response.status}`)
        }

        if (!response.body) throw new Error("No response stream")

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let gotFirst = false

        // Parse the SSE byte stream into event/data blocks.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const blocks = buffer.split("\n\n")
          buffer = blocks.pop() ?? "" // keep the trailing partial block

          for (const block of blocks) {
            if (!block.trim()) continue
            let event = "message"
            let dataStr = ""
            for (const line of block.split("\n")) {
              if (line.startsWith("event:")) event = line.slice(6).trim()
              else if (line.startsWith("data:")) dataStr += line.slice(5).trim()
            }
            if (!dataStr) continue
            let data: any
            try { data = JSON.parse(dataStr) } catch { continue }

            if (event === "delta" && typeof data.text === "string") {
              if (!gotFirst) {
                gotFirst = true
                setIsLoading(false)
                setIsStreaming(true)
              }
              assistantText += data.text
              updateAssistant((c) => c + data.text)
            } else if (event === "sources" && Array.isArray(data.sources)) {
              setAssistantSources(data.sources as MessageSource[])
            } else if (event === "error") {
              throw new Error(data.error || "Stream error")
            } else if (event === "done") {
              if (typeof data.response === "string" && data.response.length > 0) {
                assistantText = data.response
                updateAssistant(() => data.response)
              }
            }
          }
        }

        // Generation completed cleanly — fetch tailored follow-up prompts
        // (best-effort; the UI falls back to static suggestions on failure).
        if (assistantText.trim().length > 0) {
          void fetchFollowups(trimmed, assistantText)
        }
      } catch (err) {
        const isAbort = err instanceof DOMException && err.name === "AbortError"
        if (isAbort) {
          // User stopped generation — keep whatever streamed so far.
          updateAssistant((c) => c || "_(stopped)_")
        } else {
          const e = err instanceof Error ? err : new Error("Unknown error")
          setError(e)
          onErrorRef.current?.(e)
          // Drop the empty assistant bubble on hard failure.
          setMessages((prev) => prev.filter((m) => !(m.id === assistantId && m.content === "")))
        }
      } finally {
        setIsLoading(false)
        setIsStreaming(false)
        abortRef.current = null
        // Persist the final state.
        setMessages((prev) => {
          persist(prev, threadId!, mode)
          return prev
        })
      }
    },
    [messages, activeThreadId, uid, userContext, mode, persist, fetchFollowups]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const newChat = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setActiveThreadId(null)
    setError(null)
    setFollowups([])
    createdAtRef.current = Date.now()
  }, [])

  const loadThread = useCallback(
    (id: string) => {
      const thread = listThreads(uid).find((t) => t.id === id)
      if (!thread) return
      abortRef.current?.abort()
      setMessages(thread.messages.map(fromStored))
      setActiveThreadId(thread.id)
      setMode(thread.modeId ?? DEFAULT_MODE_ID)
      createdAtRef.current = thread.createdAt
      setError(null)
      setFollowups([])
    },
    [uid]
  )

  const deleteThread = useCallback(
    (id: string) => {
      removeThread(uid, id)
      refreshThreads()
      if (id === activeThreadId) newChat()
    },
    [uid, activeThreadId, refreshThreads, newChat]
  )

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    mode,
    setMode,
    sendMessage,
    stop,
    newChat,
    // feedback + follow-ups
    setReaction,
    followups,
    // thread history
    threads,
    activeThreadId,
    loadThread,
    deleteThread,
    // back-compat alias
    clearMessages: newChat,
  }
}

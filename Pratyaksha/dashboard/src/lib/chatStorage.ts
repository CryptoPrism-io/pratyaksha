// =============================================================================
// Chat thread persistence (localStorage).
// Threads are namespaced per Firebase uid so multiple accounts on one browser
// don't mix. Messages store timestamps as epoch ms; the UI rehydrates to Date.
// =============================================================================
import type { ChatModeId } from "../config/chatModes"

export interface StoredMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface ChatThread {
  id: string
  title: string
  modeId: ChatModeId
  messages: StoredMessage[]
  createdAt: number
  updatedAt: number
}

const KEY_PREFIX = "becoming_chat_threads_v1"
const MAX_THREADS = 50

function keyFor(uid: string | undefined): string {
  return `${KEY_PREFIX}::${uid || "anon"}`
}

function safeParse(raw: string | null): ChatThread[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? (data as ChatThread[]) : []
  } catch {
    return []
  }
}

/** All threads for a user, newest-updated first. */
export function listThreads(uid: string | undefined): ChatThread[] {
  const threads = safeParse(localStorage.getItem(keyFor(uid)))
  return threads.sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getThread(uid: string | undefined, id: string): ChatThread | undefined {
  return listThreads(uid).find((t) => t.id === id)
}

/** Insert or update a thread, trimming to MAX_THREADS. Skips empty threads. */
export function saveThread(uid: string | undefined, thread: ChatThread): void {
  if (thread.messages.length === 0) return
  const others = listThreads(uid).filter((t) => t.id !== thread.id)
  const next = [thread, ...others]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_THREADS)
  try {
    localStorage.setItem(keyFor(uid), JSON.stringify(next))
  } catch {
    // Quota exceeded — drop the oldest half and retry once.
    try {
      localStorage.setItem(keyFor(uid), JSON.stringify(next.slice(0, Math.ceil(MAX_THREADS / 2))))
    } catch {
      /* give up silently — persistence is best-effort */
    }
  }
}

export function deleteThread(uid: string | undefined, id: string): void {
  const next = listThreads(uid).filter((t) => t.id !== id)
  localStorage.setItem(keyFor(uid), JSON.stringify(next))
}

export function newThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Derive a short title from the first user message. */
export function deriveTitle(messages: StoredMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user")
  if (!firstUser) return "New conversation"
  const clean = firstUser.content.replace(/\s+/g, " ").trim()
  return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean || "New conversation"
}

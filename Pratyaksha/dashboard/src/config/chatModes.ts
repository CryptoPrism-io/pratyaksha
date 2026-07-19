// =============================================================================
// Chat mode display metadata for the picker.
// The AUTHORITATIVE config (models + system prompts) lives on the backend at
// server/config/chatModes.ts. This file only holds what the UI needs to render
// the picker; the frontend just sends the mode `id` to /api/chat.
// Ids MUST match the backend ids.
// =============================================================================
import { Sparkles, Compass, Gem, type LucideIcon } from "lucide-react"

export type ChatModeId = "mirror" | "guide" | "sage"

export interface ChatModeMeta {
  id: ChatModeId
  label: string
  tagline: string
  icon: LucideIcon
  /** Tailwind gradient for the avatar/active state. */
  gradient: string
  /** Short blurb shown in the picker menu. */
  blurb: string
}

export const CHAT_MODES: ChatModeMeta[] = [
  {
    id: "mirror",
    label: "Mirror",
    tagline: "Warm & reflective",
    icon: Sparkles,
    gradient: "from-violet-500 via-purple-500 to-violet-600",
    blurb: "Gently reflects your thoughts back so you feel heard. Best for venting and processing.",
  },
  {
    id: "guide",
    label: "Guide",
    tagline: "Insightful & practical",
    icon: Compass,
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    blurb: "Connects patterns to your goals and suggests small next steps. Best for figuring things out.",
  },
  {
    id: "sage",
    label: "Sage",
    tagline: "Deep & challenging",
    icon: Gem,
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    blurb: "Names blind spots and asks the harder questions. Best when you want the truth, not comfort.",
  },
]

export const DEFAULT_MODE_ID: ChatModeId = "mirror"

export function getModeMeta(id: ChatModeId | string | undefined): ChatModeMeta {
  return CHAT_MODES.find((m) => m.id === id) ?? CHAT_MODES[0]
}

// =============================================================================
// Chat mode display metadata for the picker (three deity personas).
// The AUTHORITATIVE config (models + system prompts) lives on the backend at
// server/config/chatModes.ts. This file only holds what the UI needs; the
// frontend sends the mode `id` to /api/chat. Ids MUST match the backend ids.
// =============================================================================
import { ShieldCheck, Feather, Flame, type LucideIcon } from "lucide-react"

export type ChatModeId = "rama" | "krishna" | "shiva"

/** Karma cost key in gamificationStorage.KARMA_COSTS for this persona. */
export type ChatCostKey = "AI_CHAT_RAMA" | "AI_CHAT_KRISHNA" | "AI_CHAT_SHIVA"

export interface ChatModeMeta {
  id: ChatModeId
  label: string
  tagline: string
  icon: LucideIcon
  /** Tailwind gradient for the avatar/active state. */
  gradient: string
  /** Short blurb shown in the picker menu. */
  blurb: string
  /** Karma cost key (Shiva > Krishna > Rama). */
  costKey: ChatCostKey
  /** Persona-specific opening prompts for the empty state. */
  starters: string[]
}

export const CHAT_MODES: ChatModeMeta[] = [
  {
    id: "rama",
    label: "Rama",
    tagline: "Steadiness & dharma",
    icon: ShieldCheck,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    blurb: "Grounds you in your values and helps you keep your word. Best for daily discipline and steadiness.",
    costKey: "AI_CHAT_RAMA",
    starters: [
      "Help me keep a promise I made to myself",
      "I keep slipping on my routine — help me steady it",
      "What's the right next step, true to my values?",
    ],
  },
  {
    id: "krishna",
    label: "Krishna",
    tagline: "Clarity & strategy",
    icon: Feather,
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    blurb: "Cuts through paralysis, reframes, and frees you from outcome-anxiety. Best for decisions and motivation.",
    costKey: "AI_CHAT_KRISHNA",
    starters: [
      "I'm stuck on a decision — help me see clearly",
      "I'm anxious about how this will turn out",
      "Reframe what I've been journaling about",
    ],
  },
  {
    id: "shiva",
    label: "Shiva",
    tagline: "Depth & transformation",
    icon: Flame,
    gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
    blurb: "Meets hard truths, dissolves what no longer serves, and guides stillness. Best for deep inner work.",
    costKey: "AI_CHAT_SHIVA",
    starters: [
      "What am I avoiding facing?",
      "Help me let go of something I'm clinging to",
      "Guide me into a moment of stillness",
    ],
  },
]

export const DEFAULT_MODE_ID: ChatModeId = "rama"

export function getModeMeta(id: ChatModeId | string | undefined): ChatModeMeta {
  return CHAT_MODES.find((m) => m.id === id) ?? CHAT_MODES[0]
}

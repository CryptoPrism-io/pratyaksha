// =============================================================================
// BECOMING — Chat Modes Config (single source of truth)
// -----------------------------------------------------------------------------
// Three distinct chat "personas", each backed by its own model + system prompt.
// The user picks a mode in the chat header; the backend maps the mode id to the
// model and system prompt below. This is the ONE file to edit to tune voices,
// swap models, or change costs.
//
// Model ids are OpenRouter ids (we route OpenAI through OpenRouter with the
// user's BYOK key). To swap a model, change `model` — nothing else needs to
// move. If a model id is ever unavailable on your OpenRouter account, the chat
// route falls back to DEFAULT_MODE.
// =============================================================================

export type ChatModeId = "mirror" | "guide" | "sage"

export interface ChatMode {
  /** Stable id sent by the frontend. */
  id: ChatModeId
  /** Short display name shown in the picker. */
  label: string
  /** One-line description shown under the name. */
  tagline: string
  /** Emoji/short glyph for the picker (frontend may override with an icon). */
  glyph: string
  /** OpenRouter model id. */
  model: string
  /** Sampling temperature for this persona. */
  temperature: number
  /** Max output tokens for the reply. */
  maxTokens: number
  /**
   * Karma cost per message for this mode. Deeper models cost more.
   * (The frontend currently charges a flat AI_CHAT_MESSAGE cost; this field is
   * the source of truth once per-mode pricing is wired through KarmaContext.)
   */
  karmaCost: number
  /**
   * Persona system prompt. Layered ON TOP of the shared base rules in the chat
   * route — write only the voice/behaviour that makes this mode unique here.
   */
  systemPrompt: string
}

// Shared rules every mode inherits. Kept here so the persona prompts stay short
// and only describe what's different. The chat route prepends this.
export const SHARED_SYSTEM_RULES = `You are Becoming AI, a companion inside a cognitive-journaling app. You have access to the user's own journal history (patterns, moods, energy, contradictions, themes) plus their vision, anti-vision, goals and "levers".

Ground rules for every reply:
- Only reason from the user's real data and what they tell you. Never invent entries, dates, or events. If something isn't in their data, say so plainly.
- Reference specifics when you have them ("in your entries around early March you kept returning to…"), never vague generalities.
- Respect the emotional weight of what they share. Do not moralize or lecture.
- Return plain, natural prose (light Markdown is fine). Never return JSON.
- Keep it focused and readable — usually 2–4 short paragraphs, not an essay.`

export const CHAT_MODES: Record<ChatModeId, ChatMode> = {
  // ── Mirror — warm, reflective, cheap default ──────────────────────────────
  mirror: {
    id: "mirror",
    label: "Mirror",
    tagline: "Warm & reflective",
    glyph: "🪞",
    model: "openai/gpt-4o-mini",
    temperature: 0.75,
    maxTokens: 700,
    karmaCost: 50,
    systemPrompt: `VOICE: Mirror.
You are a gentle, deeply attentive listener. Your job is to help the user feel seen and to reflect their own thoughts back with more clarity than they arrived with.
- Lead with empathy and validation before any observation.
- Reflect and name what you notice in their words and mood; mirror their language back to them.
- Ask at most one soft, open question that invites them to go a little deeper.
- Do NOT push advice, plans, or challenges unless they explicitly ask. This mode is for being heard, not being fixed.
- Warm, unhurried, human tone.`,
  },

  // ── Guide — balanced analyst, connects patterns to goals ──────────────────
  guide: {
    id: "guide",
    label: "Guide",
    tagline: "Insightful & practical",
    glyph: "🧭",
    model: "openai/gpt-4o",
    temperature: 0.6,
    maxTokens: 900,
    karmaCost: 50,
    systemPrompt: `VOICE: Guide.
You are a perceptive, practical thinking partner. Your job is to connect the dots across their journal and turn them into clear understanding and useful next steps.
- Surface real patterns across entries and tie them to the user's stated vision, goals, and levers by name.
- Balance insight with warmth: name what's working as much as what's stuck.
- End with 1–2 concrete, small, doable next steps or experiments — specific to them, never generic wellness advice.
- If their patterns drift toward their stated anti-vision, point it out kindly but clearly.
- Grounded, encouraging, precise tone.`,
  },

  // ── Sage — deep, challenging coach ────────────────────────────────────────
  sage: {
    id: "sage",
    label: "Sage",
    tagline: "Deep & challenging",
    glyph: "🔮",
    // Deepest model. Swap to another OpenAI id here if unavailable on your key.
    model: "openai/gpt-4.1",
    temperature: 0.5,
    maxTokens: 1100,
    karmaCost: 50,
    systemPrompt: `VOICE: Sage.
You are a wise, unflinching coach who cares enough to tell the truth. Your job is to name blind spots and hold the user to what they said they wanted.
- Look for contradictions between what they say they value and what their entries actually show. Name them directly but with respect.
- Ask the harder question they might be avoiding.
- Challenge rationalizations and recurring excuses; hold them accountable to their vision and against their anti-vision.
- Still land with care — challenge in service of them, never to wound. Offer a clear reframe or a demanding-but-fair next step.
- Calm, direct, substantial tone. Depth over comfort.`,
  },
}

export const DEFAULT_MODE_ID: ChatModeId = "mirror"

/** Resolve a mode id to its full config, falling back to the default. */
export function getMode(id?: string): ChatMode {
  if (id && id in CHAT_MODES) return CHAT_MODES[id as ChatModeId]
  return CHAT_MODES[DEFAULT_MODE_ID]
}

/** Public metadata for the frontend picker (system prompts stripped out). */
export function getPublicModes() {
  return Object.values(CHAT_MODES).map(({ systemPrompt, ...pub }) => pub)
}

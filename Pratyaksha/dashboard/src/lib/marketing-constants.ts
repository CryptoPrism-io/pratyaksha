// Brain States
export const STATES = {
  DORMANT: 0,
  CHAOS: 1,
  ORGANIZING: 2,
  ILLUMINATED: 3,
  RADIANT: 4,
} as const

export type BrainState = (typeof STATES)[keyof typeof STATES]

// State Colors (HSL values)
export const STATE_COLORS = {
  [STATES.DORMANT]: { h: 217, s: 91, l: 60, hex: '#3b82f6' },
  [STATES.CHAOS]: { h: 0, s: 84, l: 60, hex: '#ef4444' },
  [STATES.ORGANIZING]: { h: 258, s: 90, l: 66, hex: '#8b5cf6' },
  [STATES.ILLUMINATED]: { h: 43, s: 96, l: 56, hex: '#fbbf24' },
  [STATES.RADIANT]: { h: 0, s: 0, l: 100, hex: '#ffffff' },
} as const

// State Labels for Navbar
export const STATE_LABELS = {
  [STATES.DORMANT]: 'Begin',
  [STATES.CHAOS]: 'Problem',
  [STATES.ORGANIZING]: 'Solution',
  [STATES.ILLUMINATED]: 'Features',
  [STATES.RADIANT]: 'Start',
} as const

// Content for each state
export const STATE_CONTENT = {
  [STATES.DORMANT]: {
    headline: 'See what your mind has been trying to tell you',
    subline: 'Your thoughts hold patterns you\'ve never noticed. Until now.',
    cta: null,
  },
  [STATES.CHAOS]: {
    headline: 'Journaling alone doesn\'t reveal patterns',
    subline: 'You write. You reflect. But the connections stay hidden in the noise.',
    features: [
      'Scattered thoughts across dozens of entries',
      'Recurring themes you can\'t see',
      'Emotional patterns lost in time',
      'Insights buried in chaos',
    ],
  },
  [STATES.ORGANIZING]: {
    headline: 'AI that connects the dots',
    subline: 'Four specialized agents work together to understand your mind.',
    agents: [
      { name: 'Intent Agent', desc: 'Classifies your entry type', icon: 'brain' },
      { name: 'Emotion Agent', desc: 'Analyzes mood & energy', icon: 'heart' },
      { name: 'Theme Agent', desc: 'Extracts patterns & loops', icon: 'tags' },
      { name: 'Insight Agent', desc: 'Generates actions', icon: 'lightbulb' },
    ],
  },
  [STATES.ILLUMINATED]: {
    headline: 'Your mind, visualized',
    subline: '21 ways to see what words alone can\'t show.',
    features: [
      { name: 'Emotional Timeline', desc: 'Track mood over time' },
      { name: 'Energy Radar', desc: 'Multi-dimensional view' },
      { name: 'Contradiction Tracker', desc: 'Internal conflicts' },
      { name: 'Pattern Heatmap', desc: 'Journaling habits' },
    ],
  },
  [STATES.RADIANT]: {
    headline: 'Begin your journey',
    subline: 'Transform raw thoughts into actionable self-insight.',
    cta: 'Start Free',
    secondaryCta: 'Watch Demo',
  },
} as const

// Animation durations (ms)
export const ANIMATION = {
  TEXT_FADE_IN: 600,
  TEXT_FADE_OUT: 400,
  GLOW_TRANSITION: 800,
  VIDEO_SCRUB_EASE: 0.1,
} as const

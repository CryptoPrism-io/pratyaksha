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
    headline: 'Cognitive Logger, Visualized',
    subline: 'Capture thoughts quickly, then see the patterns shaping your focus, mood, and decisions.',
    cta: null,
  },
  [STATES.CHAOS]: {
    headline: 'Logging alone is not enough',
    subline: 'Without pattern visibility, your best insights stay buried in old entries.',
    features: [
      'Scattered thoughts across dozens of entries',
      'Recurring themes you can\'t see',
      'Emotional patterns lost in time',
      'Insights buried in chaos',
    ],
  },
  [STATES.ORGANIZING]: {
    headline: 'AI that connects the dots',
    subline: 'Specialized agents transform raw logs into structured cognitive signals.',
    agents: [
      { name: 'Intent Agent', desc: 'Classifies your entry type', icon: 'brain' },
      { name: 'Emotion Agent', desc: 'Analyzes mood & energy', icon: 'heart' },
      { name: 'Theme Agent', desc: 'Extracts patterns & loops', icon: 'tags' },
      { name: 'Insight Agent', desc: 'Generates actions', icon: 'lightbulb' },
    ],
  },
  [STATES.ILLUMINATED]: {
    headline: 'Your patterns, visualized',
    subline: 'See trends, contradictions, and shifts that text alone cannot reveal.',
    features: [
      { name: 'Emotional Timeline', desc: 'Track mood over time' },
      { name: 'Energy Radar', desc: 'Multi-dimensional view' },
      { name: 'Contradiction Tracker', desc: 'Internal conflicts' },
      { name: 'Pattern Heatmap', desc: 'Journaling habits' },
    ],
  },
  [STATES.RADIANT]: {
    headline: 'Start seeing your patterns',
    subline: 'Turn quick logs into clear insights and better next decisions.',
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

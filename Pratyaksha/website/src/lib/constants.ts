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

// Video paths
export const VIDEOS = {
  [STATES.CHAOS]: '/videos/transition-1.mp4',      // Dormant → Chaos
  [STATES.ORGANIZING]: '/videos/transition-2.mp4', // Chaos → Organizing
  [STATES.ILLUMINATED]: '/videos/transition-3.mp4', // Organizing → Illuminated
  [STATES.RADIANT]: '/videos/transition-4.mp4',    // Illuminated → Radiant
} as const

// Section Phase Types
export type SectionPhase = {
  type: 'text' | 'animation'
  state: BrainState
  transition?: string // t1, t2, t3, t4
}

// New scroll structure: Animation → Text (2 scrolls) → Animation → Text...
// Total scroll divided into animation and text phases
export const SECTION_CONFIG = {
  // Hero text (dormant state, static frame)
  'hero-text': { start: 0, end: 0.12, type: 'text' as const, state: STATES.DORMANT, label: 'Begin' },

  // Animation t1 (dormant → chaos)
  'anim-1': { start: 0.12, end: 0.20, type: 'animation' as const, state: STATES.CHAOS, transition: 't1', label: '' },

  // Problem text (chaos state)
  'problem-text': { start: 0.20, end: 0.32, type: 'text' as const, state: STATES.CHAOS, label: 'Problem' },

  // Animation t2 (chaos → organizing)
  'anim-2': { start: 0.32, end: 0.40, type: 'animation' as const, state: STATES.ORGANIZING, transition: 't2', label: '' },

  // Solution text (organizing state)
  'solution-text': { start: 0.40, end: 0.52, type: 'text' as const, state: STATES.ORGANIZING, label: 'Solution' },

  // Animation t3 (organizing → illuminated)
  'anim-3': { start: 0.52, end: 0.60, type: 'animation' as const, state: STATES.ILLUMINATED, transition: 't3', label: '' },

  // Features text (illuminated state)
  'features-text': { start: 0.60, end: 0.72, type: 'text' as const, state: STATES.ILLUMINATED, label: 'Features' },

  // Animation t4 (illuminated → radiant)
  'anim-4': { start: 0.72, end: 0.80, type: 'animation' as const, state: STATES.RADIANT, transition: 't4', label: '' },

  // CTA text (radiant state)
  'cta-text': { start: 0.80, end: 1.0, type: 'text' as const, state: STATES.RADIANT, label: 'Start' },
} as const

// Legacy scroll mapping for backward compatibility
export const SCROLL_MAPPING = {
  [STATES.DORMANT]: { start: 0, end: 0.2 },
  [STATES.CHAOS]: { start: 0.2, end: 0.4 },
  [STATES.ORGANIZING]: { start: 0.4, end: 0.6 },
  [STATES.ILLUMINATED]: { start: 0.6, end: 0.8 },
  [STATES.RADIANT]: { start: 0.8, end: 1 },
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

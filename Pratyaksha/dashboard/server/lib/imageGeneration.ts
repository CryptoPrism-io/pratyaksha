// Image Generation Style System for Becoming
// Defines the visual language and prompt templates for AI-generated images

/**
 * BECOMING VISUAL STYLE BLOCK
 * This style block is prepended to all image generation prompts
 * to ensure consistent visual identity across all generated images.
 */
export const BECOMING_STYLE_BLOCK = `
MANDATORY STYLE REQUIREMENTS - Follow these exactly:

COLOR PALETTE:
- Primary: Deep teal (#0d9488, #14b8a6) - represents growth, action, forward movement
- Accent: Dusty rose (#be123c, #f43f5e) - represents reflection, awareness, inner work
- Highlight: Warm amber (#d97706, #f59e0b) - represents balance, integration, synthesis
- Background: Warm cream (#faf5f0) for light, deep charcoal (#0a0a0a) for dark

VISUAL THEME - "METAMORPHOSIS":
- Core concept: Transformation, emergence, inner becoming
- Central motif: Moths (NOT butterflies) - they represent night wisdom, subtle beauty, attraction to light
- Supporting motifs: Cocoons, unfurling leaves, dawn light, still water reflections, seeds sprouting

AESTHETIC PRINCIPLES:
- Zen minimalism meets organic growth
- Asymmetric balance with generous negative space
- Soft, diffused lighting - golden hour or pre-dawn quality
- Dreamlike, contemplative mood
- Abstract over literal - suggest rather than show

LIGHTING & ATMOSPHERE:
- Soft golden hour warmth
- Diffused, ethereal quality
- Gentle rim lighting on subjects
- Subtle god rays or light streaks optional

COMPOSITION RULES:
- Rule of thirds with intentional asymmetry
- 40-60% negative space
- Single focal point with supporting elements
- Depth through layered translucency

ABSOLUTELY AVOID:
- Harsh contrasts or neon colors
- Cluttered compositions
- Literal human faces or figures
- Photorealistic style
- Butterflies (use moths instead)
- Corporate or clinical aesthetics
- Text or typography in images
`;

/**
 * Prompt categories for different use cases
 */
export type PromptCategory =
  | "onboarding"
  | "landing"
  | "achievement"
  | "blog"
  | "feature";

/**
 * Image prompt template with category and specific guidance
 */
export interface ImagePrompt {
  category: PromptCategory;
  subject: string;
  mood?: string;
  additionalContext?: string;
}

/**
 * Category-specific style modifiers
 */
const CATEGORY_MODIFIERS: Record<PromptCategory, string> = {
  onboarding: `
    Style: Welcoming, hopeful, intimate
    Scale: Personal, close-up details
    Mood: Encouraging first steps, gentle discovery
    Aspect: Square (1:1) or portrait (3:4)
  `,
  landing: `
    Style: Expansive, inspirational, premium
    Scale: Wider compositions, environmental
    Mood: Aspirational, transformative potential
    Aspect: Wide (16:9) or landscape (4:3)
  `,
  achievement: `
    Style: Celebratory, radiant, affirming
    Scale: Centered focal point with radiating energy
    Mood: Pride, accomplishment, growth realized
    Aspect: Square (1:1)
  `,
  blog: `
    Style: Thoughtful, contemplative, editorial
    Scale: Medium compositions with breathing room
    Mood: Intellectual curiosity, depth
    Aspect: Landscape (16:9) for headers
  `,
  feature: `
    Style: Clean, focused, functional beauty
    Scale: Icon-like or detail-focused
    Mood: Clarity, capability, elegance
    Aspect: Square (1:1) or icon-ready
  `,
};

/**
 * Pre-defined prompt templates for onboarding slides
 */
export const ONBOARDING_PROMPTS: Record<string, ImagePrompt> = {
  welcome: {
    category: "onboarding",
    subject: "A luna moth emerging from its cocoon at dawn, wings catching the first teal and rose light of day",
    mood: "Hope, new beginnings, emergence",
    additionalContext: "The cocoon should be golden/amber, the moth's wings unfurling with dewdrops catching light",
  },
  patterns: {
    category: "onboarding",
    subject: "Abstract flowing lines forming a gentle spiral pattern, representing thoughts becoming visible",
    mood: "Discovery, recognition, patterns emerging from chaos",
    additionalContext: "Lines in teal transitioning to rose, suggesting the journey from confusion to clarity",
  },
  aiPipeline: {
    category: "onboarding",
    subject: "Four luminous orbs in blue, rose, amber, and emerald, connected by gossamer threads of light",
    mood: "Intelligence, collaboration, seamless flow",
    additionalContext: "Orbs floating in misty space, threads suggesting data flowing between them",
  },
  seedEntry: {
    category: "onboarding",
    subject: "A seed cracking open with a tiny green shoot emerging, backlit by warm amber light",
    mood: "Potential, first steps, nurturing beginning",
    additionalContext: "Single seed in rich dark soil, dramatic rim lighting on the emerging sprout",
  },
  privacy: {
    category: "onboarding",
    subject: "A delicate glass dome protecting a glowing moth, surrounded by soft mist",
    mood: "Safety, protection, trust",
    additionalContext: "The dome should feel protective not imprisoning, moth comfortable inside",
  },
  memories: {
    category: "onboarding",
    subject: "Glowing fragments floating like fireflies, some connecting to form constellation patterns",
    mood: "Connection, recognition, meaningful patterns",
    additionalContext: "Warm amber and teal lights against a soft dark background, suggesting memories linking",
  },
  psychContext: {
    category: "onboarding",
    subject: "Concentric ripples in still water with a lotus bud at center, reflecting dawn sky",
    mood: "Depth, self-understanding, layers",
    additionalContext: "The ripples suggest layers of self, the lotus represents emerging clarity",
  },
  features: {
    category: "onboarding",
    subject: "An elegant dashboard interface dissolving into organic flowing lines and nature elements",
    mood: "Technology meeting nature, elegant simplicity",
    additionalContext: "Blend of minimal UI elements with organic vines and leaves, teal accent color",
  },
  commitment: {
    category: "onboarding",
    subject: "Ethereal hands cupping a softly glowing orb of teal light",
    mood: "Promise, dedication, nurturing commitment",
    additionalContext: "Hands should be semi-transparent, abstract - focus on the gentle holding gesture",
  },
  complete: {
    category: "onboarding",
    subject: "A moth in graceful flight leaving a trail of luminous particles, empty cocoon visible below",
    mood: "Freedom, transformation complete, journey beginning",
    additionalContext: "Moth flying upward toward teal light, golden trail, the shed cocoon below as origin",
  },
};

/**
 * Pre-defined prompt templates for landing page
 */
export const LANDING_PROMPTS: Record<string, ImagePrompt> = {
  hero: {
    category: "landing",
    subject: "Vast ethereal landscape at dawn with a single moth ascending toward a horizon of teal and rose light",
    mood: "Infinite possibility, transformation, journey",
    additionalContext: "Misty mountains in silhouette, the moth small but luminous against the sky",
  },
  featureJournaling: {
    category: "feature",
    subject: "An open book with pages transforming into floating leaves and petals",
    mood: "Expression, release, organic growth",
    additionalContext: "Book pages dissolving into nature, teal and rose gradient on the floating elements",
  },
  featureAI: {
    category: "feature",
    subject: "Abstract neural network pattern that resembles tree branches or root systems",
    mood: "Intelligence, organic wisdom, connection",
    additionalContext: "Bioluminescent quality, nodes glowing in brand colors, natural branching patterns",
  },
  featureInsights: {
    category: "feature",
    subject: "A crystal or prism refracting light into a spectrum of teal, rose, and amber rays",
    mood: "Clarity, understanding, revelation",
    additionalContext: "Clean geometric prism shape, soft light beams, sense of enlightenment",
  },
};

/**
 * Achievement/celebration prompt templates
 */
export const ACHIEVEMENT_PROMPTS: Record<string, ImagePrompt> = {
  firstEntry: {
    category: "achievement",
    subject: "A single seedling breaking through soil, bathed in warm light",
    mood: "First step, potential, beginning",
  },
  streak: {
    category: "achievement",
    subject: "A path of glowing stepping stones across still water, leading to distant light",
    mood: "Consistency, progress, momentum",
  },
  levelUp: {
    category: "achievement",
    subject: "A moth with wings transitioning from muted to brilliant colors, mid-transformation",
    mood: "Growth, evolution, power unlocked",
  },
  milestone: {
    category: "achievement",
    subject: "A tree with roots visible underground, showing growth both above and below",
    mood: "Deep growth, foundation, achievement",
  },
};

/**
 * Build a complete prompt from an ImagePrompt object
 */
export function buildPrompt(prompt: ImagePrompt): string {
  const categoryModifier = CATEGORY_MODIFIERS[prompt.category];

  const parts = [
    `Subject: ${prompt.subject}`,
    prompt.mood ? `Emotional Tone: ${prompt.mood}` : "",
    prompt.additionalContext ? `Additional Details: ${prompt.additionalContext}` : "",
    categoryModifier,
  ].filter(Boolean);

  return parts.join("\n\n");
}

/**
 * Get the complete prompt with style block for image generation
 */
export function getCompletePrompt(prompt: ImagePrompt): string {
  return `${BECOMING_STYLE_BLOCK}\n\n---\n\n${buildPrompt(prompt)}`;
}

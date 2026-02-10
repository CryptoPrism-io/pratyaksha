// User Context Builder - Builds AI-ready context from user profile data
// Used by chat API to provide personalized, aligned insights

// ==================== TYPES ====================

export interface UserContext {
  // Soul Mapping - completed topics and any responses
  soulMapping: {
    completedTopics: string[];
    totalCompleted: number;
    currentTier: "surface" | "deep" | "core";
  };

  // Life Blueprint - vision, goals, levers
  blueprint: {
    // Vision items
    vision: Array<{ text: string; category: string }>;
    antiVision: Array<{ text: string; category: string }>;

    // Levers
    levers: Array<{ name: string; description: string; pushesToward: string }>;

    // Time horizon goals
    timeHorizonGoals: {
      sixMonths: string[];
      oneYear: string[];
      threeYears: string[];
      fiveYears: string[];
      tenYears: string[];
    };

    // Reflection responses (key insights)
    keyReflections: Record<string, string>;

    // Metadata
    completedSections: string[];
  };

  // Onboarding Profile
  profile: {
    displayName: string;
    ageRange: string | null;
    profession: string | null;
    stressLevel: number | null; // 1-5
    emotionalOpenness: number | null; // 1-5
    personalGoal: string | null;
    selectedMemoryTopics: string[];
  };

  // Stats for context
  stats: {
    totalEntries: number;
    streakDays: number;
    karmaPoints: number;
  };
}

// ==================== CONTEXT BUILDER ====================

/**
 * Build a formatted prompt section from user context for AI injection
 * Returns markdown-formatted context that can be injected into system prompt
 */
export function buildUserContextPrompt(context: UserContext): string {
  const sections: string[] = [];

  // Header
  sections.push("## USER'S PERSONAL CONTEXT");
  sections.push("The following is deeply personal information the user has shared. Use this to provide personalized, aligned insights.\n");

  // Profile basics
  if (context.profile.displayName || context.profile.profession) {
    sections.push("### Profile");
    if (context.profile.displayName) {
      sections.push(`- Name: ${context.profile.displayName}`);
    }
    if (context.profile.profession) {
      sections.push(`- Profession: ${context.profile.profession}`);
    }
    if (context.profile.ageRange) {
      sections.push(`- Age Range: ${context.profile.ageRange}`);
    }
    sections.push("");
  }

  // Psychological context (adjust tone based on this)
  if (context.profile.stressLevel || context.profile.emotionalOpenness) {
    sections.push("### Psychological Context");
    if (context.profile.stressLevel) {
      const stressDesc = getStressDescription(context.profile.stressLevel);
      sections.push(`- Current Stress Level: ${context.profile.stressLevel}/5 (${stressDesc})`);
    }
    if (context.profile.emotionalOpenness) {
      const opennessDesc = getOpennessDescription(context.profile.emotionalOpenness);
      sections.push(`- Emotional Openness: ${context.profile.emotionalOpenness}/5 (${opennessDesc})`);
    }
    if (context.profile.personalGoal) {
      sections.push(`- Primary Goal: ${context.profile.personalGoal}`);
    }
    sections.push("");
  }

  // Vision (where they want to be)
  if (context.blueprint.vision.length > 0) {
    sections.push("### Vision (Where User Wants to Be)");
    context.blueprint.vision.forEach(v => {
      sections.push(`- [${v.category}] ${v.text}`);
    });
    sections.push("");
  }

  // Anti-Vision (what they want to avoid)
  if (context.blueprint.antiVision.length > 0) {
    sections.push("### Anti-Vision (What User Wants to AVOID)");
    sections.push("*When you see patterns drifting toward these, gently alert the user*");
    context.blueprint.antiVision.forEach(v => {
      sections.push(`- [${v.category}] ${v.text}`);
    });
    sections.push("");
  }

  // Levers (what moves them)
  if (context.blueprint.levers.length > 0) {
    sections.push("### Levers (What Influences Their Direction)");
    context.blueprint.levers.forEach(l => {
      sections.push(`- ${l.name}: ${l.description} (pushes toward ${l.pushesToward})`);
    });
    sections.push("");
  }

  // Time Horizon Goals
  const goals = context.blueprint.timeHorizonGoals;
  const hasGoals = goals.sixMonths.length > 0 || goals.oneYear.length > 0 ||
                   goals.threeYears.length > 0 || goals.fiveYears.length > 0;

  if (hasGoals) {
    sections.push("### Time Horizon Goals");
    if (goals.sixMonths.length > 0) {
      sections.push(`- 6 Months: ${goals.sixMonths.join("; ")}`);
    }
    if (goals.oneYear.length > 0) {
      sections.push(`- 1 Year: ${goals.oneYear.join("; ")}`);
    }
    if (goals.threeYears.length > 0) {
      sections.push(`- 3 Years: ${goals.threeYears.join("; ")}`);
    }
    if (goals.fiveYears.length > 0) {
      sections.push(`- 5 Years: ${goals.fiveYears.join("; ")}`);
    }
    if (goals.tenYears.length > 0) {
      sections.push(`- 10 Years: ${goals.tenYears.join("; ")}`);
    }
    sections.push("");
  }

  // Key Reflections (if any meaningful ones)
  const reflections = Object.entries(context.blueprint.keyReflections);
  if (reflections.length > 0) {
    sections.push("### Key Self-Reflections");
    reflections.slice(0, 10).forEach(([questionId, answer]) => {
      // Only include if answer has substance
      if (answer && answer.length > 20) {
        sections.push(`- ${answer.substring(0, 200)}${answer.length > 200 ? "..." : ""}`);
      }
    });
    sections.push("");
  }

  // Soul Mapping Progress
  if (context.soulMapping.completedTopics.length > 0) {
    sections.push("### Soul Mapping Progress");
    sections.push(`- Completed ${context.soulMapping.totalCompleted} deep self-reflection topics`);
    sections.push(`- Current depth level: ${context.soulMapping.currentTier}`);
    sections.push(`- Topics explored: ${context.soulMapping.completedTopics.join(", ")}`);
    sections.push("");
  }

  // Memory topics of interest
  if (context.profile.selectedMemoryTopics.length > 0) {
    sections.push("### Areas of Focus");
    sections.push(`- Memory topics user wants to explore: ${context.profile.selectedMemoryTopics.join(", ")}`);
    sections.push("");
  }

  // Response guidelines based on context
  sections.push("### Response Guidelines Based on User Context");
  sections.push(generateResponseGuidelines(context));

  return sections.join("\n");
}

/**
 * Generate response guidelines based on user's context
 */
function generateResponseGuidelines(context: UserContext): string {
  const guidelines: string[] = [];

  // Stress-based guidelines
  if (context.profile.stressLevel) {
    if (context.profile.stressLevel >= 4) {
      guidelines.push("- User reports high stress. Be extra gentle and validating. Focus on small wins and manageable steps.");
    } else if (context.profile.stressLevel <= 2) {
      guidelines.push("- User reports low stress. You can be more direct and challenge-oriented if appropriate.");
    }
  }

  // Openness-based guidelines
  if (context.profile.emotionalOpenness) {
    if (context.profile.emotionalOpenness >= 4) {
      guidelines.push("- User is emotionally open. You can explore deeper feelings and patterns.");
    } else if (context.profile.emotionalOpenness <= 2) {
      guidelines.push("- User prefers emotional privacy. Keep responses practical and action-focused.");
    }
  }

  // Goal alignment guidelines
  if (context.blueprint.vision.length > 0 || context.blueprint.antiVision.length > 0) {
    guidelines.push("- When discussing patterns or behaviors, connect them to user's stated vision or anti-vision when relevant.");
  }

  // Time horizon guidelines
  const goals = context.blueprint.timeHorizonGoals;
  if (goals.sixMonths.length > 0) {
    guidelines.push("- User has near-term (6-month) goals. Reference these when discussing immediate priorities.");
  }

  // Anti-vision warning
  if (context.blueprint.antiVision.length > 0) {
    guidelines.push("- If you notice patterns that align with user's anti-vision (what they want to avoid), gently point this out.");
  }

  // Levers (actionable strategies)
  if (context.blueprint.levers.length > 0) {
    guidelines.push("- User has defined specific levers (strategies that work for them). Suggest these levers when giving actionable advice.");
  }

  // Default guidelines
  guidelines.push("- Reference specific goals or values when giving advice.");
  guidelines.push("- Acknowledge progress toward stated vision when you see it.");

  return guidelines.join("\n");
}

/**
 * Get stress level description
 */
function getStressDescription(level: number): string {
  switch (level) {
    case 1: return "Very low stress";
    case 2: return "Manageable stress";
    case 3: return "Moderate stress";
    case 4: return "High stress";
    case 5: return "Very high stress";
    default: return "Unknown";
  }
}

/**
 * Get emotional openness description
 */
function getOpennessDescription(level: number): string {
  switch (level) {
    case 1: return "Prefers privacy";
    case 2: return "Somewhat reserved";
    case 3: return "Moderate openness";
    case 4: return "Open to sharing";
    case 5: return "Very emotionally open";
    default: return "Unknown";
  }
}

/**
 * Build a compact context block for JSON-response agents (intent, emotion, theme, insight).
 * Shorter than buildUserContextPrompt() — skips gamification, streak, karma.
 * Returns empty string if no meaningful context exists.
 */
export function buildAgentContextBlock(context: UserContext): string {
  if (!hasPersonalContext(context)) return "";

  const lines: string[] = [];
  lines.push("--- USER CONTEXT ---");

  if (context.profile.profession) lines.push(`Profession: ${context.profile.profession}`);
  if (context.profile.ageRange) lines.push(`Age range: ${context.profile.ageRange}`);
  if (context.profile.stressLevel) {
    lines.push(`Baseline stress: ${context.profile.stressLevel}/5 (${getStressDescription(context.profile.stressLevel)})`);
  }
  if (context.profile.emotionalOpenness) {
    lines.push(`Emotional openness: ${context.profile.emotionalOpenness}/5 (${getOpennessDescription(context.profile.emotionalOpenness)})`);
  }
  if (context.profile.personalGoal) lines.push(`Primary goal: ${context.profile.personalGoal}`);

  if (context.blueprint.vision.length > 0) {
    const top = context.blueprint.vision.slice(0, 3).map(v => v.text).join("; ");
    lines.push(`Vision: ${top}`);
  }
  if (context.blueprint.antiVision.length > 0) {
    const top = context.blueprint.antiVision.slice(0, 3).map(v => v.text).join("; ");
    lines.push(`Anti-vision (wants to avoid): ${top}`);
  }

  if (context.blueprint.levers.length > 0) {
    const top = context.blueprint.levers.slice(0, 3).map(l => l.name).join("; ");
    lines.push(`Key levers (strategies that work for them): ${top}`);
  }

  const goals = context.blueprint.timeHorizonGoals;
  if (goals.sixMonths.length > 0) {
    lines.push(`6-month goals: ${goals.sixMonths.slice(0, 3).join("; ")}`);
  }

  lines.push("--- END USER CONTEXT ---");
  return lines.join("\n");
}

/**
 * Check if context has meaningful data to include
 */
export function hasPersonalContext(context: UserContext): boolean {
  return (
    context.blueprint.vision.length > 0 ||
    context.blueprint.antiVision.length > 0 ||
    context.blueprint.levers.length > 0 ||
    context.blueprint.timeHorizonGoals.sixMonths.length > 0 ||
    context.blueprint.timeHorizonGoals.oneYear.length > 0 ||
    context.soulMapping.completedTopics.length > 0 ||
    context.profile.personalGoal !== null ||
    Object.keys(context.blueprint.keyReflections).length > 0
  );
}

/**
 * Create an empty/default user context
 */
export function createEmptyUserContext(): UserContext {
  return {
    soulMapping: {
      completedTopics: [],
      totalCompleted: 0,
      currentTier: "surface",
    },
    blueprint: {
      vision: [],
      antiVision: [],
      levers: [],
      timeHorizonGoals: {
        sixMonths: [],
        oneYear: [],
        threeYears: [],
        fiveYears: [],
        tenYears: [],
      },
      keyReflections: {},
      completedSections: [],
    },
    profile: {
      displayName: "",
      ageRange: null,
      profession: null,
      stressLevel: null,
      emotionalOpenness: null,
      personalGoal: null,
      selectedMemoryTopics: [],
    },
    stats: {
      totalEntries: 0,
      streakDays: 0,
      karmaPoints: 0,
    },
  };
}

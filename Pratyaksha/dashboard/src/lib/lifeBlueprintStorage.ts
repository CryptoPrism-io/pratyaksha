// Life Blueprint Storage - Vision, Anti-Vision, Levers, Goals
// localStorage key: pratyaksha-life-blueprint

// ==================== TYPES ====================

export interface LifeBlueprint {
  // Vision - Where user wants to be
  vision: VisionItem[];

  // Anti-Vision - What user wants to avoid
  antiVision: VisionItem[];

  // Levers - Factors that move between vision and anti-vision
  levers: Lever[];

  // Goals
  shortTermGoals: Goal[];
  longTermGoals: Goal[];

  // Question-based responses (new guided system)
  responses: QuestionResponse[];

  // Time horizon goals
  timeHorizonGoals: TimeHorizonGoal[];

  // Metadata
  lastUpdatedAt: string;
  createdAt: string;
  completedSections: string[]; // Track which sections user has completed
}

// Response to a reflection question
export interface QuestionResponse {
  questionId: string;
  answer: string;
  answeredAt: string;
  updatedAt?: string;
}

// Goal linked to a time horizon
export interface TimeHorizonGoal {
  id: string;
  horizon: "6months" | "1year" | "3years" | "5years" | "10years";
  text: string;
  category?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface VisionItem {
  id: string;
  text: string;
  category: VisionCategory;
  createdAt: string;
}

export interface Lever {
  id: string;
  name: string;
  description: string;
  // Which direction does this lever push when activated?
  pushesToward: "vision" | "anti-vision" | "both";
  createdAt: string;
}

export interface Goal {
  id: string;
  text: string;
  category: GoalCategory;
  targetDate?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type VisionCategory =
  | "career"
  | "health"
  | "relationships"
  | "finance"
  | "personal-growth"
  | "lifestyle"
  | "contribution"
  | "other";

export type GoalCategory =
  | "career"
  | "health"
  | "relationships"
  | "finance"
  | "learning"
  | "habits"
  | "projects"
  | "other";

// ==================== CONSTANTS ====================

export const VISION_CATEGORIES: { value: VisionCategory; label: string; icon: string }[] = [
  { value: "career", label: "Career & Work", icon: "Briefcase" },
  { value: "health", label: "Health & Energy", icon: "Heart" },
  { value: "relationships", label: "Relationships", icon: "Users" },
  { value: "finance", label: "Financial", icon: "DollarSign" },
  { value: "personal-growth", label: "Personal Growth", icon: "TrendingUp" },
  { value: "lifestyle", label: "Lifestyle", icon: "Home" },
  { value: "contribution", label: "Contribution & Impact", icon: "Globe" },
  { value: "other", label: "Other", icon: "Star" },
];

export const GOAL_CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: "career", label: "Career" },
  { value: "health", label: "Health" },
  { value: "relationships", label: "Relationships" },
  { value: "finance", label: "Finance" },
  { value: "learning", label: "Learning" },
  { value: "habits", label: "Habits" },
  { value: "projects", label: "Projects" },
  { value: "other", label: "Other" },
];

// ==================== STORAGE ====================

export const LIFE_BLUEPRINT_STORAGE_KEY = "pratyaksha-life-blueprint";

export const DEFAULT_LIFE_BLUEPRINT: LifeBlueprint = {
  vision: [],
  antiVision: [],
  levers: [],
  shortTermGoals: [],
  longTermGoals: [],
  responses: [],
  timeHorizonGoals: [],
  lastUpdatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  completedSections: [],
};

// ==================== STORAGE FUNCTIONS ====================

/**
 * Load life blueprint from localStorage
 */
export function loadLifeBlueprint(): LifeBlueprint {
  if (typeof window === "undefined") return DEFAULT_LIFE_BLUEPRINT;

  try {
    const stored = localStorage.getItem(LIFE_BLUEPRINT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_LIFE_BLUEPRINT, ...parsed };
    }
  } catch (error) {
    console.error("[LifeBlueprint] Failed to load:", error);
  }

  return DEFAULT_LIFE_BLUEPRINT;
}

/**
 * Save life blueprint to localStorage
 */
export function saveLifeBlueprint(blueprint: LifeBlueprint): void {
  if (typeof window === "undefined") return;

  try {
    const updated = {
      ...blueprint,
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LIFE_BLUEPRINT_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("[LifeBlueprint] Failed to save:", error);
  }
}

/**
 * Clear life blueprint data
 */
export function clearLifeBlueprint(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LIFE_BLUEPRINT_STORAGE_KEY);
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add a vision item
 */
export function addVisionItem(
  blueprint: LifeBlueprint,
  type: "vision" | "antiVision",
  text: string,
  category: VisionCategory
): LifeBlueprint {
  const newItem: VisionItem = {
    id: generateId(),
    text,
    category,
    createdAt: new Date().toISOString(),
  };

  return {
    ...blueprint,
    [type]: [...blueprint[type], newItem],
  };
}

/**
 * Remove a vision item
 */
export function removeVisionItem(
  blueprint: LifeBlueprint,
  type: "vision" | "antiVision",
  id: string
): LifeBlueprint {
  return {
    ...blueprint,
    [type]: blueprint[type].filter(item => item.id !== id),
  };
}

/**
 * Add a lever
 */
export function addLever(
  blueprint: LifeBlueprint,
  name: string,
  description: string,
  pushesToward: Lever["pushesToward"]
): LifeBlueprint {
  const newLever: Lever = {
    id: generateId(),
    name,
    description,
    pushesToward,
    createdAt: new Date().toISOString(),
  };

  return {
    ...blueprint,
    levers: [...blueprint.levers, newLever],
  };
}

/**
 * Remove a lever
 */
export function removeLever(blueprint: LifeBlueprint, id: string): LifeBlueprint {
  return {
    ...blueprint,
    levers: blueprint.levers.filter(lever => lever.id !== id),
  };
}

/**
 * Add a goal
 */
export function addGoal(
  blueprint: LifeBlueprint,
  type: "shortTermGoals" | "longTermGoals",
  text: string,
  category: GoalCategory,
  targetDate?: string
): LifeBlueprint {
  const newGoal: Goal = {
    id: generateId(),
    text,
    category,
    targetDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  return {
    ...blueprint,
    [type]: [...blueprint[type], newGoal],
  };
}

/**
 * Toggle goal completion
 */
export function toggleGoalComplete(
  blueprint: LifeBlueprint,
  type: "shortTermGoals" | "longTermGoals",
  id: string
): LifeBlueprint {
  return {
    ...blueprint,
    [type]: blueprint[type].map(goal =>
      goal.id === id
        ? {
            ...goal,
            completed: !goal.completed,
            completedAt: !goal.completed ? new Date().toISOString() : undefined,
          }
        : goal
    ),
  };
}

/**
 * Remove a goal
 */
export function removeGoal(
  blueprint: LifeBlueprint,
  type: "shortTermGoals" | "longTermGoals",
  id: string
): LifeBlueprint {
  return {
    ...blueprint,
    [type]: blueprint[type].filter(goal => goal.id !== id),
  };
}

/**
 * Get blueprint summary for AI context
 */
export function getBlueprintSummary(blueprint: LifeBlueprint): string {
  const sections: string[] = [];

  if (blueprint.vision.length > 0) {
    sections.push("## Vision (Where I want to be)");
    blueprint.vision.forEach(v => {
      sections.push(`- [${v.category}] ${v.text}`);
    });
  }

  if (blueprint.antiVision.length > 0) {
    sections.push("\n## Anti-Vision (What I'm avoiding)");
    blueprint.antiVision.forEach(v => {
      sections.push(`- [${v.category}] ${v.text}`);
    });
  }

  if (blueprint.levers.length > 0) {
    sections.push("\n## Levers (What influences my direction)");
    blueprint.levers.forEach(l => {
      sections.push(`- ${l.name}: ${l.description} (pushes toward ${l.pushesToward})`);
    });
  }

  if (blueprint.shortTermGoals.length > 0) {
    sections.push("\n## Short-term Goals");
    blueprint.shortTermGoals.forEach(g => {
      const status = g.completed ? "✓" : "○";
      sections.push(`- ${status} [${g.category}] ${g.text}`);
    });
  }

  if (blueprint.longTermGoals.length > 0) {
    sections.push("\n## Long-term Goals");
    blueprint.longTermGoals.forEach(g => {
      const status = g.completed ? "✓" : "○";
      sections.push(`- ${status} [${g.category}] ${g.text}`);
    });
  }

  return sections.join("\n");
}

/**
 * Check if blueprint has any content
 */
export function hasContent(blueprint: LifeBlueprint): boolean {
  return (
    blueprint.vision.length > 0 ||
    blueprint.antiVision.length > 0 ||
    blueprint.levers.length > 0 ||
    blueprint.shortTermGoals.length > 0 ||
    blueprint.longTermGoals.length > 0 ||
    blueprint.responses.length > 0 ||
    blueprint.timeHorizonGoals.length > 0
  );
}

// ==================== QUESTION RESPONSE FUNCTIONS ====================

/**
 * Save or update a question response
 */
export function saveQuestionResponse(
  blueprint: LifeBlueprint,
  questionId: string,
  answer: string
): LifeBlueprint {
  const existingIndex = blueprint.responses.findIndex(r => r.questionId === questionId);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    // Update existing response
    const updated = [...blueprint.responses];
    updated[existingIndex] = {
      ...updated[existingIndex],
      answer,
      updatedAt: now,
    };
    return { ...blueprint, responses: updated };
  } else {
    // Add new response
    return {
      ...blueprint,
      responses: [
        ...blueprint.responses,
        { questionId, answer, answeredAt: now },
      ],
    };
  }
}

/**
 * Get response for a question
 */
export function getQuestionResponse(
  blueprint: LifeBlueprint,
  questionId: string
): string | undefined {
  return blueprint.responses.find(r => r.questionId === questionId)?.answer;
}

/**
 * Mark a section as completed
 */
export function markSectionCompleted(
  blueprint: LifeBlueprint,
  sectionId: string
): LifeBlueprint {
  if (blueprint.completedSections.includes(sectionId)) {
    return blueprint;
  }
  return {
    ...blueprint,
    completedSections: [...blueprint.completedSections, sectionId],
  };
}

/**
 * Check if a section is completed
 */
export function isSectionCompleted(
  blueprint: LifeBlueprint,
  sectionId: string
): boolean {
  return blueprint.completedSections.includes(sectionId);
}

// ==================== TIME HORIZON GOAL FUNCTIONS ====================

/**
 * Add a time horizon goal
 */
export function addTimeHorizonGoal(
  blueprint: LifeBlueprint,
  horizon: TimeHorizonGoal["horizon"],
  text: string,
  category?: string
): LifeBlueprint {
  const newGoal: TimeHorizonGoal = {
    id: generateId(),
    horizon,
    text,
    category,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  return {
    ...blueprint,
    timeHorizonGoals: [...blueprint.timeHorizonGoals, newGoal],
  };
}

/**
 * Toggle time horizon goal completion
 */
export function toggleTimeHorizonGoal(
  blueprint: LifeBlueprint,
  id: string
): LifeBlueprint {
  return {
    ...blueprint,
    timeHorizonGoals: blueprint.timeHorizonGoals.map(goal =>
      goal.id === id
        ? {
            ...goal,
            completed: !goal.completed,
            completedAt: !goal.completed ? new Date().toISOString() : undefined,
          }
        : goal
    ),
  };
}

/**
 * Remove time horizon goal
 */
export function removeTimeHorizonGoal(
  blueprint: LifeBlueprint,
  id: string
): LifeBlueprint {
  return {
    ...blueprint,
    timeHorizonGoals: blueprint.timeHorizonGoals.filter(g => g.id !== id),
  };
}

/**
 * Get goals for a specific time horizon
 */
export function getGoalsByHorizon(
  blueprint: LifeBlueprint,
  horizon: TimeHorizonGoal["horizon"]
): TimeHorizonGoal[] {
  return blueprint.timeHorizonGoals.filter(g => g.horizon === horizon);
}

/**
 * Get completion stats for guided blueprint
 */
export function getBlueprintCompletionStats(blueprint: LifeBlueprint): {
  totalQuestions: number;
  answeredQuestions: number;
  percentage: number;
  completedSections: number;
  totalSections: number;
} {
  // Import would create circular dependency, so we use rough counts
  const totalSections = 6; // 6 life categories
  const totalQuestionsPerSection = 5; // Approximate average
  const totalQuestions = totalSections * totalQuestionsPerSection;
  const answeredQuestions = blueprint.responses.length;

  return {
    totalQuestions,
    answeredQuestions,
    percentage: Math.round((answeredQuestions / totalQuestions) * 100),
    completedSections: blueprint.completedSections.length,
    totalSections,
  };
}

// ==================== AI CONTEXT HELPERS ====================

/**
 * Get blueprint data formatted for AI context
 * Returns a structure that can be sent to the chat API
 */
export interface BlueprintForAI {
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
}

export function getBlueprintForAI(blueprint: LifeBlueprint): BlueprintForAI {
  // Extract vision items
  const vision = blueprint.vision.map(v => ({
    text: v.text,
    category: v.category,
  }));

  // Extract anti-vision items
  const antiVision = blueprint.antiVision.map(v => ({
    text: v.text,
    category: v.category,
  }));

  // Extract levers
  const levers = blueprint.levers.map(l => ({
    name: l.name,
    description: l.description,
    pushesToward: l.pushesToward,
  }));

  // Group time horizon goals
  const timeHorizonGoals = {
    sixMonths: blueprint.timeHorizonGoals
      .filter(g => g.horizon === "6months" && !g.completed)
      .map(g => g.text),
    oneYear: blueprint.timeHorizonGoals
      .filter(g => g.horizon === "1year" && !g.completed)
      .map(g => g.text),
    threeYears: blueprint.timeHorizonGoals
      .filter(g => g.horizon === "3years" && !g.completed)
      .map(g => g.text),
    fiveYears: blueprint.timeHorizonGoals
      .filter(g => g.horizon === "5years" && !g.completed)
      .map(g => g.text),
    tenYears: blueprint.timeHorizonGoals
      .filter(g => g.horizon === "10years" && !g.completed)
      .map(g => g.text),
  };

  // Extract key reflections (questionId -> answer map)
  const keyReflections: Record<string, string> = {};
  blueprint.responses.forEach(r => {
    // Only include substantive answers
    if (r.answer && r.answer.length > 10) {
      keyReflections[r.questionId] = r.answer;
    }
  });

  return {
    vision,
    antiVision,
    levers,
    timeHorizonGoals,
    keyReflections,
    completedSections: blueprint.completedSections,
  };
}

/**
 * Check if blueprint has any meaningful data for AI
 */
export function hasBlueprintForAI(blueprint: LifeBlueprint): boolean {
  return (
    blueprint.vision.length > 0 ||
    blueprint.antiVision.length > 0 ||
    blueprint.levers.length > 0 ||
    blueprint.timeHorizonGoals.length > 0 ||
    blueprint.responses.length > 0
  );
}

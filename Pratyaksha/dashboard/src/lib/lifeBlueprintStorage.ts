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

  // Metadata
  lastUpdatedAt: string;
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
  lastUpdatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
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
    blueprint.longTermGoals.length > 0
  );
}

// Smart Prompts Generator
// Generates personalized journal prompts based on Life Blueprint and recent entries

import type { Entry } from "./transforms";
import type { LifeBlueprint, VisionCategory, TimeHorizonGoal } from "./lifeBlueprintStorage";
import type { GamificationState } from "./gamificationStorage";

// ==================== TYPES ====================

export interface SmartPrompt {
  id: string;
  text: string;
  type: "goal-check" | "missing-area" | "lever-reminder" | "anti-vision-check" | "soul-mapping" | "time-horizon";
  priority: "high" | "medium" | "low";
  relatedGoal?: string;
  relatedCategory?: VisionCategory;
  icon?: string;
  dismissedAt?: string;
}

export interface SmartPromptConfig {
  maxPrompts?: number;
  includeGoalChecks?: boolean;
  includeMissingAreas?: boolean;
  includeLeverReminders?: boolean;
  includeAntiVisionChecks?: boolean;
  includeSoulMapping?: boolean;
  includeTimeHorizon?: boolean;
}

// Storage key for dismissed prompts
export const DISMISSED_PROMPTS_KEY = "pratyaksha-dismissed-prompts";

// ==================== PROMPT GENERATOR ====================

/**
 * Generate personalized smart prompts based on user's Life Blueprint and recent activity
 */
export function generateSmartPrompts(
  blueprint: LifeBlueprint,
  recentEntries: Entry[],
  gamification: GamificationState,
  config: SmartPromptConfig = {}
): SmartPrompt[] {
  const {
    maxPrompts = 5,
    includeGoalChecks = true,
    includeMissingAreas = true,
    includeLeverReminders = true,
    includeAntiVisionChecks = true,
    includeSoulMapping = true,
    includeTimeHorizon = true
  } = config;

  const prompts: SmartPrompt[] = [];
  const dismissedIds = loadDismissedPrompts();

  // Get entries from last 7 days for recency check
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentWeekEntries = recentEntries.filter(e => new Date(e.date) >= sevenDaysAgo);

  // Extract themes and keywords from recent entries
  const recentThemes = new Set<string>();
  const recentText = recentWeekEntries.map(e => e.text?.toLowerCase() || "").join(" ");
  recentWeekEntries.forEach(e => {
    e.themeTagsAI?.forEach(t => recentThemes.add(t.toLowerCase()));
  });

  // 1. Goal Check Prompts (check if goal not mentioned recently)
  if (includeGoalChecks) {
    const goalPrompts = generateGoalCheckPrompts(blueprint, recentText, recentThemes, dismissedIds);
    prompts.push(...goalPrompts);
  }

  // 2. Missing Area Prompts (vision categories not journaled about)
  if (includeMissingAreas) {
    const missingPrompts = generateMissingAreaPrompts(blueprint, recentWeekEntries, dismissedIds);
    prompts.push(...missingPrompts);
  }

  // 3. Lever Reminder Prompts (positive levers not activated)
  if (includeLeverReminders) {
    const leverPrompts = generateLeverPrompts(blueprint, recentText, dismissedIds);
    prompts.push(...leverPrompts);
  }

  // 4. Anti-Vision Check Prompts (when patterns match anti-vision)
  if (includeAntiVisionChecks) {
    const antiVisionPrompts = generateAntiVisionPrompts(blueprint, recentEntries, dismissedIds);
    prompts.push(...antiVisionPrompts);
  }

  // 5. Soul Mapping Continuation Prompts
  if (includeSoulMapping) {
    const soulMappingPrompts = generateSoulMappingPrompts(gamification, dismissedIds);
    prompts.push(...soulMappingPrompts);
  }

  // 6. Time Horizon Goal Prompts
  if (includeTimeHorizon) {
    const timeHorizonPrompts = generateTimeHorizonPrompts(blueprint, recentText, dismissedIds);
    prompts.push(...timeHorizonPrompts);
  }

  // Sort by priority and limit
  return prompts
    .filter(p => !dismissedIds.has(p.id))
    .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority))
    .slice(0, maxPrompts);
}

// ==================== PROMPT GENERATORS ====================

function generateGoalCheckPrompts(
  blueprint: LifeBlueprint,
  recentText: string,
  recentThemes: Set<string>,
  dismissedIds: Set<string>
): SmartPrompt[] {
  const prompts: SmartPrompt[] = [];

  // Check short-term goals
  blueprint.shortTermGoals.filter(g => !g.completed).forEach(goal => {
    const keywords = extractKeywords(goal.text);
    const isMentioned = keywords.some(kw =>
      recentText.includes(kw) || [...recentThemes].some(t => t.includes(kw))
    );

    if (!isMentioned) {
      const promptId = `goal-${goal.id}`;
      if (!dismissedIds.has(promptId)) {
        prompts.push({
          id: promptId,
          text: `How's your progress on "${truncate(goal.text, 50)}"?`,
          type: "goal-check",
          priority: "high",
          relatedGoal: goal.text,
          relatedCategory: goal.category,
          icon: "Target"
        });
      }
    }
  });

  return prompts.slice(0, 2); // Max 2 goal check prompts
}

function generateMissingAreaPrompts(
  blueprint: LifeBlueprint,
  recentEntries: Entry[],
  dismissedIds: Set<string>
): SmartPrompt[] {
  const prompts: SmartPrompt[] = [];

  // Get categories from vision
  const visionCategories = new Set(blueprint.vision.map(v => v.category));

  // Check which categories have entries
  const categoriesWithEntries = new Set<string>();
  recentEntries.forEach(entry => {
    const text = entry.text?.toLowerCase() || "";
    const themes = entry.themeTagsAI || [];

    CATEGORY_KEYWORDS.forEach((keywords, category) => {
      if (keywords.some(kw => text.includes(kw) || themes.some(t => t.toLowerCase().includes(kw)))) {
        categoriesWithEntries.add(category);
      }
    });
  });

  // Find missing categories that are in user's vision
  visionCategories.forEach(category => {
    if (!categoriesWithEntries.has(category)) {
      const promptId = `missing-${category}`;
      if (!dismissedIds.has(promptId)) {
        const categoryLabel = CATEGORY_LABELS[category] || category;
        prompts.push({
          id: promptId,
          text: `You haven't journaled about ${categoryLabel.toLowerCase()} this week. How's that area of life?`,
          type: "missing-area",
          priority: "medium",
          relatedCategory: category,
          icon: "Compass"
        });
      }
    }
  });

  return prompts.slice(0, 2); // Max 2 missing area prompts
}

function generateLeverPrompts(
  blueprint: LifeBlueprint,
  recentText: string,
  dismissedIds: Set<string>
): SmartPrompt[] {
  const prompts: SmartPrompt[] = [];

  // Find positive levers not mentioned
  const positiveLevers = blueprint.levers.filter(l => l.pushesToward === "vision");

  positiveLevers.forEach(lever => {
    const keywords = extractKeywords(lever.name + " " + lever.description);
    const isMentioned = keywords.some(kw => recentText.includes(kw));

    if (!isMentioned) {
      const promptId = `lever-${lever.id}`;
      if (!dismissedIds.has(promptId)) {
        prompts.push({
          id: promptId,
          text: `"${lever.name}" helps you move forward. When did you last engage with it?`,
          type: "lever-reminder",
          priority: "low",
          relatedGoal: lever.description,
          icon: "Zap"
        });
      }
    }
  });

  return prompts.slice(0, 1); // Max 1 lever prompt
}

function generateAntiVisionPrompts(
  blueprint: LifeBlueprint,
  recentEntries: Entry[],
  dismissedIds: Set<string>
): SmartPrompt[] {
  const prompts: SmartPrompt[] = [];

  // Check if recent entries have negative sentiment patterns
  const recentNegative = recentEntries.filter(e =>
    e.sentimentAI?.toLowerCase().includes("negative") ||
    ["anxious", "overwhelmed", "frustrated", "hopeless"].includes(e.inferredMode?.toLowerCase() || "")
  );

  if (recentNegative.length >= 3 && blueprint.antiVision.length > 0) {
    const promptId = "anti-vision-check";
    if (!dismissedIds.has(promptId)) {
      prompts.push({
        id: promptId,
        text: "I notice some challenging patterns. Are any of these connected to what you want to avoid becoming?",
        type: "anti-vision-check",
        priority: "high",
        icon: "AlertTriangle"
      });
    }
  }

  return prompts;
}

function generateSoulMappingPrompts(
  gamification: GamificationState,
  dismissedIds: Set<string>
): SmartPrompt[] {
  const prompts: SmartPrompt[] = [];
  const completed = new Set(gamification.completedSoulMappingTopics);

  // Suggest next Soul Mapping topic if not all completed
  const SOUL_TOPICS = ["childhood", "joys", "friendships", "interests", "parents", "siblings"];
  const nextTopic = SOUL_TOPICS.find(t => !completed.has(t));

  if (nextTopic && gamification.totalEntriesLogged >= 3) {
    const promptId = `soul-mapping-${nextTopic}`;
    if (!dismissedIds.has(promptId)) {
      const topicLabel = SOUL_TOPIC_LABELS[nextTopic] || nextTopic;
      prompts.push({
        id: promptId,
        text: `Ready to explore "${topicLabel}"? Soul Mapping helps you understand yourself deeper.`,
        type: "soul-mapping",
        priority: "low",
        icon: "User"
      });
    }
  }

  return prompts;
}

function generateTimeHorizonPrompts(
  blueprint: LifeBlueprint,
  recentText: string,
  dismissedIds: Set<string>
): SmartPrompt[] {
  const prompts: SmartPrompt[] = [];

  // Focus on 6-month and 1-year goals (most actionable)
  const nearTermGoals = blueprint.timeHorizonGoals.filter(
    g => !g.completed && (g.horizon === "6months" || g.horizon === "1year")
  );

  nearTermGoals.forEach(goal => {
    const keywords = extractKeywords(goal.text);
    const isMentioned = keywords.some(kw => recentText.includes(kw));

    if (!isMentioned) {
      const promptId = `time-${goal.id}`;
      if (!dismissedIds.has(promptId)) {
        const horizonLabel = goal.horizon === "6months" ? "6-month" : "1-year";
        prompts.push({
          id: promptId,
          text: `Your ${horizonLabel} goal: "${truncate(goal.text, 40)}". How's it progressing?`,
          type: "time-horizon",
          priority: "medium",
          relatedGoal: goal.text,
          icon: "Clock"
        });
      }
    }
  });

  return prompts.slice(0, 2);
}

// ==================== HELPER FUNCTIONS ====================

function priorityWeight(priority: SmartPrompt["priority"]): number {
  switch (priority) {
    case "high": return 3;
    case "medium": return 2;
    case "low": return 1;
    default: return 0;
  }
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 5);
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

// ==================== DISMISSED PROMPTS ====================

export function loadDismissedPrompts(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const stored = localStorage.getItem(DISMISSED_PROMPTS_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Filter out dismissals older than 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const valid = Object.entries(data)
        .filter(([_, timestamp]) => (timestamp as number) > sevenDaysAgo)
        .map(([id]) => id);
      return new Set(valid);
    }
  } catch (error) {
    console.error("[SmartPrompts] Failed to load dismissed prompts:", error);
  }

  return new Set();
}

export function dismissPrompt(promptId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(DISMISSED_PROMPTS_KEY);
    const data = stored ? JSON.parse(stored) : {};
    data[promptId] = Date.now();
    localStorage.setItem(DISMISSED_PROMPTS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[SmartPrompts] Failed to dismiss prompt:", error);
  }
}

export function clearDismissedPrompts(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DISMISSED_PROMPTS_KEY);
}

// ==================== CONSTANTS ====================

const CATEGORY_KEYWORDS = new Map<VisionCategory, string[]>([
  ["career", ["work", "job", "career", "project", "meeting", "boss", "professional"]],
  ["health", ["health", "exercise", "sleep", "energy", "diet", "workout", "mental"]],
  ["relationships", ["family", "friend", "partner", "love", "relationship", "social"]],
  ["finance", ["money", "budget", "savings", "investment", "financial", "income"]],
  ["personal-growth", ["learn", "growth", "improve", "skill", "development", "progress"]],
  ["lifestyle", ["home", "travel", "hobby", "leisure", "balance", "routine"]],
  ["contribution", ["help", "volunteer", "community", "impact", "give", "purpose"]],
  ["other", []]
]);

const CATEGORY_LABELS: Record<VisionCategory, string> = {
  career: "Career & Work",
  health: "Health & Energy",
  relationships: "Relationships",
  finance: "Finances",
  "personal-growth": "Personal Growth",
  lifestyle: "Lifestyle",
  contribution: "Contribution",
  other: "Other"
};

const SOUL_TOPIC_LABELS: Record<string, string> = {
  childhood: "Childhood Memories",
  joys: "Peak Joys",
  friendships: "Friendships",
  interests: "Passions & Hobbies",
  parents: "Parental Bond",
  siblings: "Siblings & Family",
  love: "Love & Romance",
  career: "Work & Purpose",
  wounds: "Emotional Wounds",
  fears: "Deepest Fears"
};

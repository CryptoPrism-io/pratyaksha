// Pattern Warnings - Proactive alerts when journal patterns suggest drift toward anti-vision
// Detects negative trends and warns users before they drift too far from their stated goals

import type { Entry } from "./transforms";
import type { LifeBlueprint } from "./lifeBlueprintStorage";

// ==================== TYPES ====================

export interface PatternWarning {
  id: string;
  type: "anti-vision-drift" | "negative-trend" | "lever-neglect" | "goal-stall";
  severity: "info" | "warning" | "alert";
  title: string;
  description: string;
  relatedAntiVision?: string;
  suggestedAction: string;
  entriesInvolved: string[];
  detectedAt: string;
  dismissedAt?: string;
}

export interface WarningDetectionResult {
  warnings: PatternWarning[];
  hasActiveWarnings: boolean;
  highestSeverity: "none" | "info" | "warning" | "alert";
}

// ==================== DETECTOR ====================

/**
 * Detect pattern warnings based on recent entries and user's Life Blueprint
 */
export function detectPatternWarnings(
  entries: Entry[],
  blueprint: LifeBlueprint,
  existingWarnings: PatternWarning[] = []
): WarningDetectionResult {
  const warnings: PatternWarning[] = [];
  const existingIds = new Set(existingWarnings.filter(w => !w.dismissedAt).map(w => w.id));

  // Get recent entries (last 14 days)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const recentEntries = entries.filter(e => new Date(e.date) >= twoWeeksAgo);

  if (recentEntries.length < 3) {
    return { warnings: [], hasActiveWarnings: false, highestSeverity: "none" };
  }

  // 1. Check for anti-vision drift
  const antiVisionWarnings = detectAntiVisionDrift(recentEntries, blueprint, existingIds);
  warnings.push(...antiVisionWarnings);

  // 2. Check for negative sentiment trends
  const negativeTrendWarnings = detectNegativeTrend(recentEntries, existingIds);
  warnings.push(...negativeTrendWarnings);

  // 3. Check for lever neglect (positive levers not activated)
  const leverWarnings = detectLeverNeglect(recentEntries, blueprint, existingIds);
  warnings.push(...leverWarnings);

  // 4. Check for goal stall (goals mentioned but no progress)
  const goalStallWarnings = detectGoalStall(recentEntries, blueprint, existingIds);
  warnings.push(...goalStallWarnings);

  // Determine highest severity
  let highestSeverity: "none" | "info" | "warning" | "alert" = "none";
  for (const warning of warnings) {
    if (warning.severity === "alert") {
      highestSeverity = "alert";
      break;
    } else if (warning.severity === "warning" && highestSeverity !== "alert") {
      highestSeverity = "warning";
    } else if (warning.severity === "info" && highestSeverity === "none") {
      highestSeverity = "info";
    }
  }

  return {
    warnings,
    hasActiveWarnings: warnings.length > 0,
    highestSeverity
  };
}

// ==================== INDIVIDUAL DETECTORS ====================

/**
 * Detect if entries are drifting toward user's stated anti-vision
 */
function detectAntiVisionDrift(
  entries: Entry[],
  blueprint: LifeBlueprint,
  existingIds: Set<string>
): PatternWarning[] {
  const warnings: PatternWarning[] = [];

  if (blueprint.antiVision.length === 0) return warnings;

  // Build keyword sets from anti-vision statements
  const antiVisionKeywords = new Map<string, { keywords: string[]; text: string }>();
  blueprint.antiVision.forEach((av, index) => {
    const keywords = av.text
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 10);
    antiVisionKeywords.set(`anti-${index}`, { keywords, text: av.text });
  });

  // Check each anti-vision for matches in recent entries
  antiVisionKeywords.forEach(({ keywords, text }, antiVisionId) => {
    const matchingEntries: string[] = [];

    entries.forEach(entry => {
      const entryText = (entry.text || "").toLowerCase();
      const themes = (entry.themeTagsAI || []).join(" ").toLowerCase();
      const mode = (entry.inferredMode || "").toLowerCase();

      // Count keyword matches
      const matchCount = keywords.filter(kw =>
        entryText.includes(kw) || themes.includes(kw)
      ).length;

      // Check for negative emotional indicators
      const hasNegativeMode = ["anxious", "overwhelmed", "frustrated", "hopeless", "angry"].includes(mode);
      const hasNegativeSentiment = entry.sentimentAI?.toLowerCase().includes("negative");

      // Consider it a match if multiple keywords match OR strong negative emotion
      if (matchCount >= 2 || (matchCount >= 1 && (hasNegativeMode || hasNegativeSentiment))) {
        matchingEntries.push(entry.id);
      }
    });

    // Create warning if threshold met
    if (matchingEntries.length >= 3) {
      const warningId = `drift-${antiVisionId}`;
      if (!existingIds.has(warningId)) {
        warnings.push({
          id: warningId,
          type: "anti-vision-drift",
          severity: matchingEntries.length >= 5 ? "alert" : "warning",
          title: "Pattern matches your anti-vision",
          description: `Your recent entries show patterns related to what you wanted to avoid: "${truncate(text, 60)}"`,
          relatedAntiVision: text,
          suggestedAction: "Consider journaling about what's driving these patterns and how to redirect.",
          entriesInvolved: matchingEntries.slice(0, 5),
          detectedAt: new Date().toISOString()
        });
      }
    }
  });

  return warnings;
}

/**
 * Detect sustained negative sentiment trends
 */
function detectNegativeTrend(
  entries: Entry[],
  existingIds: Set<string>
): PatternWarning[] {
  const warnings: PatternWarning[] = [];
  const warningId = "negative-trend";

  if (existingIds.has(warningId)) return warnings;

  // Count negative entries in the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const lastWeekEntries = entries.filter(e => new Date(e.date) >= oneWeekAgo);

  if (lastWeekEntries.length < 4) return warnings;

  const negativeEntries = lastWeekEntries.filter(e =>
    e.sentimentAI?.toLowerCase().includes("negative") ||
    ["anxious", "overwhelmed", "frustrated", "hopeless", "angry"].includes(e.inferredMode?.toLowerCase() || "")
  );

  const negativeRatio = negativeEntries.length / lastWeekEntries.length;

  if (negativeRatio >= 0.6) {
    warnings.push({
      id: warningId,
      type: "negative-trend",
      severity: negativeRatio >= 0.75 ? "alert" : "warning",
      title: "Sustained negative pattern detected",
      description: `${Math.round(negativeRatio * 100)}% of your entries this week reflect challenging emotions.`,
      suggestedAction: "This might be a difficult period. Consider reaching out to someone you trust or exploring what's driving these feelings.",
      entriesInvolved: negativeEntries.map(e => e.id).slice(0, 5),
      detectedAt: new Date().toISOString()
    });
  }

  return warnings;
}

/**
 * Detect if positive levers are being neglected
 */
function detectLeverNeglect(
  entries: Entry[],
  blueprint: LifeBlueprint,
  existingIds: Set<string>
): PatternWarning[] {
  const warnings: PatternWarning[] = [];

  // Get positive levers (those that push toward vision)
  const positiveLevers = blueprint.levers.filter(l => l.pushesToward === "vision");

  if (positiveLevers.length === 0) return warnings;

  // Check each lever for mentions in recent entries
  const combinedText = entries.map(e => (e.text || "").toLowerCase()).join(" ");

  positiveLevers.forEach(lever => {
    const keywords = (lever.name + " " + lever.description)
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);

    const isMentioned = keywords.some(kw => combinedText.includes(kw));

    if (!isMentioned) {
      const warningId = `lever-neglect-${lever.id}`;
      if (!existingIds.has(warningId)) {
        warnings.push({
          id: warningId,
          type: "lever-neglect",
          severity: "info",
          title: `Consider activating "${lever.name}"`,
          description: `You identified "${lever.name}" as something that moves you forward, but it hasn't appeared in your recent entries.`,
          suggestedAction: `Try incorporating "${lever.name}" this week and see how it affects your energy.`,
          entriesInvolved: [],
          detectedAt: new Date().toISOString()
        });
      }
    }
  });

  // Limit to top 2 lever neglect warnings
  return warnings.slice(0, 2);
}

/**
 * Detect if goals are mentioned but showing no progress
 */
function detectGoalStall(
  entries: Entry[],
  blueprint: LifeBlueprint,
  existingIds: Set<string>
): PatternWarning[] {
  const warnings: PatternWarning[] = [];

  // Get incomplete goals
  const incompleteGoals = [
    ...blueprint.shortTermGoals.filter(g => !g.completed),
    ...blueprint.timeHorizonGoals.filter(g => !g.completed && (g.horizon === "6months" || g.horizon === "1year"))
  ];

  if (incompleteGoals.length === 0) return warnings;

  const combinedText = entries.map(e => (e.text || "").toLowerCase()).join(" ");

  // Check for goals mentioned with frustration keywords
  const frustrationKeywords = ["stuck", "can't", "won't", "failed", "impossible", "give up", "quit", "stopped"];

  incompleteGoals.forEach((goal, index) => {
    const goalKeywords = goal.text
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);

    const goalMentioned = goalKeywords.some(kw => combinedText.includes(kw));
    const hasFrustration = frustrationKeywords.some(fk => combinedText.includes(fk));

    if (goalMentioned && hasFrustration) {
      const warningId = `goal-stall-${index}`;
      if (!existingIds.has(warningId)) {
        warnings.push({
          id: warningId,
          type: "goal-stall",
          severity: "warning",
          title: "Goal progress seems stuck",
          description: `Your goal "${truncate(goal.text, 50)}" appears in entries with frustration. Is something blocking you?`,
          suggestedAction: "Try breaking this goal into smaller steps or identifying what's specifically blocking progress.",
          entriesInvolved: entries.filter(e =>
            goalKeywords.some(kw => e.text?.toLowerCase().includes(kw))
          ).map(e => e.id).slice(0, 3),
          detectedAt: new Date().toISOString()
        });
      }
    }
  });

  return warnings.slice(0, 2);
}

// ==================== HELPER FUNCTIONS ====================

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Get severity color for UI
 */
export function getSeverityColor(severity: PatternWarning["severity"]): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (severity) {
    case "alert":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-600 dark:text-red-400",
        icon: "text-red-500"
      };
    case "warning":
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-700 dark:text-amber-400",
        icon: "text-amber-500"
      };
    case "info":
    default:
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-700 dark:text-blue-400",
        icon: "text-blue-500"
      };
  }
}

/**
 * Get warning type label
 */
export function getWarningTypeLabel(type: PatternWarning["type"]): string {
  switch (type) {
    case "anti-vision-drift":
      return "Anti-Vision Drift";
    case "negative-trend":
      return "Negative Trend";
    case "lever-neglect":
      return "Lever Neglect";
    case "goal-stall":
      return "Goal Stall";
    default:
      return "Pattern Warning";
  }
}

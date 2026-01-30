// Vision Alignment Calculator
// Calculates how well recent entries align with user's stated vision and goals

import type { Entry } from "./transforms";
import type { LifeBlueprint, VisionCategory } from "./lifeBlueprintStorage";

// ==================== TYPES ====================

export interface AlignmentScore {
  // Overall alignment percentage (0-100)
  overall: number;

  // Alignment by vision category
  byCategory: Record<VisionCategory, CategoryAlignment>;

  // Entry IDs that align with vision
  alignedEntries: string[];

  // Entry IDs that may indicate anti-vision drift
  driftEntries: string[];

  // Vision areas with no recent entries
  missingAreas: VisionCategory[];

  // Metadata
  totalEntriesAnalyzed: number;
  dateRange: { start: Date; end: Date };
}

export interface CategoryAlignment {
  score: number; // 0-100
  entryCount: number;
  relevantGoals: string[];
  trend: "improving" | "stable" | "declining" | "no-data";
}

// Keywords that map to vision categories
const CATEGORY_KEYWORDS: Record<VisionCategory, string[]> = {
  career: [
    "work", "job", "career", "project", "meeting", "deadline", "boss",
    "coworker", "promotion", "salary", "office", "professional", "client",
    "business", "task", "goal", "achievement", "productivity", "team"
  ],
  health: [
    "health", "exercise", "workout", "gym", "sleep", "tired", "energy",
    "diet", "food", "eating", "running", "yoga", "meditation", "stress",
    "anxiety", "mental", "physical", "doctor", "sick", "wellness"
  ],
  relationships: [
    "family", "friend", "partner", "spouse", "husband", "wife", "children",
    "parents", "sibling", "love", "relationship", "conversation", "social",
    "connection", "lonely", "together", "support", "argument", "conflict"
  ],
  finance: [
    "money", "budget", "savings", "investment", "debt", "income", "expense",
    "financial", "bank", "bills", "purchase", "spending", "wealth", "retire"
  ],
  "personal-growth": [
    "learn", "growth", "improve", "skill", "read", "course", "development",
    "challenge", "overcome", "progress", "habit", "change", "mindset",
    "therapy", "journal", "reflect", "insight", "awareness", "understand"
  ],
  lifestyle: [
    "home", "travel", "hobby", "leisure", "vacation", "weekend", "routine",
    "balance", "time", "freedom", "adventure", "relax", "enjoy", "fun"
  ],
  contribution: [
    "help", "volunteer", "community", "impact", "give", "donate", "support",
    "mentor", "teach", "share", "purpose", "meaning", "difference", "cause"
  ],
  other: []
};

// Anti-vision indicator keywords (negative patterns)
const ANTI_VISION_INDICATORS = [
  "exhausted", "burnt out", "burnout", "overwhelmed", "stuck", "hopeless",
  "trapped", "failing", "can't", "never", "always", "worst", "hate",
  "dread", "avoid", "escape", "give up", "pointless", "meaningless"
];

// ==================== CALCULATOR ====================

/**
 * Calculate vision alignment for a set of entries
 */
export function calculateVisionAlignment(
  entries: Entry[],
  blueprint: LifeBlueprint,
  dateRange?: { start: Date; end: Date }
): AlignmentScore {
  // Default to last 30 days if no range specified
  const end = dateRange?.end || new Date();
  const start = dateRange?.start || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter entries within date range
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= start && entryDate <= end;
  });

  // Initialize category scores
  const byCategory: Record<VisionCategory, CategoryAlignment> = {} as Record<VisionCategory, CategoryAlignment>;
  const categories: VisionCategory[] = [
    "career", "health", "relationships", "finance",
    "personal-growth", "lifestyle", "contribution", "other"
  ];

  categories.forEach(cat => {
    byCategory[cat] = {
      score: 0,
      entryCount: 0,
      relevantGoals: [],
      trend: "no-data"
    };
  });

  // Track aligned and drift entries
  const alignedEntries: string[] = [];
  const driftEntries: string[] = [];

  // Analyze each entry
  filteredEntries.forEach(entry => {
    const text = (entry.text || "").toLowerCase();
    const themes = entry.themeTagsAI || [];
    const sentiment = entry.sentimentAI?.toLowerCase() || "";
    const mode = entry.inferredMode?.toLowerCase() || "";

    // Detect category from entry
    const detectedCategories = detectCategories(text, themes);

    // Check for anti-vision drift
    const isDrift = checkAntiVisionDrift(text, blueprint);
    if (isDrift) {
      driftEntries.push(entry.id);
    }

    // Check for vision alignment
    const isAligned = checkVisionAlignment(text, themes, blueprint);
    if (isAligned && !isDrift) {
      alignedEntries.push(entry.id);
    }

    // Update category counts
    detectedCategories.forEach(cat => {
      byCategory[cat].entryCount++;
    });

    // Score based on sentiment and mode
    detectedCategories.forEach(cat => {
      if (sentiment.includes("positive") || ["hopeful", "calm", "determined", "grateful"].includes(mode)) {
        byCategory[cat].score += 10;
      } else if (sentiment.includes("negative") || ["anxious", "overwhelmed", "frustrated"].includes(mode)) {
        byCategory[cat].score -= 5;
      } else {
        byCategory[cat].score += 2; // Neutral still counts
      }
    });
  });

  // Calculate category scores (normalize to 0-100)
  categories.forEach(cat => {
    if (byCategory[cat].entryCount > 0) {
      // Normalize: max possible = entryCount * 10, min = entryCount * -5
      const maxPossible = byCategory[cat].entryCount * 10;
      const minPossible = byCategory[cat].entryCount * -5;
      const range = maxPossible - minPossible;
      const normalized = ((byCategory[cat].score - minPossible) / range) * 100;
      byCategory[cat].score = Math.round(Math.max(0, Math.min(100, normalized)));
    }

    // Add relevant goals
    byCategory[cat].relevantGoals = getRelevantGoals(cat, blueprint);

    // Determine trend (simplified - would need historical data for real trends)
    if (byCategory[cat].entryCount === 0) {
      byCategory[cat].trend = "no-data";
    } else if (byCategory[cat].score >= 70) {
      byCategory[cat].trend = "improving";
    } else if (byCategory[cat].score >= 40) {
      byCategory[cat].trend = "stable";
    } else {
      byCategory[cat].trend = "declining";
    }
  });

  // Find missing areas (vision categories with no entries)
  const missingAreas: VisionCategory[] = [];
  const visionCategories = new Set(blueprint.vision.map(v => v.category));

  visionCategories.forEach(cat => {
    if (byCategory[cat]?.entryCount === 0) {
      missingAreas.push(cat);
    }
  });

  // Calculate overall score
  let overall = 0;
  if (filteredEntries.length > 0) {
    const alignedRatio = alignedEntries.length / filteredEntries.length;
    const driftPenalty = driftEntries.length / filteredEntries.length;
    overall = Math.round((alignedRatio * 100) - (driftPenalty * 30));
    overall = Math.max(0, Math.min(100, overall));
  }

  return {
    overall,
    byCategory,
    alignedEntries,
    driftEntries,
    missingAreas,
    totalEntriesAnalyzed: filteredEntries.length,
    dateRange: { start, end }
  };
}

/**
 * Detect which categories an entry belongs to
 */
function detectCategories(text: string, themes: string[]): VisionCategory[] {
  const detected: VisionCategory[] = [];
  const combinedText = text + " " + themes.join(" ");

  (Object.entries(CATEGORY_KEYWORDS) as [VisionCategory, string[]][]).forEach(([category, keywords]) => {
    const hasKeyword = keywords.some(keyword =>
      combinedText.includes(keyword.toLowerCase())
    );
    if (hasKeyword) {
      detected.push(category);
    }
  });

  // If nothing detected, mark as "other"
  if (detected.length === 0) {
    detected.push("other");
  }

  return detected;
}

/**
 * Check if entry shows anti-vision drift
 */
function checkAntiVisionDrift(text: string, blueprint: LifeBlueprint): boolean {
  // Check for general negative indicators
  const hasNegativeIndicators = ANTI_VISION_INDICATORS.some(indicator =>
    text.includes(indicator)
  );

  // Check for anti-vision keywords
  const antiVisionKeywords = blueprint.antiVision.flatMap(av =>
    av.text.toLowerCase().split(/\s+/)
  );

  const matchesAntiVision = antiVisionKeywords.some(keyword =>
    keyword.length > 3 && text.includes(keyword)
  );

  return hasNegativeIndicators || matchesAntiVision;
}

/**
 * Check if entry aligns with vision
 */
function checkVisionAlignment(
  text: string,
  themes: string[],
  blueprint: LifeBlueprint
): boolean {
  // Extract keywords from vision statements
  const visionKeywords = blueprint.vision.flatMap(v =>
    v.text.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  );

  // Extract keywords from goals
  const goalKeywords = [
    ...blueprint.shortTermGoals,
    ...blueprint.longTermGoals,
    ...blueprint.timeHorizonGoals
  ].flatMap(g => g.text.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  const allKeywords = [...visionKeywords, ...goalKeywords];
  const combinedText = text + " " + themes.join(" ").toLowerCase();

  // Count matches
  const matchCount = allKeywords.filter(keyword =>
    combinedText.includes(keyword)
  ).length;

  // Consider aligned if at least 2 keyword matches
  return matchCount >= 2;
}

/**
 * Get relevant goals for a category
 */
function getRelevantGoals(category: VisionCategory, blueprint: LifeBlueprint): string[] {
  const goals: string[] = [];

  // Vision items
  blueprint.vision
    .filter(v => v.category === category)
    .forEach(v => goals.push(v.text));

  // Time horizon goals (if categorized)
  blueprint.timeHorizonGoals
    .filter(g => g.category === category && !g.completed)
    .forEach(g => goals.push(g.text));

  return goals.slice(0, 3); // Max 3 goals per category
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get a summary of alignment for display
 */
export function getAlignmentSummary(alignment: AlignmentScore): string {
  if (alignment.totalEntriesAnalyzed === 0) {
    return "No recent entries to analyze";
  }

  if (alignment.overall >= 80) {
    return "Excellent! Your entries strongly align with your vision";
  } else if (alignment.overall >= 60) {
    return "Good alignment with your stated goals";
  } else if (alignment.overall >= 40) {
    return "Moderate alignment - some areas need attention";
  } else if (alignment.overall >= 20) {
    return "Low alignment - consider refocusing on your vision";
  } else {
    return "Your recent entries may be drifting from your vision";
  }
}

/**
 * Get categories sorted by alignment score
 */
export function getSortedCategories(
  alignment: AlignmentScore
): Array<{ category: VisionCategory; alignment: CategoryAlignment }> {
  return (Object.entries(alignment.byCategory) as [VisionCategory, CategoryAlignment][])
    .filter(([_, a]) => a.entryCount > 0)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([category, alignment]) => ({ category, alignment }));
}

/**
 * Get warning level for anti-vision drift
 */
export function getDriftWarningLevel(alignment: AlignmentScore): "none" | "low" | "medium" | "high" {
  if (alignment.totalEntriesAnalyzed === 0) return "none";

  const driftRatio = alignment.driftEntries.length / alignment.totalEntriesAnalyzed;

  if (driftRatio >= 0.4) return "high";
  if (driftRatio >= 0.2) return "medium";
  if (driftRatio > 0) return "low";
  return "none";
}

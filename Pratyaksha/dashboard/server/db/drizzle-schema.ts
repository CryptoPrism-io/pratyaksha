// =============================================================================
// BECOMING — Drizzle ORM Schema
// Maps 1:1 to schema.sql PostgreSQL tables
// =============================================================================

import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  smallint,
  real,
  date,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Note: pgvector column type added via custom type below
import { customType } from "drizzle-orm/pg-core"

const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return "vector(1536)"
  },
  toDriver(value: number[]) {
    return `[${value.join(",")}]`
  },
  fromDriver(value: string) {
    return value
      .slice(1, -1)
      .split(",")
      .map(Number)
  },
})

// =============================================================================
// ENUMS
// =============================================================================

export const entryTypeEnum = pgEnum("entry_type", [
  "Emotional", "Cognitive", "Family", "Work", "Relationship",
  "Health", "Creativity", "Social", "Reflection", "Decision",
  "Avoidance", "Growth", "Stress", "Communication", "Routine",
])

export const entryFormatEnum = pgEnum("entry_format", [
  "Quick Log", "Daily Log", "End of Day", "Consolidated",
])

export const inferredModeEnum = pgEnum("inferred_mode", [
  "Hopeful", "Calm", "Grounded", "Compassionate", "Curious",
  "Reflective", "Conflicted", "Withdrawn", "Overthinking", "Numb",
  "Anxious", "Agitated", "Disconnected", "Self-critical", "Defensive",
])

export const energyLevelEnum = pgEnum("energy_level", [
  "Very Low", "Low", "Moderate", "Balanced", "High",
  "Elevated", "Scattered", "Drained", "Flat", "Restorative",
])

export const energyShapeEnum = pgEnum("energy_shape", [
  "Flat", "Heavy", "Chaotic", "Rising", "Collapsing",
  "Expanding", "Contracted", "Uneven", "Centered", "Cyclical",
  "Stabilized", "Pulsing",
])

export const contradictionEnum = pgEnum("contradiction", [
  "Connection vs. Avoidance", "Hope vs. Hopelessness",
  "Anger vs. Shame", "Control vs. Surrender",
  "Confidence vs. Doubt", "Independence vs. Belonging",
  "Closeness vs. Distance", "Expression vs. Silence",
  "Self-care vs. Obligation", "Ideal vs. Reality",
  "Action vs. Fear", "Growth vs. Comfort",
])

export const sentimentEnum = pgEnum("sentiment", [
  "Positive", "Negative", "Neutral",
])

export const moodTrendEnum = pgEnum("mood_trend", [
  "improving", "declining", "stable", "volatile",
])

export const soulMappingTierEnum = pgEnum("soul_mapping_tier", [
  "surface", "deep", "core",
])

export const goalCategoryEnum = pgEnum("goal_category", [
  "career", "health", "relationships", "finance",
  "personal-growth", "lifestyle", "contribution", "other",
])

export const timeHorizonEnum = pgEnum("time_horizon", [
  "6months", "1year", "3years", "5years", "10years",
])

export const notificationFrequencyEnum = pgEnum("notification_frequency", [
  "hourly", "3x_daily", "2x_daily", "1x_daily",
])

// =============================================================================
// TABLE 1: users
// =============================================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),

  // Demographics
  ageRange: text("age_range"),
  sex: text("sex"),
  location: text("location"),
  profession: text("profession"),

  // Psychological context
  stressLevel: smallint("stress_level"),
  emotionalOpenness: smallint("emotional_openness"),
  reflectionFrequency: smallint("reflection_frequency"),
  lifeSatisfaction: smallint("life_satisfaction"),
  personalGoal: text("personal_goal"),

  // Onboarding
  selectedMemoryTopics: text("selected_memory_topics").array().default([]),
  seedMemory: text("seed_memory"),
  defaultEntryMode: text("default_entry_mode"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  showFeatureTour: boolean("show_feature_tour").default(true),
  lastSlideCompleted: smallint("last_slide_completed").default(0),

  // Badges
  badges: text("badges").array().default([]),

  // Notifications
  fcmToken: text("fcm_token"),
  dailyReminderEnabled: boolean("daily_reminder_enabled").default(false),
  reminderTime: text("reminder_time"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lastActive: timestamp("last_active", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// =============================================================================
// TABLE 2: gamification
// =============================================================================

export const gamification = pgTable("gamification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),

  karma: integer("karma").default(0),
  streakDays: integer("streak_days").default(0),
  lastEntryDate: date("last_entry_date"),
  totalEntriesLogged: integer("total_entries_logged").default(0),
  lastDailyDashboardBonus: timestamp("last_daily_dashboard_bonus", { withTimezone: true }),
  lastAutoGift: timestamp("last_auto_gift", { withTimezone: true }),
  totalGiftsReceived: integer("total_gifts_received").default(0),

  completedSoulMappingTopics: text("completed_soul_mapping_topics").array().default([]),
  soulMappingTier: soulMappingTierEnum("soul_mapping_tier").default("surface"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// =============================================================================
// TABLE 3: entries
// =============================================================================

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  airtableId: text("airtable_id"),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // User-provided
  text: text("text").notNull(),
  date: date("date").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),

  // AI Agent 1: Intent
  name: text("name"),
  type: entryTypeEnum("type"),
  format: entryFormatEnum("format").default("Quick Log"),
  snapshot: text("snapshot"),

  // AI Agent 2: Emotion
  inferredMode: inferredModeEnum("inferred_mode"),
  inferredEnergy: energyLevelEnum("inferred_energy"),
  energyShape: energyShapeEnum("energy_shape"),
  sentiment: sentimentEnum("sentiment"),

  // AI Agent 3: Theme
  contradiction: contradictionEnum("contradiction"),
  themeTags: text("theme_tags").array().default([]),
  loops: text("loops"),

  // AI Agent 4: Insight
  summaryAi: text("summary_ai"),
  actionableInsightsAi: text("actionable_insights_ai"),
  nextAction: text("next_action"),

  // Metadata
  entryLengthWords: integer("entry_length_words").default(0),
  metaFlag: text("meta_flag").default("Web App"),
  tokensUsed: integer("tokens_used").default(0),

  // Decomposition
  parentEntryId: uuid("parent_entry_id").references((): any => entries.id, { onDelete: "set null" }),
  isDecomposed: boolean("is_decomposed").default(false),
  decompositionCount: smallint("decomposition_count").default(0),
  sequenceOrder: smallint("sequence_order"),
  approximateTime: text("approximate_time"),
  overarchingTheme: text("overarching_theme"),

  // User actions
  isBookmarked: boolean("is_bookmarked").default(false),
  isDeleted: boolean("is_deleted").default(false),
  isSummary: boolean("is_summary").default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_entries_user_id").on(table.userId),
  index("idx_entries_user_date").on(table.userId, table.date),
  index("idx_entries_type").on(table.type),
  index("idx_entries_sentiment").on(table.sentiment),
  index("idx_entries_mode").on(table.inferredMode),
])

// =============================================================================
// TABLE 4: entry_embeddings
// =============================================================================

export const entryEmbeddings = pgTable("entry_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryId: uuid("entry_id").notNull().references(() => entries.id, { onDelete: "cascade" }).unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  embedding: vector("embedding").notNull(),
  model: text("model").default("text-embedding-3-small"),
  tokenCount: integer("token_count"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// =============================================================================
// TABLE 5a: vision_items
// =============================================================================

export const visionItems = pgTable("vision_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  category: goalCategoryEnum("category").default("other"),
  isAnti: boolean("is_anti").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// =============================================================================
// TABLE 5b: levers
// =============================================================================

export const levers = pgTable("levers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  pushesToward: text("pushes_toward").default("vision"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// =============================================================================
// TABLE 5c: goals
// =============================================================================

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  category: goalCategoryEnum("category").default("other"),
  timeHorizon: timeHorizonEnum("time_horizon"),
  isLongTerm: boolean("is_long_term").default(false),
  targetDate: date("target_date"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// =============================================================================
// TABLE 5d: blueprint_responses
// =============================================================================

export const blueprintResponses = pgTable("blueprint_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  answer: text("answer").notNull(),
  answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex("idx_blueprint_user_question").on(table.userId, table.questionId),
])

// =============================================================================
// TABLE 5e: blueprint_sections
// =============================================================================

export const blueprintSections = pgTable("blueprint_sections", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sectionName: text("section_name").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  // Composite primary key
  uniqueIndex("pk_blueprint_sections").on(table.userId, table.sectionName),
])

// =============================================================================
// TABLE 6: chat_messages
// =============================================================================

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").notNull(),
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used"),
  model: text("model"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_chat_user_session").on(table.userId, table.sessionId, table.createdAt),
])

// =============================================================================
// TABLE 7: summaries
// =============================================================================

export const summaries = pgTable("summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  summaryType: text("summary_type").notNull(), // 'daily', 'weekly', 'monthly'
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  entryCount: integer("entry_count").default(0),

  narrative: text("narrative"),
  moodTrend: moodTrendEnum("mood_trend"),
  moodSummary: text("mood_summary"),
  energyPattern: text("energy_pattern"),
  keyTakeaway: text("key_takeaway"),
  eveningReflection: text("evening_reflection"),
  weeklyInsight: text("weekly_insight"),
  recommendations: text("recommendations").array().default([]),
  nextWeekFocus: text("next_week_focus"),

  dominantMode: text("dominant_mode"),
  dominantEnergy: text("dominant_energy"),
  dominantSentiment: text("dominant_sentiment"),
  topThemes: text("top_themes").array().default([]),
  topContradiction: text("top_contradiction"),
  positiveRatio: real("positive_ratio"),
  avgEntriesPerDay: real("avg_entries_per_day"),
  sentimentBreakdown: jsonb("sentiment_breakdown"),

  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
  tokensUsed: integer("tokens_used"),
  model: text("model"),
}, (table) => [
  uniqueIndex("idx_summaries_unique").on(table.userId, table.summaryType, table.periodStart),
])

// =============================================================================
// TABLE 8: prompt_cache
// =============================================================================

export const promptCache = pgTable("prompt_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  promptHash: text("prompt_hash").notNull(),
  model: text("model").notNull(),
  response: jsonb("response").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  hitCount: integer("hit_count").default(0),
}, (table) => [
  uniqueIndex("idx_prompt_cache_unique").on(table.promptHash, table.model),
])

// =============================================================================
// TABLE 9: notification_settings
// =============================================================================

export const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  enabled: boolean("enabled").default(false),
  timezone: text("timezone").default("Asia/Kolkata"),
  frequency: notificationFrequencyEnum("frequency").default("1x_daily"),
  customTimes: text("custom_times").array().default(["09:00", "13:00", "20:00"]),
  quietHoursStart: text("quiet_hours_start").default("22:00"),
  quietHoursEnd: text("quiet_hours_end").default("07:00"),
  streakAtRisk: boolean("streak_at_risk").default(true),
  weeklySummary: boolean("weekly_summary").default(true),
  lastNotified: timestamp("last_notified", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// =============================================================================
// TABLE 10: explainer_cache
// =============================================================================

export const explainerCache = pgTable("explainer_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  chartType: text("chart_type").notNull(),
  dataHash: text("data_hash").notNull(),
  explanation: text("explanation").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("idx_explainer_unique").on(table.userId, table.chartType, table.dataHash),
])

// =============================================================================
// TABLE 11: pattern_warnings
// =============================================================================

export const patternWarnings = pgTable("pattern_warnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  warningType: text("warning_type").notNull(),
  severity: text("severity").notNull().default("info"),
  title: text("title").notNull(),
  description: text("description"),
  relatedEntries: uuid("related_entries").array().default([]),
  dismissed: boolean("dismissed").default(false),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  dismissExpires: timestamp("dismiss_expires", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// =============================================================================
// TABLE 12: api_usage
// =============================================================================

export const apiUsage = pgTable("api_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  endpoint: text("endpoint").notNull(),
  model: text("model").notNull(),
  promptTokens: integer("prompt_tokens").default(0),
  completionTokens: integer("completion_tokens").default(0),
  totalTokens: integer("total_tokens").default(0),
  estimatedCost: real("estimated_cost").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_api_usage_user").on(table.userId, table.createdAt),
])

// =============================================================================
// RELATIONS
// =============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  gamification: one(gamification, {
    fields: [users.id],
    references: [gamification.userId],
  }),
  entries: many(entries),
  visionItems: many(visionItems),
  levers: many(levers),
  goals: many(goals),
  blueprintResponses: many(blueprintResponses),
  chatMessages: many(chatMessages),
  notificationSettings: one(notificationSettings, {
    fields: [users.id],
    references: [notificationSettings.userId],
  }),
  patternWarnings: many(patternWarnings),
}))

export const entriesRelations = relations(entries, ({ one, many }) => ({
  user: one(users, {
    fields: [entries.userId],
    references: [users.id],
  }),
  parentEntry: one(entries, {
    fields: [entries.parentEntryId],
    references: [entries.id],
    relationName: "parentChild",
  }),
  childEntries: many(entries, { relationName: "parentChild" }),
  embedding: one(entryEmbeddings, {
    fields: [entries.id],
    references: [entryEmbeddings.entryId],
  }),
}))

export const gamificationRelations = relations(gamification, ({ one }) => ({
  user: one(users, {
    fields: [gamification.userId],
    references: [users.id],
  }),
}))

// =============================================================================
// BECOMING — PostgreSQL Database Layer (replaces lib/airtable.ts)
// Uses Drizzle ORM for type-safe queries against Cloud SQL
// =============================================================================

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { eq, and, not, or, gte, lte, desc, asc, sql, isNull } from "drizzle-orm"
import * as schema from "../db/drizzle-schema"

// ── Connection ──────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "becoming"}`

const queryClient = postgres(DATABASE_URL, {
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(queryClient, { schema })

// ── User Queries ────────────────────────────────────────────────────────────

export async function findUserByFirebaseUid(firebaseUid: string) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.firebaseUid, firebaseUid))
    .limit(1)
  return user || null
}

export async function resolveUserId(firebaseUid: string): Promise<string | null> {
  const user = await findUserByFirebaseUid(firebaseUid)
  return user?.id || null
}

export async function upsertUser(data: {
  firebaseUid: string
  email?: string
  displayName?: string
  personalization?: {
    ageRange?: string | null
    sex?: string | null
    location?: string | null
    profession?: string | null
    stressLevel?: number | null
    emotionalOpenness?: number | null
    reflectionFrequency?: number | null
    lifeSatisfaction?: number | null
    personalGoal?: string | null
    selectedMemoryTopics?: string[]
    seedMemory?: string | null
    defaultEntryMode?: string | null
    showFeatureTour?: boolean
  }
  gamification?: {
    karma?: number
    completedSoulMappingTopics?: string[]
    streakDays?: number
    lastEntryDate?: string | null
    lastDailyDashboardBonus?: string | null
    totalEntriesLogged?: number
  }
  lifeBlueprint?: {
    vision?: Array<{ id: string; text: string; category: string; createdAt: string }>
    antiVision?: Array<{ id: string; text: string; category: string; createdAt: string }>
    levers?: Array<{ id: string; name: string; description: string; pushesToward: string; createdAt: string }>
    shortTermGoals?: Array<{ id: string; text: string; category: string; targetDate?: string; completed: boolean; completedAt?: string; createdAt: string }>
    longTermGoals?: Array<{ id: string; text: string; category: string; targetDate?: string; completed: boolean; completedAt?: string; createdAt: string }>
    responses?: Array<{ questionId: string; answer: string; answeredAt: string; updatedAt?: string }>
    timeHorizonGoals?: Array<{ id: string; horizon: string; text: string; category?: string; completed: boolean; completedAt?: string; createdAt: string }>
    completedSections?: string[]
  }
  onboardingCompleted?: boolean
  dailyReminderEnabled?: boolean
  reminderTime?: string
  badges?: string[]
  fcmToken?: string
}) {
  const existing = await findUserByFirebaseUid(data.firebaseUid)
  const p = data.personalization || {}

  if (existing) {
    // Update existing user - set all fields explicitly (Drizzle requires this for proper param binding)
    await db.update(schema.users).set({
      email: data.email !== undefined ? data.email : existing.email,
      displayName: data.displayName !== undefined ? data.displayName : existing.displayName,
      ageRange: p.ageRange !== undefined ? p.ageRange : existing.ageRange,
      sex: p.sex !== undefined ? p.sex : existing.sex,
      location: p.location !== undefined ? p.location : existing.location,
      profession: p.profession !== undefined ? p.profession : existing.profession,
      stressLevel: p.stressLevel !== undefined ? p.stressLevel : existing.stressLevel,
      emotionalOpenness: p.emotionalOpenness !== undefined ? p.emotionalOpenness : existing.emotionalOpenness,
      reflectionFrequency: p.reflectionFrequency !== undefined ? p.reflectionFrequency : existing.reflectionFrequency,
      lifeSatisfaction: p.lifeSatisfaction !== undefined ? p.lifeSatisfaction : existing.lifeSatisfaction,
      personalGoal: p.personalGoal !== undefined ? p.personalGoal : existing.personalGoal,
      selectedMemoryTopics: p.selectedMemoryTopics !== undefined ? p.selectedMemoryTopics : existing.selectedMemoryTopics,
      seedMemory: p.seedMemory !== undefined ? p.seedMemory : existing.seedMemory,
      defaultEntryMode: p.defaultEntryMode !== undefined ? p.defaultEntryMode : existing.defaultEntryMode,
      showFeatureTour: p.showFeatureTour !== undefined ? p.showFeatureTour : existing.showFeatureTour,
      onboardingCompleted: data.onboardingCompleted !== undefined ? data.onboardingCompleted : existing.onboardingCompleted,
      dailyReminderEnabled: data.dailyReminderEnabled !== undefined ? data.dailyReminderEnabled : existing.dailyReminderEnabled,
      reminderTime: data.reminderTime !== undefined ? data.reminderTime : existing.reminderTime,
      badges: data.badges !== undefined ? data.badges : existing.badges,
      fcmToken: data.fcmToken !== undefined ? data.fcmToken : existing.fcmToken,
      lastActive: new Date(),
    }).where(eq(schema.users.id, existing.id))

    // Update gamification if provided
    if (data.gamification) {
      const g = data.gamification
      await db
        .insert(schema.gamification)
        .values({
          userId: existing.id,
          karma: g.karma ?? 0,
          streakDays: g.streakDays ?? 0,
          lastEntryDate: g.lastEntryDate || null,
          totalEntriesLogged: g.totalEntriesLogged ?? 0,
          lastDailyDashboardBonus: g.lastDailyDashboardBonus ? new Date(g.lastDailyDashboardBonus) : null,
          completedSoulMappingTopics: g.completedSoulMappingTopics || [],
        })
        .onConflictDoUpdate({
          target: schema.gamification.userId,
          set: {
            karma: g.karma ?? 0,
            streakDays: g.streakDays ?? 0,
            totalEntriesLogged: g.totalEntriesLogged ?? 0,
            completedSoulMappingTopics: g.completedSoulMappingTopics || [],
          },
        })
    }

    // Return updated user
    return (await findUserByFirebaseUid(data.firebaseUid))!
  } else {
    // Create new user
    const [newUser] = await db
      .insert(schema.users)
      .values({
        firebaseUid: data.firebaseUid,
        email: data.email || `${data.firebaseUid}@unknown.local`,
        displayName: data.displayName || null,
        ageRange: p.ageRange || null,
        sex: p.sex || null,
        location: p.location || null,
        profession: p.profession || null,
        stressLevel: p.stressLevel ?? null,
        emotionalOpenness: p.emotionalOpenness ?? null,
        reflectionFrequency: p.reflectionFrequency ?? null,
        lifeSatisfaction: p.lifeSatisfaction ?? null,
        personalGoal: p.personalGoal || null,
        selectedMemoryTopics: p.selectedMemoryTopics || [],
        seedMemory: p.seedMemory || null,
        defaultEntryMode: p.defaultEntryMode || null,
        onboardingCompleted: data.onboardingCompleted ?? false,
        showFeatureTour: p.showFeatureTour !== false,
        badges: data.badges || [],
        fcmToken: data.fcmToken || null,
        dailyReminderEnabled: data.dailyReminderEnabled ?? false,
        reminderTime: data.reminderTime || null,
      })
      .returning()

    // Create gamification record
    if (data.gamification) {
      const g = data.gamification
      await db.insert(schema.gamification).values({
        userId: newUser.id,
        karma: g.karma ?? 0,
        streakDays: g.streakDays ?? 0,
        lastEntryDate: g.lastEntryDate || null,
        totalEntriesLogged: g.totalEntriesLogged ?? 0,
        completedSoulMappingTopics: g.completedSoulMappingTopics || [],
      })
    }

    return newUser
  }
}

export async function getUserProfile(firebaseUid: string) {
  const user = await findUserByFirebaseUid(firebaseUid)
  if (!user) return null

  // Get gamification data
  const [gamificationData] = await db
    .select()
    .from(schema.gamification)
    .where(eq(schema.gamification.userId, user.id))
    .limit(1)

  // Get life blueprint data
  const visions = await db.select().from(schema.visionItems).where(and(eq(schema.visionItems.userId, user.id), eq(schema.visionItems.isAnti, false)))
  const antiVisions = await db.select().from(schema.visionItems).where(and(eq(schema.visionItems.userId, user.id), eq(schema.visionItems.isAnti, true)))
  const leversData = await db.select().from(schema.levers).where(eq(schema.levers.userId, user.id))
  const shortTermGoals = await db.select().from(schema.goals).where(and(eq(schema.goals.userId, user.id), eq(schema.goals.isLongTerm, false), isNull(schema.goals.timeHorizon)))
  const longTermGoals = await db.select().from(schema.goals).where(and(eq(schema.goals.userId, user.id), eq(schema.goals.isLongTerm, true), isNull(schema.goals.timeHorizon)))
  const timeHorizonGoals = await db.select().from(schema.goals).where(and(eq(schema.goals.userId, user.id), not(isNull(schema.goals.timeHorizon))))
  const responses = await db.select().from(schema.blueprintResponses).where(eq(schema.blueprintResponses.userId, user.id))
  const sections = await db.select().from(schema.blueprintSections).where(eq(schema.blueprintSections.userId, user.id))

  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    displayName: user.displayName,
    dailyReminderEnabled: user.dailyReminderEnabled,
    reminderTime: user.reminderTime,
    onboardingCompleted: user.onboardingCompleted,
    badges: user.badges || [],
    fcmToken: user.fcmToken,
    createdAt: user.createdAt?.toISOString(),
    lastActive: user.lastActive?.toISOString(),
    personalization: {
      ageRange: user.ageRange,
      sex: user.sex,
      location: user.location,
      profession: user.profession,
      stressLevel: user.stressLevel,
      emotionalOpenness: user.emotionalOpenness,
      reflectionFrequency: user.reflectionFrequency,
      lifeSatisfaction: user.lifeSatisfaction,
      personalGoal: user.personalGoal,
      selectedMemoryTopics: user.selectedMemoryTopics,
      seedMemory: user.seedMemory,
      defaultEntryMode: user.defaultEntryMode,
      showFeatureTour: user.showFeatureTour,
    },
    gamification: gamificationData ? {
      karma: gamificationData.karma,
      completedSoulMappingTopics: gamificationData.completedSoulMappingTopics,
      streakDays: gamificationData.streakDays,
      lastEntryDate: gamificationData.lastEntryDate,
      lastDailyDashboardBonus: gamificationData.lastDailyDashboardBonus?.toISOString() || null,
      totalEntriesLogged: gamificationData.totalEntriesLogged,
    } : {},
    lifeBlueprint: {
      vision: visions.map(v => ({ id: v.id, text: v.text, category: v.category || "other", createdAt: v.createdAt?.toISOString() || "" })),
      antiVision: antiVisions.map(v => ({ id: v.id, text: v.text, category: v.category || "other", createdAt: v.createdAt?.toISOString() || "" })),
      levers: leversData.map(l => ({ id: l.id, name: l.name, description: l.description || "", pushesToward: l.pushesToward || "vision", createdAt: l.createdAt?.toISOString() || "" })),
      shortTermGoals: shortTermGoals.map(g => ({ id: g.id, text: g.text, category: g.category || "other", targetDate: g.targetDate || undefined, completed: g.completed || false, completedAt: g.completedAt?.toISOString(), createdAt: g.createdAt?.toISOString() || "" })),
      longTermGoals: longTermGoals.map(g => ({ id: g.id, text: g.text, category: g.category || "other", targetDate: g.targetDate || undefined, completed: g.completed || false, completedAt: g.completedAt?.toISOString(), createdAt: g.createdAt?.toISOString() || "" })),
      timeHorizonGoals: timeHorizonGoals.map(g => ({ id: g.id, horizon: g.timeHorizon || "", text: g.text, category: g.category || undefined, completed: g.completed || false, completedAt: g.completedAt?.toISOString(), createdAt: g.createdAt?.toISOString() || "" })),
      responses: responses.map(r => ({ questionId: r.questionId, answer: r.answer, answeredAt: r.answeredAt?.toISOString() || "", updatedAt: r.updatedAt?.toISOString() })),
      completedSections: sections.map(s => s.sectionName),
    },
  }
}

// ── Entry Queries (replaces createAirtableEntry, updateAirtableEntry, etc.) ──

// Entry type matching Airtable's AirtableRecord shape for backward compat with agents
export interface EntryRecord {
  id: string
  fields: {
    Name?: string
    Type?: string
    Date?: string
    Text?: string
    Timestamp?: string
    User_ID?: string
    "Inferred Mode"?: string
    "Inferred Energy"?: string
    "Energy Shape"?: string
    Contradiction?: string
    Snapshot?: string
    Loops?: string
    "Next Action"?: string
    "Meta Flag"?: string
    "Is Summary?"?: boolean
    "Summary (AI)"?: string
    "Actionable Insights (AI)"?: string
    "Entry Length (Words)"?: number
    "Entry Sentiment (AI)"?: string
    "Entry Theme Tags (AI)"?: string
    "Is Deleted?"?: boolean
    "Is Bookmarked?"?: boolean
    "Entry Format"?: string
    "Parent Entry ID"?: string
    "Is Decomposed?"?: boolean
    "Decomposition Count"?: number
    "Sequence Order"?: number
    "Approximate Time"?: string
    "Overarching Theme"?: string
  }
}

function dbEntryToRecord(row: typeof schema.entries.$inferSelect): EntryRecord {
  return {
    id: row.id,
    fields: {
      Name: row.name || undefined,
      Type: row.type || undefined,
      Date: row.date || undefined,
      Text: row.text,
      Timestamp: row.timestamp?.toISOString(),
      "Inferred Mode": row.inferredMode || undefined,
      "Inferred Energy": row.inferredEnergy || undefined,
      "Energy Shape": row.energyShape || undefined,
      Contradiction: row.contradiction || undefined,
      Snapshot: row.snapshot || undefined,
      Loops: row.loops || undefined,
      "Next Action": row.nextAction || undefined,
      "Meta Flag": row.metaFlag || undefined,
      "Is Summary?": row.isSummary || false,
      "Summary (AI)": row.summaryAi || undefined,
      "Actionable Insights (AI)": row.actionableInsightsAi || undefined,
      "Entry Length (Words)": row.entryLengthWords || 0,
      "Entry Sentiment (AI)": row.sentiment || undefined,
      "Entry Theme Tags (AI)": row.themeTags?.join(", ") || undefined,
      "Is Deleted?": row.isDeleted || false,
      "Is Bookmarked?": row.isBookmarked || false,
      "Entry Format": row.format || undefined,
      "Is Decomposed?": row.isDecomposed || false,
      "Decomposition Count": row.decompositionCount || 0,
      "Sequence Order": row.sequenceOrder || undefined,
      "Approximate Time": row.approximateTime || undefined,
      "Overarching Theme": row.overarchingTheme || undefined,
    },
  }
}

type SafeEnum<T extends string> = T | null | undefined
function safeEnum<T extends string>(value: string | undefined, validValues: readonly T[]): T | null {
  if (!value) return null
  return (validValues as readonly string[]).includes(value) ? (value as T) : null
}

const ENTRY_TYPES = ["Emotional", "Cognitive", "Family", "Work", "Relationship", "Health", "Creativity", "Social", "Reflection", "Decision", "Avoidance", "Growth", "Stress", "Communication", "Routine"] as const
const INFERRED_MODES = ["Hopeful", "Calm", "Grounded", "Compassionate", "Curious", "Reflective", "Conflicted", "Withdrawn", "Overthinking", "Numb", "Anxious", "Agitated", "Disconnected", "Self-critical", "Defensive"] as const
const ENERGY_LEVELS = ["Very Low", "Low", "Moderate", "Balanced", "High", "Elevated", "Scattered", "Drained", "Flat", "Restorative"] as const
const ENERGY_SHAPES = ["Flat", "Heavy", "Chaotic", "Rising", "Collapsing", "Expanding", "Contracted", "Uneven", "Centered", "Cyclical", "Stabilized", "Pulsing"] as const
const CONTRADICTIONS = ["Connection vs. Avoidance", "Hope vs. Hopelessness", "Anger vs. Shame", "Control vs. Surrender", "Confidence vs. Doubt", "Independence vs. Belonging", "Closeness vs. Distance", "Expression vs. Silence", "Self-care vs. Obligation", "Ideal vs. Reality", "Action vs. Fear", "Growth vs. Comfort"] as const
const SENTIMENTS = ["Positive", "Negative", "Neutral"] as const
const ENTRY_FORMATS = ["Quick Log", "Daily Log", "End of Day", "Consolidated"] as const

export async function createEntry(fields: {
  userId: string  // firebase_uid
  text: string
  name?: string
  type?: string
  format?: string
  date?: string
  snapshot?: string
  inferredMode?: string
  inferredEnergy?: string
  energyShape?: string
  sentiment?: string
  contradiction?: string
  themeTags?: string[]
  loops?: string
  summaryAi?: string
  actionableInsightsAi?: string
  nextAction?: string
  entryLengthWords?: number
  metaFlag?: string
  isSummary?: boolean
  parentEntryId?: string
  isDecomposed?: boolean
  decompositionCount?: number
  sequenceOrder?: number
  approximateTime?: string
  overarchingTheme?: string
}): Promise<EntryRecord> {
  // Resolve firebase_uid to user UUID
  let pgUserId = await resolveUserId(fields.userId)
  if (!pgUserId) {
    // Auto-create user
    const user = await upsertUser({ firebaseUid: fields.userId })
    pgUserId = user.id
  }

  const now = new Date()
  const dateStr = fields.date || now.toISOString().split("T")[0]

  const [row] = await db
    .insert(schema.entries)
    .values({
      userId: pgUserId,
      text: fields.text,
      date: dateStr,
      timestamp: now,
      name: fields.name || null,
      type: safeEnum(fields.type, ENTRY_TYPES) as any,
      format: safeEnum(fields.format, ENTRY_FORMATS) as any,
      snapshot: fields.snapshot || null,
      inferredMode: safeEnum(fields.inferredMode, INFERRED_MODES) as any,
      inferredEnergy: safeEnum(fields.inferredEnergy, ENERGY_LEVELS) as any,
      energyShape: safeEnum(fields.energyShape, ENERGY_SHAPES) as any,
      sentiment: safeEnum(fields.sentiment, SENTIMENTS) as any,
      contradiction: safeEnum(fields.contradiction, CONTRADICTIONS) as any,
      themeTags: fields.themeTags || [],
      loops: fields.loops || null,
      summaryAi: fields.summaryAi || null,
      actionableInsightsAi: fields.actionableInsightsAi || null,
      nextAction: fields.nextAction || null,
      entryLengthWords: fields.entryLengthWords || 0,
      metaFlag: fields.metaFlag || "Web App",
      isSummary: fields.isSummary || false,
      parentEntryId: fields.parentEntryId || null,
      isDecomposed: fields.isDecomposed || false,
      decompositionCount: (fields.decompositionCount || 0) as any,
      sequenceOrder: fields.sequenceOrder as any,
      approximateTime: fields.approximateTime || null,
      overarchingTheme: fields.overarchingTheme || null,
    })
    .returning()

  return dbEntryToRecord(row)
}

export async function updateEntry(entryId: string, fields: Partial<{
  text: string
  name: string
  type: string
  format: string
  snapshot: string
  inferredMode: string
  inferredEnergy: string
  energyShape: string
  sentiment: string
  contradiction: string
  themeTags: string[]
  loops: string
  summaryAi: string
  actionableInsightsAi: string
  nextAction: string
  entryLengthWords: number
  metaFlag: string
  isBookmarked: boolean
  isDeleted: boolean
  isSummary: boolean
  isDecomposed: boolean
  decompositionCount: number
  overarchingTheme: string
}>): Promise<EntryRecord> {
  const updates: any = {}
  if (fields.text !== undefined) updates.text = fields.text
  if (fields.name !== undefined) updates.name = fields.name
  if (fields.type !== undefined) updates.type = safeEnum(fields.type, ENTRY_TYPES)
  if (fields.format !== undefined) updates.format = safeEnum(fields.format, ENTRY_FORMATS)
  if (fields.snapshot !== undefined) updates.snapshot = fields.snapshot
  if (fields.inferredMode !== undefined) updates.inferredMode = safeEnum(fields.inferredMode, INFERRED_MODES)
  if (fields.inferredEnergy !== undefined) updates.inferredEnergy = safeEnum(fields.inferredEnergy, ENERGY_LEVELS)
  if (fields.energyShape !== undefined) updates.energyShape = safeEnum(fields.energyShape, ENERGY_SHAPES)
  if (fields.sentiment !== undefined) updates.sentiment = safeEnum(fields.sentiment, SENTIMENTS)
  if (fields.contradiction !== undefined) updates.contradiction = safeEnum(fields.contradiction, CONTRADICTIONS)
  if (fields.themeTags !== undefined) updates.themeTags = fields.themeTags
  if (fields.loops !== undefined) updates.loops = fields.loops
  if (fields.summaryAi !== undefined) updates.summaryAi = fields.summaryAi
  if (fields.actionableInsightsAi !== undefined) updates.actionableInsightsAi = fields.actionableInsightsAi
  if (fields.nextAction !== undefined) updates.nextAction = fields.nextAction
  if (fields.entryLengthWords !== undefined) updates.entryLengthWords = fields.entryLengthWords
  if (fields.metaFlag !== undefined) updates.metaFlag = fields.metaFlag
  if (fields.isBookmarked !== undefined) updates.isBookmarked = fields.isBookmarked
  if (fields.isDeleted !== undefined) updates.isDeleted = fields.isDeleted
  if (fields.isSummary !== undefined) updates.isSummary = fields.isSummary
  if (fields.isDecomposed !== undefined) updates.isDecomposed = fields.isDecomposed
  if (fields.decompositionCount !== undefined) updates.decompositionCount = fields.decompositionCount
  if (fields.overarchingTheme !== undefined) updates.overarchingTheme = fields.overarchingTheme

  const [row] = await db
    .update(schema.entries)
    .set(updates)
    .where(eq(schema.entries.id, entryId))
    .returning()

  return dbEntryToRecord(row)
}

export async function fetchEntriesByDateRange(startDate: string, endDate: string): Promise<EntryRecord[]> {
  const rows = await db
    .select()
    .from(schema.entries)
    .where(
      and(
        gte(schema.entries.date, startDate),
        lte(schema.entries.date, endDate),
        or(eq(schema.entries.isSummary, false), isNull(schema.entries.isSummary))
      )
    )
    .orderBy(asc(schema.entries.date))

  return rows.map(dbEntryToRecord)
}

export async function fetchAllEntriesForUser(firebaseUid: string): Promise<EntryRecord[]> {
  const userId = await resolveUserId(firebaseUid)
  if (!userId) return []

  const rows = await db
    .select()
    .from(schema.entries)
    .where(
      and(
        eq(schema.entries.userId, userId),
        or(eq(schema.entries.isDeleted, false), isNull(schema.entries.isDeleted)),
        or(eq(schema.entries.isSummary, false), isNull(schema.entries.isSummary))
      )
    )
    .orderBy(desc(schema.entries.date))

  return rows.map(dbEntryToRecord)
}

// Fetch ALL non-deleted, non-summary entries (for chat context — no user filter)
export async function fetchAllEntries(): Promise<EntryRecord[]> {
  const rows = await db
    .select()
    .from(schema.entries)
    .where(
      and(
        or(eq(schema.entries.isDeleted, false), isNull(schema.entries.isDeleted)),
        or(eq(schema.entries.isSummary, false), isNull(schema.entries.isSummary))
      )
    )
    .orderBy(desc(schema.entries.date))

  return rows.map(dbEntryToRecord)
}

// ── Summary Queries (replaces findSummaryByWeek, createSummaryEntry, etc.) ──

export async function findSummaryByPeriod(
  type: "weekly" | "monthly",
  periodId: string
): Promise<{ id: string; data: typeof schema.summaries.$inferSelect } | null> {
  // Weekly: periodId like "2026-W05", monthly: "2026-01"
  // We search for summaries that match the type and contain the periodId somewhere
  // More robustly: search by period_start matching the week/month start date
  const rows = await db
    .select()
    .from(schema.summaries)
    .where(
      and(
        eq(schema.summaries.summaryType, type),
        // Use the narrative or a pattern match — but simpler: just use SQL LIKE on a generated label
        sql`${schema.summaries.narrative} IS NOT NULL`
      )
    )
    .orderBy(desc(schema.summaries.generatedAt))

  // Filter by matching period - for now check if periodStart matches
  for (const row of rows) {
    const start = row.periodStart
    if (type === "weekly" && start) {
      // Check if this summary's period matches the weekId
      const d = new Date(start)
      const jan1 = new Date(d.getFullYear(), 0, 1)
      const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
      const checkId = `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`
      if (checkId === periodId) return { id: row.id, data: row }
    }
    if (type === "monthly" && start) {
      const d = new Date(start)
      const checkId = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (checkId === periodId) return { id: row.id, data: row }
    }
  }

  // Also check entries table for legacy Airtable summaries (Is Summary = true)
  const legacyRows = await db
    .select()
    .from(schema.entries)
    .where(
      and(
        eq(schema.entries.isSummary, true),
        sql`${schema.entries.name} LIKE ${"%" + periodId + "%"}`
      )
    )
    .orderBy(desc(schema.entries.timestamp))
    .limit(1)

  if (legacyRows.length > 0) {
    const e = legacyRows[0]
    return {
      id: e.id,
      data: {
        id: e.id,
        userId: e.userId,
        summaryType: type,
        periodStart: e.date,
        periodEnd: e.date,
        entryCount: e.entryLengthWords || 0, // Legacy: stored count here
        narrative: e.summaryAi,
        moodTrend: null,
        moodSummary: null,
        energyPattern: null,
        keyTakeaway: null,
        eveningReflection: null,
        weeklyInsight: null,
        recommendations: e.actionableInsightsAi ? e.actionableInsightsAi.split("\n\n") : [],
        nextWeekFocus: e.nextAction,
        dominantMode: e.inferredMode,
        dominantEnergy: e.inferredEnergy,
        dominantSentiment: e.sentiment,
        topThemes: e.themeTags || [],
        topContradiction: e.contradiction,
        positiveRatio: null,
        avgEntriesPerDay: null,
        sentimentBreakdown: null,
        generatedAt: e.timestamp,
        tokensUsed: null,
        model: null,
      } as any,
    }
  }

  return null
}

export async function upsertSummary(data: {
  userId?: string  // firebase_uid
  type: "daily" | "weekly" | "monthly"
  periodStart: string
  periodEnd: string
  entryCount: number
  narrative: string
  recommendations: string[]
  nextWeekFocus?: string
  topThemes: string[]
  dominantMode: string
  moodTrend?: string
  weeklyInsight?: string
  monthHighlight?: string
  dominantEnergy?: string
  dominantSentiment?: string
  topContradiction?: string
  positiveRatio?: number
  avgEntriesPerDay?: number
  sentimentBreakdown?: { positive: number; negative: number; neutral: number }
  activeDays?: number
  activeWeeks?: number
}): Promise<string> {
  let pgUserId: string | null = null
  if (data.userId) {
    pgUserId = await resolveUserId(data.userId)
  }

  // Use a default user if none resolved
  if (!pgUserId) {
    const [firstUser] = await db.select({ id: schema.users.id }).from(schema.users).limit(1)
    pgUserId = firstUser?.id || null
  }

  if (!pgUserId) throw new Error("No user found for summary")

  const [row] = await db
    .insert(schema.summaries)
    .values({
      userId: pgUserId,
      summaryType: data.type,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      entryCount: data.entryCount,
      narrative: data.narrative,
      recommendations: data.recommendations,
      nextWeekFocus: data.nextWeekFocus || null,
      topThemes: data.topThemes,
      dominantMode: data.dominantMode,
      moodTrend: safeEnum(data.moodTrend, ["improving", "declining", "stable", "volatile"] as const) as any,
      weeklyInsight: data.weeklyInsight || null,
      dominantEnergy: data.dominantEnergy || null,
      dominantSentiment: data.dominantSentiment || null,
      topContradiction: data.topContradiction || null,
      positiveRatio: data.positiveRatio ?? null,
      avgEntriesPerDay: data.avgEntriesPerDay ?? null,
      sentimentBreakdown: data.sentimentBreakdown || null,
    })
    .onConflictDoUpdate({
      target: [schema.summaries.userId, schema.summaries.summaryType, schema.summaries.periodStart],
      set: {
        narrative: data.narrative,
        recommendations: data.recommendations,
        topThemes: data.topThemes,
        dominantMode: data.dominantMode,
        generatedAt: new Date(),
      },
    })
    .returning({ id: schema.summaries.id })

  return row.id
}

// ── Notification Queries ────────────────────────────────────────────────────

export async function findNotificationSettings(firebaseUid: string) {
  const userId = await resolveUserId(firebaseUid)
  if (!userId) return null

  const [settings] = await db
    .select()
    .from(schema.notificationSettings)
    .where(eq(schema.notificationSettings.userId, userId))
    .limit(1)

  if (!settings) return null

  return {
    id: settings.id,
    userId: firebaseUid,
    enabled: settings.enabled,
    timezone: settings.timezone || "Asia/Kolkata",
    frequency: settings.frequency || "1x_daily",
    customTimes: settings.customTimes || ["09:00", "13:00", "20:00"],
    quietHoursStart: settings.quietHoursStart || "22:00",
    quietHoursEnd: settings.quietHoursEnd || "07:00",
    lastNotified: settings.lastNotified?.toISOString() || null,
    streakAtRisk: settings.streakAtRisk ?? false,
    weeklySummary: settings.weeklySummary ?? false,
    fcmToken: null as string | null, // Loaded from users table
    pgUserId: userId,
  }
}

export async function upsertNotificationSettings(data: {
  firebaseUid: string
  fcmToken: string
  enabled: boolean
  timezone: string
  frequency: string
  customTimes: string[]
  quietHoursStart: string
  quietHoursEnd: string
  streakAtRisk: boolean
  weeklySummary: boolean
}) {
  let userId = await resolveUserId(data.firebaseUid)
  if (!userId) {
    const user = await upsertUser({ firebaseUid: data.firebaseUid })
    userId = user.id
  }

  // Update FCM token on user
  await db.update(schema.users).set({ fcmToken: data.fcmToken }).where(eq(schema.users.id, userId))

  const VALID_FREQUENCIES = ["hourly", "3x_daily", "2x_daily", "1x_daily"] as const

  await db
    .insert(schema.notificationSettings)
    .values({
      userId,
      enabled: data.enabled,
      timezone: data.timezone,
      frequency: safeEnum(data.frequency, VALID_FREQUENCIES) as any || "1x_daily",
      customTimes: data.customTimes,
      quietHoursStart: data.quietHoursStart,
      quietHoursEnd: data.quietHoursEnd,
      streakAtRisk: data.streakAtRisk,
      weeklySummary: data.weeklySummary,
    })
    .onConflictDoUpdate({
      target: schema.notificationSettings.userId,
      set: {
        enabled: data.enabled,
        timezone: data.timezone,
        frequency: safeEnum(data.frequency, VALID_FREQUENCIES) as any || "1x_daily",
        customTimes: data.customTimes,
        quietHoursStart: data.quietHoursStart,
        quietHoursEnd: data.quietHoursEnd,
        streakAtRisk: data.streakAtRisk,
        weeklySummary: data.weeklySummary,
        updatedAt: new Date(),
      },
    })
}

export async function getAllEnabledNotificationUsers() {
  const rows = await db
    .select({
      settingsId: schema.notificationSettings.id,
      userId: schema.notificationSettings.userId,
      enabled: schema.notificationSettings.enabled,
      timezone: schema.notificationSettings.timezone,
      frequency: schema.notificationSettings.frequency,
      customTimes: schema.notificationSettings.customTimes,
      quietHoursStart: schema.notificationSettings.quietHoursStart,
      quietHoursEnd: schema.notificationSettings.quietHoursEnd,
      lastNotified: schema.notificationSettings.lastNotified,
      streakAtRisk: schema.notificationSettings.streakAtRisk,
      weeklySummary: schema.notificationSettings.weeklySummary,
      firebaseUid: schema.users.firebaseUid,
      fcmToken: schema.users.fcmToken,
    })
    .from(schema.notificationSettings)
    .innerJoin(schema.users, eq(schema.notificationSettings.userId, schema.users.id))
    .where(eq(schema.notificationSettings.enabled, true))

  return rows.map(r => ({
    userId: r.firebaseUid,
    fcmToken: r.fcmToken || "",
    enabled: r.enabled,
    timezone: r.timezone || "UTC",
    frequency: r.frequency || "2x_daily",
    customTimes: r.customTimes || ["09:00", "20:00"],
    quietHoursStart: r.quietHoursStart || "22:00",
    quietHoursEnd: r.quietHoursEnd || "07:00",
    lastNotified: r.lastNotified?.toISOString() || null,
    streakAtRisk: r.streakAtRisk ?? false,
    weeklySummary: r.weeklySummary ?? false,
    recordId: r.settingsId, // For updateLastNotified compat
  }))
}

export async function updateLastNotified(settingsId: string) {
  await db
    .update(schema.notificationSettings)
    .set({ lastNotified: new Date(), updatedAt: new Date() })
    .where(eq(schema.notificationSettings.id, settingsId))
}

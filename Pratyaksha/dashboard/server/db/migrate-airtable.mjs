// =============================================================================
// BECOMING — Airtable → PostgreSQL Migration Script
// =============================================================================
// Pulls ALL data from 3 Airtable tables:
//   1. Entries (tblhKYssgHtjpmbni)
//   2. User Profiles (tblmncNWqXioyJYPc)
//   3. Notification Settings (tbluPhiX7JJJe5jM1)
// Transforms and inserts into Cloud SQL PostgreSQL (becoming database)
// =============================================================================

import pg from "pg"
import { config as dotenvConfig } from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenvConfig({ path: join(__dirname, "../../.env") })

// ── Config ──────────────────────────────────────────────────────────────────

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || "appMzFpUZLuZs9VGc"
const ENTRIES_TABLE_ID = process.env.AIRTABLE_TABLE_ID || process.env.VITE_AIRTABLE_TABLE_ID || "tblhKYssgHtjpmbni"
const USER_PROFILES_TABLE_ID = process.env.AIRTABLE_USER_PROFILES_TABLE_ID || "tblmncNWqXioyJYPc"
const NOTIFICATIONS_TABLE_ID = process.env.AIRTABLE_NOTIFICATIONS_TABLE_ID || "tbluPhiX7JJJe5jM1"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "becoming",
  user: process.env.DB_USER || "becoming_app",
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15000,
}

if (!AIRTABLE_API_KEY) {
  console.error("Error: AIRTABLE_API_KEY not set")
  process.exit(1)
}
if (!dbConfig.password) {
  console.error("Error: DB_PASSWORD not set")
  process.exit(1)
}

// ── Valid enum values (must match schema.sql) ───────────────────────────────

const VALID_ENTRY_TYPES = new Set([
  "Emotional", "Cognitive", "Family", "Work", "Relationship",
  "Health", "Creativity", "Social", "Reflection", "Decision",
  "Avoidance", "Growth", "Stress", "Communication", "Routine",
])

const VALID_ENTRY_FORMATS = new Set(["Quick Log", "Daily Log", "End of Day", "Consolidated"])

const VALID_INFERRED_MODES = new Set([
  "Hopeful", "Calm", "Grounded", "Compassionate", "Curious",
  "Reflective", "Conflicted", "Withdrawn", "Overthinking", "Numb",
  "Anxious", "Agitated", "Disconnected", "Self-critical", "Defensive",
])

const VALID_ENERGY_LEVELS = new Set([
  "Very Low", "Low", "Moderate", "Balanced", "High",
  "Elevated", "Scattered", "Drained", "Flat", "Restorative",
])

const VALID_ENERGY_SHAPES = new Set([
  "Flat", "Heavy", "Chaotic", "Rising", "Collapsing",
  "Expanding", "Contracted", "Uneven", "Centered", "Cyclical",
  "Stabilized", "Pulsing",
])

const VALID_CONTRADICTIONS = new Set([
  "Connection vs. Avoidance", "Hope vs. Hopelessness",
  "Anger vs. Shame", "Control vs. Surrender",
  "Confidence vs. Doubt", "Independence vs. Belonging",
  "Closeness vs. Distance", "Expression vs. Silence",
  "Self-care vs. Obligation", "Ideal vs. Reality",
  "Action vs. Fear", "Growth vs. Comfort",
])

const VALID_SENTIMENTS = new Set(["Positive", "Negative", "Neutral"])

const VALID_NOTIFICATION_FREQUENCIES = new Set(["hourly", "3x_daily", "2x_daily", "1x_daily"])

const VALID_GOAL_CATEGORIES = new Set([
  "career", "health", "relationships", "finance",
  "personal-growth", "lifestyle", "contribution", "other",
])

const VALID_TIME_HORIZONS = new Set(["6months", "1year", "3years", "5years", "10years"])

// ── Helpers ─────────────────────────────────────────────────────────────────

function safeEnum(value, validSet) {
  if (!value) return null
  const trimmed = String(value).trim()
  return validSet.has(trimmed) ? trimmed : null
}

function extractAIField(value) {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value.value) return value.value
  return ""
}

function parseThemeTags(value) {
  const raw = extractAIField(value)
  if (!raw) return []
  return raw.split(",").map(t => t.trim()).filter(Boolean)
}

function safeDate(value) {
  if (!value) return null
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0]
  } catch {
    return null
  }
}

function safeTimestamp(value) {
  if (!value) return null
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch {
    return null
  }
}

function safeInt(value, defaultVal = null) {
  if (value === undefined || value === null) return defaultVal
  const n = parseInt(value)
  return isNaN(n) ? defaultVal : n
}

function safeSmallint(value, min, max) {
  const n = safeInt(value)
  if (n === null) return null
  return n >= min && n <= max ? n : null
}

function safeJSON(value) {
  if (!value) return null
  if (typeof value === "object") return value
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

// ── Airtable Fetcher (handles pagination) ───────────────────────────────────

async function fetchAllRecords(tableId, tableName) {
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`
  const records = []
  let offset = undefined
  let page = 0

  console.log(`  Fetching ${tableName}...`)

  do {
    const url = offset ? `${baseUrl}?offset=${offset}` : baseUrl
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`  ⚠ Table ${tableName} (${tableId}) not found, skipping`)
        return []
      }
      const error = await response.text()
      throw new Error(`Airtable ${tableName} fetch failed (${response.status}): ${error}`)
    }

    const data = await response.json()
    records.push(...(data.records || []))
    offset = data.offset
    page++

    if (offset) {
      console.log(`    page ${page}: ${records.length} records so far...`)
      // Airtable rate limit: 5 requests/second
      await new Promise(r => setTimeout(r, 250))
    }
  } while (offset)

  console.log(`  ✓ ${records.length} ${tableName} records fetched`)
  return records
}

// ── Migration Functions ─────────────────────────────────────────────────────

/**
 * Step 1: Migrate User Profiles → users + gamification + life blueprint tables
 * Returns a Map of firebase_uid → postgres user UUID for entry FK resolution
 */
async function migrateUserProfiles(client, records) {
  console.log("\n[Step 1] Migrating User Profiles...")
  const uidMap = new Map() // firebase_uid → postgres UUID
  let created = 0, skipped = 0

  for (const record of records) {
    const f = record.fields
    const firebaseUid = f["Firebase UID"]
    if (!firebaseUid) {
      skipped++
      continue
    }

    // Parse JSON blobs
    const settings = safeJSON(f["Settings"]) || {}
    const gamification = safeJSON(f["Gamification"]) || {}
    const blueprint = safeJSON(f["Life Blueprint"]) || {}
    const badges = safeJSON(f["Badges"]) || []

    // ── Insert into users table ──
    const userResult = await client.query(
      `INSERT INTO users (
        firebase_uid, email, display_name,
        age_range, sex, location, profession,
        stress_level, emotional_openness, reflection_frequency, life_satisfaction,
        personal_goal, selected_memory_topics, seed_memory, default_entry_mode,
        onboarding_completed, show_feature_tour,
        badges, fcm_token, daily_reminder_enabled, reminder_time,
        created_at, last_active
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      ON CONFLICT (firebase_uid) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, users.email),
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        last_active = COALESCE(EXCLUDED.last_active, users.last_active)
      RETURNING id`,
      [
        firebaseUid,
        f["Email"] || `${firebaseUid}@unknown.local`,
        f["Display Name"] || null,
        settings.ageRange || null,
        settings.sex || null,
        settings.location || null,
        settings.profession || null,
        safeSmallint(settings.stressLevel, 1, 5),
        safeSmallint(settings.emotionalOpenness, 1, 5),
        safeSmallint(settings.reflectionFrequency, 1, 5),
        safeSmallint(settings.lifeSatisfaction, 1, 5),
        settings.personalGoal || null,
        settings.selectedMemoryTopics || [],
        settings.seedMemory || null,
        settings.defaultEntryMode || null,
        f["Onboarding Completed"] || false,
        settings.showFeatureTour !== false,
        Array.isArray(badges) ? badges : [],
        f["FCM Token"] || null,
        f["Daily Reminder Enabled"] || false,
        f["Reminder Time"] || null,
        safeTimestamp(f["Created At"]) || new Date().toISOString(),
        safeTimestamp(f["Last Active"]) || new Date().toISOString(),
      ]
    )

    const userId = userResult.rows[0].id
    uidMap.set(firebaseUid, userId)

    // ── Insert gamification data ──
    if (gamification && Object.keys(gamification).length > 0) {
      await client.query(
        `INSERT INTO gamification (
          user_id, karma, streak_days, last_entry_date,
          total_entries_logged, last_daily_dashboard_bonus,
          completed_soul_mapping_topics
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (user_id) DO UPDATE SET
          karma = EXCLUDED.karma,
          streak_days = EXCLUDED.streak_days,
          total_entries_logged = EXCLUDED.total_entries_logged`,
        [
          userId,
          safeInt(gamification.karma, 0),
          safeInt(gamification.streakDays, 0),
          safeDate(gamification.lastEntryDate),
          safeInt(gamification.totalEntriesLogged, 0),
          safeTimestamp(gamification.lastDailyDashboardBonus),
          gamification.completedSoulMappingTopics || [],
        ]
      )
    }

    // ── Insert Life Blueprint data (normalized across 5 tables) ──
    if (blueprint && Object.keys(blueprint).length > 0) {
      // Vision items
      const visions = [...(blueprint.vision || []), ...(blueprint.antiVision || []).map(v => ({ ...v, _isAnti: true }))]
      for (const v of visions) {
        await client.query(
          `INSERT INTO vision_items (user_id, text, category, is_anti, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            v.text,
            VALID_GOAL_CATEGORIES.has(v.category) ? v.category : "other",
            v._isAnti || false,
            safeTimestamp(v.createdAt) || new Date().toISOString(),
          ]
        )
      }

      // Levers
      for (const l of (blueprint.levers || [])) {
        await client.query(
          `INSERT INTO levers (user_id, name, description, pushes_toward, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, l.name, l.description || null, l.pushesToward || "vision", safeTimestamp(l.createdAt) || new Date().toISOString()]
        )
      }

      // Goals (short-term + long-term + time-horizon)
      for (const g of (blueprint.shortTermGoals || [])) {
        await client.query(
          `INSERT INTO goals (user_id, text, category, is_long_term, target_date, completed, completed_at, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            userId, g.text,
            VALID_GOAL_CATEGORIES.has(g.category) ? g.category : "other",
            false,
            safeDate(g.targetDate),
            g.completed || false,
            safeTimestamp(g.completedAt),
            safeTimestamp(g.createdAt) || new Date().toISOString(),
          ]
        )
      }
      for (const g of (blueprint.longTermGoals || [])) {
        await client.query(
          `INSERT INTO goals (user_id, text, category, is_long_term, target_date, completed, completed_at, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            userId, g.text,
            VALID_GOAL_CATEGORIES.has(g.category) ? g.category : "other",
            true,
            safeDate(g.targetDate),
            g.completed || false,
            safeTimestamp(g.completedAt),
            safeTimestamp(g.createdAt) || new Date().toISOString(),
          ]
        )
      }
      for (const g of (blueprint.timeHorizonGoals || [])) {
        await client.query(
          `INSERT INTO goals (user_id, text, category, time_horizon, is_long_term, completed, completed_at, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            userId, g.text,
            VALID_GOAL_CATEGORIES.has(g.category) ? g.category : "other",
            VALID_TIME_HORIZONS.has(g.horizon) ? g.horizon : null,
            true,
            g.completed || false,
            safeTimestamp(g.completedAt),
            safeTimestamp(g.createdAt) || new Date().toISOString(),
          ]
        )
      }

      // Blueprint question responses
      for (const r of (blueprint.responses || [])) {
        await client.query(
          `INSERT INTO blueprint_responses (user_id, question_id, answer, answered_at, updated_at)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (user_id, question_id) DO UPDATE SET
             answer = EXCLUDED.answer, updated_at = EXCLUDED.updated_at`,
          [
            userId, r.questionId, r.answer,
            safeTimestamp(r.answeredAt) || new Date().toISOString(),
            safeTimestamp(r.updatedAt) || safeTimestamp(r.answeredAt) || new Date().toISOString(),
          ]
        )
      }

      // Completed sections
      for (const section of (blueprint.completedSections || [])) {
        await client.query(
          `INSERT INTO blueprint_sections (user_id, section_name)
           VALUES ($1, $2)
           ON CONFLICT (user_id, section_name) DO NOTHING`,
          [userId, section]
        )
      }
    }

    created++
  }

  console.log(`  ✓ ${created} users migrated, ${skipped} skipped (no Firebase UID)`)
  return uidMap
}

/**
 * Step 2: Migrate Entries → entries table
 * Uses uidMap to resolve User_ID → users.id FK
 */
async function migrateEntries(client, records, uidMap) {
  console.log("\n[Step 2] Migrating Entries...")
  let migrated = 0, skipped = 0, autoCreatedUsers = 0
  const airtableIdMap = new Map() // airtable record ID → postgres entry UUID

  // Sort so parent entries come before children
  const sorted = [...records].sort((a, b) => {
    const aTime = a.createdTime || a.fields.Timestamp || ""
    const bTime = b.createdTime || b.fields.Timestamp || ""
    return aTime.localeCompare(bTime)
  })

  for (const record of sorted) {
    const f = record.fields
    const firebaseUid = f.User_ID

    // Skip entries with no text
    if (!f.Text) {
      skipped++
      continue
    }

    // Resolve user FK
    let userId = firebaseUid ? uidMap.get(firebaseUid) : null
    if (!userId && firebaseUid) {
      // User not in profiles table — create a minimal user record
      const result = await client.query(
        `INSERT INTO users (firebase_uid, email) VALUES ($1, $2)
         ON CONFLICT (firebase_uid) DO UPDATE SET last_active = NOW()
         RETURNING id`,
        [firebaseUid, `${firebaseUid}@unknown.local`]
      )
      userId = result.rows[0].id
      uidMap.set(firebaseUid, userId)
      autoCreatedUsers++
    }

    if (!userId) {
      // Entry has no user — skip (likely corrupted data)
      skipped++
      continue
    }

    // Resolve parent entry (if this is a child of a decomposed entry)
    let parentEntryId = null
    if (f["Parent Entry ID"]) {
      parentEntryId = airtableIdMap.get(f["Parent Entry ID"]) || null
    }

    // Parse theme tags
    const themeTags = parseThemeTags(f["Entry Theme Tags (AI)"])
    const sentimentRaw = extractAIField(f["Entry Sentiment (AI)"])

    // Word count
    const wordCount = f["Entry Length (Words)"] || (f.Text ? f.Text.trim().split(/\s+/).filter(Boolean).length : 0)

    const result = await client.query(
      `INSERT INTO entries (
        airtable_id, user_id, text, date, timestamp,
        name, type, format, snapshot,
        inferred_mode, inferred_energy, energy_shape, sentiment,
        contradiction, theme_tags, loops,
        summary_ai, actionable_insights_ai, next_action,
        entry_length_words, meta_flag,
        parent_entry_id, is_decomposed, decomposition_count,
        sequence_order, approximate_time, overarching_theme,
        is_bookmarked, is_deleted, is_summary,
        created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31
      ) RETURNING id`,
      [
        record.id,                                           // $1: airtable_id
        userId,                                              // $2: user_id
        f.Text,                                              // $3: text
        safeDate(f.Date) || new Date().toISOString().split("T")[0], // $4: date
        safeTimestamp(record.createdTime || f.Timestamp) || new Date().toISOString(), // $5: timestamp
        f.Name || null,                                      // $6: name
        safeEnum(f.Type, VALID_ENTRY_TYPES),                 // $7: type
        safeEnum(f["Entry Format"], VALID_ENTRY_FORMATS),    // $8: format
        f.Snapshot || null,                                  // $9: snapshot
        safeEnum(f["Inferred Mode"], VALID_INFERRED_MODES),  // $10: inferred_mode
        safeEnum(f["Inferred Energy"], VALID_ENERGY_LEVELS), // $11: inferred_energy
        safeEnum(f["Energy Shape"], VALID_ENERGY_SHAPES),    // $12: energy_shape
        safeEnum(sentimentRaw, VALID_SENTIMENTS),            // $13: sentiment
        safeEnum(f.Contradiction, VALID_CONTRADICTIONS),     // $14: contradiction
        themeTags,                                           // $15: theme_tags (TEXT[])
        f.Loops || null,                                     // $16: loops
        f["Summary (AI)"] || null,                           // $17: summary_ai
        f["Actionable Insights (AI)"] || null,               // $18: actionable_insights_ai
        f["Next Action"] || null,                            // $19: next_action
        safeInt(wordCount, 0),                               // $20: entry_length_words
        f["Meta Flag"] || "Web App",                         // $21: meta_flag
        parentEntryId,                                       // $22: parent_entry_id
        f["Is Decomposed?"] || false,                        // $23: is_decomposed
        safeInt(f["Decomposition Count"], 0),                // $24: decomposition_count
        safeInt(f["Sequence Order"]),                         // $25: sequence_order
        f["Approximate Time"] || null,                       // $26: approximate_time
        f["Overarching Theme"] || null,                      // $27: overarching_theme
        f["Is Bookmarked?"] || false,                        // $28: is_bookmarked
        f["Is Deleted?"] || false,                           // $29: is_deleted
        f["Is Summary?"] || false,                           // $30: is_summary
        safeTimestamp(record.createdTime || f.Timestamp) || new Date().toISOString(), // $31: created_at
      ]
    )

    airtableIdMap.set(record.id, result.rows[0].id)
    migrated++

    // Progress logging every 50 entries
    if (migrated % 50 === 0) {
      console.log(`    ${migrated} entries migrated...`)
    }
  }

  console.log(`  ✓ ${migrated} entries migrated, ${skipped} skipped`)
  if (autoCreatedUsers > 0) {
    console.log(`  ⚠ ${autoCreatedUsers} users auto-created (had entries but no profile)`)
  }

  return airtableIdMap
}

/**
 * Step 3: Migrate Notification Settings
 */
async function migrateNotifications(client, records, uidMap) {
  console.log("\n[Step 3] Migrating Notification Settings...")
  let migrated = 0, skipped = 0

  for (const record of records) {
    const f = record.fields
    const firebaseUid = f["User ID"]
    if (!firebaseUid) {
      skipped++
      continue
    }

    const userId = uidMap.get(firebaseUid)
    if (!userId) {
      console.warn(`  ⚠ Notification for unknown user: ${firebaseUid}`)
      skipped++
      continue
    }

    // Also update FCM token on users table
    if (f["FCM Token"]) {
      await client.query(
        `UPDATE users SET fcm_token = $1 WHERE id = $2`,
        [f["FCM Token"], userId]
      )
    }

    // Parse custom times
    const customTimes = f["Custom Times"]
      ? f["Custom Times"].split(",").map(t => t.trim()).filter(Boolean)
      : ["09:00", "13:00", "20:00"]

    await client.query(
      `INSERT INTO notification_settings (
        user_id, enabled, timezone, frequency,
        custom_times, quiet_hours_start, quiet_hours_end,
        streak_at_risk, weekly_summary, last_notified
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (user_id) DO UPDATE SET
        enabled = EXCLUDED.enabled,
        timezone = EXCLUDED.timezone,
        frequency = EXCLUDED.frequency,
        custom_times = EXCLUDED.custom_times`,
      [
        userId,
        f["Enabled"] || false,
        f["Timezone"] || "Asia/Kolkata",
        safeEnum(f["Frequency"], VALID_NOTIFICATION_FREQUENCIES) || "1x_daily",
        customTimes,
        f["Quiet Hours Start"] || "22:00",
        f["Quiet Hours End"] || "07:00",
        f["Streak At Risk"] || false,
        f["Weekly Summary"] || false,
        safeTimestamp(f["Last Notified"]),
      ]
    )

    migrated++
  }

  console.log(`  ✓ ${migrated} notification settings migrated, ${skipped} skipped`)
}

// ── Main Migration ──────────────────────────────────────────────────────────

async function migrate() {
  console.log("=".repeat(60))
  console.log("  BECOMING — Airtable → PostgreSQL Migration")
  console.log("=".repeat(60))
  console.log(`  Source: Airtable base ${AIRTABLE_BASE_ID}`)
  console.log(`  Target: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`)
  console.log("")

  // ── Phase 1: Fetch all Airtable data ──
  console.log("Phase 1: Fetching data from Airtable...")

  const [entryRecords, profileRecords, notificationRecords] = await Promise.all([
    fetchAllRecords(ENTRIES_TABLE_ID, "Entries"),
    fetchAllRecords(USER_PROFILES_TABLE_ID, "User Profiles"),
    fetchAllRecords(NOTIFICATIONS_TABLE_ID, "Notification Settings"),
  ])

  console.log(`\n  Total: ${entryRecords.length} entries, ${profileRecords.length} profiles, ${notificationRecords.length} notification settings`)

  // ── Phase 2: Insert into PostgreSQL ──
  console.log("\nPhase 2: Inserting into PostgreSQL...")

  const client = new pg.Client(dbConfig)
  await client.connect()
  console.log("  Connected to Cloud SQL")

  try {
    // Start transaction
    await client.query("BEGIN")

    // Clear existing data (idempotent migration)
    console.log("\n  Clearing existing data for clean migration...")
    await client.query("DELETE FROM offline_queue")
    await client.query("DELETE FROM pattern_warnings")
    await client.query("DELETE FROM explainer_cache")
    await client.query("DELETE FROM prompt_cache")
    await client.query("DELETE FROM api_usage")
    await client.query("DELETE FROM chat_messages")
    await client.query("DELETE FROM summaries")
    await client.query("DELETE FROM notification_settings")
    await client.query("DELETE FROM entry_embeddings")
    await client.query("DELETE FROM entries")
    await client.query("DELETE FROM blueprint_sections")
    await client.query("DELETE FROM blueprint_responses")
    await client.query("DELETE FROM goals")
    await client.query("DELETE FROM levers")
    await client.query("DELETE FROM vision_items")
    await client.query("DELETE FROM gamification")
    await client.query("DELETE FROM users")
    console.log("  ✓ Tables cleared")

    // Migrate in dependency order
    const uidMap = await migrateUserProfiles(client, profileRecords)
    const airtableIdMap = await migrateEntries(client, entryRecords, uidMap)
    await migrateNotifications(client, notificationRecords, uidMap)

    // Commit transaction
    await client.query("COMMIT")
    console.log("\n  ✓ Transaction committed")

    // ── Phase 3: Verification ──
    console.log("\nPhase 3: Verification...")

    const counts = await client.query(`
      SELECT
        (SELECT count(*) FROM users) as users,
        (SELECT count(*) FROM gamification) as gamification,
        (SELECT count(*) FROM entries) as entries,
        (SELECT count(*) FROM entries WHERE NOT is_deleted AND NOT is_summary) as active_entries,
        (SELECT count(*) FROM entries WHERE is_summary) as summaries,
        (SELECT count(*) FROM entries WHERE is_deleted) as deleted,
        (SELECT count(*) FROM vision_items) as vision_items,
        (SELECT count(*) FROM levers) as levers,
        (SELECT count(*) FROM goals) as goals,
        (SELECT count(*) FROM blueprint_responses) as bp_responses,
        (SELECT count(*) FROM blueprint_sections) as bp_sections,
        (SELECT count(*) FROM notification_settings) as notifications
    `)

    const c = counts.rows[0]
    console.log(`
  ┌─────────────────────────────────────┐
  │  Migration Results                  │
  ├─────────────────────────────────────┤
  │  Users:              ${String(c.users).padStart(6)}       │
  │  Gamification:       ${String(c.gamification).padStart(6)}       │
  │  Entries (total):    ${String(c.entries).padStart(6)}       │
  │    Active:           ${String(c.active_entries).padStart(6)}       │
  │    Summaries:        ${String(c.summaries).padStart(6)}       │
  │    Deleted:          ${String(c.deleted).padStart(6)}       │
  │  Vision Items:       ${String(c.vision_items).padStart(6)}       │
  │  Levers:             ${String(c.levers).padStart(6)}       │
  │  Goals:              ${String(c.goals).padStart(6)}       │
  │  BP Responses:       ${String(c.bp_responses).padStart(6)}       │
  │  BP Sections:        ${String(c.bp_sections).padStart(6)}       │
  │  Notifications:      ${String(c.notifications).padStart(6)}       │
  └─────────────────────────────────────┘`)

    // Show entry type distribution
    const typeDist = await client.query(`
      SELECT type, count(*) as cnt FROM entries
      WHERE NOT is_deleted AND NOT is_summary AND type IS NOT NULL
      GROUP BY type ORDER BY cnt DESC LIMIT 10
    `)
    if (typeDist.rows.length > 0) {
      console.log("\n  Entry type distribution:")
      typeDist.rows.forEach(r => console.log(`    ${r.type}: ${r.cnt}`))
    }

    // Show user entry counts
    const userEntries = await client.query(`
      SELECT u.display_name, u.firebase_uid, count(e.id) as entry_count
      FROM users u LEFT JOIN entries e ON e.user_id = u.id AND NOT e.is_deleted
      GROUP BY u.id, u.display_name, u.firebase_uid
      ORDER BY entry_count DESC
    `)
    if (userEntries.rows.length > 0) {
      console.log("\n  Entries per user:")
      userEntries.rows.forEach(r => {
        const name = r.display_name || r.firebase_uid.substring(0, 12) + "..."
        console.log(`    ${name}: ${r.entry_count} entries`)
      })
    }

    // Airtable vs PostgreSQL comparison
    console.log("\n  Airtable → PostgreSQL comparison:")
    console.log(`    Airtable profiles: ${profileRecords.length} → PostgreSQL users: ${c.users}`)
    console.log(`    Airtable entries:  ${entryRecords.length} → PostgreSQL entries: ${c.entries}`)
    console.log(`    Airtable notifs:   ${notificationRecords.length} → PostgreSQL notifs: ${c.notifications}`)

  } catch (error) {
    await client.query("ROLLBACK")
    console.error("\n  ✗ Migration failed, rolled back:", error.message)
    if (error.detail) console.error("  Detail:", error.detail)
    if (error.hint) console.error("  Hint:", error.hint)
    process.exit(1)
  } finally {
    await client.end()
  }

  console.log("\n" + "=".repeat(60))
  console.log("  Migration complete!")
  console.log("=".repeat(60))
}

migrate().catch(error => {
  console.error("Fatal error:", error)
  process.exit(1)
})

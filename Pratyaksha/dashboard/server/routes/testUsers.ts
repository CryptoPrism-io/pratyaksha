// Test User management routes for multi-user validation
import { Router, Request, Response } from "express"
import { db, upsertUser, findUserByFirebaseUid, resolveUserId } from "../lib/db"
import * as schema from "../db/drizzle-schema"
import { eq, like, sql } from "drizzle-orm"

const router = Router()

const TEST_PREFIX = "test-"

function isTestUid(uid: string): boolean {
  return uid.startsWith(TEST_PREFIX)
}

/**
 * POST /api/test-users/setup
 * Creates or updates a test user with profile data.
 * Body: { firebaseUid, displayName, email, personalization, gamification, lifeBlueprint }
 */
router.post("/setup", async (req: Request, res: Response) => {
  try {
    const { firebaseUid, displayName, email, personalization, gamification, lifeBlueprint } = req.body

    if (!firebaseUid || !isTestUid(firebaseUid)) {
      return res.status(400).json({
        success: false,
        error: "firebaseUid must start with 'test-' prefix",
      })
    }

    // Upsert base user + gamification
    const user = await upsertUser({
      firebaseUid,
      displayName,
      email: email || `${firebaseUid}@pratyaksha.dev`,
      personalization: personalization || {},
      gamification: gamification || {},
      onboardingCompleted: true,
    })

    // Upsert Life Blueprint data if provided
    if (lifeBlueprint) {
      // Delete existing blueprint data for clean slate
      await db.delete(schema.visionItems).where(eq(schema.visionItems.userId, user.id))
      await db.delete(schema.levers).where(eq(schema.levers.userId, user.id))
      await db.delete(schema.goals).where(eq(schema.goals.userId, user.id))
      await db.delete(schema.blueprintResponses).where(eq(schema.blueprintResponses.userId, user.id))
      await db.delete(schema.blueprintSections).where(eq(schema.blueprintSections.userId, user.id))

      // Insert vision items (using raw SQL with ISO timestamps)
      if (lifeBlueprint.vision?.length > 0) {
        for (const v of lifeBlueprint.vision) {
          const timestamp = v.createdAt || new Date().toISOString()
          await db.execute(sql`
            INSERT INTO vision_items (user_id, text, category, is_anti, created_at)
            VALUES (
              ${user.id}::uuid,
              ${v.text},
              ${v.category || 'other'},
              false,
              ${timestamp}::timestamptz
            )
          `)
        }
      }

      // Insert anti-vision items (using raw SQL with ISO timestamps)
      if (lifeBlueprint.antiVision?.length > 0) {
        for (const v of lifeBlueprint.antiVision) {
          const timestamp = v.createdAt || new Date().toISOString()
          await db.execute(sql`
            INSERT INTO vision_items (user_id, text, category, is_anti, created_at)
            VALUES (
              ${user.id}::uuid,
              ${v.text},
              ${v.category || 'other'},
              true,
              ${timestamp}::timestamptz
            )
          `)
        }
      }

      // Insert levers (using raw SQL with ISO timestamps)
      if (lifeBlueprint.levers?.length > 0) {
        for (const l of lifeBlueprint.levers) {
          const timestamp = l.createdAt || new Date().toISOString()
          await db.execute(sql`
            INSERT INTO levers (user_id, name, description, pushes_toward, created_at)
            VALUES (
              ${user.id}::uuid,
              ${l.name},
              ${l.description || ''},
              ${l.pushesToward || 'vision'},
              ${timestamp}::timestamptz
            )
          `)
        }
      }

      // Insert goals from generic 'goals' array (using raw SQL with ISO timestamps)
      const allGoals = [
        ...(lifeBlueprint.goals || []),
        ...(lifeBlueprint.timeHorizonGoals || []),
        ...(lifeBlueprint.shortTermGoals || []),
      ];

      if (allGoals.length > 0) {
        for (const g of allGoals) {
          const timestamp = g.createdAt || new Date().toISOString()
          const timeHorizon = g.horizon || g.timeHorizon || null
          await db.execute(sql`
            INSERT INTO goals (user_id, text, category, time_horizon, created_at)
            VALUES (
              ${user.id}::uuid,
              ${g.text},
              ${g.category || 'other'},
              ${timeHorizon},
              ${timestamp}::timestamptz
            )
          `)
        }
      }

      // Insert long-term goals (using raw SQL with ISO timestamps)
      if (lifeBlueprint.longTermGoals?.length > 0) {
        for (const g of lifeBlueprint.longTermGoals) {
          const timestamp = g.createdAt || new Date().toISOString()
          await db.execute(sql`
            INSERT INTO goals (user_id, text, category, is_long_term, created_at)
            VALUES (
              ${user.id}::uuid,
              ${g.text},
              ${g.category || 'other'},
              true,
              ${timestamp}::timestamptz
            )
          `)
        }
      }

      // Insert blueprint responses (using raw SQL with ISO timestamps)
      if (lifeBlueprint.responses?.length > 0) {
        for (const r of lifeBlueprint.responses) {
          const timestamp = r.answeredAt || new Date().toISOString()
          await db.execute(sql`
            INSERT INTO blueprint_responses (user_id, question_id, answer, answered_at)
            VALUES (
              ${user.id}::uuid,
              ${r.questionId},
              ${r.answer},
              ${timestamp}::timestamptz
            )
          `)
        }
      }

      // Insert completed sections (using raw SQL)
      if (lifeBlueprint.completedSections?.length > 0) {
        for (const sectionName of lifeBlueprint.completedSections) {
          await db.execute(sql`
            INSERT INTO blueprint_sections (user_id, section_name, completed_at)
            VALUES (${user.id}::uuid, ${sectionName}, NOW())
          `)
        }
      }
    }

    console.log(`[TestUsers] Upserted test user: ${firebaseUid} (${displayName})`)

    return res.json({ success: true, user })
  } catch (error) {
    console.error("[TestUsers] Error creating test user:", error)
    return res.status(500).json({ success: false, error: String(error) })
  }
})

/**
 * GET /api/test-users
 * Lists all test users (firebase_uid LIKE 'test-%') with entry/embedding counts.
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const testUsers = await db
      .select({
        id: schema.users.id,
        firebaseUid: schema.users.firebaseUid,
        displayName: schema.users.displayName,
        email: schema.users.email,
        profession: schema.users.profession,
        stressLevel: schema.users.stressLevel,
        personalGoal: schema.users.personalGoal,
        createdAt: schema.users.createdAt,
        lastActive: schema.users.lastActive,
      })
      .from(schema.users)
      .where(like(schema.users.firebaseUid, "test-%"))

    // Get entry and embedding counts for each user
    const usersWithCounts = await Promise.all(
      testUsers.map(async (u) => {
        const [entryCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.entries)
          .where(eq(schema.entries.userId, u.id))

        const [embeddingCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.entryEmbeddings)
          .where(eq(schema.entryEmbeddings.userId, u.id))

        return {
          ...u,
          entryCount: entryCount?.count || 0,
          embeddingCount: embeddingCount?.count || 0,
        }
      })
    )

    return res.json({ success: true, users: usersWithCounts })
  } catch (error) {
    console.error("[TestUsers] Error listing test users:", error)
    return res.status(500).json({ success: false, error: String(error) })
  }
})

/**
 * DELETE /api/test-users/:firebaseUid
 * Deletes a single test user and all cascading data.
 */
router.delete("/:firebaseUid", async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params

    if (!isTestUid(firebaseUid)) {
      return res.status(400).json({
        success: false,
        error: "Can only delete users with 'test-' prefix",
      })
    }

    const user = await findUserByFirebaseUid(firebaseUid)
    if (!user) {
      return res.status(404).json({ success: false, error: "Test user not found" })
    }

    // CASCADE delete handles entries, embeddings, gamification, etc.
    await db.delete(schema.users).where(eq(schema.users.id, user.id))

    console.log(`[TestUsers] Deleted test user: ${firebaseUid}`)
    return res.json({ success: true, deleted: firebaseUid })
  } catch (error) {
    console.error("[TestUsers] Error deleting test user:", error)
    return res.status(500).json({ success: false, error: String(error) })
  }
})

/**
 * DELETE /api/test-users/all
 * Deletes ALL test users (cleanup).
 */
router.delete("/all", async (_req: Request, res: Response) => {
  try {
    const result = await db
      .delete(schema.users)
      .where(like(schema.users.firebaseUid, "test-%"))
      .returning({ id: schema.users.id, firebaseUid: schema.users.firebaseUid })

    console.log(`[TestUsers] Deleted ${result.length} test users`)
    return res.json({ success: true, deletedCount: result.length, deleted: result })
  } catch (error) {
    console.error("[TestUsers] Error deleting all test users:", error)
    return res.status(500).json({ success: false, error: String(error) })
  }
})

export default router

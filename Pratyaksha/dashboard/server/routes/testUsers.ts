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
 * Body: { firebaseUid, displayName, email, personalization }
 */
router.post("/setup", async (req: Request, res: Response) => {
  try {
    const { firebaseUid, displayName, email, personalization } = req.body

    if (!firebaseUid || !isTestUid(firebaseUid)) {
      return res.status(400).json({
        success: false,
        error: "firebaseUid must start with 'test-' prefix",
      })
    }

    const user = await upsertUser({
      firebaseUid,
      displayName,
      email: email || `${firebaseUid}@pratyaksha.dev`,
      personalization: personalization || {},
      onboardingCompleted: true,
    })

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

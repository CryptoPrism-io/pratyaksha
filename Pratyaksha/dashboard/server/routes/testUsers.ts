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

      // Insert vision items (let DB generate IDs)
      if (lifeBlueprint.vision?.length > 0) {
        await db.insert(schema.visionItems).values(
          lifeBlueprint.vision.map((v: any) => ({
            userId: user.id,
            text: v.text,
            category: v.category || "other",
            isAnti: false,
            createdAt: new Date(v.createdAt),
          }))
        )
      }

      // Insert anti-vision items (let DB generate IDs)
      if (lifeBlueprint.antiVision?.length > 0) {
        await db.insert(schema.visionItems).values(
          lifeBlueprint.antiVision.map((v: any) => ({
            userId: user.id,
            text: v.text,
            category: v.category || "other",
            isAnti: true,
            createdAt: new Date(v.createdAt),
          }))
        )
      }

      // Insert levers (let DB generate IDs)
      if (lifeBlueprint.levers?.length > 0) {
        await db.insert(schema.levers).values(
          lifeBlueprint.levers.map((l: any) => ({
            userId: user.id,
            name: l.name,
            description: l.description || "",
            pushesToward: l.pushesToward || "vision",
            createdAt: new Date(l.createdAt),
          }))
        )
      }

      // Insert time-horizon goals (let DB generate IDs, omit targetDate if not provided)
      if (lifeBlueprint.timeHorizonGoals?.length > 0) {
        await db.insert(schema.goals).values(
          lifeBlueprint.timeHorizonGoals.map((g: any) => {
            const goal: any = {
              userId: user.id,
              text: g.text,
              category: g.category || "other",
              timeHorizon: g.horizon,
              isLongTerm: false,
              completed: g.completed || false,
              createdAt: new Date(g.createdAt),
            }
            if (g.targetDate) goal.targetDate = g.targetDate
            if (g.completedAt) goal.completedAt = new Date(g.completedAt)
            return goal
          })
        )
      }

      // Insert short-term goals (if any)
      if (lifeBlueprint.shortTermGoals?.length > 0) {
        await db.insert(schema.goals).values(
          lifeBlueprint.shortTermGoals.map((g: any) => {
            const goal: any = {
              userId: user.id,
              text: g.text,
              category: g.category || "other",
              isLongTerm: false,
              completed: g.completed || false,
              createdAt: new Date(g.createdAt),
            }
            if (g.targetDate) goal.targetDate = g.targetDate
            if (g.completedAt) goal.completedAt = new Date(g.completedAt)
            return goal
          })
        )
      }

      // Insert long-term goals (if any)
      if (lifeBlueprint.longTermGoals?.length > 0) {
        await db.insert(schema.goals).values(
          lifeBlueprint.longTermGoals.map((g: any) => {
            const goal: any = {
              userId: user.id,
              text: g.text,
              category: g.category || "other",
              isLongTerm: true,
              completed: g.completed || false,
              createdAt: new Date(g.createdAt),
            }
            if (g.targetDate) goal.targetDate = g.targetDate
            if (g.completedAt) goal.completedAt = new Date(g.completedAt)
            return goal
          })
        )
      }

      // Insert blueprint responses
      if (lifeBlueprint.responses?.length > 0) {
        await db.insert(schema.blueprintResponses).values(
          lifeBlueprint.responses.map((r: any) => {
            const response: any = {
              userId: user.id,
              questionId: r.questionId,
              answer: r.answer,
              answeredAt: new Date(r.answeredAt),
            }
            if (r.updatedAt) response.updatedAt = new Date(r.updatedAt)
            return response
          })
        )
      }

      // Insert completed sections (sectionName, not sectionId)
      if (lifeBlueprint.completedSections?.length > 0) {
        await db.insert(schema.blueprintSections).values(
          lifeBlueprint.completedSections.map((sectionName: string) => ({
            userId: user.id,
            sectionName,  // Changed from sectionId
            completedAt: new Date(),
          }))
        )
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

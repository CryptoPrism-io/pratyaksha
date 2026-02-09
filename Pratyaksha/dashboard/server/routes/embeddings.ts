// Embeddings management routes
import { Router, Request, Response } from "express"
import { embedAllMissing } from "../lib/embeddings"
import { db } from "../lib/db"
import { sql } from "drizzle-orm"

const router = Router()

/**
 * POST /api/embeddings/backfill
 * Generate embeddings for entries that don't have them yet
 * Processes up to 100 entries per request
 */
router.post("/backfill", async (req: Request, res: Response) => {
  try {
    console.log("[Embeddings] Starting backfill batch...")

    // Get count before
    const beforeCount = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM entries e
      LEFT JOIN entry_embeddings ee ON ee.entry_id = e.id
      WHERE ee.id IS NULL
        AND e.is_deleted = false
        AND e.text IS NOT NULL
        AND length(e.text) > 10
    `)

    const remaining = parseInt((beforeCount as any)[0]?.count || "0")

    if (remaining === 0) {
      return res.json({
        success: true,
        embedded: 0,
        errors: 0,
        remaining: 0,
        message: "All entries already have embeddings",
      })
    }

    // Generate embeddings for batch
    const stats = await embedAllMissing()

    // Get count after
    const afterCount = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM entries e
      LEFT JOIN entry_embeddings ee ON ee.entry_id = e.id
      WHERE ee.id IS NULL
        AND e.is_deleted = false
        AND e.text IS NOT NULL
        AND length(e.text) > 10
    `)

    const remainingAfter = parseInt((afterCount as any)[0]?.count || "0")

    return res.json({
      success: true,
      embedded: stats.embedded,
      errors: stats.errors,
      remaining: remainingAfter,
      message: `Embedded ${stats.embedded} entries, ${remainingAfter} remaining`,
    })
  } catch (error) {
    console.error("[Embeddings] Backfill error:", error)
    return res.status(500).json({
      success: false,
      error: String(error),
    })
  }
})

/**
 * GET /api/embeddings/status
 * Get embedding coverage statistics
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    // Total entries
    const totalResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM entries
      WHERE is_deleted = false
    `)
    const total = parseInt((totalResult as any)[0]?.count || "0")

    // Entries with embeddings
    const embeddedResult = await db.execute(sql`
      SELECT COUNT(DISTINCT ee.entry_id) as count
      FROM entry_embeddings ee
      JOIN entries e ON e.id = ee.entry_id
      WHERE e.is_deleted = false
    `)
    const embedded = parseInt((embeddedResult as any)[0]?.count || "0")

    // Entries without embeddings
    const missingResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM entries e
      LEFT JOIN entry_embeddings ee ON ee.entry_id = e.id
      WHERE ee.id IS NULL
        AND e.is_deleted = false
        AND e.text IS NOT NULL
        AND length(e.text) > 10
    `)
    const missing = parseInt((missingResult as any)[0]?.count || "0")

    // By user type
    const byUserType = await db.execute(sql`
      SELECT
        CASE
          WHEN u.firebase_uid LIKE 'test-%' THEN 'test'
          ELSE 'real'
        END as user_type,
        COUNT(DISTINCT e.id) as total_entries,
        COUNT(DISTINCT ee.entry_id) as embedded_entries
      FROM entries e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN entry_embeddings ee ON ee.entry_id = e.id
      WHERE e.is_deleted = false
      GROUP BY user_type
    `)

    return res.json({
      success: true,
      total,
      embedded,
      missing,
      coverage: total > 0 ? Math.round((embedded / total) * 100) : 0,
      byUserType: byUserType as any[],
    })
  } catch (error) {
    console.error("[Embeddings] Status error:", error)
    return res.status(500).json({
      success: false,
      error: String(error),
    })
  }
})

export default router

// GET /api/entries - Fetch all entries for a user
import { Router, Request, Response } from "express"
import { db, resolveUserId, type EntryRecord } from "../lib/db"
import * as schema from "../db/drizzle-schema"
import { eq, desc } from "drizzle-orm"

const router = Router()

/**
 * GET /api/entries
 * Returns all entries for the authenticated user
 * Requires: X-Firebase-UID header
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.headers["x-firebase-uid"] as string

    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        error: "Missing X-Firebase-UID header",
      })
    }

    // Resolve user ID from Firebase UID
    const userId = await resolveUserId(firebaseUid)

    if (!userId) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    // Fetch all entries for this user, sorted by date descending
    const entries = await db
      .select()
      .from(schema.entries)
      .where(eq(schema.entries.userId, userId))
      .orderBy(desc(schema.entries.date))

    // Convert to EntryRecord format (Airtable-compatible)
    const entryRecords: EntryRecord[] = entries.map((entry) => ({
      id: entry.id,
      fields: {
        Text: entry.text,
        Date: entry.date,
        Timestamp: entry.timestamp?.toISOString() || entry.date,
        Name: entry.name || "",
        Type: entry.type || "Reflection",
        Snapshot: entry.snapshot || "",
        "Inferred Mode": entry.inferredMode || "Reflective",
        "Inferred Energy": entry.inferredEnergy || "Moderate",
        "Energy Shape": entry.energyShape || "Centered",
        Contradiction: entry.contradiction || undefined,
        Loops: entry.loops || "",
        "Next Action": entry.nextAction || "",
        "Meta Flag": entry.metaFlag || "Web App",
        "Is Summary?": entry.isSummary || false,
        "Summary (AI)": entry.summaryAi || "",
        "Actionable Insights (AI)": entry.actionableInsightsAi || "",
        "Entry Length (Words)": entry.entryLengthWords || 0,
        "Entry Sentiment (AI)": entry.sentiment || "Neutral",
        "Entry Theme Tags (AI)": (entry.themeTags || []).join(", "),
        "Is Deleted?": entry.isDeleted || false,
        "Is Bookmarked?": entry.isBookmarked || false,
        "Entry Format": entry.format || "Daily Log",
        "Parent Entry ID": entry.parentEntryId || undefined,
        "Is Decomposed?": entry.isDecomposed || false,
        "Decomposition Count": entry.decompositionCount || 0,
        "Sequence Order": entry.sequenceOrder || undefined,
        "Approximate Time": entry.approximateTime || undefined,
        "Overarching Theme": entry.overarchingTheme || undefined,
      },
    }))

    return res.json({
      success: true,
      entries: entryRecords,
      count: entryRecords.length,
    })
  } catch (error) {
    console.error("[Entries] Error fetching entries:", error)
    return res.status(500).json({
      success: false,
      error: String(error),
    })
  }
})

export default router

// =============================================================================
// BECOMING — LLM Response Cache (PostgreSQL-backed)
// Uses prompt_cache table to avoid redundant LLM calls
// =============================================================================

import { createHash } from "crypto"
import { db } from "./db"
import { eq, and, sql, gt, isNull, or } from "drizzle-orm"
import * as schema from "../db/drizzle-schema"

// Default cache TTL: 24 hours for agent responses, 1 hour for chat
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000

/**
 * Generate a SHA-256 hash for cache key from prompt components
 */
function hashPrompt(systemPrompt: string | undefined, userPrompt: string, model: string): string {
  const input = `${model}::${systemPrompt || ""}::${userPrompt}`
  return createHash("sha256").update(input).digest("hex")
}

/**
 * Look up a cached LLM response
 * Returns null if no valid cache entry exists
 */
export async function getCachedResponse<T>(
  systemPrompt: string | undefined,
  userPrompt: string,
  model: string
): Promise<{ data: T; tokens: number } | null> {
  try {
    const hash = hashPrompt(systemPrompt, userPrompt, model)

    const [cached] = await db
      .select()
      .from(schema.promptCache)
      .where(
        and(
          eq(schema.promptCache.promptHash, hash),
          eq(schema.promptCache.model, model),
          // Only return if not expired
          or(
            isNull(schema.promptCache.expiresAt),
            gt(schema.promptCache.expiresAt, new Date())
          )
        )
      )
      .limit(1)

    if (!cached) return null

    // Increment hit count
    await db
      .update(schema.promptCache)
      .set({ hitCount: sql`${schema.promptCache.hitCount} + 1` })
      .where(eq(schema.promptCache.id, cached.id))

    console.log(`[Cache] HIT for model=${model} hash=${hash.slice(0, 12)}...`)

    return {
      data: cached.response as T,
      tokens: cached.tokensUsed || 0,
    }
  } catch (error) {
    // Cache failures should not block LLM calls
    console.error("[Cache] Read error (non-fatal):", error)
    return null
  }
}

/**
 * Store an LLM response in the cache
 */
export async function setCachedResponse<T>(
  systemPrompt: string | undefined,
  userPrompt: string,
  model: string,
  response: T,
  tokens: number,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<void> {
  try {
    const hash = hashPrompt(systemPrompt, userPrompt, model)
    const expiresAt = new Date(Date.now() + ttlMs)

    await db
      .insert(schema.promptCache)
      .values({
        promptHash: hash,
        model,
        response: response as any,
        tokensUsed: tokens,
        expiresAt,
        hitCount: 0,
      })
      .onConflictDoUpdate({
        target: [schema.promptCache.promptHash, schema.promptCache.model],
        set: {
          response: response as any,
          tokensUsed: tokens,
          expiresAt,
          hitCount: 0,
          createdAt: new Date(),
        },
      })

    console.log(`[Cache] SET for model=${model} hash=${hash.slice(0, 12)}... ttl=${Math.round(ttlMs / 60000)}min`)
  } catch (error) {
    // Cache failures should not block responses
    console.error("[Cache] Write error (non-fatal):", error)
  }
}

/**
 * Clean up expired cache entries
 * Can be called periodically or via cron
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const result = await db
      .delete(schema.promptCache)
      .where(
        and(
          sql`${schema.promptCache.expiresAt} IS NOT NULL`,
          sql`${schema.promptCache.expiresAt} < NOW()`
        )
      )

    // Drizzle doesn't return affected row count directly,
    // but the delete succeeds silently
    console.log("[Cache] Cleaned expired entries")
    return 0
  } catch (error) {
    console.error("[Cache] Cleanup error:", error)
    return 0
  }
}

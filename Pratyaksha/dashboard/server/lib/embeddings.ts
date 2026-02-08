// =============================================================================
// BECOMING — Embedding & RAG Layer
// Generates embeddings via OpenRouter, stores in pgvector, retrieves for RAG
// =============================================================================

import { OpenAIEmbeddings } from "@langchain/openai"
import { db } from "./db"
import { eq, sql, and } from "drizzle-orm"
import * as schema from "../db/drizzle-schema"

// ── Embedding model ─────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const EMBEDDING_MODEL = "openai/text-embedding-3-small"

let embeddingsInstance: OpenAIEmbeddings | null = null

/**
 * Get or create the embeddings instance
 * Routes through OpenRouter for consistent billing
 */
function getEmbeddings(): OpenAIEmbeddings {
  if (embeddingsInstance) return embeddingsInstance

  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is required for embeddings")
  }

  embeddingsInstance = new OpenAIEmbeddings({
    modelName: EMBEDDING_MODEL,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://pratyaksha.app",
        "X-Title": "Pratyaksha Cognitive Journal",
      },
    },
    apiKey: OPENROUTER_API_KEY,
  })

  return embeddingsInstance
}

// ── Embed a single entry ────────────────────────────────────────────────────

/**
 * Generate and store embedding for a journal entry
 * Called after entry processing to build the vector index
 */
export async function embedEntry(
  entryId: string,
  userId: string,
  text: string
): Promise<void> {
  try {
    const embeddings = getEmbeddings()

    // Generate embedding vector
    const vector = await embeddings.embedQuery(text)

    // Format as pgvector string
    const vectorStr = `[${vector.join(",")}]`

    // Upsert into entry_embeddings
    await db
      .insert(schema.entryEmbeddings)
      .values({
        entryId,
        userId,
        embedding: vector,
        model: EMBEDDING_MODEL,
        tokenCount: Math.ceil(text.length / 4), // rough token estimate
      })
      .onConflictDoUpdate({
        target: schema.entryEmbeddings.entryId,
        set: {
          embedding: vector,
          model: EMBEDDING_MODEL,
          tokenCount: Math.ceil(text.length / 4),
          createdAt: new Date(),
        },
      })

    console.log(`[Embeddings] Stored embedding for entry ${entryId} (${vector.length}d)`)
  } catch (error) {
    // Embedding failures should not block entry processing
    console.error("[Embeddings] Error embedding entry (non-fatal):", error)
  }
}

// ── RAG retrieval ───────────────────────────────────────────────────────────

export interface RAGResult {
  entryId: string
  text: string
  date: string | null
  name: string | null
  mode: string | null
  sentiment: string | null
  snapshot: string | null
  similarity: number
}

/**
 * Find journal entries most similar to the query text
 * Uses pgvector cosine distance for semantic search
 */
export async function findSimilarEntries(
  query: string,
  limit: number = 5,
  userId?: string
): Promise<RAGResult[]> {
  try {
    const embeddings = getEmbeddings()

    // Generate query embedding
    const queryVector = await embeddings.embedQuery(query)
    const vectorStr = `[${queryVector.join(",")}]`

    // Query pgvector with cosine distance
    // Lower distance = more similar (cosine distance, not similarity)
    const userFilter = userId
      ? sql`AND ee.user_id = ${userId}::uuid`
      : sql``

    const results = await db.execute(sql`
      SELECT
        ee.entry_id,
        e.text,
        e.date::text,
        e.name,
        e.inferred_mode as mode,
        e.sentiment,
        e.snapshot,
        1 - (ee.embedding <=> ${vectorStr}::vector) as similarity
      FROM entry_embeddings ee
      JOIN entries e ON e.id = ee.entry_id
      WHERE e.is_deleted = false
        ${userFilter}
      ORDER BY ee.embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `)

    return (results as any[]).map((r) => ({
      entryId: r.entry_id,
      text: r.text || "",
      date: r.date,
      name: r.name,
      mode: r.mode,
      sentiment: r.sentiment,
      snapshot: r.snapshot,
      similarity: parseFloat(r.similarity) || 0,
    }))
  } catch (error) {
    console.error("[Embeddings] RAG search error:", error)
    return []
  }
}

/**
 * Build a RAG context string from similar entries for injection into chat
 */
export function buildRAGContext(results: RAGResult[]): string {
  if (results.length === 0) return ""

  const entries = results
    .map((r, i) => {
      const parts = [
        `${i + 1}. [${r.date || "Unknown date"}] "${r.name || "Untitled"}"`,
        `   Mode: ${r.mode || "Unknown"} | Sentiment: ${r.sentiment || "Unknown"}`,
        `   ${r.snapshot || r.text?.slice(0, 150) || "No content"}`,
        `   (Relevance: ${(r.similarity * 100).toFixed(0)}%)`,
      ]
      return parts.join("\n")
    })
    .join("\n\n")

  return `\nRELEVANT JOURNAL ENTRIES (semantically similar to user's question):\n${entries}`
}

// ── Batch embedding ─────────────────────────────────────────────────────────

/**
 * Embed all entries that don't have embeddings yet
 * Useful for initial indexing after migration
 */
export async function embedAllMissing(): Promise<{ embedded: number; skipped: number; errors: number }> {
  const stats = { embedded: 0, skipped: 0, errors: 0 }

  try {
    // Find entries without embeddings
    const missing = await db.execute(sql`
      SELECT e.id, e.user_id, e.text, e.name, e.snapshot
      FROM entries e
      LEFT JOIN entry_embeddings ee ON ee.entry_id = e.id
      WHERE ee.id IS NULL
        AND e.is_deleted = false
        AND e.text IS NOT NULL
        AND length(e.text) > 10
      ORDER BY e.created_at DESC
      LIMIT 100
    `)

    console.log(`[Embeddings] Found ${(missing as any[]).length} entries without embeddings`)

    for (const entry of missing as any[]) {
      try {
        // Combine text fields for richer embedding
        const textForEmbedding = [
          entry.text,
          entry.name ? `Title: ${entry.name}` : "",
          entry.snapshot ? `Summary: ${entry.snapshot}` : "",
        ].filter(Boolean).join("\n")

        await embedEntry(entry.id, entry.user_id, textForEmbedding)
        stats.embedded++

        // Rate limit to avoid OpenRouter throttling
        await new Promise((r) => setTimeout(r, 200))
      } catch {
        stats.errors++
      }
    }
  } catch (error) {
    console.error("[Embeddings] Batch embed error:", error)
  }

  console.log(`[Embeddings] Batch complete: ${stats.embedded} embedded, ${stats.errors} errors`)
  return stats
}

#!/usr/bin/env node

/**
 * Backfill Embeddings for Existing Entries
 * Generates embeddings for all entries that don't have them yet
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function triggerEmbeddingGeneration() {
  const response = await fetch(`${API_BASE}/embeddings/backfill`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Backfill failed: ${error}`);
  }

  return response.json();
}

async function checkProgress() {
  // Query database to see how many entries still need embeddings
  const response = await fetch(`${API_BASE}/embeddings/status`);

  if (response.ok) {
    return response.json();
  }
  return null;
}

async function main() {
  console.log('\n🔄 EMBEDDING BACKFILL FOR AIRTABLE ENTRIES');
  console.log('═'.repeat(80));
  console.log('Generating embeddings for entries without them...\n');

  let totalEmbedded = 0;
  let totalErrors = 0;
  let batchCount = 0;

  try {
    while (true) {
      batchCount++;
      console.log(`\n📦 Batch ${batchCount}:`);
      console.log('─'.repeat(80));

      const result = await triggerEmbeddingGeneration();

      if (!result.success) {
        console.error('❌ Backfill failed:', result.error);
        break;
      }

      const { embedded, errors, remaining } = result;

      totalEmbedded += embedded || 0;
      totalErrors += errors || 0;

      console.log(`✅ Embedded: ${embedded}`);
      console.log(`❌ Errors: ${errors}`);
      console.log(`📊 Remaining: ${remaining}`);

      if (embedded === 0 || remaining === 0) {
        console.log('\n✅ All entries have embeddings!');
        break;
      }

      // Wait before next batch to avoid rate limiting
      if (remaining > 0) {
        console.log('\n⏳ Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Safety limit: max 30 batches (3000 entries)
      if (batchCount >= 30) {
        console.log('\n⚠️  Reached batch limit (30). Run again if needed.');
        break;
      }
    }

    console.log('\n\n═'.repeat(80));
    console.log('📊 BACKFILL COMPLETE');
    console.log('═'.repeat(80));
    console.log(`Total batches: ${batchCount}`);
    console.log(`Total embedded: ${totalEmbedded}`);
    console.log(`Total errors: ${totalErrors}`);
    console.log('');

  } catch (error) {
    console.error(`\n❌ Backfill error: ${error.message}`);
    console.error('   Make sure the server is running: npm run dev:server');
  }
}

main();

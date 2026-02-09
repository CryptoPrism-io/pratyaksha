#!/usr/bin/env node

/**
 * Direct PostgreSQL Query to Check Airtable Migration
 * Connects directly to database to verify non-test users exist
 */

import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const sql = postgres({
  host: '34.55.195.199',
  database: 'becoming',
  username: 'becoming_app',
  password: process.env.DB_PASSWORD || 'W3lc0m3#2024',
  port: 5432,
  ssl: false
});

async function main() {
  console.log('\n🔍 DIRECT DATABASE CHECK: Airtable User Migration');
  console.log('═'.repeat(80));
  console.log('Connecting to PostgreSQL database...\n');

  try {
    // Check total users
    const totalUsers = await sql`
      SELECT COUNT(*) as count FROM users
    `;
    console.log(`📊 Total users in database: ${totalUsers[0].count}`);

    // Check test users
    const testUsers = await sql`
      SELECT COUNT(*) as count FROM users
      WHERE firebase_uid LIKE 'test-%'
    `;
    console.log(`🧪 Test users (test-* prefix): ${testUsers[0].count}`);

    // Calculate non-test users
    const realUserCount = parseInt(totalUsers[0].count) - parseInt(testUsers[0].count);
    console.log(`👤 Original Airtable users: ${realUserCount}`);

    if (realUserCount > 0) {
      console.log('\n✅ ORIGINAL AIRTABLE USERS FOUND!');
      console.log('─'.repeat(80));

      // Get details of non-test users
      const realUsers = await sql`
        SELECT
          firebase_uid,
          display_name,
          email,
          profession,
          created_at,
          last_active
        FROM users
        WHERE firebase_uid NOT LIKE 'test-%'
        ORDER BY created_at DESC
        LIMIT 10
      `;

      console.log(`\nShowing first ${realUsers.length} non-test users:\n`);

      realUsers.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.display_name || 'Unknown'}`);
        console.log(`   Firebase UID: ${user.firebase_uid}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Profession: ${user.profession || 'N/A'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`   Last Active: ${user.last_active ? new Date(user.last_active).toLocaleString() : 'Never'}`);
        console.log('');
      });

      // Check entries for these users
      console.log('─'.repeat(80));
      console.log('📝 CHECKING ENTRIES FOR AIRTABLE USERS...\n');

      for (const user of realUsers.slice(0, 3)) {
        const entries = await sql`
          SELECT COUNT(*) as count FROM entries
          WHERE user_id = (
            SELECT id FROM users WHERE firebase_uid = ${user.firebase_uid}
          )
        `;
        console.log(`${user.display_name}: ${entries[0].count} entries`);

        // Show sample entry
        if (parseInt(entries[0].count) > 0) {
          const sampleEntry = await sql`
            SELECT
              id,
              name,
              type,
              text,
              snapshot,
              timestamp
            FROM entries
            WHERE user_id = (
              SELECT id FROM users WHERE firebase_uid = ${user.firebase_uid}
            )
            ORDER BY timestamp DESC
            LIMIT 1
          `;

          if (sampleEntry.length > 0) {
            const entry = sampleEntry[0];
            console.log(`   Latest entry: "${entry.name || 'Untitled'}"`);
            console.log(`   Type: ${entry.type || 'N/A'}`);
            console.log(`   Created: ${new Date(entry.timestamp).toLocaleString()}`);
            console.log(`   Snapshot: ${entry.snapshot?.substring(0, 80) || 'N/A'}...`);
            console.log(`   Text preview: ${entry.text?.substring(0, 100) || 'N/A'}...`);
          }
        }
        console.log('');
      }

      // Total entries for all non-test users
      const totalEntries = await sql`
        SELECT COUNT(*) as count FROM entries
        WHERE user_id IN (
          SELECT id FROM users WHERE firebase_uid NOT LIKE 'test-%'
        )
      `;
      console.log(`\n📊 Total entries from Airtable users: ${totalEntries[0].count}`);

      // Check embeddings
      const totalEmbeddings = await sql`
        SELECT COUNT(*) as count FROM entry_embeddings
        WHERE user_id IN (
          SELECT id FROM users WHERE firebase_uid NOT LIKE 'test-%'
        )
      `;
      console.log(`🧮 Total embeddings for Airtable users: ${totalEmbeddings[0].count}`);

    } else {
      console.log('\n⚠️  NO ORIGINAL AIRTABLE USERS FOUND');
      console.log('    All users in database have "test-" prefix');
      console.log('    The Airtable data may not have been migrated yet.');
    }

    console.log('\n═'.repeat(80));
    console.log('✅ Database check complete!\n');

  } catch (error) {
    console.error(`\n❌ Database query failed: ${error.message}`);
    console.error('   Check database connection settings');
    console.error(`   Error: ${error.stack}`);
  } finally {
    await sql.end();
  }
}

main();

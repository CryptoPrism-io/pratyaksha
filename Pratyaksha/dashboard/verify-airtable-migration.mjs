#!/usr/bin/env node

/**
 * Verify Airtable Data Migration to PostgreSQL
 * Checks if existing Airtable users and entries are in PostgreSQL
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function getTestUsers() {
  const response = await fetch(`${API_BASE}/test-users`);
  if (!response.ok) {
    throw new Error(`Failed to get test users: ${response.status}`);
  }
  return response.json();
}

async function getAllUsers() {
  const response = await fetch(`${API_BASE}/users`, {
    headers: {
      'X-Firebase-UID': 'admin-check' // Dummy header for API access
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to get all users: ${response.status}`);
  }
  return response.json();
}

async function getUserEntries(firebaseUid) {
  const response = await fetch(`${API_BASE}/entries`, {
    headers: {
      'X-Firebase-UID': firebaseUid
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to get entries for ${firebaseUid}: ${response.status}`);
  }
  return response.json();
}

async function main() {
  console.log('\n🔍 AIRTABLE DATA MIGRATION VERIFICATION');
  console.log('═'.repeat(80));
  console.log('Checking if original Airtable users and data exist in PostgreSQL...\n');

  try {
    // Get all users (both test and real)
    console.log('📊 Fetching all users from PostgreSQL...');
    const allUsersResponse = await getAllUsers();

    // Note: The API might not have a /users endpoint, let's try test-users first
    console.log('📊 Fetching test users...');
    const testUsersResponse = await getTestUsers();

    if (!testUsersResponse.success) {
      throw new Error('Failed to fetch test users');
    }

    const testUsers = testUsersResponse.users || [];
    console.log(`\n✅ Found ${testUsers.length} test users in database`);

    // Show test users
    console.log('\n📋 TEST USERS (with "test-" prefix):');
    console.log('─'.repeat(80));
    testUsers.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.displayName || 'Unknown'}`);
      console.log(`   Firebase UID: ${user.firebaseUid}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Entries: ${user.entryCount || 0} | Embeddings: ${user.embeddingCount || 0}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      console.log('');
    });

    // Now let's check for NON-test users (original Airtable users)
    console.log('\n🔍 CHECKING FOR ORIGINAL AIRTABLE USERS (non-test users)...');
    console.log('─'.repeat(80));

    // Try to fetch entries for a known Airtable user if we have one
    // We need to query the database directly or use an admin endpoint

    console.log('\n💡 To verify Airtable migration, we need to check:');
    console.log('   1. Users without "test-" prefix exist in database');
    console.log('   2. Their entries have been migrated');
    console.log('   3. Entry data matches Airtable format\n');

    // Let's try to get entries for a test user to show the format
    if (testUsers.length > 0) {
      const sampleUser = testUsers[0];
      console.log(`📝 Sample entries from ${sampleUser.displayName}:`);
      console.log('─'.repeat(80));

      try {
        const entriesResponse = await getUserEntries(sampleUser.firebaseUid);

        if (entriesResponse && entriesResponse.length > 0) {
          const sampleEntries = entriesResponse.slice(0, 3);
          sampleEntries.forEach((entry, idx) => {
            console.log(`\nEntry ${idx + 1}:`);
            console.log(`  ID: ${entry.id}`);
            console.log(`  Entry Name: ${entry.fields?.entryName || 'N/A'}`);
            console.log(`  Type: ${entry.fields?.type || 'N/A'}`);
            console.log(`  Created: ${entry.fields?.createdAt ? new Date(entry.fields.createdAt).toLocaleDateString() : 'N/A'}`);
            console.log(`  Snapshot: ${entry.fields?.snapshot?.substring(0, 80) || 'N/A'}...`);
          });

          console.log(`\n✅ Total entries for ${sampleUser.displayName}: ${entriesResponse.length}`);
        } else {
          console.log('⚠️  No entries found for sample user');
        }
      } catch (error) {
        console.error(`❌ Error fetching entries: ${error.message}`);
      }
    }

    // Summary
    console.log('\n\n═'.repeat(80));
    console.log('📊 MIGRATION VERIFICATION SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\nTest Users Found: ${testUsers.length}`);
    console.log('Total Entries: ' + testUsers.reduce((sum, u) => sum + (u.entryCount || 0), 0));
    console.log('Total Embeddings: ' + testUsers.reduce((sum, u) => sum + (u.embeddingCount || 0), 0));

    console.log('\n⚠️  NOTE: To verify ORIGINAL Airtable users (non-test):');
    console.log('   - Check PostgreSQL directly with SQL query:');
    console.log('     SELECT firebase_uid, display_name, email, created_at');
    console.log('     FROM users');
    console.log('     WHERE firebase_uid NOT LIKE \'test-%\';');
    console.log('\n   - Or create an admin endpoint to list all users');
    console.log('');

  } catch (error) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    console.error('   Make sure the server is running: npm run dev:server');
  }
}

main();

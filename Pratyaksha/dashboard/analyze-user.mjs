#!/usr/bin/env node

/**
 * User Behavior Analysis Script
 * Analyzes how a specific user is interacting with Pratyaksha
 */

import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const sql = postgres({
  host: '34.55.195.199',
  database: 'becoming',
  username: 'becoming_app',
  password: process.env.DB_PASSWORD || 'W3lc0m3#2024',
  port: 5432,
  ssl: false
});

async function analyzeUser(firebaseUid) {
  console.log('\n📊 USER BEHAVIOR ANALYSIS');
  console.log('═'.repeat(80));

  try {
    // Get user details
    const users = await sql`
      SELECT
        id,
        firebase_uid,
        display_name,
        email,
        profession,
        stress_level,
        emotional_openness,
        personal_goal,
        created_at,
        last_active,
        onboarding_completed
      FROM users
      WHERE firebase_uid = ${firebaseUid}
    `;

    if (users.length === 0) {
      console.log(`❌ User not found: ${firebaseUid}\n`);
      return;
    }

    const user = users[0];
    console.log(`\n👤 USER PROFILE`);
    console.log('─'.repeat(80));
    console.log(`Name: ${user.display_name || 'Unknown'}`);
    console.log(`Email: ${user.email || 'N/A'}`);
    console.log(`Profession: ${user.profession || 'N/A'}`);
    console.log(`Personal Goal: ${user.personal_goal || 'N/A'}`);
    console.log(`Stress Level: ${user.stress_level || 'N/A'}/5`);
    console.log(`Emotional Openness: ${user.emotional_openness || 'N/A'}/5`);
    console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`Last Active: ${user.last_active ? new Date(user.last_active).toLocaleString() : 'Never'}`);
    console.log(`Onboarding: ${user.onboarding_completed ? '✅ Completed' : '⏳ Incomplete'}`);

    // Entry statistics
    console.log(`\n\n📝 JOURNAL ENTRY STATISTICS`);
    console.log('─'.repeat(80));

    const entryStats = await sql`
      SELECT
        COUNT(*) as total_entries,
        MIN(date) as first_entry,
        MAX(date) as last_entry,
        COUNT(DISTINCT date) as days_with_entries,
        AVG(length(text)) as avg_entry_length
      FROM entries
      WHERE user_id = ${user.id}
        AND is_deleted = false
    `;

    const stats = entryStats[0];
    console.log(`Total Entries: ${stats.total_entries}`);
    console.log(`First Entry: ${stats.first_entry}`);
    console.log(`Last Entry: ${stats.last_entry}`);
    console.log(`Days with Entries: ${stats.days_with_entries}`);
    console.log(`Avg Entry Length: ${Math.round(stats.avg_entry_length || 0)} characters`);

    // Calculate journal streak
    const daysSinceFirst = Math.floor(
      (new Date(stats.last_entry) - new Date(stats.first_entry)) / (1000 * 60 * 60 * 24)
    );
    const consistency = daysSinceFirst > 0
      ? Math.round((parseInt(stats.days_with_entries) / daysSinceFirst) * 100)
      : 0;
    console.log(`Consistency: ${consistency}% (${stats.days_with_entries}/${daysSinceFirst + 1} days)`);

    // Entry types breakdown
    console.log(`\n\n📊 ENTRY TYPES`);
    console.log('─'.repeat(80));

    const typeBreakdown = await sql`
      SELECT
        type,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / ${stats.total_entries})::numeric, 1) as percentage
      FROM entries
      WHERE user_id = ${user.id}
        AND is_deleted = false
        AND type IS NOT NULL
      GROUP BY type
      ORDER BY count DESC
    `;

    typeBreakdown.forEach(row => {
      const bar = '█'.repeat(Math.round(parseFloat(row.percentage) / 2));
      console.log(`${row.type.padEnd(20)} ${row.count.toString().padStart(4)} (${row.percentage}%) ${bar}`);
    });

    // Emotional patterns
    console.log(`\n\n😊 EMOTIONAL PATTERNS`);
    console.log('─'.repeat(80));

    const moodStats = await sql`
      SELECT
        inferred_mode as mode,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / ${stats.total_entries})::numeric, 1) as percentage
      FROM entries
      WHERE user_id = ${user.id}
        AND is_deleted = false
        AND inferred_mode IS NOT NULL
      GROUP BY inferred_mode
      ORDER BY count DESC
      LIMIT 10
    `;

    moodStats.forEach(row => {
      const bar = '█'.repeat(Math.round(parseFloat(row.percentage) / 2));
      console.log(`${row.mode.padEnd(20)} ${row.count.toString().padStart(4)} (${row.percentage}%) ${bar}`);
    });

    // Sentiment distribution
    const sentimentStats = await sql`
      SELECT
        sentiment,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / ${stats.total_entries})::numeric, 1) as percentage
      FROM entries
      WHERE user_id = ${user.id}
        AND is_deleted = false
        AND sentiment IS NOT NULL
      GROUP BY sentiment
      ORDER BY count DESC
    `;

    console.log(`\n\nSentiment Distribution:`);
    sentimentStats.forEach(row => {
      const emoji = row.sentiment === 'Positive' ? '😊' : row.sentiment === 'Negative' ? '😔' : '😐';
      console.log(`  ${emoji} ${row.sentiment}: ${row.count} (${row.percentage}%)`);
    });

    // Recent entries
    console.log(`\n\n📖 RECENT ENTRIES (Last 5)`);
    console.log('─'.repeat(80));

    const recentEntries = await sql`
      SELECT
        name,
        type,
        inferred_mode,
        sentiment,
        date,
        snapshot,
        length(text) as text_length
      FROM entries
      WHERE user_id = ${user.id}
        AND is_deleted = false
      ORDER BY timestamp DESC
      LIMIT 5
    `;

    recentEntries.forEach((entry, idx) => {
      console.log(`\n${idx + 1}. ${entry.name || 'Untitled'} (${new Date(entry.date).toLocaleDateString()})`);
      console.log(`   Type: ${entry.type || 'N/A'} | Mode: ${entry.inferred_mode || 'N/A'} | Sentiment: ${entry.sentiment || 'N/A'}`);
      console.log(`   Length: ${entry.text_length} characters`);
      console.log(`   ${entry.snapshot?.substring(0, 100) || 'No snapshot'}...`);
    });

    // Theme tags (using theme_tags column)
    console.log(`\n\n🏷️  RECURRING THEMES`);
    console.log('─'.repeat(80));

    try {
      const themes = await sql`
        SELECT
          unnest(theme_tags) as theme,
          COUNT(*) as count
        FROM entries
        WHERE user_id = ${user.id}
          AND is_deleted = false
          AND theme_tags IS NOT NULL
          AND array_length(theme_tags, 1) > 0
        GROUP BY theme
        ORDER BY count DESC
        LIMIT 10
      `;

      if (themes.length > 0) {
        themes.forEach((row, idx) => {
          console.log(`${idx + 1}. ${row.theme} (${row.count} entries)`);
        });
      } else {
        console.log('No theme tags found');
      }
    } catch {
      console.log('Theme tags not available in schema');
    }

    // Gamification stats
    console.log(`\n\n🎮 GAMIFICATION & ENGAGEMENT`);
    console.log('─'.repeat(80));

    const gamification = await sql`
      SELECT
        karma,
        streak_days,
        total_entries_logged,
        last_entry_date,
        total_gifts_received,
        completed_soul_mapping_topics,
        soul_mapping_tier
      FROM gamification
      WHERE user_id = ${user.id}
    `;

    if (gamification.length > 0) {
      const gam = gamification[0];
      console.log(`Karma Points: ${gam.karma || 0}`);
      console.log(`Current Streak: ${gam.streak_days || 0} days`);
      console.log(`Total Entries Logged: ${gam.total_entries_logged || 0}`);
      console.log(`Last Entry Date: ${gam.last_entry_date || 'N/A'}`);
      console.log(`Gifts Received: ${gam.total_gifts_received || 0}`);
      console.log(`Soul Mapping Tier: ${gam.soul_mapping_tier || 'surface'}`);
      console.log(`Completed Topics: ${gam.completed_soul_mapping_topics?.length || 0}`);
      if (gam.completed_soul_mapping_topics?.length > 0) {
        console.log(`  - ${gam.completed_soul_mapping_topics.join(', ')}`);
      }
    } else {
      console.log('No gamification data found');
    }

    // Life Blueprint data
    console.log(`\n\n🎯 LIFE BLUEPRINT`);
    console.log('─'.repeat(80));

    const visionCount = await sql`
      SELECT COUNT(*) as count FROM vision_items WHERE user_id = ${user.id}
    `;
    const goalsCount = await sql`
      SELECT COUNT(*) as count FROM goals WHERE user_id = ${user.id}
    `;
    const leversCount = await sql`
      SELECT COUNT(*) as count FROM levers WHERE user_id = ${user.id}
    `;

    console.log(`Vision Items: ${visionCount[0]?.count || 0}`);
    console.log(`Goals: ${goalsCount[0]?.count || 0}`);
    console.log(`Levers: ${leversCount[0]?.count || 0}`);

    if (parseInt(visionCount[0]?.count || 0) > 0) {
      const visionItems = await sql`
        SELECT text, category, is_anti
        FROM vision_items
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 5
      `;
      console.log(`\nVision (top 5):`);
      visionItems.forEach(v => {
        const prefix = v.is_anti ? '🚫 Anti-Vision' : '✨ Vision';
        console.log(`  ${prefix}: ${v.text} (${v.category})`);
      });
    }

    // Embeddings coverage
    console.log(`\n\n🧮 EMBEDDINGS (RAG)`);
    console.log('─'.repeat(80));

    const embeddingCount = await sql`
      SELECT COUNT(*) as count
      FROM entry_embeddings
      WHERE user_id = ${user.id}
    `;

    const coverage = parseInt(embeddingCount[0]?.count || 0);
    const coveragePercent = parseInt(stats.total_entries) > 0
      ? Math.round((coverage / parseInt(stats.total_entries)) * 100)
      : 0;

    console.log(`Entries with Embeddings: ${coverage}/${stats.total_entries} (${coveragePercent}%)`);
    console.log(`RAG Status: ${coveragePercent === 100 ? '✅ Fully Indexed' : coveragePercent > 0 ? '⚠️ Partially Indexed' : '❌ Not Indexed'}`);

    // Usage insights
    console.log(`\n\n💡 USAGE INSIGHTS`);
    console.log('─'.repeat(80));

    const daysSinceCreated = Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
    const avgEntriesPerDay = daysSinceCreated > 0 ? (parseInt(stats.total_entries) / daysSinceCreated).toFixed(2) : '0.00';

    console.log(`Days since signup: ${daysSinceCreated}`);
    console.log(`Avg entries per day: ${avgEntriesPerDay}`);
    console.log(`Most common entry type: ${typeBreakdown[0]?.type || 'N/A'} (${typeBreakdown[0]?.percentage || 0}%)`);
    console.log(`Most common mood: ${moodStats[0]?.mode || 'N/A'} (${moodStats[0]?.percentage || 0}%)`);
    console.log(`Dominant sentiment: ${sentimentStats[0]?.sentiment || 'N/A'} (${sentimentStats[0]?.percentage || 0}%)`);

    // Recommendations
    console.log(`\n\n🎯 RECOMMENDATIONS`);
    console.log('─'.repeat(80));

    if (coveragePercent < 100) {
      console.log(`⚡ Generate embeddings for RAG personalization (${100 - coveragePercent}% remaining)`);
    }
    if (parseInt(visionCount[0]?.count || 0) === 0) {
      console.log(`📋 Complete Life Blueprint to unlock deeper personalization`);
    }
    if (parseInt(gamification[0]?.completed_soul_mapping_topics?.length || 0) < 5) {
      console.log(`🧠 Complete remaining Soul Mapping topics for better insights`);
    }
    if (parseFloat(avgEntriesPerDay) < 0.5) {
      console.log(`📝 Increase journaling frequency for better trend analysis`);
    }
    if (parseInt(stats.days_with_entries) < 7) {
      console.log(`🔥 Build a 7-day streak to establish the habit`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ Analysis complete!\n');

  } catch (error) {
    console.error(`\n❌ Analysis error: ${error.message}`);
    console.error(error.stack);
  } finally {
    await sql.end();
  }
}

// Get user from command line argument or use default
const userToAnalyze = process.argv[2] || 'KPpTYXXjKpdFLoXAhkbkHxYvm2l2';

console.log(`\nAnalyzing user: ${userToAnalyze}\n`);
analyzeUser(userToAnalyze);

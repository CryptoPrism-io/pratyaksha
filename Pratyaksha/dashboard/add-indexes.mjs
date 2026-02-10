#!/usr/bin/env node
/**
 * Add Performance Indexes to PostgreSQL Database
 * Fixes: getUserProfile() taking 5-40 seconds
 * Expected improvement: 5-40s → <1s
 */

import postgres from 'postgres'
import 'dotenv/config'

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

function log(msg, color = COLORS.reset) {
  console.log(`${color}${msg}${COLORS.reset}`)
}

// Database connection
const sql = postgres({
  host: process.env.DB_HOST || '34.55.195.199',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'becoming',
  username: process.env.DB_USER || 'becoming_app',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // Disable SSL certificate verification for Cloud SQL
  },
})

const indexes = [
  {
    name: 'idx_vision_items_user_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_vision_items_user_id ON vision_items(user_id)',
    table: 'vision_items',
  },
  {
    name: 'idx_vision_items_user_anti',
    sql: 'CREATE INDEX IF NOT EXISTS idx_vision_items_user_anti ON vision_items(user_id, is_anti)',
    table: 'vision_items',
  },
  {
    name: 'idx_levers_user_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_levers_user_id ON levers(user_id)',
    table: 'levers',
  },
  {
    name: 'idx_goals_user_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)',
    table: 'goals',
  },
  {
    name: 'idx_goals_user_long_term',
    sql: 'CREATE INDEX IF NOT EXISTS idx_goals_user_long_term ON goals(user_id, is_long_term)',
    table: 'goals',
  },
  {
    name: 'idx_goals_user_time_horizon',
    sql: 'CREATE INDEX IF NOT EXISTS idx_goals_user_time_horizon ON goals(user_id, time_horizon) WHERE time_horizon IS NOT NULL',
    table: 'goals',
  },
  {
    name: 'idx_blueprint_responses_user_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_blueprint_responses_user_id ON blueprint_responses(user_id)',
    table: 'blueprint_responses',
  },
  {
    name: 'idx_blueprint_sections_user_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_blueprint_sections_user_id ON blueprint_sections(user_id)',
    table: 'blueprint_sections',
  },
  {
    name: 'idx_gamification_user_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_gamification_user_id ON gamification(user_id)',
    table: 'gamification',
  },
  {
    name: 'idx_entries_user_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id)',
    table: 'entries',
  },
  {
    name: 'idx_entries_user_date',
    sql: 'CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date DESC)',
    table: 'entries',
  },
  {
    name: 'idx_entries_user_created',
    sql: 'CREATE INDEX IF NOT EXISTS idx_entries_user_created ON entries(user_id, created_at DESC)',
    table: 'entries',
  },
  {
    name: 'idx_entry_embeddings_entry_id',
    sql: 'CREATE INDEX IF NOT EXISTS idx_entry_embeddings_entry_id ON entry_embeddings(entry_id)',
    table: 'entry_embeddings',
  },
  {
    name: 'idx_chat_messages_user_session',
    sql: 'CREATE INDEX IF NOT EXISTS idx_chat_messages_user_session ON chat_messages(user_id, session_id, created_at DESC)',
    table: 'chat_messages',
  },
]

async function addIndexes() {
  log('\n' + '='.repeat(70), COLORS.bright)
  log('  ADDING PERFORMANCE INDEXES TO DATABASE', COLORS.cyan + COLORS.bright)
  log('='.repeat(70), COLORS.bright)

  log(`\n📊 Database: ${process.env.DB_NAME || 'becoming'}`)
  log(`📍 Host: ${process.env.DB_HOST || '34.55.195.199'}`)
  log(`👤 User: ${process.env.DB_USER || 'becoming_app'}`)
  log(`📝 Indexes to create: ${indexes.length}\n`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const index of indexes) {
    try {
      const start = Date.now()
      await sql.unsafe(index.sql)
      const duration = Date.now() - start

      log(`✅ ${index.name} (${duration}ms)`, COLORS.green)
      created++
    } catch (err) {
      if (err.message.includes('already exists')) {
        log(`⏭️  ${index.name} (already exists)`, COLORS.yellow)
        skipped++
      } else {
        log(`❌ ${index.name} - ${err.message}`, COLORS.red)
        failed++
      }
    }
  }

  log('\n' + '─'.repeat(70))
  log(`\n📊 RESULTS:`, COLORS.bright)
  log(`✅ Created: ${created}`, created > 0 ? COLORS.green : COLORS.reset)
  log(`⏭️  Skipped: ${skipped}`, skipped > 0 ? COLORS.yellow : COLORS.reset)
  log(`❌ Failed: ${failed}`, failed > 0 ? COLORS.red : COLORS.reset)

  // Analyze tables to update statistics
  log('\n📊 Updating table statistics...', COLORS.cyan)

  const tables = [
    'vision_items',
    'levers',
    'goals',
    'blueprint_responses',
    'blueprint_sections',
    'gamification',
    'entries',
    'entry_embeddings',
    'chat_messages',
  ]

  for (const table of tables) {
    try {
      await sql.unsafe(`ANALYZE ${table}`)
      log(`✅ Analyzed ${table}`, COLORS.green)
    } catch (err) {
      log(`⚠️  Could not analyze ${table}: ${err.message}`, COLORS.yellow)
    }
  }

  // Verify indexes
  log('\n🔍 Verifying indexes...', COLORS.cyan)

  const result = await sql`
    SELECT schemaname, tablename, indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname
  `

  log(`\n📊 Total indexes in database: ${result.length}`)
  log('─'.repeat(70))

  // Group by table
  const byTable = {}
  for (const row of result) {
    if (!byTable[row.tablename]) byTable[row.tablename] = []
    byTable[row.tablename].push(row.indexname)
  }

  for (const [table, idxs] of Object.entries(byTable)) {
    log(`\n${table}:`)
    idxs.forEach(idx => log(`  - ${idx}`))
  }

  log('\n' + '='.repeat(70), COLORS.bright)
  log('✅ INDEX CREATION COMPLETE!', COLORS.green + COLORS.bright)
  log('='.repeat(70), COLORS.bright)

  log('\n🎯 Expected Performance Improvement:', COLORS.cyan)
  log('  Before: /api/user-profile takes 5-40 seconds')
  log('  After:  /api/user-profile takes <1 second')
  log('  Impact: 95%+ faster user profile queries! ⚡\n')
}

async function main() {
  try {
    await addIndexes()
    await sql.end()
    process.exit(0)
  } catch (err) {
    log('\n💥 Fatal error:', COLORS.red)
    log(err.message, COLORS.red)
    log(err.stack, COLORS.red)
    await sql.end()
    process.exit(1)
  }
}

main()

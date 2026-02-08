// Deploy schema.sql to Cloud SQL — runs as a single transaction
import pg from "pg"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env from dashboard root
import { config as dotenvConfig } from "dotenv"
dotenvConfig({ path: join(dirname(fileURLToPath(import.meta.url)), "../../.env") })

const config = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "becoming",
  user: process.env.DB_USER || "becoming_app",
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
}

if (!config.password) {
  console.error("Error: DB_PASSWORD not set. Check your .env file.")
  process.exit(1)
}

async function deploy() {
  const client = new pg.Client(config)

  try {
    console.log("Connecting to Cloud SQL...")
    await client.connect()

    const ver = await client.query("SELECT version()")
    console.log("PostgreSQL:", ver.rows[0].version.split(",")[0])

    // Run entire schema as one transaction
    console.log("\nDeploying schema.sql as single transaction...")
    const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8")
    await client.query(schema)
    console.log("Schema deployed successfully!")

    // Verify tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    console.log(`\nTables created (${tables.rows.length}):`)
    tables.rows.forEach(r => console.log(`  - ${r.table_name}`))

    // Verify enums
    const enums = await client.query(`
      SELECT typname FROM pg_type
      WHERE typtype = 'e' ORDER BY typname
    `)
    console.log(`\nEnums created (${enums.rows.length}):`)
    enums.rows.forEach(r => console.log(`  - ${r.typname}`))

    // Verify indexes
    const indexes = await client.query(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `)
    console.log(`\nCustom indexes (${indexes.rows.length}):`)
    indexes.rows.forEach(r => console.log(`  - ${r.indexname}`))

    // Verify views
    const views = await client.query(`
      SELECT table_name FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    console.log(`\nViews (${views.rows.length}):`)
    views.rows.forEach(r => console.log(`  - ${r.table_name}`))

    // Verify extensions
    const exts = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp', 'pg_trgm')")
    console.log(`\nExtensions:`)
    exts.rows.forEach(r => console.log(`  - ${r.extname} v${r.extversion}`))

  } catch (e) {
    console.error("\nError:", e.message)
    if (e.position) {
      console.error("Position:", e.position)
    }
    // Show context around error
    if (e.position) {
      const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8")
      const pos = parseInt(e.position)
      const context = schema.substring(Math.max(0, pos - 100), pos + 100)
      console.error("Context:", context)
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

deploy()

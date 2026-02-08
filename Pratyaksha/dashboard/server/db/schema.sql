-- =============================================================================
-- BECOMING (Pratyaksha) — PostgreSQL Schema
-- =============================================================================
-- Replaces: Airtable (Entries, User Profiles, Notification Settings)
--           + localStorage (gamification, life blueprint, onboarding profile)
-- Adds:     entry_embeddings (pgvector), prompt_cache (LangChain), chat_messages
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- For fuzzy text search on themes/tags

-- =============================================================================
-- ENUMS (from server/types.ts — exact 1:1 mapping)
-- =============================================================================

CREATE TYPE entry_type AS ENUM (
  'Emotional', 'Cognitive', 'Family', 'Work', 'Relationship',
  'Health', 'Creativity', 'Social', 'Reflection', 'Decision',
  'Avoidance', 'Growth', 'Stress', 'Communication', 'Routine'
);

CREATE TYPE entry_format AS ENUM (
  'Quick Log', 'Daily Log', 'End of Day', 'Consolidated'
);

CREATE TYPE inferred_mode AS ENUM (
  'Hopeful', 'Calm', 'Grounded', 'Compassionate', 'Curious',
  'Reflective', 'Conflicted', 'Withdrawn', 'Overthinking', 'Numb',
  'Anxious', 'Agitated', 'Disconnected', 'Self-critical', 'Defensive'
);

CREATE TYPE energy_level AS ENUM (
  'Very Low', 'Low', 'Moderate', 'Balanced', 'High',
  'Elevated', 'Scattered', 'Drained', 'Flat', 'Restorative'
);

CREATE TYPE energy_shape AS ENUM (
  'Flat', 'Heavy', 'Chaotic', 'Rising', 'Collapsing',
  'Expanding', 'Contracted', 'Uneven', 'Centered', 'Cyclical',
  'Stabilized', 'Pulsing'
);

CREATE TYPE contradiction AS ENUM (
  'Connection vs. Avoidance', 'Hope vs. Hopelessness',
  'Anger vs. Shame', 'Control vs. Surrender',
  'Confidence vs. Doubt', 'Independence vs. Belonging',
  'Closeness vs. Distance', 'Expression vs. Silence',
  'Self-care vs. Obligation', 'Ideal vs. Reality',
  'Action vs. Fear', 'Growth vs. Comfort'
);

CREATE TYPE sentiment AS ENUM ('Positive', 'Negative', 'Neutral');

CREATE TYPE mood_trend AS ENUM ('improving', 'declining', 'stable', 'volatile');

CREATE TYPE soul_mapping_tier AS ENUM ('surface', 'deep', 'core');

CREATE TYPE goal_category AS ENUM (
  'career', 'health', 'relationships', 'finance',
  'personal-growth', 'lifestyle', 'contribution', 'other'
);

CREATE TYPE time_horizon AS ENUM (
  '6months', '1year', '3years', '5years', '10years'
);

CREATE TYPE notification_frequency AS ENUM (
  'hourly', '3x_daily', '2x_daily', '1x_daily'
);

-- =============================================================================
-- TABLE 1: users (replaces Airtable User Profiles + localStorage onboarding)
-- =============================================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid    TEXT UNIQUE NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  display_name    TEXT,

  -- Demographics (from onboarding slide 2)
  age_range       TEXT,                -- '18-24', '25-34', etc.
  sex             TEXT,                -- 'male', 'female', 'non-binary', 'prefer-not-to-say'
  location        TEXT,
  profession      TEXT,

  -- Psychological context (from onboarding slide 8)
  stress_level        SMALLINT CHECK (stress_level BETWEEN 1 AND 5),
  emotional_openness  SMALLINT CHECK (emotional_openness BETWEEN 1 AND 5),
  reflection_frequency SMALLINT CHECK (reflection_frequency BETWEEN 1 AND 5),
  life_satisfaction    SMALLINT CHECK (life_satisfaction BETWEEN 1 AND 5),
  personal_goal       TEXT,

  -- Onboarding state
  selected_memory_topics TEXT[] DEFAULT '{}',
  seed_memory           TEXT,
  default_entry_mode    TEXT,
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  show_feature_tour     BOOLEAN DEFAULT TRUE,
  last_slide_completed  SMALLINT DEFAULT 0,

  -- Badges
  badges          TEXT[] DEFAULT '{}',   -- ['early_explorer', 'open_book', ...]

  -- Notifications
  fcm_token               TEXT,
  daily_reminder_enabled  BOOLEAN DEFAULT FALSE,
  reminder_time           TEXT,          -- 'HH:MM' format

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_active     TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_firebase_uid ON users (firebase_uid);
CREATE INDEX idx_users_email ON users (email);

-- =============================================================================
-- TABLE 2: gamification (replaces localStorage pratyaksha-gamification)
-- =============================================================================

CREATE TABLE gamification (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  karma             INTEGER DEFAULT 0,
  streak_days       INTEGER DEFAULT 0,
  last_entry_date   DATE,
  total_entries_logged INTEGER DEFAULT 0,
  last_daily_dashboard_bonus TIMESTAMPTZ,
  last_auto_gift    TIMESTAMPTZ,
  total_gifts_received INTEGER DEFAULT 0,

  -- Soul Mapping progress
  completed_soul_mapping_topics TEXT[] DEFAULT '{}',
  soul_mapping_tier soul_mapping_tier DEFAULT 'surface',

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id)
);

-- =============================================================================
-- TABLE 3: entries (replaces Airtable Entries table)
-- =============================================================================

CREATE TABLE entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airtable_id     TEXT,                  -- Legacy ID for migration, nullable after cutover
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- User-provided
  text            TEXT NOT NULL,
  date            DATE NOT NULL,
  timestamp       TIMESTAMPTZ DEFAULT NOW(),

  -- AI Agent 1: Intent
  name            TEXT,                  -- AI-generated 3-6 word title
  type            entry_type,
  format          entry_format DEFAULT 'Quick Log',
  snapshot        TEXT,                  -- 1-2 sentence summary

  -- AI Agent 2: Emotion
  inferred_mode   inferred_mode,
  inferred_energy energy_level,
  energy_shape    energy_shape,
  sentiment       sentiment,

  -- AI Agent 3: Theme
  contradiction   contradiction,
  theme_tags      TEXT[] DEFAULT '{}',   -- Array instead of comma-separated
  loops           TEXT,

  -- AI Agent 4: Insight
  summary_ai      TEXT,
  actionable_insights_ai TEXT,
  next_action     TEXT,

  -- Metadata
  entry_length_words INTEGER DEFAULT 0,
  meta_flag       TEXT DEFAULT 'Web App', -- 'Web App', 'Decomposed Entry', 'Voice Entry'
  tokens_used     INTEGER DEFAULT 0,

  -- Decomposition (Agent 5)
  parent_entry_id UUID REFERENCES entries(id) ON DELETE SET NULL,
  is_decomposed   BOOLEAN DEFAULT FALSE,
  decomposition_count SMALLINT DEFAULT 0,
  sequence_order  SMALLINT,
  approximate_time TEXT,
  overarching_theme TEXT,

  -- User actions
  is_bookmarked   BOOLEAN DEFAULT FALSE,
  is_deleted      BOOLEAN DEFAULT FALSE,
  is_summary      BOOLEAN DEFAULT FALSE,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Core query indexes
CREATE INDEX idx_entries_user_id ON entries (user_id);
CREATE INDEX idx_entries_user_date ON entries (user_id, date DESC);
CREATE INDEX idx_entries_user_not_deleted ON entries (user_id) WHERE NOT is_deleted;
CREATE INDEX idx_entries_type ON entries (type);
CREATE INDEX idx_entries_sentiment ON entries (sentiment);
CREATE INDEX idx_entries_mode ON entries (inferred_mode);
CREATE INDEX idx_entries_contradiction ON entries (contradiction);
CREATE INDEX idx_entries_parent ON entries (parent_entry_id) WHERE parent_entry_id IS NOT NULL;
CREATE INDEX idx_entries_airtable_id ON entries (airtable_id) WHERE airtable_id IS NOT NULL;

-- Full-text search on entry text
CREATE INDEX idx_entries_text_search ON entries USING gin (to_tsvector('english', text));

-- Theme tags search (GIN for array containment)
CREATE INDEX idx_entries_theme_tags ON entries USING gin (theme_tags);

-- =============================================================================
-- TABLE 4: entry_embeddings (NEW — for RAG / vector search)
-- =============================================================================

CREATE TABLE entry_embeddings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id        UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Vector embedding (OpenAI text-embedding-3-small = 1536 dimensions)
  embedding       vector(1536) NOT NULL,

  -- Metadata for filtering
  model           TEXT DEFAULT 'text-embedding-3-small',
  token_count     INTEGER,

  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (entry_id)
);

-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX idx_entry_embeddings_vector ON entry_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Filter by user before vector search
CREATE INDEX idx_entry_embeddings_user ON entry_embeddings (user_id);

-- =============================================================================
-- TABLE 5: life_blueprint (replaces localStorage pratyaksha-life-blueprint)
-- =============================================================================
-- Normalized from single JSON blob into proper relational tables

-- 5a: Vision items
CREATE TABLE vision_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  category    goal_category DEFAULT 'other',
  is_anti     BOOLEAN DEFAULT FALSE,  -- TRUE = anti-vision, FALSE = vision
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vision_user ON vision_items (user_id, is_anti);

-- 5b: Levers
CREATE TABLE levers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  pushes_toward   TEXT DEFAULT 'vision',  -- 'vision', 'anti-vision', 'both'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_levers_user ON levers (user_id);

-- 5c: Goals
CREATE TABLE goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text            TEXT NOT NULL,
  category        goal_category DEFAULT 'other',
  time_horizon    time_horizon,           -- NULL = short/long term (non-horizon)
  is_long_term    BOOLEAN DEFAULT FALSE,  -- TRUE = long-term, FALSE = short-term
  target_date     DATE,
  completed       BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user ON goals (user_id, completed);
CREATE INDEX idx_goals_horizon ON goals (user_id, time_horizon) WHERE time_horizon IS NOT NULL;

-- 5d: Blueprint question responses
CREATE TABLE blueprint_responses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  answer          TEXT NOT NULL,
  answered_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, question_id)
);

CREATE INDEX idx_blueprint_responses_user ON blueprint_responses (user_id);

-- 5e: Blueprint section completion tracking
CREATE TABLE blueprint_sections (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section_name    TEXT NOT NULL,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, section_name)
);

-- =============================================================================
-- TABLE 6: chat_messages (NEW — replaces ephemeral chat history)
-- =============================================================================

CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id      UUID NOT NULL,         -- Groups messages in a conversation
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  tokens_used     INTEGER,
  model           TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_user_session ON chat_messages (user_id, session_id, created_at);
CREATE INDEX idx_chat_recent ON chat_messages (user_id, created_at DESC);

-- =============================================================================
-- TABLE 7: summaries (replaces Airtable summary entries + caching)
-- =============================================================================

CREATE TABLE summaries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Period
  summary_type    TEXT NOT NULL CHECK (summary_type IN ('daily', 'weekly', 'monthly')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  entry_count     INTEGER DEFAULT 0,

  -- AI-generated content
  narrative       TEXT,
  mood_trend      mood_trend,
  mood_summary    TEXT,
  energy_pattern  TEXT,
  key_takeaway    TEXT,
  evening_reflection TEXT,
  weekly_insight  TEXT,
  recommendations TEXT[] DEFAULT '{}',
  next_week_focus TEXT,

  -- Stats snapshot
  dominant_mode   TEXT,
  dominant_energy TEXT,
  dominant_sentiment TEXT,
  top_themes      TEXT[] DEFAULT '{}',
  top_contradiction TEXT,
  positive_ratio  REAL,
  avg_entries_per_day REAL,
  sentiment_breakdown JSONB,  -- {positive: N, negative: N, neutral: N}

  -- Metadata
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  tokens_used     INTEGER,
  model           TEXT,

  UNIQUE (user_id, summary_type, period_start)
);

CREATE INDEX idx_summaries_user_type ON summaries (user_id, summary_type, period_start DESC);

-- =============================================================================
-- TABLE 8: prompt_cache (NEW — for LangChain caching layer)
-- =============================================================================

CREATE TABLE prompt_cache (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_hash     TEXT NOT NULL,          -- SHA-256 of (system_prompt + user_prompt + model)
  model           TEXT NOT NULL,
  response        JSONB NOT NULL,         -- Full parsed response
  tokens_used     INTEGER,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,            -- TTL for cache invalidation
  hit_count       INTEGER DEFAULT 0,      -- Track cache utilization

  UNIQUE (prompt_hash, model)
);

CREATE INDEX idx_prompt_cache_hash ON prompt_cache (prompt_hash, model);
CREATE INDEX idx_prompt_cache_expires ON prompt_cache (expires_at) WHERE expires_at IS NOT NULL;

-- =============================================================================
-- TABLE 9: notification_settings (replaces Airtable Notification_Settings)
-- =============================================================================

CREATE TABLE notification_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  enabled         BOOLEAN DEFAULT FALSE,
  timezone        TEXT DEFAULT 'Asia/Kolkata',
  frequency       notification_frequency DEFAULT '1x_daily',
  custom_times    TEXT[] DEFAULT '{"09:00","13:00","20:00"}',
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end   TEXT DEFAULT '07:00',

  streak_at_risk  BOOLEAN DEFAULT TRUE,
  weekly_summary  BOOLEAN DEFAULT TRUE,

  last_notified   TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id)
);

-- =============================================================================
-- TABLE 10: explainer_cache (replaces localStorage pratyaksha_explainer_*)
-- =============================================================================

CREATE TABLE explainer_cache (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chart_type      TEXT NOT NULL,          -- 'energyRadar', 'modeDistribution', etc.
  data_hash       TEXT NOT NULL,          -- Hash of chart data for invalidation
  explanation     TEXT NOT NULL,
  tokens_used     INTEGER,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,            -- 1 hour TTL

  UNIQUE (user_id, chart_type, data_hash)
);

CREATE INDEX idx_explainer_user_chart ON explainer_cache (user_id, chart_type);

-- =============================================================================
-- TABLE 11: pattern_warnings (replaces localStorage pratyaksha-pattern-warnings)
-- =============================================================================

CREATE TABLE pattern_warnings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  warning_type    TEXT NOT NULL,          -- 'anti_vision_drift', 'negative_trend', 'lever_neglect', 'goal_stall'
  severity        TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'alert'
  title           TEXT NOT NULL,
  description     TEXT,
  related_entries UUID[] DEFAULT '{}',    -- Entry IDs that triggered this warning

  dismissed       BOOLEAN DEFAULT FALSE,
  dismissed_at    TIMESTAMPTZ,
  dismiss_expires TIMESTAMPTZ,            -- 7 days from dismissal

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_warnings_user_active ON pattern_warnings (user_id, dismissed);

-- =============================================================================
-- TABLE 12: offline_queue (replaces IndexedDB pratyaksha-offline)
-- =============================================================================
-- Note: This stays as IndexedDB on the client for true offline support.
-- This table is for server-side tracking of queued items after sync.

CREATE TABLE offline_queue (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text            TEXT NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'failed', 'completed')),
  retry_count     SMALLINT DEFAULT 0,
  last_error      TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  synced_at       TIMESTAMPTZ
);

-- =============================================================================
-- TABLE 13: api_usage (NEW — cost tracking per user)
-- =============================================================================

CREATE TABLE api_usage (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,

  endpoint        TEXT NOT NULL,          -- '/api/process-entry', '/api/chat', etc.
  model           TEXT NOT NULL,          -- 'openai/gpt-4o-mini', 'openai/gpt-4o'
  prompt_tokens   INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens    INTEGER DEFAULT 0,
  estimated_cost  REAL DEFAULT 0,         -- USD

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_usage_user ON api_usage (user_id, created_at DESC);
CREATE INDEX idx_api_usage_created ON api_usage (created_at DESC);

-- =============================================================================
-- VIEWS (convenience queries)
-- =============================================================================

-- User dashboard stats
CREATE VIEW user_stats AS
SELECT
  u.id AS user_id,
  u.firebase_uid,
  COUNT(e.id) FILTER (WHERE NOT e.is_deleted) AS total_entries,
  COUNT(e.id) FILTER (WHERE NOT e.is_deleted AND e.date >= CURRENT_DATE - INTERVAL '7 days') AS recent_entries,
  COALESCE(SUM(e.entry_length_words) FILTER (WHERE NOT e.is_deleted), 0) AS total_words,
  ROUND(
    COUNT(e.id) FILTER (WHERE NOT e.is_deleted AND e.sentiment = 'Positive')::NUMERIC /
    NULLIF(COUNT(e.id) FILTER (WHERE NOT e.is_deleted), 0) * 100, 0
  ) AS positive_pct,
  g.karma,
  g.streak_days
FROM users u
LEFT JOIN entries e ON e.user_id = u.id
LEFT JOIN gamification g ON g.user_id = u.id
GROUP BY u.id, u.firebase_uid, g.karma, g.streak_days;

-- Monthly API cost per user
CREATE VIEW user_monthly_cost AS
SELECT
  user_id,
  DATE_TRUNC('month', created_at) AS month,
  SUM(estimated_cost) AS total_cost,
  SUM(total_tokens) AS total_tokens,
  COUNT(*) AS api_calls
FROM api_usage
GROUP BY user_id, DATE_TRUNC('month', created_at);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_entries_updated_at BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_gamification_updated_at BEFORE UPDATE ON gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- SEED DATA: Insert demo personas (Mario, Kratos, Sherlock, Nova)
-- =============================================================================
-- These are created during migration from Airtable demo data.
-- No synthetic data inserted here per project policy.

-- =============================================================================
-- MIGRATION NOTES
-- =============================================================================
--
-- Airtable → PostgreSQL Field Mapping:
--
-- ENTRIES TABLE:
--   "Name"                    → entries.name
--   "Type"                    → entries.type (enum)
--   "Entry Format"            → entries.format (enum)
--   "Date"                    → entries.date
--   "Timestamp"               → entries.timestamp
--   "Text"                    → entries.text
--   "User_ID"                 → entries.user_id (FK to users via firebase_uid lookup)
--   "Inferred Mode"           → entries.inferred_mode (enum)
--   "Inferred Energy"         → entries.inferred_energy (enum)
--   "Energy Shape"            → entries.energy_shape (enum)
--   "Entry Sentiment (AI)"    → entries.sentiment (enum)
--   "Contradiction"           → entries.contradiction (enum)
--   "Entry Theme Tags (AI)"   → entries.theme_tags (TEXT[] — split on comma)
--   "Loops"                   → entries.loops
--   "Snapshot"                → entries.snapshot
--   "Summary (AI)"            → entries.summary_ai
--   "Actionable Insights (AI)"→ entries.actionable_insights_ai
--   "Next Action"             → entries.next_action
--   "Entry Length (Words)"    → entries.entry_length_words
--   "Is Bookmarked?"          → entries.is_bookmarked
--   "Is Deleted?"             → entries.is_deleted
--   "Is Summary?"             → entries.is_summary
--   "Meta Flag"               → entries.meta_flag
--
-- USER PROFILES TABLE:
--   "Firebase UID"            → users.firebase_uid
--   "Email"                   → users.email
--   "Display Name"            → users.display_name
--   "Settings" (JSON)         → users.age_range, sex, location, profession, stress_level,
--                                emotional_openness, reflection_frequency, life_satisfaction,
--                                personal_goal, selected_memory_topics, seed_memory,
--                                default_entry_mode, show_feature_tour, last_slide_completed, badges
--   "Gamification" (JSON)     → gamification.* (separate table)
--   "Life Blueprint" (JSON)   → vision_items.*, levers.*, goals.*,
--                                blueprint_responses.*, blueprint_sections.*
--   "Onboarding Completed"    → users.onboarding_completed
--   "Daily Reminder Enabled"  → users.daily_reminder_enabled
--   "Reminder Time"           → users.reminder_time
--   "FCM Token"               → users.fcm_token
--   "Badges" (JSON)           → users.badges (TEXT[])
--   "Created At"              → users.created_at
--   "Last Active"             → users.last_active
--
-- NOTIFICATION SETTINGS TABLE:
--   "User ID"                 → notification_settings.user_id (FK lookup)
--   "FCM Token"               → users.fcm_token (moved to users table)
--   "Enabled"                 → notification_settings.enabled
--   "Timezone"                → notification_settings.timezone
--   "Frequency"               → notification_settings.frequency (enum)
--   "Custom Times"            → notification_settings.custom_times (TEXT[])
--   "Quiet Hours Start"       → notification_settings.quiet_hours_start
--   "Quiet Hours End"         → notification_settings.quiet_hours_end
--   "Last Notified"           → notification_settings.last_notified
--   "Streak At Risk"          → notification_settings.streak_at_risk
--   "Weekly Summary"          → notification_settings.weekly_summary
--
-- localStorage → PostgreSQL:
--   pratyaksha-gamification        → gamification table
--   pratyaksha-life-blueprint      → vision_items + levers + goals +
--                                    blueprint_responses + blueprint_sections
--   pratyaksha-first-time-onboarding-profile → users table columns
--   pratyaksha-pattern-warnings    → pattern_warnings table
--   pratyaksha_explainer_*         → explainer_cache table
--   pratyaksha-offline (IndexedDB) → offline_queue table (server-side)
--
-- NEW TABLES (no Airtable equivalent):
--   entry_embeddings  — pgvector for RAG chat
--   prompt_cache      — LangChain response caching
--   chat_messages     — Persistent chat history
--   api_usage         — Cost tracking per user
--   summaries         — Cached daily/weekly/monthly summaries

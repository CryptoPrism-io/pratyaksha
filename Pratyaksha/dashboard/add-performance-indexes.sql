-- PERFORMANCE OPTIMIZATION: Add Missing Indexes
-- Issue: getUserProfile() taking 5-40 seconds
-- Cause: No indexes on foreign keys and filter columns
-- Impact: 10 sequential queries without indexes = slow
-- Expected improvement: 5-40s → <1s

-- =====================================================
-- CRITICAL INDEXES: userId Foreign Keys
-- =====================================================

-- Vision items (both vision and anti-vision)
CREATE INDEX IF NOT EXISTS idx_vision_items_user_id ON vision_items(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_items_user_anti ON vision_items(user_id, is_anti);

-- Levers
CREATE INDEX IF NOT EXISTS idx_levers_user_id ON levers(user_id);

-- Goals (multiple filter combinations)
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_long_term ON goals(user_id, is_long_term);
CREATE INDEX IF NOT EXISTS idx_goals_user_time_horizon ON goals(user_id, time_horizon) WHERE time_horizon IS NOT NULL;

-- Blueprint responses
CREATE INDEX IF NOT EXISTS idx_blueprint_responses_user_id ON blueprint_responses(user_id);

-- Blueprint sections
CREATE INDEX IF NOT EXISTS idx_blueprint_sections_user_id ON blueprint_sections(user_id);

-- Gamification
CREATE INDEX IF NOT EXISTS idx_gamification_user_id ON gamification(user_id);

-- =====================================================
-- SECONDARY INDEXES: Entry Queries
-- =====================================================

-- Entries table (for dashboard loads)
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_user_created ON entries(user_id, created_at DESC);

-- Entry embeddings (for RAG/chat)
CREATE INDEX IF NOT EXISTS idx_entry_embeddings_entry_id ON entry_embeddings(entry_id);

-- =====================================================
-- TERTIARY INDEXES: Chat History
-- =====================================================

-- Chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_session ON chat_messages(user_id, session_id, created_at DESC);

-- =====================================================
-- ANALYZE TABLES (Update Statistics)
-- =====================================================

ANALYZE vision_items;
ANALYZE levers;
ANALYZE goals;
ANALYZE blueprint_responses;
ANALYZE blueprint_sections;
ANALYZE gamification;
ANALYZE entries;
ANALYZE entry_embeddings;
ANALYZE chat_messages;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check indexes were created
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Expected indexes count: ~15+

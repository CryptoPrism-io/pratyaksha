# Becoming - System Architecture & Personalization Map

> Generated: 2026-02-07 | Covers: Data flows, AI pipeline, personalization, gaps, cost optimization

---

## 1. High-Level Architecture

```
                              BECOMING SYSTEM MAP
 ============================================================================

  USER INPUT                    SERVER (Express)                  STORAGE
 +-----------+               +------------------+            +-------------+
 |           |   /api/       |                  |            |             |
 | Text Entry|-------------->| 5-Agent Pipeline |----------->|  Airtable   |
 | Voice Log |   process-    | (OpenRouter)     |  write     |  Entries    |
 | Chat Msg  |   entry       |                  |            |  Table      |
 |           |               +------------------+            +-------------+
 +-----------+                       |                             |
      |                              v                             |
      |                  +-----------------------+                 |
      |                  | Agent 1: Intent       | gpt-4o-mini    |
      |                  | Agent 2: Emotion      | gpt-4o-mini    |
      |                  | Agent 3: Theme        | gpt-4o-mini    |
      |                  | Agent 4: Insight      | gpt-4o         |
      |                  | Agent 5: Decompose    | gpt-4o-mini    |
      |                  +-----------------------+                 |
      |                                                            |
      |  /api/chat       +------------------+                      |
      +----------------->| Chat Engine      |<---------------------+
      |                  | (gpt-4o-mini)    |  reads all entries
      |                  | + User Context   |  for personalization
      |                  +------------------+
      |
      |  /api/speech     +------------------+
      +----------------->| Groq Whisper     |  FREE
                         | + LLaMA 3.3-70b  |  FREE (tier limited)
                         +------------------+

  FRONTEND (React)                                     LOCAL STORAGE
 +---------------------+                          +--------------------+
 | Life Blueprint      |------------------------->| pratyaksha-        |
 | Soul Mapping        |  reads/writes            |  life-blueprint    |
 | Gamification/Karma  |                          |  gamification      |
 | Pattern Warnings    |                          |  onboarding        |
 | Vision Alignment    |                          |  pattern-warnings  |
 +---------------------+                          +--------------------+
         |                                                |
         |  /api/user-profile (sync)                      |
         +----------------------------------------------->+ Airtable
                                                            User Profiles
                                                            Table
```

---

## 2. Data Collection Points

### 2.1 Onboarding (10 slides, one-time)

| Slide | Data Collected | Storage | Used By |
|-------|---------------|---------|---------|
| 2 | Name, age range, sex, location, profession | Airtable Profile `Settings` | Chat personalization |
| 3 | Stress level (1-5), emotional openness (1-5), reflection frequency, life satisfaction, personal goal | Airtable Profile `Settings` | Chat tone adjustment |
| 5 | Key memory topics (3 from 10 options) | Airtable Profile `Settings` | Soul Mapping seeding |
| 4 | Seed memory entry (100+ chars) | Airtable Entries table | First journal entry |
| 9 | Daily reminder preference, reminder time | Airtable Profile | Push notifications |

### 2.2 Life Blueprint (ongoing)

| Component | Data Type | Example | Storage |
|-----------|----------|---------|---------|
| Vision | Array of statements with category | "Lead a team building meaningful products" (career) | localStorage + Airtable Profile |
| Anti-Vision | Array of statements with category | "Burned out, disconnected from family" (lifestyle) | localStorage + Airtable Profile |
| Levers | Array of {name, description, direction} | "Morning routine" pushes toward vision | localStorage + Airtable Profile |
| Short-term Goals | Array with target dates | "Meditate 10 min daily by March" | localStorage + Airtable Profile |
| Long-term Goals | Array with target dates | "Write a book by 2027" | localStorage + Airtable Profile |
| Time Horizon Goals | Buckets: 6mo, 1yr, 3yr, 5yr, 10yr | Per-horizon goal lists | localStorage + Airtable Profile |
| Question Responses | Free-text answers to guided questions | Reflective responses | localStorage + Airtable Profile |

**Categories**: career, health, relationships, finance, personal-growth, lifestyle, contribution, other

### 2.3 Soul Mapping (progressive unlock)

| Tier | Unlock | Topics (17 total) |
|------|--------|-------------------|
| Surface | Always | childhood, joys, friendships, interests |
| Deep | 10+ entries | parents, siblings, love, career, turning-points, body |
| Core | 25+ entries | wounds, fears, regrets, shadow, identity, beliefs, mortality |

**Storage**: `pratyaksha-gamification` in localStorage, synced to Airtable `Gamification` field

### 2.4 Per Journal Entry (AI-processed)

```
USER WRITES/SPEAKS                     AI GENERATES (5 agents)
+---------------------------+          +--------------------------------+
| Raw text (free-form)      |    ->    | Entry Type (15 types)          |
| Date/time                 |          | Entry Format (4 formats)       |
| Entry mode (morning,      |          | Name (3-6 word title)          |
|   evening, gratitude,     |          | Snapshot (1-2 sentence)        |
|   stress, goal, free)     |          | Inferred Mode (15 states)      |
|                           |          | Inferred Energy (10 levels)    |
|                           |          | Energy Shape (12 patterns)     |
|                           |          | Sentiment (pos/neg/neutral)    |
|                           |          | Contradiction (12 tensions)    |
|                           |          | Theme Tags (3-5 extracted)     |
|                           |          | Loops (repetitive patterns)    |
|                           |          | Summary (AI narrative)         |
|                           |          | Actionable Insights            |
|                           |          | Next Action (1 concrete step)  |
+---------------------------+          +--------------------------------+
```

### 2.5 Gamification / Karma

| Action | Karma | Frequency |
|--------|-------|-----------|
| Journal entry | +10 | Per entry |
| Soul Mapping topic | +25 | One-time per topic |
| Daily dashboard view | +5 | Once/day |
| Daily streak | +5 | Per day |
| Onboarding completion | +50 | One-time |
| AI chat message | **-5** | Per message |
| Chart explainer | **-3** | Per request |
| Regenerate summary | **-10** | Per request |

---

## 3. AI Pipeline Detail

### 3.1 Entry Processing (5 sequential agents)

```
  User Text
      |
      v
 +------------------+     +------------------+     +------------------+
 | AGENT 1: INTENT  |---->| AGENT 2: EMOTION |---->| AGENT 3: THEME   |
 | gpt-4o-mini      |     | gpt-4o-mini      |     | gpt-4o-mini      |
 | ~100 tokens out   |     | ~100 tokens out   |     | ~150 tokens out   |
 | $0.002/call       |     | $0.002/call       |     | $0.002/call       |
 |                  |     |                  |     |                  |
 | Output:          |     | Output:          |     | Output:          |
 | - type           |     | - inferredMode   |     | - themeTagsAI[]  |
 | - format         |     | - inferredEnergy |     | - contradiction  |
 | - name           |     | - energyShape    |     | - loops          |
 | - snapshot       |     | - sentimentAI    |     |                  |
 | - isConsolidated |     |                  |     |                  |
 +------------------+     +------------------+     +------------------+
                                                          |
      +---------------------------------------------------+
      |
      v
 +------------------+     +------------------+
 | AGENT 4: INSIGHT |---->| AGENT 5: DECOMP  |  (conditional)
 | gpt-4o (!)       |     | gpt-4o-mini      |
 | ~300 tokens out   |     | ~300 tokens out   |
 | $0.005/call       |     | $0.002/call       |
 |                  |     |                  |
 | Output:          |     | Trigger: only if |
 | - summaryAI      |     | isConsolidated   |
 | - actionable     |     |                  |
 |   insights       |     | Output:          |
 | - nextAction     |     | - child events[] |
 +------------------+     | - each re-runs   |
                          |   FULL pipeline  |  <-- COST MULTIPLIER
                          +------------------+
```

**Cost per entry**: $0.013 (simple) to $0.065+ (consolidated with 3 child events)

### 3.2 Chat Engine

```
  User Message
      |
      +---> Fetch ALL entries from Airtable (no cache!)
      |          |
      |          v
      |     Build Context Summary:
      |     - Top 5 modes + counts
      |     - Top 5 energy shapes
      |     - Top 5 contradictions
      |     - Sentiment breakdown (%)
      |     - Top 10 themes
      |     - Last 10 entry snapshots
      |
      +---> Load User Context (from request body):
      |     - Soul Mapping: tier, completed topics
      |     - Life Blueprint: vision, anti-vision, levers, goals
      |     - Profile: name, profession, stress, openness
      |     - Stats: entries, streak, karma
      |
      +---> Compose 3-part system prompt:
      |     1. Base prompt (role + guidelines)
      |     2. Personal context (adjusts tone per stress/openness)
      |     3. Journal data context (all aggregated stats)
      |
      v
 +------------------+
 | gpt-4o-mini      |
 | temp: 0.7        |
 | max_tokens: 800  |
 | ~3000-5000 tokens|
 | input context    |
 | $0.05-0.15/msg   |
 +------------------+
```

### 3.3 Summaries

| Type | Model | max_tokens | Trigger | Input Size | Cost |
|------|-------|-----------|---------|------------|------|
| Daily | gpt-4o-mini | 500 | User views insights | All entries for 1 day | $0.003 |
| Weekly | **gpt-4o** | 1500 | User views weekly | Full week + aggregated stats | $0.04 |
| Monthly | **gpt-4o** | 2000 | User views monthly | 4 week summaries + 30 entries | $0.07 |
| Chart Explainer | gpt-4o-mini | 600 | User clicks "explain" | Chart-specific data | $0.02 |

### 3.4 Speech-to-Text (Groq)

```
  Audio (webm, max 25MB)
      |
      v
 +------------------------+     +------------------------+
 | Groq Whisper           |---->| Groq LLaMA 3.3-70b    |
 | whisper-large-v3-turbo |     | llama-3.3-70b-versatile|
 | FREE                   |     | FREE (tier limited)    |
 |                        |     |                        |
 | Output: raw transcript |     | Output:                |
 |                        |     | - cleanedText          |
 |                        |     | - suggestedType        |
 |                        |     | - suggestedTags[]      |
 |                        |     | - confidence           |
 +------------------------+     +------------------------+
```

---

## 4. Personalization Flow

```
  ONBOARDING DATA                    ONGOING DATA
  (collected once)                   (grows over time)
 +-------------------+              +-------------------+
 | Name, Age, Sex    |              | Journal Entries   |
 | Profession        |              | (all AI fields)   |
 | Stress Level      |              |                   |
 | Emotional Open.   |              | Soul Mapping      |
 | Personal Goal     |              | Progress          |
 | Memory Topics     |              |                   |
 | Seed Memory       |              | Life Blueprint    |
 +-------------------+              | Updates           |
         |                          |                   |
         |                          | Karma/Streaks     |
         v                          +-------------------+
 +-----------------------------------------------+
 |         USER CONTEXT BUILDER                   |
 |  server/lib/userContextBuilder.ts              |
 |                                                |
 |  Adjustments based on:                         |
 |  - High stress -> extra gentle tone            |
 |  - Low stress -> more direct                   |
 |  - High openness -> explore feelings deeper    |
 |  - Low openness -> practical advice focus      |
 |  - Vision/Anti-Vision -> drift awareness       |
 +-----------------------------------------------+
         |
         v
 +-----------------------------------------------+
 |         PERSONALIZED OUTPUTS                   |
 |                                                |
 |  Chat: Tone-adjusted, references your goals    |
 |  Insights: Compared against your vision        |
 |  Warnings: Drift toward anti-vision detected   |
 |  Summaries: Framed around your trajectory      |
 +-----------------------------------------------+
```

### Personalization Channels

| Channel | What's Personalized | Data Source |
|---------|-------------------|-------------|
| Chat responses | Tone, depth, references to goals/fears | Profile settings + Life Blueprint |
| Entry insights | "Next action" aligned to user's vision | Life Blueprint vision statements |
| Pattern warnings | Anti-vision drift detection | Life Blueprint anti-vision + entry sentiment |
| Weekly/monthly narratives | Framed around user's trajectory | All entries + vision alignment score |
| Soul Mapping unlocks | Tier progression based on engagement | Entry count gamification |
| Dashboard visualizations | All charts reflect user's actual data | Entries table (type, mode, energy, themes) |

---

## 5. Airtable Schema

### Table 1: Entries (`tblhKYssgHtjpmbni`)

| Field | Type | Source | Purpose |
|-------|------|--------|---------|
| Name | Text | AI (Agent 1) | 3-6 word entry title |
| Type | Single Select | AI (Agent 1) | 15 entry types |
| Format | Single Select | AI (Agent 1) | Quick/Daily/End of Day/Consolidated |
| Date | Date | System | YYYY-MM-DD |
| Timestamp | DateTime | System | ISO timestamp |
| Text | Long Text | User | Full journal entry |
| User_ID | Text | Firebase Auth | Multi-tenant filtering |
| Inferred Mode | Single Select | AI (Agent 2) | 15 psychological states |
| Inferred Energy | Single Select | AI (Agent 2) | 10 energy levels |
| Energy Shape | Single Select | AI (Agent 2) | 12 energy patterns |
| Entry Sentiment (AI) | Single Select | AI (Agent 2) | Positive/Negative/Neutral |
| Contradiction | Single Select | AI (Agent 3) | 12 internal tensions |
| Entry Theme Tags (AI) | Text | AI (Agent 3) | Comma-separated themes |
| Loops | Text | AI (Agent 3) | Repetitive patterns |
| Snapshot | Long Text | AI (Agent 1) | 1-2 sentence summary |
| Summary (AI) | Long Text | AI (Agent 4) | Full narrative summary |
| Actionable Insights (AI) | Long Text | AI (Agent 4) | Recommendations |
| Next Action | Text | AI (Agent 4) | One concrete step |
| Entry Length (Words) | Number | System | Word count |
| Is Bookmarked? | Checkbox | User | Favorites |
| Is Deleted? | Checkbox | User | Soft delete |
| Is Summary? | Checkbox | System | Aggregated summaries |
| Meta Flag | Text | System | "Web App", "Decomposed Entry" |

### Table 2: User Profiles (`tblmncNWqXioyJYPc`)

| Field | Type | Content |
|-------|------|---------|
| Firebase UID | Text | Primary key |
| Email | Email | User email |
| Display Name | Text | User name |
| Settings | Long Text (JSON) | `{ageRange, sex, location, profession, stressLevel, emotionalOpenness, reflectionFrequency, lifeSatisfaction, personalGoal, selectedMemoryTopics[], seedMemory, defaultEntryMode}` |
| Gamification | Long Text (JSON) | `{karma, completedSoulMappingTopics[], streakDays, lastEntryDate, totalEntriesLogged, totalGiftsReceived}` |
| Life Blueprint | Long Text (JSON) | `{vision[], antiVision[], levers[], shortTermGoals[], longTermGoals[], timeHorizonGoals{}, questionResponses[], completedSections[], metadata}` |
| Badges | Long Text (JSON) | `["early_explorer", "open_book", "deep_diver", "seeker"]` |
| Onboarding Completed | Checkbox | First-run flag |
| Daily Reminder Enabled | Checkbox | Notification pref |
| Reminder Time | Text | HH:MM format |
| FCM Token | Text | Push notification token |
| Created At | DateTime | Account creation |
| Last Active | DateTime | Last activity |

---

## 6. Gap Analysis

### 6.1 Critical Gaps

| # | Gap | Impact | Severity |
|---|-----|--------|----------|
| G1 | **No caching on chat context** - Every chat message fetches ALL entries from Airtable and rebuilds context from scratch | High API costs, slow responses for users with many entries | HIGH |
| G2 | **Decomposition cascade** - Consolidated entries re-run the full 5-agent pipeline for each child event (N children = 5N extra API calls) | Cost multiplier of 2-5x per consolidated entry | HIGH |
| G3 | **No rate limiting on OpenRouter** - No backoff on 429 errors, no per-user request throttling | Risk of runaway costs, API key exhaustion | HIGH |
| G4 | **Life Blueprint only in localStorage** - Cloud sync exists but is secondary; data loss risk on browser clear | Users lose vision/goals if they clear browser data | MEDIUM |
| G5 | **No request deduplication** - Identical chat messages or re-submitted entries trigger full pipeline again | Wasted API spend | MEDIUM |
| G6 | **Image generation not cached** - Onboarding images regenerated on every view | $0.10-0.30 wasted per repeat view | MEDIUM |
| G7 | **Vision alignment is keyword-only** - Pattern matching uses simple string matching (3+ char words), no semantic understanding | Misses conceptual drift, false positives on short words | LOW |
| G8 | **No feedback loop** - Users can't correct AI classifications (wrong type/mode/sentiment) | AI accuracy never improves from user corrections | LOW |
| G9 | **Groq free tier dependency** - Speech-to-text relies entirely on Groq's free tier; no fallback | Feature breaks if Groq limits change | LOW |

### 6.2 Feature Gaps

| # | Missing Feature | Description | Difficulty |
|---|----------------|-------------|------------|
| F1 | **Comparative insights** | "You were 40% more anxious this month than last month" - requires month-over-month delta tracking | Medium |
| F2 | **Goal progress tracking** | Life Blueprint goals have no completion % or progress indicators tied to entries | Medium |
| F3 | **Contradiction evolution** | Track how contradictions shift over time (e.g., "Action vs Fear" declining over 3 months) | Easy |
| F4 | **Peer benchmarking** (anonymized) | "Your journaling frequency is in the top 20%" | Hard (needs aggregation layer) |
| F5 | **Export / portability** | Users can't export their Life Blueprint or Soul Mapping responses | Easy |
| F6 | **Entry editing** | No ability to edit an entry after AI processing (only delete) | Medium |
| F7 | **Custom contradiction types** | Users can only see the 12 predefined contradictions, can't define their own | Easy |
| F8 | **Scheduled summaries** | Weekly/monthly summaries require manual trigger; no auto-generation + notification | Medium |

### 6.3 Data Flow Gaps

```
  CURRENT GAPS IN DATA FLOW:

  Onboarding Profile ----X----> Entry Pipeline
  (stress level, goals)         (agents don't see user profile!)
         |
         |  Only flows to:
         v
  Chat Engine (has full context)

  MISSING CONNECTIONS:
  -----------------------------------------------------------
  1. Entry agents don't know user's vision/goals
     -> Insight agent could give better "next action" if it
        knew the user's Life Blueprint

  2. Pattern warnings are frontend-only
     -> Server doesn't generate warnings; client-side
        keyword matching is limited

  3. Soul Mapping responses don't feed into AI
     -> Deeply personal responses about fears, wounds,
        identity are collected but NEVER used by chat
        or insight agents

  4. Gamification doesn't adapt difficulty
     -> Karma costs are static; a power user with 500
        entries pays the same as a new user with 5
```

---

## 7. Cost Analysis

### 7.1 Cost Per Action

| Action | API Calls | Models | Est. Cost |
|--------|----------|--------|-----------|
| Submit text entry | 4-5 | 3x mini + 1x 4o + 1x mini | $0.013 |
| Submit consolidated entry (3 events) | 20 | 12x mini + 4x 4o + 4x mini | $0.065 |
| Voice entry (transcribe + process) | 2 Groq + 4-5 OpenRouter | Whisper + LLaMA + pipeline | $0.013 |
| Chat message | 1 + Airtable reads | 1x mini (large context) | $0.05-0.15 |
| Chart explanation | 1 | 1x mini | $0.02 |
| Daily summary | 1 | 1x mini | $0.003 |
| Weekly summary | 1 | 1x **4o** | $0.04 |
| Monthly summary | 1 | 1x **4o** | $0.07 |
| Image generation | 1 | Gemini Imagen 3 | $0.10-0.30 |

### 7.2 Monthly Cost Per User (moderate usage)

| Category | Assumptions | Monthly Cost |
|----------|------------|-------------|
| Entry processing | 10 entries/day, 50% consolidated | $13.50 |
| Chat | 5 messages/day | $12.00 |
| Chart explainers | 8/week | $0.64 |
| Summaries | 30 daily + 4 weekly + 1 monthly | $0.33 |
| Images | 10 onboarding + 2 custom | $1.20 |
| **TOTAL** | | **~$27.67/user/month** |

### 7.3 Scaling Costs

| Users | Monthly Cost | Annual Cost |
|-------|-------------|-------------|
| 1 | $28 | $336 |
| 10 | $277 | $3,324 |
| 100 | $2,767 | $33,204 |
| 1,000 | $27,670 | $332,040 |

---

## 8. Cost Optimization Strategies

### 8.1 HIGH IMPACT (save 40-60%)

#### Strategy 1: Cache chat context (saves ~$8/user/month)
```
Current:  Every chat msg -> fetch ALL entries -> rebuild context
Proposed: Cache context summary in memory/Redis
          Invalidate only when new entry is added
          TTL: 5 minutes

Savings: 80% reduction in chat context building
         ~$8/user/month at 5 msgs/day
```

#### Strategy 2: Lightweight decomposition (saves ~$5/user/month)
```
Current:  Consolidated entry -> decompose -> run FULL 5-agent
          pipeline on EACH child event (5N extra calls)
Proposed: For child events, only run Agent 1 (Intent) + Agent 2
          (Emotion). Skip Theme/Insight/Decompose.
          Parent entry already has the narrative insight.

Savings: 60% fewer calls on consolidated entries
         ~$5/user/month assuming 50% consolidated
```

#### Strategy 3: Replace gpt-4o with gpt-4o-mini for insights (saves ~$3/user/month)
```
Current:  Agent 4 (Insight) uses gpt-4o ($5/$15 per M tokens)
Proposed: Test gpt-4o-mini ($0.15/$0.60 per M tokens)
          gpt-4o-mini has significantly improved since launch
          Quality delta is minimal for structured JSON output

Savings: 33x cheaper per insight call
         ~$3/user/month
```

### 8.2 MEDIUM IMPACT (save 15-25%)

#### Strategy 4: Reduce max_tokens across agents
```
Current:  All agents default to max_tokens=500
Actual:   Most agents output 50-200 tokens

Proposed max_tokens:
  Agent 1 (Intent):    250  (outputs ~100 tokens)
  Agent 2 (Emotion):   200  (outputs ~80 tokens)
  Agent 3 (Theme):     300  (outputs ~150 tokens)
  Agent 4 (Insight):   400  (outputs ~250 tokens)
  Agent 5 (Decompose): 500  (keep, outputs vary)
  Chat:                600  (from 800)

Savings: 20-30% on output token costs
```

#### Strategy 5: Parallelize agents 1-3
```
Current:  Agent 1 -> wait -> Agent 2 -> wait -> Agent 3 -> wait -> Agent 4
Proposed: Agent 1 runs first (needed for type),
          then Agent 2 + Agent 3 in PARALLEL (both need type, but
          are independent of each other),
          then Agent 4 (needs all 3 results)

Pipeline:  1 -> [2 || 3] -> 4 -> 5(conditional)

Savings: No cost savings, but ~30% faster processing time
         Better UX (entry appears sooner)
```

#### Strategy 6: Cache image generations permanently
```
Current:  Onboarding images regenerated per user
Proposed: Generate once, store in Cloud Storage / CDN
          Serve cached images for standard prompts
          Only generate custom images on demand

Savings: ~$1/user one-time savings
```

### 8.3 LOW IMPACT (save 5-10%)

#### Strategy 7: Request deduplication
```
Hash the last 5 (prompt + model) combinations.
If identical request within 60 seconds, return cached result.
Prevents accidental double-submits.
```

#### Strategy 8: Batch daily summaries
```
Instead of generating on-demand per user request,
generate overnight via cron job for all active users.
Cache result. Amortize Airtable reads.
```

#### Strategy 9: Switch weekly/monthly summaries to gpt-4o-mini
```
Current:  gpt-4o ($5/$15 per M tokens)
Proposed: gpt-4o-mini with slightly longer prompt for quality
Savings:  ~$0.10/user/month (small volume but 33x cheaper)
```

### 8.4 Cost Optimization Roadmap

```
  PHASE 1 (Quick wins, 1-2 days)          Est. Savings: 25%
  +-----------------------------------------+
  | - Reduce max_tokens (Strategy 4)        |
  | - Cache images (Strategy 6)             |
  | - Request deduplication (Strategy 7)    |
  +-----------------------------------------+

  PHASE 2 (Medium effort, 3-5 days)        Est. Savings: 35%
  +-----------------------------------------+
  | - Cache chat context (Strategy 1)       |
  | - Lightweight decomposition (Strategy 2)|
  | - Parallelize agents (Strategy 5)       |
  +-----------------------------------------+

  PHASE 3 (Requires testing, 1 week)       Est. Savings: 15%
  +-----------------------------------------+
  | - gpt-4o-mini for insights (Strategy 3) |
  | - gpt-4o-mini for summaries (Strategy 9)|
  | - Batch daily summaries (Strategy 8)    |
  +-----------------------------------------+

  TOTAL POTENTIAL SAVINGS: ~60-70%
  From ~$28/user/month -> ~$8-11/user/month
```

---

## 9. Security & Privacy Notes

| Aspect | Current State |
|--------|--------------|
| Authentication | Firebase Auth (email/password + Google SSO) |
| Data at rest | Airtable (SOC 2 Type II compliant) |
| Data in transit | HTTPS everywhere (Cloud Run, Airtable API, OpenRouter) |
| PII collected | Name, email, age range, profession, location (all optional) |
| PII NOT collected | Real address, phone, payment info, biometrics |
| AI data retention | OpenRouter: no training on user data (policy) |
| Local-first | Life Blueprint, gamification stored in localStorage first |
| Demo mode | Full app accessible without authentication (demo personas) |
| Data export | CSV export for entries; no Life Blueprint export yet (Gap F5) |

---

## 10. Key Files Reference

| Component | File Path |
|-----------|----------|
| Entry pipeline orchestrator | `server/routes/entry.ts` |
| Intent agent | `server/agents/intentAgent.ts` |
| Emotion agent | `server/agents/emotionAgent.ts` |
| Theme agent | `server/agents/themeAgent.ts` |
| Insight agent | `server/agents/insightAgent.ts` |
| Decomposition agent | `server/agents/decompositionAgent.ts` |
| Chat engine | `server/routes/chat.ts` |
| User context builder | `server/lib/userContextBuilder.ts` |
| OpenRouter client | `server/lib/openrouter.ts` |
| Speech processing | `server/routes/speech.ts` |
| Image generation | `server/lib/geminiImageGen.ts` |
| Daily/Weekly/Monthly agents | `server/agents/daily|weekly|monthlyAgent.ts` |
| Chart explainer prompts | `server/lib/explainerPrompts.ts` |
| Life Blueprint storage | `src/lib/lifeBlueprintStorage.ts` |
| Gamification/karma | `src/lib/gamificationStorage.ts` |
| Vision alignment | `src/lib/visionAlignment.ts` |
| Pattern warnings | `src/lib/patternWarnings.ts` |
| User profile sync | `server/routes/userProfile.ts` |
| Soul Mapping UI | `src/components/gamification/SoulMappingProgress.tsx` |
| Life Blueprint UI | `src/components/gamification/LifeBlueprintEditor.tsx` |
| Onboarding flow | `src/components/onboarding/FirstTimeOnboarding.tsx` |

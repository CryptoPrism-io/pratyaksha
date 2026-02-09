// Express Server Entry Point for Pratyaksha API
import "dotenv/config"
import express from "express"
import cors from "cors"
import path from "path"
import { processEntry, updateEntry, deleteEntry, toggleBookmark } from "./routes/entry"
import { getWeeklySummary } from "./routes/weeklySummary"
import { getDailySummary } from "./routes/dailySummary"
import { getMonthlySummary } from "./routes/monthlySummary"
import { registerToken, updatePreferences, sendNotification, getSettings, testNotification, cronNotifications } from "./routes/notifications"
import { explainChart } from "./routes/explain"
import { chat } from "./routes/chat"
import speechRouter from "./routes/speech"
import { getUserProfile, upsertUserProfile } from "./routes/userProfile"
import {
  generateCustom,
  getOnboardingImage,
  getLandingImage,
  getAchievementImage,
  generateAllOnboarding,
  listPrompts,
  previewPrompt
} from "./routes/imageGen"
import { embedAllMissing } from "./lib/embeddings"
import { cleanExpiredCache } from "./lib/cache"
import testUsersRouter from "./routes/testUsers"
import debugRouter from "./routes/debug"

const app = express()
const PORT = process.env.PORT || 3001
const isProduction = process.env.NODE_ENV === "production"

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// API Routes
app.post("/api/process-entry", processEntry)
app.patch("/api/entry/:id", updateEntry)
app.delete("/api/entry/:id", deleteEntry)
app.patch("/api/entry/:id/bookmark", toggleBookmark)
app.get("/api/weekly-summary", getWeeklySummary)
app.get("/api/daily-summary", getDailySummary)
app.get("/api/monthly-summary", getMonthlySummary)

// AI Chart Explainer route
app.post("/api/explain", explainChart)

// AI Chat route
app.post("/api/chat", chat)

// Speech-to-text routes (Groq Whisper)
app.use("/api/speech", speechRouter)

// Notification routes
app.post("/api/notifications/register", registerToken)
app.put("/api/notifications/preferences", updatePreferences)
app.post("/api/notifications/send", sendNotification)
app.get("/api/notifications/settings/:userId", getSettings)
app.post("/api/notifications/test", testNotification)

// GET /api/notifications/preferences - redirect to proper endpoint
// This handles stray GET requests that should use /api/notifications/settings/:userId
app.get("/api/notifications/preferences", (_req, res) => {
  res.status(400).json({
    success: false,
    error: "userId is required. Use GET /api/notifications/settings/:userId instead.",
  })
})

// User Profile routes
app.get("/api/user-profile/:uid", getUserProfile)
app.post("/api/user-profile", upsertUserProfile)

// Image Generation routes (Gemini)
app.post("/api/image/generate", generateCustom)
app.get("/api/image/onboarding/:slideId", getOnboardingImage)
app.get("/api/image/landing/:imageId", getLandingImage)
app.get("/api/image/achievement/:achievementId", getAchievementImage)
app.post("/api/image/batch/onboarding", generateAllOnboarding)
app.get("/api/image/prompts", listPrompts)
app.get("/api/image/prompt/:category/:id", previewPrompt)

// Test user routes (admin/dev)
app.use("/api/test-users", testUsersRouter)

// Debug routes (dev only)
app.use("/api/debug", debugRouter)

// Cron routes (called by Cloud Scheduler)
app.post("/api/cron/notifications", cronNotifications)

// Embedding & Cache management (internal/admin)
app.post("/api/embeddings/index-all", async (_req, res) => {
  try {
    const stats = await embedAllMissing()
    res.json({ success: true, ...stats })
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) })
  }
})
app.post("/api/cache/clean", async (_req, res) => {
  try {
    await cleanExpiredCache()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) })
  }
})

// Serve static files in production
// __dirname is available in CommonJS modules
if (isProduction) {
  // In production, static files are in dist/ at the same level as dist/server/
  const clientPath = path.resolve(__dirname, "..")
  app.use(express.static(clientPath))

  // SPA fallback - serve index.html for non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientPath, "index.html"))
  })
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Server Error]", err)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Pratyaksha API running on port ${PORT}`)
  console.log(`[Server] Health check: http://localhost:${PORT}/health`)
  console.log(`[Server] Process entry: POST http://localhost:${PORT}/api/process-entry`)
})

export default app

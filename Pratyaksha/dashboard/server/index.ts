// Express Server Entry Point for Pratyaksha API
import "dotenv/config"
import express from "express"
import cors from "cors"
import path from "path"
import { processEntry, updateEntry, deleteEntry, toggleBookmark } from "./routes/entry"
import { getWeeklySummary } from "./routes/weeklySummary"
import { getDailySummary } from "./routes/dailySummary"

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

// Debug endpoints for testing personalization
import { Router, Request, Response } from "express"
import { getUserProfile, findUserByFirebaseUid } from "../lib/db"
import { createEmptyUserContext, buildAgentContextBlock, type UserContext } from "../lib/userContextBuilder"

const router = Router()

/**
 * GET /api/debug/user-context/:firebaseUid
 * Inspect the raw user context that gets injected into agent prompts
 */
router.get("/user-context/:firebaseUid", async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params

    const user = await findUserByFirebaseUid(firebaseUid)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const profile = await getUserProfile(firebaseUid)
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" })
    }

    // Build context exactly as entry route does
    const ctx: UserContext = createEmptyUserContext()

    // Profile basics
    ctx.profile.displayName = profile.displayName || ""
    ctx.profile.ageRange = profile.personalization?.ageRange || null
    ctx.profile.profession = profile.personalization?.profession || null
    ctx.profile.stressLevel = profile.personalization?.stressLevel || null
    ctx.profile.emotionalOpenness = profile.personalization?.emotionalOpenness || null
    ctx.profile.personalGoal = profile.personalization?.personalGoal || null
    ctx.profile.selectedMemoryTopics = profile.personalization?.selectedMemoryTopics || []

    // Life blueprint
    if (profile.lifeBlueprint) {
      ctx.blueprint.vision = (profile.lifeBlueprint.vision || []).map(v => ({
        text: v.text,
        category: v.category || "other",
      }))
      ctx.blueprint.antiVision = (profile.lifeBlueprint.antiVision || []).map(v => ({
        text: v.text,
        category: v.category || "other",
      }))
      ctx.blueprint.levers = (profile.lifeBlueprint.levers || []).map(l => ({
        name: l.name,
        description: l.description || "",
        pushesToward: l.pushesToward || "vision",
      }))
      ctx.blueprint.completedSections = profile.lifeBlueprint.completedSections || []

      // Time horizon goals
      const thGoals = profile.lifeBlueprint.timeHorizonGoals || []
      for (const g of thGoals) {
        if (g.completed) continue
        const horizon = g.horizon as keyof typeof ctx.blueprint.timeHorizonGoals
        if (horizon && ctx.blueprint.timeHorizonGoals[horizon]) {
          ctx.blueprint.timeHorizonGoals[horizon].push(g.text)
        }
      }

      // Key reflections
      const responses = profile.lifeBlueprint.responses || []
      for (const r of responses) {
        ctx.blueprint.keyReflections[r.questionId] = r.answer
      }
    }

    // Gamification stats
    if (profile.gamification) {
      ctx.stats.totalEntries = (profile.gamification as any).totalEntriesLogged || 0
      ctx.stats.streakDays = (profile.gamification as any).streakDays || 0
      ctx.stats.karmaPoints = (profile.gamification as any).karma || 0
    }

    // Soul mapping
    if (profile.gamification && (profile.gamification as any).completedSoulMappingTopics) {
      ctx.soulMapping.completedTopics = (profile.gamification as any).completedSoulMappingTopics || []
      ctx.soulMapping.totalCompleted = ctx.soulMapping.completedTopics.length
    }

    // Build the agent context block (what actually gets injected)
    const agentContextBlock = buildAgentContextBlock(ctx)

    return res.json({
      firebaseUid,
      userId: user.id,
      rawContext: ctx,
      agentContextBlock,
      agentContextBlockLength: agentContextBlock.length,
      hasPersonalContext: agentContextBlock.length > 0,
    })
  } catch (error) {
    console.error("[Debug] Error fetching user context:", error)
    return res.status(500).json({ error: String(error) })
  }
})

export default router

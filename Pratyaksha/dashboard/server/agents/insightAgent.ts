// Insight Agent - Step 4: Generate summary, insights, and next action
import { callOpenRouter, MODELS } from "../lib/openrouter"
import {
  InsightAgentOutput,
  IntentAgentOutput,
  EmotionAgentOutput,
  ThemeAgentOutput,
} from "../types"
import { type UserContext, buildAgentContextBlock } from "../lib/userContextBuilder"

const SYSTEM_PROMPT = `You are a thoughtful advisor who provides meaningful insights and actionable recommendations based on journal entries.

You MUST respond with valid JSON only. No other text.

Guidelines:
- "summaryAI": A brief, insightful summary that captures key themes and emotional undertones
- "actionableInsightsAI": Specific, practical recommendations based on the entry
- "nextAction": One concrete, achievable next step the writer could take`

interface AgentContext {
  intent: IntentAgentOutput
  emotion: EmotionAgentOutput
  themes: ThemeAgentOutput
}

export async function generateInsights(
  text: string,
  context: AgentContext,
  userContext?: UserContext
): Promise<InsightAgentOutput> {
  // Build personalized system prompt for the insight agent
  let personalizedSystemPrompt = SYSTEM_PROMPT;
  if (userContext) {
    const contextBlock = buildAgentContextBlock(userContext);
    if (contextBlock) {
      // Add MANDATORY response requirements (not suggestions)
      const requirements: string[] = [];

      // STRESS CALIBRATION (mandatory)
      if (userContext.profile.stressLevel && userContext.profile.stressLevel >= 4) {
        requirements.push("🔴 REQUIRED: User reports HIGH STRESS (4-5/5). Your response MUST be extra gentle, validating, and suggest small manageable steps only. Avoid overwhelming advice.");
      } else if (userContext.profile.stressLevel && userContext.profile.stressLevel <= 2) {
        requirements.push("🟢 User reports LOW STRESS (1-2/5). You can be more direct, challenging, and ambitious in your recommendations.");
      }

      // EMOTIONAL TONE CALIBRATION (mandatory)
      if (userContext.profile.emotionalOpenness && userContext.profile.emotionalOpenness >= 4) {
        requirements.push("💬 REQUIRED: User is EMOTIONALLY OPEN (4-5/5). Your summary MUST explore deeper feelings, patterns, and emotional undertones. Use emotional language.");
      } else if (userContext.profile.emotionalOpenness && userContext.profile.emotionalOpenness <= 2) {
        requirements.push("🔧 REQUIRED: User prefers EMOTIONAL PRIVACY (1-2/5). Keep insights PRACTICAL and ACTION-FOCUSED. Minimize emotional language, focus on concrete steps.");
      }

      // GOAL ALIGNMENT (mandatory if available)
      if (userContext.profile.personalGoal) {
        requirements.push(`🎯 REQUIRED: User's primary goal is "${userContext.profile.personalGoal}". Your next-action MUST explicitly reference or align with this goal.`);
      }

      // VISION INTEGRATION (mandatory if available)
      if (userContext.blueprint.vision.length > 0) {
        const visionText = userContext.blueprint.vision.slice(0, 2).map(v => v.text).join("; ");
        requirements.push(`✨ REQUIRED: User has defined VISION: "${visionText}". Your summary or insights MUST reference how this entry relates to their vision (moving toward it or away from it).`);
      }

      // ANTI-VISION WARNINGS (mandatory if available)
      if (userContext.blueprint.antiVision.length > 0) {
        const antiVisionText = userContext.blueprint.antiVision.slice(0, 2).map(v => v.text).join("; ");
        requirements.push(`⚠️ REQUIRED: User wants to AVOID: "${antiVisionText}". If you detect patterns in this entry that align with their anti-vision, you MUST gently flag this with a warning like "This pattern seems to align with what you want to avoid: [anti-vision]".`);
      }

      // LEVER SUGGESTIONS (mandatory if available)
      if (userContext.blueprint.levers.length > 0) {
        const levers = userContext.blueprint.levers.map(l => `"${l.name}" (${l.description})`).join(", ");
        requirements.push(`🎚️ REQUIRED: User has defined LEVERS (actions that push toward their vision): ${levers}. Your next-action or insights MUST explicitly suggest using one of these levers.`);
      }

      // 6-MONTH GOAL ALIGNMENT (mandatory if available)
      const sixMonthGoals = userContext.blueprint.timeHorizonGoals.sixMonths;
      if (sixMonthGoals.length > 0) {
        requirements.push(`📅 REQUIRED: User's 6-month goal(s): "${sixMonthGoals.join("; ")}". Your insights MUST connect advice to this near-term goal when relevant.`);
      }

      personalizedSystemPrompt += `\n\n${contextBlock}`;
      personalizedSystemPrompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      personalizedSystemPrompt += `\n🎯 PERSONALIZATION REQUIREMENTS (YOU MUST FOLLOW THESE):\n`;
      personalizedSystemPrompt += requirements.join("\n");
      personalizedSystemPrompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      personalizedSystemPrompt += `\n\n⚡ IMPORTANT: The requirements above are MANDATORY, not optional. If user has vision/levers/goals defined, you MUST reference them explicitly in your response.`;
    }
  }

  const prompt = `Based on this journal entry and analysis, generate thoughtful insights.

Entry:
"""
${text}
"""

Analysis Context:
- Type: ${context.intent.type}
- Title: ${context.intent.name}
- Snapshot: ${context.intent.snapshot}
- Psychological Mode: ${context.emotion.inferredMode}
- Energy Level: ${context.emotion.inferredEnergy}
- Energy Shape: ${context.emotion.energyShape}
- Sentiment: ${context.emotion.sentimentAI}
- Themes: ${context.themes.themeTagsAI.join(", ")}
- Internal Tension: ${context.themes.contradiction || "None identified"}
- Thought Patterns: ${context.themes.loops || "None identified"}

Respond with JSON:
{
  "summaryAI": "<brief summary with emotional context>",
  "actionableInsightsAI": "<specific practical recommendations>",
  "nextAction": "<one concrete next step>"
}`

  // Use a more capable model for insights
  const response = await callOpenRouter<InsightAgentOutput>(
    prompt,
    MODELS.BALANCED,
    personalizedSystemPrompt
  )

  return {
    summaryAI: response.data.summaryAI || context.intent.snapshot,
    actionableInsightsAI:
      response.data.actionableInsightsAI || "Reflect on this entry and notice any patterns.",
    nextAction: response.data.nextAction || "Take a moment to pause and breathe.",
  }
}

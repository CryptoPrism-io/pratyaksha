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
      // Add response calibration rules
      const calibrationRules: string[] = [];
      if (userContext.profile.stressLevel && userContext.profile.stressLevel >= 4) {
        calibrationRules.push("- User reports high stress. Lead with validation, suggest gentle/manageable steps.");
      } else if (userContext.profile.stressLevel && userContext.profile.stressLevel <= 2) {
        calibrationRules.push("- User reports low stress. You can be more direct and challenge-oriented.");
      }
      if (userContext.profile.emotionalOpenness && userContext.profile.emotionalOpenness >= 4) {
        calibrationRules.push("- User is emotionally open. Explore deeper feelings and patterns in your summary.");
      } else if (userContext.profile.emotionalOpenness && userContext.profile.emotionalOpenness <= 2) {
        calibrationRules.push("- User prefers emotional privacy. Keep insights practical and action-focused.");
      }
      if (userContext.profile.personalGoal) {
        calibrationRules.push(`- Connect next-action to user's goal: "${userContext.profile.personalGoal}".`);
      }

      personalizedSystemPrompt += `\n\n${contextBlock}`;
      if (calibrationRules.length > 0) {
        personalizedSystemPrompt += `\n\nResponse Calibration:\n${calibrationRules.join("\n")}`;
      }
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

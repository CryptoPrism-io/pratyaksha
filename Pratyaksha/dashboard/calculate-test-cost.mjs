// Calculate token usage and cost for profile personalization test
// Test: 8 users × 4 agents × 1 query each = 32 LLM calls

const MODELS = {
  CHEAP: {
    name: "gpt-4o-mini",
    inputCost: 0.15,  // per 1M tokens
    outputCost: 0.60, // per 1M tokens
  },
  BALANCED: {
    name: "gpt-4o-mini", // Using mini for balanced too
    inputCost: 0.15,
    outputCost: 0.60,
  },
  QUALITY: {
    name: "gpt-4o",
    inputCost: 2.50,  // per 1M tokens
    outputCost: 10.00, // per 1M tokens
  },
};

// Agent model assignments (from codebase)
const AGENT_MODELS = {
  intentAgent: "CHEAP",      // gpt-4o-mini
  emotionAgent: "CHEAP",     // gpt-4o-mini
  themeAgent: "CHEAP",       // gpt-4o-mini
  insightAgent: "BALANCED",  // gpt-4o-mini
};

// Estimated token counts per agent (based on typical usage)
const TOKEN_ESTIMATES = {
  intentAgent: {
    systemPrompt: 150,
    userMessage: 250,  // Test query + entry text
    response: 150,     // Name, type, snapshot
  },
  emotionAgent: {
    systemPrompt: 200,
    userMessage: 300,  // Entry + type + user context
    response: 100,     // Mode, energy, shape, sentiment
  },
  themeAgent: {
    systemPrompt: 180,
    userMessage: 350,  // Entry + type + mode + vision context
    response: 120,     // Themes, contradiction, loops
  },
  insightAgent: {
    systemPrompt: 400,  // NOW MUCH LONGER with requirements
    userMessage: 500,   // Entry + full analysis + user context block
    response: 300,      // Summary, insights, next action (longest response)
  },
};

// Calculate cost for one agent call
function calculateAgentCost(agentName, modelKey) {
  const model = MODELS[modelKey];
  const tokens = TOKEN_ESTIMATES[agentName];

  const inputTokens = tokens.systemPrompt + tokens.userMessage;
  const outputTokens = tokens.response;

  const inputCost = (inputTokens / 1_000_000) * model.inputCost;
  const outputCost = (outputTokens / 1_000_000) * model.outputCost;

  return {
    agent: agentName,
    model: model.name,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

// Calculate test totals
function calculateTestCost() {
  const NUM_USERS = 8;
  const agentCosts = [];

  for (const [agentName, modelKey] of Object.entries(AGENT_MODELS)) {
    const cost = calculateAgentCost(agentName, modelKey);
    cost.callsPerUser = 1;
    cost.totalCalls = NUM_USERS;
    agentCosts.push(cost);
  }

  // Calculate totals
  const totals = agentCosts.reduce(
    (acc, agent) => ({
      totalInputTokens: acc.totalInputTokens + agent.inputTokens * agent.totalCalls,
      totalOutputTokens: acc.totalOutputTokens + agent.outputTokens * agent.totalCalls,
      totalCost: acc.totalCost + agent.totalCost * agent.totalCalls,
    }),
    { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 }
  );

  totals.totalTokens = totals.totalInputTokens + totals.totalOutputTokens;

  return { agentCosts, totals, numUsers: NUM_USERS };
}

// Format currency
function fmt(n) {
  return "$" + n.toFixed(4);
}

// Display results
function displayResults() {
  const results = calculateTestCost();

  console.log("\n╔═══════════════════════════════════════════════════════════════════════╗");
  console.log("║  PROFILE PERSONALIZATION TEST - TOKEN USAGE & COST ANALYSIS           ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

  console.log(`Test Configuration:`);
  console.log(`  • Users tested: ${results.numUsers}`);
  console.log(`  • Agents per user: 4 (intent, emotion, theme, insight)`);
  console.log(`  • Total LLM calls: ${results.numUsers * 4}`);
  console.log(`  • Test query: 67 words (identical for all users)\n`);

  console.log("┌─ COST BREAKDOWN BY AGENT ──────────────────────────────────────────┐\n");

  console.log("┌──────────────┬──────────────┬────────┬────────┬──────────┬──────────┐");
  console.log("│ Agent        │ Model        │ Input  │ Output │ Total    │ Cost ($) │");
  console.log("├──────────────┼──────────────┼────────┼────────┼──────────┼──────────┤");

  for (const agent of results.agentCosts) {
    const totalTokens = agent.inputTokens * agent.totalCalls + agent.outputTokens * agent.totalCalls;
    const cost = agent.totalCost * agent.totalCalls;

    console.log(
      `│ ${agent.agent.padEnd(12)} │ ${agent.model.padEnd(12)} │ ${String(agent.inputTokens * agent.totalCalls).padStart(6)} │ ${String(agent.outputTokens * agent.totalCalls).padStart(6)} │ ${String(totalTokens).padStart(8)} │ ${fmt(cost).padStart(8)} │`
    );
  }

  console.log("└──────────────┴──────────────┴────────┴────────┴──────────┴──────────┘\n");

  console.log("┌─ TOTAL TEST COST ──────────────────────────────────────────────────┐\n");
  console.log(`  Total Input Tokens:  ${results.totals.totalInputTokens.toLocaleString()} tokens`);
  console.log(`  Total Output Tokens: ${results.totals.totalOutputTokens.toLocaleString()} tokens`);
  console.log(`  Total Tokens:        ${results.totals.totalTokens.toLocaleString()} tokens`);
  console.log(`  \n  💰 Total Test Cost:   ${fmt(results.totals.totalCost)}`);
  console.log("\n└────────────────────────────────────────────────────────────────────┘\n");

  console.log("┌─ COST PER USER ────────────────────────────────────────────────────┐\n");
  const costPerUser = results.totals.totalCost / results.numUsers;
  const tokensPerUser = results.totals.totalTokens / results.numUsers;
  console.log(`  Cost per user (4 agents): ${fmt(costPerUser)}`);
  console.log(`  Tokens per user:          ${tokensPerUser.toFixed(0)} tokens`);
  console.log("\n└────────────────────────────────────────────────────────────────────┘\n");

  console.log("┌─ MODEL PRICING (per 1M tokens) ────────────────────────────────────┐\n");
  console.log("  gpt-4o-mini:  $0.15 input / $0.60 output");
  console.log("  gpt-4o:       $2.50 input / $10.00 output");
  console.log("\n└────────────────────────────────────────────────────────────────────┘\n");

  console.log("┌─ PROMPT IMPROVEMENTS IMPACT ───────────────────────────────────────┐\n");
  console.log("  insightAgent system prompt:");
  console.log("    • Before: ~200 tokens");
  console.log("    • After:  ~400 tokens (+100% increase)");
  console.log("  ");
  console.log("  Additional cost per user:");
  const additionalTokens = 200 * results.numUsers; // 200 extra tokens per user
  const additionalCost = (additionalTokens / 1_000_000) * MODELS.BALANCED.inputCost;
  console.log(`    • Extra tokens: ${additionalTokens} (input)`);
  console.log(`    • Extra cost:   ${fmt(additionalCost)}`);
  console.log(`  `);
  console.log(`  New test cost (with improvements): ${fmt(results.totals.totalCost + additionalCost)}`);
  console.log("\n└────────────────────────────────────────────────────────────────────┘\n");

  console.log("✅ Analysis Complete\n");

  return results;
}

// Run
displayResults();

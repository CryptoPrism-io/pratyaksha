// Profile Response Quality Test
// Tests how AI responses vary based on user profile completion:
// 1. Complete profile (Soul Mapping + Life Blueprint + Onboarding)
// 2. Partial Soul Mapping only
// 3. Partial Life Blueprint only
// 4. Onboarding only (minimal)
// 5. No profile (anonymous)

import http from "http"

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const req = http.request(
      {
        hostname: "localhost",
        port: 3001,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = ""
        res.on("data", (c) => (body += c))
        res.on("end", () => {
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            reject(new Error(`Parse error: ${body.slice(0, 200)}`))
          }
        })
      }
    )
    req.on("error", reject)
    req.write(data)
    req.end()
  })
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: "localhost", port: 3001, path }, (res) => {
      let body = ""
      res.on("data", (c) => (body += c))
      res.on("end", () => {
        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(new Error(`Parse error: ${body.slice(0, 200)}`))
        }
      })
    }).on("error", reject)
  })
}

// ════════════════════════════════════════════════════════════════════════════
// TEST USER PROFILES
// ════════════════════════════════════════════════════════════════════════════

const TEST_USERS = {
  complete: {
    firebaseUid: "test-complete-profile",
    displayName: "Sarah Martinez",
    email: "sarah@pratyaksha.dev",
    personalization: {
      ageRange: "28-35",
      profession: "Product Manager at Tech Startup",
      stressLevel: 4,
      emotionalOpenness: 5,
      personalGoal: "Build a product that impacts 1M users while maintaining work-life balance",
      selectedMemoryTopics: ["career-transitions", "imposter-syndrome", "leadership-challenges"],
    },
    gamification: {
      completedSoulMappingTopics: [
        "childhood-beliefs",
        "relationship-patterns",
        "fear-analysis",
        "values-clarification",
        "identity-exploration",
      ],
      karma: 450,
      streakDays: 12,
      totalEntriesLogged: 45,
    },
    lifeBlueprint: {
      vision: [
        { id: "v1", text: "Leading a team that ships products users love", category: "career", createdAt: new Date().toISOString() },
        { id: "v2", text: "Having deep, meaningful relationships with family and close friends", category: "relationships", createdAt: new Date().toISOString() },
        { id: "v3", text: "Feeling confident in my decisions without constant self-doubt", category: "personal-growth", createdAt: new Date().toISOString() },
      ],
      antiVision: [
        { id: "av1", text: "Burning out from overwork and losing my creativity", category: "career", createdAt: new Date().toISOString() },
        { id: "av2", text: "Becoming cynical and jaded about work", category: "personal-growth", createdAt: new Date().toISOString() },
        { id: "av3", text: "Neglecting relationships for career advancement", category: "relationships", createdAt: new Date().toISOString() },
      ],
      levers: [
        { id: "l1", name: "Setting boundaries", description: "Learning to say no to non-essential commitments", pushesToward: "vision", createdAt: new Date().toISOString() },
        { id: "l2", name: "Weekly team 1-on-1s", description: "Investing in relationships builds trust and better products", pushesToward: "vision", createdAt: new Date().toISOString() },
      ],
      timeHorizonGoals: [
        { id: "g1", horizon: "sixMonths", text: "Launch v2.0 of our product with 85%+ user satisfaction", category: "career", completed: false, createdAt: new Date().toISOString() },
        { id: "g2", horizon: "oneYear", text: "Establish a sustainable work schedule (45hr weeks max)", category: "lifestyle", completed: false, createdAt: new Date().toISOString() },
        { id: "g3", horizon: "threeYears", text: "Become a VP of Product with a team of 10+", category: "career", completed: false, createdAt: new Date().toISOString() },
      ],
      responses: [
        { questionId: "biggest-fear", answer: "That I'll get promoted to a level where I'm incompetent and everyone will realize I don't belong", answeredAt: new Date().toISOString() },
        { questionId: "proud-moment", answer: "When my team shipped our first major feature and users loved it. I felt like I could actually do this.", answeredAt: new Date().toISOString() },
      ],
      completedSections: ["vision-crafting", "anti-vision", "levers", "time-horizons", "deep-reflection"],
    },
  },

  partialSoulMapping: {
    firebaseUid: "test-partial-soul",
    displayName: "Alex Chen",
    email: "alex@pratyaksha.dev",
    personalization: {
      ageRange: "22-27",
      profession: "Software Engineer",
      stressLevel: 3,
      emotionalOpenness: 3,
      personalGoal: "Get better at managing stress and anxiety",
    },
    gamification: {
      completedSoulMappingTopics: ["childhood-beliefs", "fear-analysis"], // Only 2 topics
      karma: 120,
      streakDays: 5,
      totalEntriesLogged: 15,
    },
    lifeBlueprint: {
      vision: [],
      antiVision: [],
      levers: [],
      timeHorizonGoals: [],
      responses: [],
      completedSections: [],
    },
  },

  partialBlueprint: {
    firebaseUid: "test-partial-blueprint",
    displayName: "Jordan Lee",
    email: "jordan@pratyaksha.dev",
    personalization: {
      ageRange: "35-44",
      profession: "Marketing Director",
      stressLevel: 5,
      emotionalOpenness: 4,
      personalGoal: "Find clarity on next career move",
    },
    gamification: {
      completedSoulMappingTopics: [], // No soul mapping
      karma: 80,
      streakDays: 3,
      totalEntriesLogged: 8,
    },
    lifeBlueprint: {
      vision: [
        { id: "v1", text: "Running my own consulting business", category: "career", createdAt: new Date().toISOString() },
        { id: "v2", text: "Spending more time with my kids", category: "relationships", createdAt: new Date().toISOString() },
      ],
      antiVision: [
        { id: "av1", text: "Staying in a corporate job that drains me", category: "career", createdAt: new Date().toISOString() },
      ],
      levers: [],
      timeHorizonGoals: [],
      responses: [],
      completedSections: ["vision-crafting", "anti-vision"], // Partial completion
    },
  },

  onboardingOnly: {
    firebaseUid: "test-onboarding-only",
    displayName: "Taylor Kim",
    email: "taylor@pratyaksha.dev",
    personalization: {
      ageRange: "18-24",
      profession: "Graduate Student",
      stressLevel: 4,
      emotionalOpenness: 2,
      personalGoal: "Figure out what I want to do after graduation",
    },
    gamification: {
      completedSoulMappingTopics: [],
      karma: 0,
      streakDays: 1,
      totalEntriesLogged: 1,
    },
    lifeBlueprint: {
      vision: [],
      antiVision: [],
      levers: [],
      timeHorizonGoals: [],
      responses: [],
      completedSections: [],
    },
  },

  mayaPatel: {
    firebaseUid: "test-maya-partial-both",
    displayName: "Maya Patel",
    email: "maya@pratyaksha.dev",
    personalization: {
      ageRange: "28-35",
      profession: "UX Designer",
      stressLevel: 2,
      emotionalOpenness: 4,
      personalGoal: "Find creative fulfillment in my work",
    },
    gamification: {
      completedSoulMappingTopics: ["values-clarification", "identity-exploration", "fear-analysis"],
      karma: 180,
      streakDays: 7,
      totalEntriesLogged: 22,
    },
    lifeBlueprint: {
      vision: [
        { id: "v1", text: "Creating design work that genuinely delights users", category: "career", createdAt: new Date().toISOString() },
      ],
      antiVision: [],
      levers: [],
      timeHorizonGoals: [
        { id: "g1", horizon: "sixMonths", text: "Ship portfolio redesign showcasing my best work", category: "career", completed: false, createdAt: new Date().toISOString() },
        { id: "g2", horizon: "oneYear", text: "Speaking at a design conference about user empathy", category: "personal-growth", completed: false, createdAt: new Date().toISOString() },
      ],
      responses: [],
      completedSections: ["vision-crafting"],
    },
  },

  chrisAnderson: {
    firebaseUid: "test-chris-soul-only",
    displayName: "Chris Anderson",
    email: "chris@pratyaksha.dev",
    personalization: {
      ageRange: "35-44",
      profession: "Senior Accountant",
      stressLevel: 5,
      emotionalOpenness: 2,
      personalGoal: "Achieve financial security for my family",
    },
    gamification: {
      completedSoulMappingTopics: [
        "childhood-beliefs",
        "relationship-patterns",
        "fear-analysis",
        "values-clarification",
        "identity-exploration",
      ],
      karma: 520,
      streakDays: 18,
      totalEntriesLogged: 52,
    },
    lifeBlueprint: {
      vision: [],
      antiVision: [],
      levers: [],
      timeHorizonGoals: [],
      responses: [
        { questionId: "biggest-fear", answer: "That I won't be able to provide for my family if something goes wrong financially", answeredAt: new Date().toISOString() },
      ],
      completedSections: [],
    },
  },

  rileyThompson: {
    firebaseUid: "test-riley-blueprint-only",
    displayName: "Riley Thompson",
    email: "riley@pratyaksha.dev",
    personalization: {
      ageRange: "28-35",
      profession: "High School Teacher",
      stressLevel: 3,
      emotionalOpenness: 5,
      personalGoal: "Make a lasting impact on my students' lives",
    },
    gamification: {
      completedSoulMappingTopics: [],
      karma: 140,
      streakDays: 6,
      totalEntriesLogged: 18,
    },
    lifeBlueprint: {
      vision: [
        { id: "v1", text: "Helping every student discover their unique potential", category: "career", createdAt: new Date().toISOString() },
        { id: "v2", text: "Building a classroom community where students feel safe to be themselves", category: "relationships", createdAt: new Date().toISOString() },
      ],
      antiVision: [
        { id: "av1", text: "Burning out from endless administrative work", category: "career", createdAt: new Date().toISOString() },
        { id: "av2", text: "Losing my passion for teaching and becoming cynical", category: "personal-growth", createdAt: new Date().toISOString() },
      ],
      levers: [
        { id: "l1", name: "One meaningful conversation", description: "Having at least one deep conversation with a student each day", pushesToward: "vision", createdAt: new Date().toISOString() },
        { id: "l2", name: "Saying no to committees", description: "Protecting my time by declining non-essential committee work", pushesToward: "vision", createdAt: new Date().toISOString() },
      ],
      timeHorizonGoals: [
        { id: "g1", horizon: "sixMonths", text: "Implement project-based learning in my classroom", category: "career", completed: false, createdAt: new Date().toISOString() },
        { id: "g2", horizon: "oneYear", text: "Start mentoring program for new teachers", category: "contribution", completed: false, createdAt: new Date().toISOString() },
      ],
      responses: [],
      completedSections: ["vision-crafting", "anti-vision", "levers", "time-horizons"],
    },
  },

  anonymous: {
    firebaseUid: "test-anonymous",
    displayName: "Anonymous User",
    email: "anon@pratyaksha.dev",
    personalization: {
      // Minimal data
    },
    gamification: {
      completedSoulMappingTopics: [],
      karma: 0,
      streakDays: 0,
      totalEntriesLogged: 0,
    },
    lifeBlueprint: {
      vision: [],
      antiVision: [],
      levers: [],
      timeHorizonGoals: [],
      responses: [],
      completedSections: [],
    },
  },
}

// ════════════════════════════════════════════════════════════════════════════
// TEST SCENARIOS - Same query, different users
// ════════════════════════════════════════════════════════════════════════════

const TEST_QUERY = "I'm feeling very stressed about work lately. There's this big project deadline coming up and I'm worried I won't be able to deliver. I feel like I'm constantly anxious and can't focus. How do I cope with this situation?"

// ════════════════════════════════════════════════════════════════════════════
// SETUP USERS
// ════════════════════════════════════════════════════════════════════════════

async function setupAllUsers() {
  console.log("═".repeat(80))
  console.log("  SETTING UP TEST USERS")
  console.log("═".repeat(80))
  console.log()

  for (const [key, userData] of Object.entries(TEST_USERS)) {
    try {
      const result = await post("/api/test-users/setup", userData)
      if (result.success) {
        console.log(`✓ ${key.padEnd(20)} - ${userData.displayName}`)
      } else {
        console.log(`✗ ${key.padEnd(20)} - ERROR: ${result.error}`)
      }
    } catch (error) {
      console.log(`✗ ${key.padEnd(20)} - FAILED: ${error.message}`)
    }
  }
  console.log()
}

// ════════════════════════════════════════════════════════════════════════════
// RUN TESTS
// ════════════════════════════════════════════════════════════════════════════

async function testPersonalizedResponses() {
  console.log("═".repeat(80))
  console.log("  TESTING PERSONALIZED AI RESPONSES")
  console.log("═".repeat(80))
  console.log()
  console.log("Query (identical for all users):")
  console.log(`"${TEST_QUERY}"`)
  console.log()
  console.log("─".repeat(80))
  console.log()

  const results = []

  for (const [key, userData] of Object.entries(TEST_USERS)) {
    console.log(`\n${"═".repeat(80)}`)
    console.log(`  USER: ${userData.displayName.toUpperCase()} (${key})`)
    console.log(`${"═".repeat(80)}`)
    console.log()

    // Profile summary
    console.log("Profile Completeness:")
    console.log(`  • Onboarding: ${userData.personalization.profession ? "✓" : "✗"}`)
    console.log(`  • Soul Mapping: ${userData.gamification.completedSoulMappingTopics.length} topics completed`)
    console.log(`  • Life Blueprint: ${userData.lifeBlueprint.completedSections.length} sections completed`)
    console.log(`  • Vision items: ${userData.lifeBlueprint.vision.length}`)
    console.log(`  • Anti-vision items: ${userData.lifeBlueprint.antiVision.length}`)
    console.log(`  • Goals: ${userData.lifeBlueprint.timeHorizonGoals.length}`)
    console.log()

    try {
      const startTime = Date.now()
      const response = await post("/api/process-entry", {
        userId: userData.firebaseUid,
        text: TEST_QUERY,
      })
      const duration = Date.now() - startTime

      if (response.success) {
        const fields = response.entry.fields
        const processing = response.processing

        results.push({
          user: key,
          displayName: userData.displayName,
          profileCompleteness: {
            soulMapping: userData.gamification.completedSoulMappingTopics.length,
            blueprint: userData.lifeBlueprint.completedSections.length,
            vision: userData.lifeBlueprint.vision.length,
            goals: userData.lifeBlueprint.timeHorizonGoals.length,
          },
          response: {
            name: fields.Name,
            type: fields.Type,
            mode: fields["Inferred Mode"],
            energy: fields["Inferred Energy"],
            energyShape: fields["Energy Shape"],
            sentiment: fields["Entry Sentiment (AI)"],
            contradiction: fields.Contradiction,
            themes: fields["Entry Theme Tags (AI)"],
            snapshot: fields.Snapshot,
            summary: fields["Summary (AI)"],
            insights: fields["Actionable Insights (AI)"],
            nextAction: fields["Next Action"],
          },
          duration,
        })

        console.log("AI Response:")
        console.log("─".repeat(80))
        console.log()
        console.log(`Entry Name: ${fields.Name}`)
        console.log(`Type: ${fields.Type} | Mode: ${fields["Inferred Mode"]} | Energy: ${fields["Inferred Energy"]}`)
        console.log(`Sentiment: ${fields["Entry Sentiment (AI)"]} | Energy Shape: ${fields["Energy Shape"]}`)
        console.log()
        console.log("SNAPSHOT:")
        console.log(wrapText(fields.Snapshot || "—", 76))
        console.log()
        console.log("SUMMARY:")
        console.log(wrapText(fields["Summary (AI)"] || "—", 76))
        console.log()
        console.log("ACTIONABLE INSIGHTS:")
        console.log(wrapText(fields["Actionable Insights (AI)"] || "—", 76))
        console.log()
        console.log("NEXT ACTION:")
        console.log(wrapText(fields["Next Action"] || "—", 76))
        console.log()
        console.log("THEMES:", fields["Entry Theme Tags (AI)"] || "—")
        console.log("CONTRADICTION:", fields.Contradiction || "None")
        console.log()
        console.log(`⏱  Processing time: ${(duration / 1000).toFixed(1)}s`)
      } else {
        console.log(`✗ ERROR: ${response.error}`)
      }
    } catch (error) {
      console.log(`✗ FAILED: ${error.message}`)
    }
  }

  return results
}

// ════════════════════════════════════════════════════════════════════════════
// COMPARATIVE ANALYSIS
// ════════════════════════════════════════════════════════════════════════════

function analyzeResponses(results) {
  console.log("\n\n")
  console.log("═".repeat(80))
  console.log("  COMPARATIVE ANALYSIS")
  console.log("═".repeat(80))
  console.log()

  // 1. Next Action Comparison
  console.log("┌─ NEXT ACTIONS (MOST PERSONALIZED FIELD) ─────────────────────────────────┐")
  console.log()
  for (const result of results) {
    const label = `${result.displayName} (${result.user}):`
    console.log(label)
    console.log(wrapText(result.response.nextAction, 76, "  "))
    console.log()
  }
  console.log("└────────────────────────────────────────────────────────────────────────────┘")
  console.log()

  // 2. Insights Comparison
  console.log("┌─ ACTIONABLE INSIGHTS COMPARISON ──────────────────────────────────────────┐")
  console.log()
  for (const result of results) {
    const label = `${result.displayName}:`
    console.log(label)
    console.log(wrapText(result.response.insights, 76, "  "))
    console.log()
  }
  console.log("└────────────────────────────────────────────────────────────────────────────┘")
  console.log()

  // 3. Structural Field Comparison
  console.log("┌─ STRUCTURAL FIELDS COMPARISON ────────────────────────────────────────────┐")
  console.log()
  console.log("┌───────────────────┬────────┬─────────────┬──────────┬──────────────┬─────────────┐")
  console.log("│ User              │ Type   │ Mode        │ Energy   │ Energy Shape │ Sentiment   │")
  console.log("├───────────────────┼────────┼─────────────┼──────────┼──────────────┼─────────────┤")
  for (const result of results) {
    const name = result.displayName.slice(0, 17).padEnd(17)
    const type = (result.response.type || "").slice(0, 6).padEnd(6)
    const mode = (result.response.mode || "").slice(0, 11).padEnd(11)
    const energy = (result.response.energy || "").slice(0, 8).padEnd(8)
    const shape = (result.response.energyShape || "").slice(0, 12).padEnd(12)
    const sentiment = (result.response.sentiment || "").slice(0, 11).padEnd(11)
    console.log(`│ ${name} │ ${type} │ ${mode} │ ${energy} │ ${shape} │ ${sentiment} │`)
  }
  console.log("└───────────────────┴────────┴─────────────┴──────────┴──────────────────┴─────────────┘")
  console.log()
  console.log("└────────────────────────────────────────────────────────────────────────────┘")
  console.log()

  // 4. Profile Completeness vs Response Quality
  console.log("┌─ PROFILE COMPLETENESS vs RESPONSE SPECIFICITY ────────────────────────────┐")
  console.log()
  console.log("Profile completeness score = Soul Mapping topics + Blueprint sections + Vision + Goals")
  console.log()
  for (const result of results) {
    const score =
      result.profileCompleteness.soulMapping * 2 + // Weight soul mapping higher
      result.profileCompleteness.blueprint * 3 +
      result.profileCompleteness.vision +
      result.profileCompleteness.goals

    const hasVisionReference = result.response.insights.toLowerCase().includes("vision") ||
                                result.response.insights.toLowerCase().includes("goal") ||
                                result.response.nextAction.toLowerCase().includes("goal")

    const hasProfessionReference = result.response.insights.toLowerCase().includes(
      TEST_USERS[result.user].personalization.profession?.toLowerCase() || "___never_match___"
    ) || result.response.nextAction.toLowerCase().includes(
      TEST_USERS[result.user].personalization.profession?.toLowerCase() || "___never_match___"
    )

    const specificity = [
      hasVisionReference ? "Vision-aligned" : null,
      hasProfessionReference ? "Profession-specific" : null,
    ].filter(Boolean).join(", ") || "Generic"

    console.log(`${result.displayName.padEnd(20)} | Score: ${String(score).padStart(3)} | ${specificity}`)
  }
  console.log()
  console.log("└────────────────────────────────────────────────────────────────────────────┘")
  console.log()

  // 5. Personalization Quality Scores
  console.log("┌─ PERSONALIZATION QUALITY ASSESSMENT ──────────────────────────────────────┐")
  console.log()
  console.log("Criteria:")
  console.log("  • References user's vision/anti-vision: +10 points")
  console.log("  • References user's profession: +10 points")
  console.log("  • References user's specific goals: +10 points")
  console.log("  • Tone matches emotional openness: +5 points")
  console.log("  • Advice calibrated to stress level: +5 points")
  console.log()
  console.log("┌───────────────────┬───────┬────────────────────────────────────────────────┐")
  console.log("│ User              │ Score │ Quality Assessment                             │")
  console.log("├───────────────────┼───────┼────────────────────────────────────────────────┤")

  for (const result of results) {
    const userData = TEST_USERS[result.user]
    let score = 0
    const reasons = []

    // Check vision/anti-vision reference
    const textToCheck = (result.response.insights + " " + result.response.nextAction).toLowerCase()

    if (userData.lifeBlueprint.vision.length > 0) {
      const hasVisionRef = userData.lifeBlueprint.vision.some(v =>
        textToCheck.includes(v.text.toLowerCase().slice(0, 20))
      )
      if (hasVisionRef) {
        score += 10
        reasons.push("Vision-aligned")
      }
    }

    // Check profession reference
    if (userData.personalization.profession) {
      const professionWords = userData.personalization.profession.toLowerCase().split(" ")
      const hasProfRef = professionWords.some(word =>
        word.length > 4 && textToCheck.includes(word)
      )
      if (hasProfRef) {
        score += 10
        reasons.push("Profession-specific")
      }
    }

    // Check goal reference
    if (userData.personalization.personalGoal) {
      const goalWords = userData.personalization.personalGoal.toLowerCase().split(" ")
      const hasGoalRef = goalWords.some(word =>
        word.length > 5 && textToCheck.includes(word)
      )
      if (hasGoalRef) {
        score += 10
        reasons.push("Goal-oriented")
      }
    }

    // Tone calibration (heuristic)
    const insightsText = result.response.insights
    if (userData.personalization.emotionalOpenness >= 4) {
      if (insightsText.includes("feel") || insightsText.includes("emotion")) {
        score += 5
        reasons.push("Emotionally attuned")
      }
    } else {
      if (insightsText.includes("action") || insightsText.includes("step")) {
        score += 5
        reasons.push("Action-focused")
      }
    }

    // Stress calibration
    if (userData.personalization.stressLevel >= 4) {
      if (insightsText.includes("gentle") || insightsText.includes("manag") || insightsText.includes("small")) {
        score += 5
        reasons.push("Stress-aware")
      }
    }

    const assessment = reasons.length > 0 ? reasons.join(", ") : "Generic response"
    const name = result.displayName.slice(0, 17).padEnd(17)
    const scoreStr = String(score).padStart(5)
    const assessStr = assessment.slice(0, 46).padEnd(46)

    console.log(`│ ${name} │ ${scoreStr} │ ${assessStr} │`)
  }
  console.log("└───────────────────┴───────┴────────────────────────────────────────────────┘")
  console.log()
  console.log("Legend:")
  console.log("  40+ = Highly personalized (references user's unique context)")
  console.log("  20-39 = Moderately personalized (some contextual awareness)")
  console.log("  0-19 = Generic (could apply to anyone)")
  console.log()
  console.log("└────────────────────────────────────────────────────────────────────────────┘")
  console.log()
}

// ════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

function wrapText(text, width, indent = "") {
  if (!text) return "—"

  const words = text.split(" ")
  const lines = []
  let currentLine = indent

  for (const word of words) {
    if ((currentLine + word).length > width) {
      lines.push(currentLine)
      currentLine = indent + word + " "
    } else {
      currentLine += word + " "
    }
  }
  if (currentLine.trim()) lines.push(currentLine)

  return lines.join("\n")
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  console.clear()
  console.log()
  console.log("╔" + "═".repeat(78) + "╗")
  console.log("║" + " ".repeat(78) + "║")
  console.log("║" + "  PRATYAKSHA PROFILE RESPONSE QUALITY TEST".padEnd(78) + "║")
  console.log("║" + "  Testing AI personalization across different profile completeness levels".padEnd(78) + "║")
  console.log("║" + " ".repeat(78) + "║")
  console.log("╚" + "═".repeat(78) + "╝")
  console.log()
  console.log()

  try {
    await setupAllUsers()
    const results = await testPersonalizedResponses()
    analyzeResponses(results)

    console.log()
    console.log("═".repeat(80))
    console.log("  TEST COMPLETE")
    console.log("═".repeat(80))
    console.log()
    console.log("✓ All users tested with identical query")
    console.log("✓ Comparative analysis generated")
    console.log()
    console.log("Review the outputs above to evaluate personalization quality.")
    console.log()
  } catch (error) {
    console.error("\n✗ Test failed:", error.message)
    console.error(error.stack)
  }
}

main().catch(console.error)

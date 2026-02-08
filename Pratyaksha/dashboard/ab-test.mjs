// A/B Test Script: Compare AI responses for Alice vs Bob with identical journal entries
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

// ──── Test User Setup ────
async function setupUsers() {
  console.log("=== SETTING UP TEST USERS ===\n")

  const alice = await post("/api/test-users/setup", {
    firebaseUid: "test-alice",
    displayName: "Alice Chen",
    email: "test-alice@pratyaksha.dev",
    personalization: {
      ageRange: "25-34",
      profession: "Startup Founder",
      stressLevel: 5,  // High stress (max = 5)
      emotionalOpenness: 4,  // Moderately open
      personalGoal: "Scale SaaS to $1M ARR",
    },
  })
  console.log("Alice created:", alice.success ? "OK" : alice.error)

  const bob = await post("/api/test-users/setup", {
    firebaseUid: "test-bob",
    displayName: "Dr. Bob Williams",
    email: "test-bob@pratyaksha.dev",
    personalization: {
      ageRange: "35-44",
      profession: "Clinical Psychologist",
      stressLevel: 2,  // Low stress
      emotionalOpenness: 5,  // Very open (max = 5)
      personalGoal: "Help 1000 people overcome anxiety",
    },
  })
  console.log("Bob created:", bob.success ? "OK" : bob.error)
  console.log()
}

// ──── Journal Entries (identical text, different users) ────
const ENTRIES = [
  {
    label: "ENTRY 1: Work stress / overwhelm",
    text: "I feel completely overwhelmed today. There are so many things on my plate and I don't know where to start. I had a difficult conversation with a colleague about a deadline we're going to miss. I couldn't sleep last night thinking about all the things that could go wrong. I feel like I'm failing at everything.",
  },
  {
    label: "ENTRY 2: Positive reflection / gratitude",
    text: "Had a really good morning today. Went for a walk and noticed the trees are starting to bloom. I felt grateful for the small things - my morning coffee, a kind text from a friend, the way sunlight came through the window. I want to hold on to this feeling. Life isn't perfect but these moments matter.",
  },
  {
    label: "ENTRY 3: Relationship conflict / uncertainty",
    text: "Got into an argument with someone close to me. They said I never listen, and maybe they're right. I keep replaying the conversation in my head. Part of me wants to apologize, part of me thinks I was justified. I don't know how to bridge this gap. It's been eating at me all day.",
  },
]

async function submitEntry(userId, text) {
  return post("/api/process-entry", { userId, text })
}

// ──── Run A/B test ────
async function runTest() {
  await setupUsers()

  const results = []

  for (const entry of ENTRIES) {
    console.log(`\n${"=".repeat(70)}`)
    console.log(`  ${entry.label}`)
    console.log(`${"=".repeat(70)}`)
    console.log(`Input: "${entry.text.slice(0, 80)}..."\n`)

    // Submit for Alice
    console.log("  Submitting for ALICE (Startup Founder, stress 5/5 HIGH, openness 4/5)...")
    const aliceStart = Date.now()
    const aliceResult = await submitEntry("test-alice", entry.text)
    const aliceTime = Date.now() - aliceStart

    // Submit for Bob
    console.log("  Submitting for BOB (Clinical Psychologist, stress 2/5 LOW, openness 5/5)...")
    const bobStart = Date.now()
    const bobResult = await submitEntry("test-bob", entry.text)
    const bobTime = Date.now() - bobStart

    const aliceFields = aliceResult.entry?.fields || {}
    const bobFields = bobResult.entry?.fields || {}

    const comparison = {
      entry: entry.label,
      alice: {
        success: aliceResult.success,
        time: `${(aliceTime / 1000).toFixed(1)}s`,
        type: aliceFields.Type,
        name: aliceFields.Name,
        mode: aliceFields["Inferred Mode"],
        energy: aliceFields["Inferred Energy"],
        energyShape: aliceFields["Energy Shape"],
        sentiment: aliceFields["Entry Sentiment (AI)"],
        contradiction: aliceFields.Contradiction,
        themes: aliceFields["Entry Theme Tags (AI)"],
        snapshot: aliceFields.Snapshot,
        summary: aliceFields["Summary (AI)"],
        nextAction: aliceFields["Next Action"],
        insights: aliceFields["Actionable Insights (AI)"],
      },
      bob: {
        success: bobResult.success,
        time: `${(bobTime / 1000).toFixed(1)}s`,
        type: bobFields.Type,
        name: bobFields.Name,
        mode: bobFields["Inferred Mode"],
        energy: bobFields["Inferred Energy"],
        energyShape: bobFields["Energy Shape"],
        sentiment: bobFields["Entry Sentiment (AI)"],
        contradiction: bobFields.Contradiction,
        themes: bobFields["Entry Theme Tags (AI)"],
        snapshot: bobFields.Snapshot,
        summary: bobFields["Summary (AI)"],
        nextAction: bobFields["Next Action"],
        insights: bobFields["Actionable Insights (AI)"],
      },
    }

    results.push(comparison)

    // Print side-by-side
    console.log("\n  ┌─────────────────────┬──────────────────────────────┬──────────────────────────────┐")
    console.log("  │ Field               │ ALICE (Founder)              │ BOB (Psychologist)           │")
    console.log("  ├─────────────────────┼──────────────────────────────┼──────────────────────────────┤")

    const fields = [
      ["Type", comparison.alice.type, comparison.bob.type],
      ["Name", comparison.alice.name, comparison.bob.name],
      ["Mode", comparison.alice.mode, comparison.bob.mode],
      ["Energy", comparison.alice.energy, comparison.bob.energy],
      ["Energy Shape", comparison.alice.energyShape, comparison.bob.energyShape],
      ["Sentiment", comparison.alice.sentiment, comparison.bob.sentiment],
      ["Contradiction", comparison.alice.contradiction, comparison.bob.contradiction],
      ["Themes", comparison.alice.themes, comparison.bob.themes],
    ]

    for (const [name, a, b] of fields) {
      const aStr = (a || "—").slice(0, 28).padEnd(28)
      const bStr = (b || "—").slice(0, 28).padEnd(28)
      const match = a === b ? "  " : "!="
      console.log(`  │ ${name.padEnd(19)} │ ${aStr} │ ${bStr} │ ${match}`)
    }
    console.log("  └─────────────────────┴──────────────────────────────┴──────────────────────────────┘")

    // Print longer fields
    console.log("\n  SNAPSHOT:")
    console.log(`    Alice: ${(comparison.alice.snapshot || "—").slice(0, 120)}`)
    console.log(`    Bob:   ${(comparison.bob.snapshot || "—").slice(0, 120)}`)

    console.log("\n  SUMMARY:")
    console.log(`    Alice: ${(comparison.alice.summary || "—").slice(0, 150)}`)
    console.log(`    Bob:   ${(comparison.bob.summary || "—").slice(0, 150)}`)

    console.log("\n  NEXT ACTION:")
    console.log(`    Alice: ${(comparison.alice.nextAction || "—").slice(0, 120)}`)
    console.log(`    Bob:   ${(comparison.bob.nextAction || "—").slice(0, 120)}`)

    console.log(`\n  Time: Alice ${comparison.alice.time} | Bob ${comparison.bob.time}`)
  }

  // ──── Final Summary ────
  console.log(`\n\n${"=".repeat(70)}`)
  console.log("  A/B TEST SUMMARY — DIFFERENCES FOUND")
  console.log(`${"=".repeat(70)}\n`)

  let totalDiffs = 0
  let totalFields = 0

  for (const r of results) {
    const checkFields = ["type", "mode", "energy", "energyShape", "sentiment", "contradiction", "themes", "name"]
    let diffs = 0
    for (const f of checkFields) {
      totalFields++
      if (r.alice[f] !== r.bob[f]) {
        diffs++
        totalDiffs++
      }
    }
    console.log(`  ${r.entry}: ${diffs}/${checkFields.length} fields differ`)
  }

  console.log(`\n  TOTAL: ${totalDiffs}/${totalFields} field comparisons showed differences`)
  console.log(`  Differentiation rate: ${((totalDiffs / totalFields) * 100).toFixed(0)}%\n`)

  // Check user entry counts
  const users = await get("/api/test-users")
  if (users.success) {
    console.log("  Final user state:")
    for (const u of users.users) {
      console.log(`    ${u.displayName}: ${u.entryCount} entries, ${u.embeddingCount} embeddings`)
    }
  }
}

runTest().catch(console.error)

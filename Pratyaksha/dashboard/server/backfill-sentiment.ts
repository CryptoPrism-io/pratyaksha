// Backfill script to add missing sentiment to Airtable entries
import "dotenv/config"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appMzFpUZLuZs9VGc"
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID || "tblhKYssgHtjpmbni"
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`

interface AirtableRecord {
  id: string
  fields: {
    Name?: string
    Text?: string
    Type?: string
    "Entry Sentiment (AI)"?: string
    "Inferred Mode"?: string
  }
}

const SENTIMENTS = ["Positive", "Negative", "Neutral", "Mixed"] as const

async function analyzeSentiment(text: string, type: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set")
  }

  const systemPrompt = `You analyze the sentiment of journal entries.
Respond with ONLY a JSON object: {"sentiment": "Positive" | "Negative" | "Neutral" | "Mixed"}

Guidelines:
- Positive: Hopeful, happy, grateful, excited, calm, content
- Negative: Sad, angry, frustrated, anxious, stressed, overwhelmed
- Neutral: Factual, observational, neither positive nor negative
- Mixed: Contains both positive and negative elements`

  const prompt = `Analyze the sentiment of this ${type} journal entry:

"${text.slice(0, 500)}"

Respond with JSON only.`

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 50,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`)
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content

  try {
    const parsed = JSON.parse(content)
    let sentiment = parsed.sentiment?.replace(/"/g, "").trim() // Remove any extra quotes

    // Map Mixed to Neutral since Airtable might not have Mixed as an option
    if (sentiment === "Mixed") {
      sentiment = "Neutral"
    }

    if (["Positive", "Negative", "Neutral"].includes(sentiment)) {
      return sentiment
    }
    return "Neutral"
  } catch {
    return "Neutral"
  }
}

async function fetchEntriesWithoutSentiment(): Promise<AirtableRecord[]> {
  if (!AIRTABLE_API_KEY) {
    throw new Error("AIRTABLE_API_KEY is not set")
  }

  const allRecords: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const url = new URL(AIRTABLE_URL)
    url.searchParams.set("filterByFormula", '{Entry Sentiment (AI)} = ""')
    if (offset) url.searchParams.set("offset", offset)

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    })

    if (!response.ok) {
      throw new Error(`Airtable fetch error: ${response.status}`)
    }

    const data = await response.json()
    allRecords.push(...data.records)
    offset = data.offset
  } while (offset)

  return allRecords
}

async function updateAirtableRecord(recordId: string, sentiment: string): Promise<void> {
  if (!AIRTABLE_API_KEY) throw new Error("AIRTABLE_API_KEY is not set")

  const response = await fetch(`${AIRTABLE_URL}/${recordId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        "Entry Sentiment (AI)": sentiment,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Airtable update error: ${response.status} - ${error}`)
  }
}

async function main() {
  console.log("🔍 Fetching entries without sentiment...")

  const records = await fetchEntriesWithoutSentiment()
  console.log(`📊 Found ${records.length} entries without sentiment\n`)

  if (records.length === 0) {
    console.log("✅ All entries already have sentiment!")
    return
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const text = record.fields.Text || record.fields.Name || ""
    const type = record.fields.Type || "Reflection"
    const name = record.fields.Name || "Unnamed"

    if (!text) {
      console.log(`⏭️  [${i + 1}/${records.length}] Skipping "${name}" - no text`)
      continue
    }

    try {
      process.stdout.write(`🔄 [${i + 1}/${records.length}] Analyzing "${name.slice(0, 30)}..."`)

      const sentiment = await analyzeSentiment(text, type)
      await updateAirtableRecord(record.id, sentiment)

      console.log(` → ${sentiment}`)
      success++

      // Rate limiting - avoid hitting API limits
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.log(` → ❌ Failed: ${error}`)
      failed++
    }
  }

  console.log("\n" + "=".repeat(50))
  console.log(`✅ Backfill complete!`)
  console.log(`   Success: ${success}`)
  console.log(`   Failed: ${failed}`)
  console.log(`   Total: ${records.length}`)
}

main().catch(console.error)

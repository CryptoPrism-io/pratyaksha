/**
 * Image Generation Script
 * Generates AI images for onboarding and landing pages using Gemini API
 *
 * Usage: node scripts/generate-images.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env manually
const envPath = path.join(__dirname, '../.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envLines = envContent.split('\n')
for (const line of envLines) {
  const [key, ...valueParts] = line.split('=')
  if (key && !key.startsWith('#')) {
    process.env[key.trim()] = valueParts.join('=').trim()
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env')
  process.exit(1)
}

const OUTPUT_DIR = path.join(__dirname, '../public/images')

// Style block for consistent visual identity
const BECOMING_STYLE_BLOCK = `
MANDATORY STYLE REQUIREMENTS - Follow these exactly:

COLOR PALETTE:
- Primary: Deep teal (#0d9488, #14b8a6) - represents growth, action, forward movement
- Accent: Dusty rose (#be123c, #f43f5e) - represents reflection, awareness, inner work
- Highlight: Warm amber (#d97706, #f59e0b) - represents balance, integration, synthesis
- Background: Warm cream (#faf5f0) for light, deep charcoal (#0a0a0a) for dark

VISUAL THEME - "METAMORPHOSIS":
- Core concept: Transformation, emergence, inner becoming
- Central motif: Moths (NOT butterflies) - they represent night wisdom, subtle beauty, attraction to light
- Supporting motifs: Cocoons, unfurling leaves, dawn light, still water reflections, seeds sprouting

AESTHETIC PRINCIPLES:
- Zen minimalism meets organic growth
- Asymmetric balance with generous negative space
- Soft, diffused lighting - golden hour or pre-dawn quality
- Dreamlike, contemplative mood
- Abstract over literal - suggest rather than show

ABSOLUTELY AVOID:
- Harsh contrasts or neon colors
- Cluttered compositions
- Literal human faces or figures
- Photorealistic style
- Butterflies (use moths instead)
- Text or typography in images
`

// Onboarding prompts
const ONBOARDING_PROMPTS = {
  welcome: {
    subject: "A luna moth emerging from its cocoon at dawn, wings catching the first teal and rose light of day",
    mood: "Hope, new beginnings, emergence",
  },
  patterns: {
    subject: "Abstract flowing lines forming a gentle spiral pattern, representing thoughts becoming visible",
    mood: "Discovery, recognition, patterns emerging from chaos",
  },
  'ai-pipeline': {
    subject: "Four luminous orbs in blue, rose, amber, and emerald, connected by gossamer threads of light",
    mood: "Intelligence, collaboration, seamless flow",
  },
  'seed-entry': {
    subject: "A seed cracking open with a tiny green shoot emerging, backlit by warm amber light",
    mood: "Potential, first steps, nurturing beginning",
  },
  privacy: {
    subject: "A delicate glass dome protecting a glowing moth, surrounded by soft mist",
    mood: "Safety, protection, trust",
  },
  memories: {
    subject: "Glowing fragments floating like fireflies, some connecting to form constellation patterns",
    mood: "Connection, recognition, meaningful patterns",
  },
  'psych-context': {
    subject: "Concentric ripples in still water with a lotus bud at center, reflecting dawn sky",
    mood: "Depth, self-understanding, layers",
  },
  features: {
    subject: "An elegant dashboard interface dissolving into organic flowing lines and nature elements",
    mood: "Technology meeting nature, elegant simplicity",
  },
  commitment: {
    subject: "Ethereal hands cupping a softly glowing orb of teal light",
    mood: "Promise, dedication, nurturing commitment",
  },
  complete: {
    subject: "A moth in graceful flight leaving a trail of luminous particles, empty cocoon visible below",
    mood: "Freedom, transformation complete, journey beginning",
  },
}

// Landing prompts
const LANDING_PROMPTS = {
  hero: {
    subject: "Vast ethereal landscape at dawn with a single moth ascending toward a horizon of teal and rose light",
    mood: "Infinite possibility, transformation, journey",
  },
  'feature-journaling': {
    subject: "An open book with pages transforming into floating leaves and petals",
    mood: "Expression, release, organic growth",
  },
  'feature-ai': {
    subject: "Abstract neural network pattern that resembles tree branches or root systems",
    mood: "Intelligence, organic wisdom, connection",
  },
  'feature-insights': {
    subject: "A crystal or prism refracting light into a spectrum of teal, rose, and amber rays",
    mood: "Clarity, understanding, revelation",
  },
}

/**
 * Generate image using Gemini 2.0 Flash with image generation
 */
async function generateImage(prompt, aspectRatio = '1:1') {
  const fullPrompt = `Generate an image with these specifications:

${BECOMING_STYLE_BLOCK}

Subject: ${prompt.subject}
Mood: ${prompt.mood}
Aspect Ratio: ${aspectRatio}

Create a beautiful, high-quality image that captures this vision.`

  console.log(`  📝 Prompt: ${prompt.subject.substring(0, 50)}...`)

  try {
    // Using Gemini 2.0 Flash with native image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"]
          }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`  ❌ API Error: ${response.status}`)
      console.error(`  ${errorText.substring(0, 300)}`)
      return { error: `API error: ${response.status}` }
    }

    const result = await response.json()

    // Check for inline image data in the response
    const parts = result.candidates?.[0]?.content?.parts || []
    for (const part of parts) {
      if (part.inlineData?.data) {
        return { base64: part.inlineData.data }
      }
    }

    console.error(`  ❌ No image in response:`, JSON.stringify(result).substring(0, 300))
    return { error: 'No image in response' }
  } catch (error) {
    console.error(`  ❌ Error:`, error.message)
    return { error: error.message }
  }
}

/**
 * Save base64 image to file
 */
function saveImage(base64, filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const buffer = Buffer.from(base64, 'base64')
  fs.writeFileSync(filePath, buffer)
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 Becoming Image Generator')
  console.log('============================')
  console.log(`Using API Key: ${GEMINI_API_KEY?.substring(0, 15)}...`)
  console.log(`Output directory: ${OUTPUT_DIR}\n`)

  const args = process.argv.slice(2)
  const generateOnboarding = args.length === 0 || args.includes('--onboarding') || args.includes('--all')
  const generateLanding = args.includes('--landing') || args.includes('--all')

  let successful = 0
  let failed = 0

  if (generateOnboarding) {
    console.log('🦋 Generating Onboarding Images...\n')
    const outputDir = path.join(OUTPUT_DIR, 'onboarding')

    for (const [id, prompt] of Object.entries(ONBOARDING_PROMPTS)) {
      console.log(`\n📸 Generating: ${id}`)

      const result = await generateImage(prompt, '1:1')

      if (result.base64) {
        const filePath = path.join(outputDir, `${id}.png`)
        saveImage(result.base64, filePath)
        console.log(`  ✅ Saved: public/images/onboarding/${id}.png`)
        successful++
      } else {
        console.log(`  ❌ Failed: ${result.error}`)
        failed++
      }

      // Rate limiting - wait 3 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  if (generateLanding) {
    console.log('\n\n🌅 Generating Landing Page Images...\n')
    const outputDir = path.join(OUTPUT_DIR, 'landing')

    for (const [id, prompt] of Object.entries(LANDING_PROMPTS)) {
      console.log(`\n📸 Generating: ${id}`)

      const result = await generateImage(prompt, '16:9')

      if (result.base64) {
        const filePath = path.join(outputDir, `${id}.png`)
        saveImage(result.base64, filePath)
        console.log(`  ✅ Saved: public/images/landing/${id}.png`)
        successful++
      } else {
        console.log(`  ❌ Failed: ${result.error}`)
        failed++
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  // Summary
  console.log('\n\n📊 Summary')
  console.log('===========')
  console.log(`✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)
  console.log('\n🎉 Done!')
}

main().catch(console.error)

/**
 * Image Generation Script
 * Generates AI images for onboarding and landing pages using Gemini API
 *
 * Usage: npx ts-node scripts/generate-images.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env')
  process.exit(1)
}

// Import prompts
import {
  BECOMING_STYLE_BLOCK,
  ONBOARDING_PROMPTS,
  LANDING_PROMPTS,
  getCompletePrompt,
  ImagePrompt,
} from '../server/lib/imageGeneration'

const OUTPUT_DIR = path.join(__dirname, '../public/images')

interface GenerationResult {
  id: string
  success: boolean
  filePath?: string
  error?: string
}

/**
 * Generate image using Gemini Imagen API
 */
async function generateImage(prompt: ImagePrompt, category: string): Promise<{ base64?: string; error?: string }> {
  const fullPrompt = getCompletePrompt(prompt)

  console.log(`  📝 Prompt: ${prompt.subject.substring(0, 60)}...`)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt: fullPrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: category === 'landing' ? '16:9' : '1:1',
            safetyFilterLevel: 'block_only_high',
            personGeneration: 'dont_allow',
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`  ❌ API Error: ${response.status}`)
      return { error: `API error: ${response.status} - ${errorText}` }
    }

    const result = await response.json()

    if (result.predictions?.[0]?.bytesBase64Encoded) {
      return { base64: result.predictions[0].bytesBase64Encoded }
    }

    return { error: 'No image in response' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Save base64 image to file
 */
function saveImage(base64: string, filePath: string): void {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const buffer = Buffer.from(base64, 'base64')
  fs.writeFileSync(filePath, buffer)
}

/**
 * Generate all onboarding images
 */
async function generateOnboardingImages(): Promise<GenerationResult[]> {
  console.log('\n🦋 Generating Onboarding Images...\n')

  const results: GenerationResult[] = []
  const outputDir = path.join(OUTPUT_DIR, 'onboarding')

  for (const [id, prompt] of Object.entries(ONBOARDING_PROMPTS)) {
    console.log(`\n📸 Generating: ${id}`)

    const result = await generateImage(prompt, 'onboarding')

    if (result.base64) {
      const filePath = path.join(outputDir, `${id}.png`)
      saveImage(result.base64, filePath)
      console.log(`  ✅ Saved: ${filePath}`)
      results.push({ id, success: true, filePath })
    } else {
      console.log(`  ❌ Failed: ${result.error}`)
      results.push({ id, success: false, error: result.error })
    }

    // Rate limiting - wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return results
}

/**
 * Generate all landing page images
 */
async function generateLandingImages(): Promise<GenerationResult[]> {
  console.log('\n🌅 Generating Landing Page Images...\n')

  const results: GenerationResult[] = []
  const outputDir = path.join(OUTPUT_DIR, 'landing')

  for (const [id, prompt] of Object.entries(LANDING_PROMPTS)) {
    console.log(`\n📸 Generating: ${id}`)

    const result = await generateImage(prompt, 'landing')

    if (result.base64) {
      const filePath = path.join(outputDir, `${id}.png`)
      saveImage(result.base64, filePath)
      console.log(`  ✅ Saved: ${filePath}`)
      results.push({ id, success: true, filePath })
    } else {
      console.log(`  ❌ Failed: ${result.error}`)
      results.push({ id, success: false, error: result.error })
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return results
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 Becoming Image Generator')
  console.log('============================')
  console.log(`Using API Key: ${GEMINI_API_KEY?.substring(0, 10)}...`)
  console.log(`Output directory: ${OUTPUT_DIR}`)

  const args = process.argv.slice(2)
  const generateAll = args.length === 0 || args.includes('--all')
  const generateOnboarding = generateAll || args.includes('--onboarding')
  const generateLanding = generateAll || args.includes('--landing')

  const allResults: GenerationResult[] = []

  if (generateOnboarding) {
    const results = await generateOnboardingImages()
    allResults.push(...results)
  }

  if (generateLanding) {
    const results = await generateLandingImages()
    allResults.push(...results)
  }

  // Summary
  console.log('\n\n📊 Summary')
  console.log('===========')
  const successful = allResults.filter(r => r.success)
  const failed = allResults.filter(r => !r.success)

  console.log(`✅ Successful: ${successful.length}`)
  console.log(`❌ Failed: ${failed.length}`)

  if (failed.length > 0) {
    console.log('\nFailed images:')
    failed.forEach(f => console.log(`  - ${f.id}: ${f.error}`))
  }

  console.log('\n🎉 Done!')
}

main().catch(console.error)

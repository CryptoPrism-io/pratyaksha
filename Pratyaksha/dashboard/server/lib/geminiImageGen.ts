// Gemini Image Generation Client
// Uses Google's Gemini API for consistent AI image generation

import {
  ImagePrompt,
  getCompletePrompt,
  ONBOARDING_PROMPTS,
  LANDING_PROMPTS,
  ACHIEVEMENT_PROMPTS,
} from "./imageGeneration";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Response from Gemini image generation
 */
export interface GeminiImageResponse {
  success: boolean;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
  prompt?: string;
}

/**
 * Batch generation result
 */
export interface BatchGenerationResult {
  id: string;
  success: boolean;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

/**
 * Generate an image using Gemini's image generation capabilities
 * Uses Imagen 3 model through Gemini API
 */
export async function generateImage(
  prompt: ImagePrompt
): Promise<GeminiImageResponse> {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error: "GEMINI_API_KEY is not configured",
    };
  }

  const fullPrompt = getCompletePrompt(prompt);

  try {
    // Using Gemini's Imagen 3 endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: fullPrompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: getAspectRatio(prompt.category),
            safetyFilterLevel: "block_only_high",
            personGeneration: "dont_allow",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Gemini] API error:", response.status, errorText);
      return {
        success: false,
        error: `Gemini API error: ${response.status}`,
        prompt: fullPrompt,
      };
    }

    const result = await response.json();

    if (
      result.predictions &&
      result.predictions.length > 0 &&
      result.predictions[0].bytesBase64Encoded
    ) {
      return {
        success: true,
        imageBase64: result.predictions[0].bytesBase64Encoded,
        mimeType: result.predictions[0].mimeType || "image/png",
        prompt: fullPrompt,
      };
    }

    return {
      success: false,
      error: "No image generated",
      prompt: fullPrompt,
    };
  } catch (error) {
    console.error("[Gemini] Generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      prompt: fullPrompt,
    };
  }
}

/**
 * Get aspect ratio based on category
 */
function getAspectRatio(
  category: string
): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" {
  switch (category) {
    case "landing":
      return "16:9";
    case "blog":
      return "16:9";
    case "onboarding":
      return "1:1";
    case "achievement":
      return "1:1";
    case "feature":
      return "1:1";
    default:
      return "1:1";
  }
}

/**
 * Generate a specific onboarding slide image
 */
export async function generateOnboardingImage(
  slideId: keyof typeof ONBOARDING_PROMPTS
): Promise<GeminiImageResponse> {
  const prompt = ONBOARDING_PROMPTS[slideId];
  if (!prompt) {
    return {
      success: false,
      error: `Unknown onboarding slide: ${slideId}`,
    };
  }
  return generateImage(prompt);
}

/**
 * Generate a specific landing page image
 */
export async function generateLandingImage(
  imageId: keyof typeof LANDING_PROMPTS
): Promise<GeminiImageResponse> {
  const prompt = LANDING_PROMPTS[imageId];
  if (!prompt) {
    return {
      success: false,
      error: `Unknown landing image: ${imageId}`,
    };
  }
  return generateImage(prompt);
}

/**
 * Generate an achievement celebration image
 */
export async function generateAchievementImage(
  achievementId: keyof typeof ACHIEVEMENT_PROMPTS
): Promise<GeminiImageResponse> {
  const prompt = ACHIEVEMENT_PROMPTS[achievementId];
  if (!prompt) {
    return {
      success: false,
      error: `Unknown achievement: ${achievementId}`,
    };
  }
  return generateImage(prompt);
}

/**
 * Generate multiple images in sequence (not parallel to avoid rate limits)
 */
export async function generateBatch(
  prompts: Array<{ id: string; prompt: ImagePrompt }>
): Promise<BatchGenerationResult[]> {
  const results: BatchGenerationResult[] = [];

  for (const { id, prompt } of prompts) {
    const result = await generateImage(prompt);

    results.push({
      id,
      success: result.success,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
      error: result.error,
    });

    // Small delay between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Generate all onboarding images
 */
export async function generateAllOnboardingImages(): Promise<
  BatchGenerationResult[]
> {
  const prompts = Object.entries(ONBOARDING_PROMPTS).map(([id, prompt]) => ({
    id,
    prompt,
  }));
  return generateBatch(prompts);
}

/**
 * Generate a custom image with the Becoming style
 */
export async function generateCustomImage(
  subject: string,
  category: ImagePrompt["category"] = "feature",
  mood?: string,
  additionalContext?: string
): Promise<GeminiImageResponse> {
  return generateImage({
    category,
    subject,
    mood,
    additionalContext,
  });
}

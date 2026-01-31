// Image Generation API Routes
// Endpoints for generating AI images with Becoming's visual style

import { Request, Response } from "express";
import {
  generateImage,
  generateOnboardingImage,
  generateLandingImage,
  generateAchievementImage,
  generateCustomImage,
  generateAllOnboardingImages,
  GeminiImageResponse,
} from "../lib/geminiImageGen";
import {
  ImagePrompt,
  ONBOARDING_PROMPTS,
  LANDING_PROMPTS,
  ACHIEVEMENT_PROMPTS,
  getCompletePrompt,
} from "../lib/imageGeneration";

/**
 * POST /api/image/generate
 * Generate a custom image with provided prompt
 */
export async function generateCustom(req: Request, res: Response) {
  try {
    const { subject, category, mood, additionalContext } = req.body;

    if (!subject) {
      return res.status(400).json({
        success: false,
        error: "Subject is required",
      });
    }

    const result = await generateCustomImage(
      subject,
      category || "feature",
      mood,
      additionalContext
    );

    if (result.success) {
      res.json({
        success: true,
        image: {
          base64: result.imageBase64,
          mimeType: result.mimeType,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("[ImageGen] Custom generation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
}

/**
 * GET /api/image/onboarding/:slideId
 * Generate a specific onboarding slide image
 */
export async function getOnboardingImage(req: Request, res: Response) {
  try {
    const { slideId } = req.params;

    if (!ONBOARDING_PROMPTS[slideId as keyof typeof ONBOARDING_PROMPTS]) {
      return res.status(400).json({
        success: false,
        error: `Invalid slide ID. Available: ${Object.keys(ONBOARDING_PROMPTS).join(", ")}`,
      });
    }

    const result = await generateOnboardingImage(
      slideId as keyof typeof ONBOARDING_PROMPTS
    );

    if (result.success) {
      res.json({
        success: true,
        slideId,
        image: {
          base64: result.imageBase64,
          mimeType: result.mimeType,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("[ImageGen] Onboarding generation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
}

/**
 * GET /api/image/landing/:imageId
 * Generate a specific landing page image
 */
export async function getLandingImage(req: Request, res: Response) {
  try {
    const { imageId } = req.params;

    if (!LANDING_PROMPTS[imageId as keyof typeof LANDING_PROMPTS]) {
      return res.status(400).json({
        success: false,
        error: `Invalid image ID. Available: ${Object.keys(LANDING_PROMPTS).join(", ")}`,
      });
    }

    const result = await generateLandingImage(
      imageId as keyof typeof LANDING_PROMPTS
    );

    if (result.success) {
      res.json({
        success: true,
        imageId,
        image: {
          base64: result.imageBase64,
          mimeType: result.mimeType,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("[ImageGen] Landing generation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
}

/**
 * GET /api/image/achievement/:achievementId
 * Generate an achievement celebration image
 */
export async function getAchievementImage(req: Request, res: Response) {
  try {
    const { achievementId } = req.params;

    if (!ACHIEVEMENT_PROMPTS[achievementId as keyof typeof ACHIEVEMENT_PROMPTS]) {
      return res.status(400).json({
        success: false,
        error: `Invalid achievement ID. Available: ${Object.keys(ACHIEVEMENT_PROMPTS).join(", ")}`,
      });
    }

    const result = await generateAchievementImage(
      achievementId as keyof typeof ACHIEVEMENT_PROMPTS
    );

    if (result.success) {
      res.json({
        success: true,
        achievementId,
        image: {
          base64: result.imageBase64,
          mimeType: result.mimeType,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("[ImageGen] Achievement generation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
}

/**
 * POST /api/image/batch/onboarding
 * Generate all onboarding images (long-running operation)
 */
export async function generateAllOnboarding(req: Request, res: Response) {
  try {
    // This is a long-running operation - could take several minutes
    const results = await generateAllOnboardingImages();

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    res.json({
      success: true,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
      results: results.map((r) => ({
        id: r.id,
        success: r.success,
        error: r.error,
        // Don't include base64 in batch response - too large
        hasImage: !!r.imageBase64,
      })),
    });
  } catch (error) {
    console.error("[ImageGen] Batch generation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Batch generation failed",
    });
  }
}

/**
 * GET /api/image/prompts
 * List all available prompt templates
 */
export async function listPrompts(_req: Request, res: Response) {
  res.json({
    success: true,
    prompts: {
      onboarding: Object.keys(ONBOARDING_PROMPTS),
      landing: Object.keys(LANDING_PROMPTS),
      achievement: Object.keys(ACHIEVEMENT_PROMPTS),
    },
  });
}

/**
 * GET /api/image/prompt/:category/:id
 * Preview a specific prompt without generating
 */
export async function previewPrompt(req: Request, res: Response) {
  const { category, id } = req.params;

  let prompt: ImagePrompt | undefined;

  switch (category) {
    case "onboarding":
      prompt = ONBOARDING_PROMPTS[id as keyof typeof ONBOARDING_PROMPTS];
      break;
    case "landing":
      prompt = LANDING_PROMPTS[id as keyof typeof LANDING_PROMPTS];
      break;
    case "achievement":
      prompt = ACHIEVEMENT_PROMPTS[id as keyof typeof ACHIEVEMENT_PROMPTS];
      break;
    default:
      return res.status(400).json({
        success: false,
        error: "Invalid category. Use: onboarding, landing, or achievement",
      });
  }

  if (!prompt) {
    return res.status(404).json({
      success: false,
      error: `Prompt not found: ${category}/${id}`,
    });
  }

  res.json({
    success: true,
    category,
    id,
    prompt,
    fullPrompt: getCompletePrompt(prompt),
  });
}

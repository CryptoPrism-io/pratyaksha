/**
 * Adaptive Quality Frame Loader
 *
 * Automatically detects device capabilities and selects the appropriate
 * frame quality for optimal performance and visual experience.
 *
 * Quality tiers:
 * - 4k: 3840px width - for high-end displays (4K monitors, high DPR devices)
 * - hd: 1920px width - for standard desktop/laptop displays
 * - sd: 960px width - for mobile devices or slow connections
 */

export type QualityTier = '4k' | 'hd' | 'sd'

interface DeviceCapabilities {
  screenWidth: number
  devicePixelRatio: number
  networkType: string | null
  deviceMemory: number | null
  hardwareConcurrency: number
}

interface QualityConfig {
  tier: QualityTier
  path: string
  frameWidth: number
}

const QUALITY_CONFIGS: Record<QualityTier, Omit<QualityConfig, 'path'>> = {
  '4k': { tier: '4k', frameWidth: 3840 },
  hd: { tier: 'hd', frameWidth: 1920 },
  sd: { tier: 'sd', frameWidth: 960 },
}

/**
 * Detects device capabilities for quality selection
 */
function getDeviceCapabilities(): DeviceCapabilities {
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string }
    deviceMemory?: number
  }

  return {
    screenWidth: window.screen.width,
    devicePixelRatio: window.devicePixelRatio || 1,
    networkType: nav.connection?.effectiveType || null,
    deviceMemory: nav.deviceMemory || null,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
  }
}

/**
 * Determines the optimal quality tier based on device capabilities
 */
export function detectOptimalQuality(): QualityTier {
  const caps = getDeviceCapabilities()

  // Calculate effective resolution (screen width * DPR)
  const effectiveWidth = caps.screenWidth * caps.devicePixelRatio

  // Check network conditions - prefer lower quality on slow connections
  const slowNetwork = caps.networkType === 'slow-2g' || caps.networkType === '2g'
  const moderateNetwork = caps.networkType === '3g'

  if (slowNetwork) {
    return 'sd'
  }

  // Check device memory - prefer lower quality on low-memory devices
  const lowMemory = caps.deviceMemory !== null && caps.deviceMemory < 4
  const moderateMemory = caps.deviceMemory !== null && caps.deviceMemory < 8

  if (lowMemory) {
    return 'sd'
  }

  // Check CPU cores - prefer lower quality on weak devices
  const weakCPU = caps.hardwareConcurrency < 4

  if (weakCPU || moderateNetwork) {
    return moderateMemory ? 'sd' : 'hd'
  }

  // High-end device selection based on effective resolution
  if (effectiveWidth >= 3000) {
    // 4K capable display
    return caps.deviceMemory && caps.deviceMemory >= 8 ? '4k' : 'hd'
  } else if (effectiveWidth >= 1800) {
    // HD capable display
    return 'hd'
  } else {
    // Lower resolution display (mobile, etc.)
    return caps.devicePixelRatio > 2 ? 'hd' : 'sd'
  }
}

/**
 * Gets the frame path for a specific quality tier and transition
 *
 * Supports multiple folder structures:
 * - New structure: /frames/{quality}/t{1-4}/frame_{n}.jpg
 * - Legacy structure: /frames/t{1-4}/frame-{n}.jpg
 *
 * @param transition - The transition name (t1, t2, t3, t4)
 * @param quality - The quality tier (4k, hd, sd)
 * @param useLegacy - Whether to use legacy path structure
 */
export function getFramePath(
  transition: string,
  quality: QualityTier = 'hd',
  useLegacy: boolean = true
): string {
  if (useLegacy) {
    // Current/legacy structure: /frames/t1/frame-0001.jpg
    return `/frames/${transition}`
  }

  // New multi-quality structure: /frames/hd/t1/frame_0001.jpg
  return `/frames/${quality}/${transition}`
}

/**
 * Generates the frame filename for a given frame number
 *
 * @param frameNumber - The frame number (1-indexed)
 * @param useLegacy - Whether to use legacy naming convention
 */
export function getFrameFilename(
  frameNumber: number,
  useLegacy: boolean = true
): string {
  const paddedNumber = String(frameNumber).padStart(4, '0')

  if (useLegacy) {
    return `frame-${paddedNumber}.jpg`
  }

  return `frame_${paddedNumber}.jpg`
}

/**
 * Full frame URL generator
 *
 * @param transition - The transition name
 * @param frameNumber - The frame number (1-indexed)
 * @param quality - The quality tier
 * @param useLegacy - Whether to use legacy structure
 */
export function getFrameUrl(
  transition: string,
  frameNumber: number,
  quality: QualityTier = 'hd',
  useLegacy: boolean = true
): string {
  const path = getFramePath(transition, quality, useLegacy)
  const filename = getFrameFilename(frameNumber, useLegacy)
  return `${path}/${filename}`
}

/**
 * Quality tier display names for UI
 */
export const QUALITY_LABELS: Record<QualityTier, string> = {
  '4k': 'Ultra HD (4K)',
  hd: 'Full HD (1080p)',
  sd: 'Standard (480p)',
}

/**
 * Checks if the browser supports progressive loading features
 */
export function supportsProgressiveLoading(): boolean {
  return 'IntersectionObserver' in window && 'requestIdleCallback' in window
}

/**
 * Creates a quality-aware frame manifest
 */
export function createQualityManifest(
  baseManifest: Record<string, { path: string; count: number; pattern: string }>,
  quality: QualityTier
): Record<string, { path: string; count: number; pattern: string }> {
  const result: Record<string, { path: string; count: number; pattern: string }> = {}

  for (const [transition, config] of Object.entries(baseManifest)) {
    result[transition] = {
      ...config,
      path: getFramePath(transition, quality, true), // Use legacy for now
    }
  }

  return result
}

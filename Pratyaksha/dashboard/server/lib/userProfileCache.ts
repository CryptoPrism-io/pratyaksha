/**
 * User Profile Cache - In-Memory Caching
 * Strategy: Cache forever, invalidate on updates
 * Performance: 5.5s → instant on cache hit
 */

// In-memory cache
const profileCache = new Map<string, any>()

export function getCachedUserProfile(firebaseUid: string): any | null {
  const cached = profileCache.get(firebaseUid)
  if (cached) {
    console.log(`[ProfileCache] HIT: ${firebaseUid}`)
    return cached
  }
  console.log(`[ProfileCache] MISS: ${firebaseUid}`)
  return null
}

export function setCachedUserProfile(firebaseUid: string, profile: any): void {
  profileCache.set(firebaseUid, profile)
  console.log(`[ProfileCache] SET: ${firebaseUid} (cached indefinitely)`)
}

export function invalidateUserProfile(firebaseUid: string): void {
  profileCache.delete(firebaseUid)
  console.log(`[ProfileCache] INVALIDATED: ${firebaseUid}`)
}

export function getCacheStats() {
  return { cachedProfiles: profileCache.size }
}

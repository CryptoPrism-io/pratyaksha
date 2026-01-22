import { useEffect, useRef, useCallback } from 'react'
import { type BrainState, STATES } from '@/lib/constants'

interface UseVideoScrubProps {
  videoRef: React.RefObject<HTMLVideoElement>
  state: BrainState
  stateProgress: number
  isActive: boolean
}

export function useVideoScrub({ videoRef, state, stateProgress, isActive }: UseVideoScrubProps) {
  const rafRef = useRef<number | null>(null)
  const targetTimeRef = useRef<number>(0)

  const scrubVideo = useCallback(() => {
    const video = videoRef.current
    if (!video || !isActive) return

    // Smoothly interpolate to target time
    const currentTime = video.currentTime
    const targetTime = targetTimeRef.current
    const diff = targetTime - currentTime

    // Only update if difference is significant
    if (Math.abs(diff) > 0.01) {
      // Ease towards target (lerp)
      video.currentTime = currentTime + diff * 0.15
      rafRef.current = requestAnimationFrame(scrubVideo)
    }
  }, [videoRef, isActive])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !isActive) return

    // Calculate target time based on state progress
    const duration = video.duration || 0
    targetTimeRef.current = stateProgress * duration

    // Start scrubbing animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(scrubVideo)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [stateProgress, isActive, scrubVideo, videoRef])

  // Pause video when not active
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive) {
      video.pause() // We control playback via scrubbing
    }
  }, [isActive, videoRef])
}

// Preload all videos
export function usePreloadVideos(videoPaths: string[]) {
  useEffect(() => {
    videoPaths.forEach((path) => {
      const video = document.createElement('video')
      video.preload = 'auto'
      video.src = path
      video.load()
    })
  }, [videoPaths])
}

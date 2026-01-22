import { useRef, useEffect, useState } from 'react'
import { VIDEOS, STATES, type BrainState, STATE_COLORS } from '@/lib/constants'
import { useVideoScrub, usePreloadVideos } from '@/hooks/useVideoScrub'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  currentState: BrainState
  stateProgress: number
}

export function VideoPlayer({ currentState, stateProgress }: VideoPlayerProps) {
  const videoRefs = {
    [STATES.CHAOS]: useRef<HTMLVideoElement>(null),
    [STATES.ORGANIZING]: useRef<HTMLVideoElement>(null),
    [STATES.ILLUMINATED]: useRef<HTMLVideoElement>(null),
    [STATES.RADIANT]: useRef<HTMLVideoElement>(null),
  }

  const [loadedVideos, setLoadedVideos] = useState<Set<BrainState>>(new Set())

  // Preload all videos
  usePreloadVideos(Object.values(VIDEOS))

  // Set up video scrubbing for each video
  useVideoScrub({
    videoRef: videoRefs[STATES.CHAOS],
    state: STATES.CHAOS,
    stateProgress: currentState === STATES.CHAOS ? stateProgress : currentState > STATES.CHAOS ? 1 : 0,
    isActive: currentState === STATES.CHAOS,
  })

  useVideoScrub({
    videoRef: videoRefs[STATES.ORGANIZING],
    state: STATES.ORGANIZING,
    stateProgress: currentState === STATES.ORGANIZING ? stateProgress : currentState > STATES.ORGANIZING ? 1 : 0,
    isActive: currentState === STATES.ORGANIZING,
  })

  useVideoScrub({
    videoRef: videoRefs[STATES.ILLUMINATED],
    state: STATES.ILLUMINATED,
    stateProgress: currentState === STATES.ILLUMINATED ? stateProgress : currentState > STATES.ILLUMINATED ? 1 : 0,
    isActive: currentState === STATES.ILLUMINATED,
  })

  useVideoScrub({
    videoRef: videoRefs[STATES.RADIANT],
    state: STATES.RADIANT,
    stateProgress: currentState === STATES.RADIANT ? stateProgress : 0,
    isActive: currentState === STATES.RADIANT,
  })

  // Track loaded videos
  const handleVideoLoaded = (state: BrainState) => {
    setLoadedVideos((prev) => new Set([...prev, state]))
  }

  // Get current glow color
  const glowColor = STATE_COLORS[currentState]

  // Determine which video should be visible
  const getVideoOpacity = (videoState: BrainState) => {
    if (currentState === STATES.DORMANT) {
      // Show first frame of first video
      return videoState === STATES.CHAOS ? 1 : 0
    }
    if (currentState >= videoState) {
      return 1
    }
    return 0
  }

  return (
    <div className="video-container">
      {/* Background glow effect */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at center, hsla(${glowColor.h}, ${glowColor.s}%, ${glowColor.l}%, 0.15) 0%, transparent 70%)`,
        }}
      />

      {/* Video layers - stacked on top of each other */}
      {Object.entries(VIDEOS).map(([state, src]) => {
        const stateNum = Number(state) as BrainState
        const opacity = getVideoOpacity(stateNum)

        return (
          <video
            key={state}
            ref={videoRefs[stateNum]}
            src={src}
            muted
            playsInline
            preload="auto"
            onLoadedData={() => handleVideoLoaded(stateNum)}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
              opacity > 0 ? 'opacity-100' : 'opacity-0'
            )}
            style={{ zIndex: stateNum }}
          />
        )
      })}

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,5,8,0.8) 100%)',
          zIndex: 10,
        }}
      />

      {/* Loading indicator */}
      {loadedVideos.size < 4 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/50 text-sm">
          Loading experience...
        </div>
      )}
    </div>
  )
}

import { STATES, STATE_LABELS, STATE_COLORS, type BrainState } from '@/lib/constants'
import { useScrollToState } from '@/hooks/useScrollProgress'
import { cn } from '@/lib/utils'

interface StateNavbarProps {
  currentState: BrainState
  stateProgress: number
}

export function StateNavbar({ currentState, stateProgress }: StateNavbarProps) {
  const scrollToState = useScrollToState()

  const states = [
    STATES.DORMANT,
    STATES.CHAOS,
    STATES.ORGANIZING,
    STATES.ILLUMINATED,
    STATES.RADIANT,
  ]

  return (
    <nav className="state-navbar">
      {states.map((state) => {
        const isActive = currentState === state
        const isPast = currentState > state
        const color = STATE_COLORS[state]
        const label = STATE_LABELS[state]

        return (
          <button
            key={state}
            onClick={() => scrollToState(state)}
            className="group flex items-center gap-3 transition-all duration-300"
            aria-label={`Go to ${label}`}
          >
            {/* Dot */}
            <div className="relative">
              {/* Glow ring for active state */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    boxShadow: `0 0 20px 5px ${color.hex}40`,
                  }}
                />
              )}

              {/* Main dot */}
              <div
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300 border-2',
                  isActive && 'scale-125',
                  isPast ? 'border-white/50 bg-white/30' : 'border-white/20 bg-transparent'
                )}
                style={{
                  backgroundColor: isActive ? color.hex : undefined,
                  borderColor: isActive ? color.hex : undefined,
                }}
              />

              {/* Progress fill for active state */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{
                    background: `conic-gradient(${color.hex} ${stateProgress * 360}deg, transparent 0deg)`,
                    opacity: 0.3,
                  }}
                />
              )}
            </div>

            {/* Label - shows on hover or when active */}
            <span
              className={cn(
                'text-xs font-medium transition-all duration-300 whitespace-nowrap',
                'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0',
                isActive && 'opacity-100 translate-x-0'
              )}
              style={{
                color: isActive ? color.hex : 'rgba(255,255,255,0.6)',
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

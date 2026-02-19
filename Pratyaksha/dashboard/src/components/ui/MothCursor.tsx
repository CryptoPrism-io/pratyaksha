import { useState, useEffect, useMemo } from "react"

// Muted pastel color palette
const DARK_TEAL = "#115e59"
const DARK_ROSE = "#9f1239"
const DARK_BODY = "#1c1917"

export function MothCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const [isFastFlutter, setIsFastFlutter] = useState(false)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    const handleLeave = () => setVisible(false)
    const handleEnter = () => setVisible(true)

    // Listen for collision flutter event
    const handleFlutter = () => {
      setIsFastFlutter(true)
      setTimeout(() => setIsFastFlutter(false), 500)
    }

    window.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseleave", handleLeave)
    document.addEventListener("mouseenter", handleEnter)
    window.addEventListener("moth-collision-flutter", handleFlutter)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseleave", handleLeave)
      document.removeEventListener("mouseenter", handleEnter)
      window.removeEventListener("moth-collision-flutter", handleFlutter)
    }
  }, [])

  if (!visible) return null

  // Size reduced to 25% of previous: ~27x17
  const width = 27
  const height = 17

  // Spotlight size
  const spotlightSize = 120

  return (
    <>
      {/* Spotlight effect - lights up area around cursor */}
      <div
        className="fixed pointer-events-none z-[1000000001]"
        style={{
          left: pos.x - spotlightSize / 2,
          top: pos.y - spotlightSize / 2,
          width: spotlightSize,
          height: spotlightSize,
          background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.02) 60%, transparent 80%)",
          borderRadius: "50%",
          mixBlendMode: "overlay",
        }}
      />
      {/* Secondary glow for extra contrast */}
      <div
        className="fixed pointer-events-none z-[1000000001]"
        style={{
          left: pos.x - spotlightSize * 0.4,
          top: pos.y - spotlightSize * 0.4,
          width: spotlightSize * 0.8,
          height: spotlightSize * 0.8,
          background: "radial-gradient(circle at center, rgba(20,184,166,0.12) 0%, rgba(244,63,94,0.08) 50%, transparent 80%)",
          borderRadius: "50%",
          filter: "blur(8px)",
        }}
      />
      {/* Moth cursor */}
      <div
        className="fixed pointer-events-none z-[1000000002]"
        style={{
          left: pos.x - width / 2,
          top: pos.y - height / 2,
          transform: "rotate(-15deg)",
        }}
      >
        <MothSVG fastFlutter={isFastFlutter} />
      </div>
    </>
  )
}

function MothSVG({ fastFlutter = false }: { fastFlutter?: boolean }) {
  const uniqueId = useMemo(() => `cursor-moth-${Math.random().toString(36).slice(2, 9)}`, [])

  // Wing animation class - 10x faster when fluttering
  const wingLeftClass = fastFlutter ? "animate-wing-left-fast" : "animate-wing-left"
  const wingRightClass = fastFlutter ? "animate-wing-right-fast" : "animate-wing-right"

  // Size reduced to 25% of previous: ~27x17
  return (
    <svg
      width={27}
      height={17}
      viewBox="0 0 80 50"
    >
      <defs>
        <linearGradient id={`${uniqueId}-wingL`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={DARK_TEAL} />
          <stop offset="100%" stopColor={DARK_ROSE} />
        </linearGradient>
        <linearGradient id={`${uniqueId}-wingR`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={DARK_TEAL} />
          <stop offset="100%" stopColor={DARK_ROSE} />
        </linearGradient>
      </defs>
      {/* Left wing */}
      <ellipse
        cx="25" cy="25" rx="18" ry="12"
        fill={`url(#${uniqueId}-wingL)`}
        opacity="1"
        className={wingLeftClass}
        style={{ transformOrigin: "40px 25px" }}
      />
      {/* Right wing */}
      <ellipse
        cx="55" cy="25" rx="18" ry="12"
        fill={`url(#${uniqueId}-wingR)`}
        opacity="1"
        className={wingRightClass}
        style={{ transformOrigin: "40px 25px" }}
      />
      {/* Body */}
      <ellipse cx="40" cy="25" rx="2.5" ry="10" fill={DARK_BODY} opacity="1" />
      {/* Antennae */}
      <line x1="38" y1="16" x2="33" y2="9" stroke={DARK_BODY} strokeWidth="1.5" strokeLinecap="round" opacity="1" />
      <line x1="42" y1="16" x2="47" y2="9" stroke={DARK_BODY} strokeWidth="1.5" strokeLinecap="round" opacity="1" />
    </svg>
  )
}

import { cn } from "@/lib/utils"

interface OrbConfig {
  size: number
  x: string
  y: string
  color: "teal" | "rose" | "purple"
  blur: number
  delay?: number
}

const ORBS: OrbConfig[] = [
  // Top-left: center at corner of screen
  { size: 1000, x: "0%", y: "0%", color: "teal", blur: 60, delay: 0 },
  // Bottom-right: center at corner of screen (larger to compensate for rose being less visible)
  { size: 1200, x: "100%", y: "100%", color: "rose", blur: 50, delay: 2 },
]

interface BackgroundOrbsProps {
  className?: string
  intensity?: "subtle" | "normal" | "strong"
}

export function BackgroundOrbs({
  className,
  intensity = "normal"
}: BackgroundOrbsProps) {
  const opacityMap = {
    subtle: 0.5,
    normal: 1,
    strong: 1.5,
  }

  return (
    <div
      className={cn(
        "fixed inset-0 overflow-hidden pointer-events-none -z-10",
        className
      )}
      style={{ opacity: opacityMap[intensity] }}
    >
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className={cn(
            "floating-orb",
            orb.color === "teal" && "floating-orb-teal",
            orb.color === "rose" && "floating-orb-rose",
            orb.color === "purple" && "floating-orb-purple"
          )}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            transform: "translate(-50%, -50%)",
            filter: `blur(${orb.blur}px)`,
            animationDelay: `${orb.delay || 0}s`,
          }}
        />
      ))}
    </div>
  )
}

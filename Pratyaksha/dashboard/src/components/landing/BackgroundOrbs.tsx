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
  { size: 500, x: "5%", y: "10%", color: "teal", blur: 120, delay: 0 },
  { size: 400, x: "75%", y: "50%", color: "rose", blur: 100, delay: 2 },
  { size: 350, x: "55%", y: "5%", color: "purple", blur: 90, delay: 4 },
  { size: 300, x: "15%", y: "70%", color: "rose", blur: 80, delay: 3 },
  { size: 250, x: "85%", y: "20%", color: "teal", blur: 70, delay: 5 },
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
            filter: `blur(${orb.blur}px)`,
            animationDelay: `${orb.delay || 0}s`,
          }}
        />
      ))}
    </div>
  )
}

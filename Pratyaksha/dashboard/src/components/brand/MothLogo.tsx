import { cn } from "@/lib/utils"

interface MothLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
}

// Brand colors
const TEAL = "#0d9488"
const ROSE = "#be123c"
const BODY = "#134e4a"

const sizes = {
  sm: { width: 24, height: 20 },
  md: { width: 32, height: 26 },
  lg: { width: 40, height: 32 },
  xl: { width: 56, height: 45 },
}

export function MothLogo({ className, size = "md", animated = false }: MothLogoProps) {
  const { width, height } = sizes[size]

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 50"
      className={cn(className)}
      aria-label="Becoming logo"
    >
      <defs>
        <linearGradient id="mothWingL" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={TEAL} />
          <stop offset="100%" stopColor={ROSE} />
        </linearGradient>
        <linearGradient id="mothWingR" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={TEAL} />
          <stop offset="100%" stopColor={ROSE} />
        </linearGradient>
      </defs>
      {/* Left wing */}
      <ellipse
        cx="25"
        cy="25"
        rx="20"
        ry="14"
        fill="url(#mothWingL)"
        className={animated ? "animate-wing-left" : ""}
        style={{ transformOrigin: "40px 25px" }}
      />
      {/* Right wing */}
      <ellipse
        cx="55"
        cy="25"
        rx="20"
        ry="14"
        fill="url(#mothWingR)"
        className={animated ? "animate-wing-right" : ""}
        style={{ transformOrigin: "40px 25px" }}
      />
      {/* Body */}
      <ellipse cx="40" cy="25" rx="3" ry="12" fill={BODY} />
      {/* Antennae */}
      <line x1="38" y1="14" x2="32" y2="5" stroke={BODY} strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="14" x2="48" y2="5" stroke={BODY} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

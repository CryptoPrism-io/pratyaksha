import { cn } from "@/lib/utils"

interface BrandWordmarkProps {
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "hero"
  variant?: "default" | "modern" | "split" | "minimal"
  animated?: boolean
  showTagline?: boolean
}

const sizeClasses = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg sm:text-xl",
  lg: "text-xl sm:text-2xl",
  xl: "text-2xl sm:text-3xl",
  "2xl": "text-3xl sm:text-4xl",
  hero: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
}

export function BrandWordmark({
  className,
  size = "md",
  variant = "default",
  animated = false,
  showTagline = false,
}: BrandWordmarkProps) {
  const gradientClass = animated ? "brand-gradient-animated" : "brand-gradient"

  // Bold modern - primary brand voice
  if (variant === "default") {
    return (
      <span className={cn("inline-flex flex-col", className)}>
        <span
          className={cn(
            "brand-wordmark",
            gradientClass,
            sizeClasses[size]
          )}
        >
          Becoming
        </span>
        {showTagline && (
          <span className="text-[10px] text-muted-foreground font-medium tracking-[0.15em] uppercase mt-1">
            Your transformation
          </span>
        )}
      </span>
    )
  }

  // Extra bold impact - for hero sections
  if (variant === "modern") {
    return (
      <span className={cn("inline-flex flex-col", className)}>
        <span
          className={cn(
            "brand-wordmark-bold",
            gradientClass,
            sizeClasses[size]
          )}
        >
          Becoming
        </span>
        {showTagline && (
          <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase mt-1">
            Journal your journey
          </span>
        )}
      </span>
    )
  }

  // Split styling - light "Be" + bold "coming"
  if (variant === "split") {
    return (
      <span className={cn("inline-flex flex-col brand-split", className)}>
        <span className={cn(gradientClass, sizeClasses[size])}>
          <span className="brand-be">Be</span>
          <span className="brand-coming">coming</span>
        </span>
        {showTagline && (
          <span className="text-xs text-muted-foreground font-medium tracking-wide mt-1">
            The journey of transformation
          </span>
        )}
      </span>
    )
  }

  // Minimal - clean for UI elements
  if (variant === "minimal") {
    return (
      <span
        className={cn(
          "brand-wordmark-minimal",
          gradientClass,
          sizeClasses[size],
          className
        )}
      >
        Becoming
      </span>
    )
  }

  return null
}

// Compact logo + wordmark combo for headers
export function BrandLogo({
  className,
  size = "md",
  animated = false,
}: {
  className?: string
  size?: "sm" | "md" | "lg"
  animated?: boolean
}) {
  const { MothLogo } = require("./MothLogo")

  const logoSizes = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
  }

  const textSizes = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <MothLogo size={logoSizes[size]} animated={animated} />
      <span
        className={cn(
          "brand-wordmark brand-gradient",
          textSizes[size]
        )}
      >
        Becoming
      </span>
    </span>
  )
}

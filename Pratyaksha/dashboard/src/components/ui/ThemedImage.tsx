import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemedImageProps {
  lightSrc: string
  darkSrc: string
  alt?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Image component that switches between light and dark mode versions
 * Uses next-themes to detect current theme
 */
export function ThemedImage({
  lightSrc,
  darkSrc,
  alt = "",
  className = "",
  style,
}: ThemedImageProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch - show light version first
  if (!mounted) {
    return (
      <img
        src={lightSrc}
        alt={alt}
        className={className}
        style={style}
        loading="lazy"
      />
    )
  }

  const src = resolvedTheme === "dark" ? darkSrc : lightSrc

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
    />
  )
}

/**
 * Background image component with theme-aware switching
 * Renders as a div with background-image for better performance
 */
export function ThemedBackground({
  lightSrc,
  darkSrc,
  className = "",
  children,
  overlay = true,
}: {
  lightSrc: string
  darkSrc: string
  className?: string
  children?: React.ReactNode
  overlay?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const src = mounted && resolvedTheme === "dark" ? darkSrc : lightSrc

  return (
    <div
      className={`relative ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {overlay && (
        <div className="absolute inset-0 bg-background/60 dark:bg-background/70" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/**
 * Placeholder component for images not yet generated
 * Shows a gradient placeholder with the section name
 */
export function ImagePlaceholder({
  section,
  aspectRatio = "16/9",
  className = "",
}: {
  section: string
  aspectRatio?: string
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ aspectRatio }}
    >
      {/* Gradient placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-rose-500/20" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="px-3 py-1.5 rounded-full bg-black/20 dark:bg-white/10 text-xs font-medium text-white/60 dark:text-white/40 backdrop-blur-sm">
          {section}
        </span>
      </div>
    </div>
  )
}

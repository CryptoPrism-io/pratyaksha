import { useState, useEffect, useRef, type ReactElement, type ReactNode } from "react"
import { ResponsiveContainer } from "recharts"

interface SafeResponsiveContainerProps {
  width?: string | number
  height?: string | number
  /** Chart component to render - must be a valid Recharts chart element */
  children: ReactElement
  /** Minimum width before rendering children (default: 10) */
  minWidth?: number
  /** Minimum height before rendering children (default: 10) */
  minHeight?: number
  /** Custom loading fallback */
  fallback?: ReactNode
}

/**
 * A wrapper around Recharts ResponsiveContainer that prevents NaN errors
 * by only rendering children once the container has valid dimensions.
 *
 * This fixes console errors like:
 * "Error: <rect> attribute x: Expected length, 'NaN'"
 */
export function SafeResponsiveContainer({
  width = "100%",
  height,
  children,
  minWidth = 10,
  minHeight = 10,
  fallback,
}: SafeResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const checkDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect && rect.width >= minWidth && rect.height >= minHeight) {
        setIsReady(true)
      }
    }

    // Check immediately
    checkDimensions()

    // Also observe for size changes
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.contentRect.width >= minWidth && entry.contentRect.height >= minHeight) {
        setIsReady(true)
      }
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [minWidth, minHeight])

  const defaultFallback = (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )

  return (
    <div ref={containerRef} style={{ width, height, minHeight: height }}>
      {isReady ? (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  )
}

import { useState, useEffect } from "react"

/**
 * Hook to detect if a media query matches
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return matches
}

/**
 * Hook to check if screen is mobile (< 768px)
 */
export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)")
}

/**
 * Hook to check if screen is tablet or larger (>= 768px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px)")
}

/**
 * Hook to check if screen is desktop (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)")
}

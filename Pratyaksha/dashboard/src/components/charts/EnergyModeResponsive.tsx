import { useIsMobile } from "../../hooks/useMediaQuery"
import { EnergyModeBubble } from "./EnergyModeBubble"
import { EnergyModeGroupedBar } from "./EnergyModeGroupedBar"

/**
 * Responsive Energy-Mode visualization
 * - Desktop (>= 768px): Shows bubble/scatter chart for detailed view
 * - Mobile (< 768px): Shows grouped bar chart for better readability
 */
export function EnergyModeResponsive() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <EnergyModeGroupedBar />
  }

  return <EnergyModeBubble />
}

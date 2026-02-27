import { useState, useRef } from "react"
import type { TouchEvent, ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

interface ChartItem {
  id: string
  name: string
  component: ReactNode
}

interface MobileChartCarouselProps {
  charts: ChartItem[]
}

export function MobileChartCarousel({ charts }: MobileChartCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const minSwipeDistance = 50

  const goNext = () => {
    setCurrentIndex((i) => (i + 1) % charts.length)
  }

  const goPrev = () => {
    setCurrentIndex((i) => (i - 1 + charts.length) % charts.length)
  }

  const goTo = (index: number) => {
    setCurrentIndex(index)
  }

  // Touch handlers for swipe
  const onTouchStart = (e: TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      goNext()
    } else if (isRightSwipe) {
      goPrev()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  const currentChart = charts[currentIndex]
  const prevChart = charts[(currentIndex - 1 + charts.length) % charts.length]
  const nextChart = charts[(currentIndex + 1) % charts.length]

  return (
    <div className="flex flex-col h-full">
      {/* Chart area - takes remaining space */}
      <div
        className="flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="h-full p-2">
          <div className="h-full rounded-md signal-card p-3 overflow-hidden">
            {/* Chart title */}
            <h3 className="text-sm font-semibold mb-2">{currentChart.name}</h3>
            {/* Chart content */}
            <div className="h-[calc(100%-2rem)] overflow-hidden">
              {currentChart.component}
            </div>
          </div>
        </div>
      </div>

      {/* Compact navigation bar - above the FAB */}
      <div className="flex items-center px-2 py-2 bg-background/80 backdrop-blur-sm border-t mb-16 w-full overflow-hidden">
        {/* Prev button */}
        <button
          onClick={goPrev}
          className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors w-16 flex-shrink-0"
          aria-label={`Previous: ${prevChart.name}`}
        >
          <ChevronLeft className="h-4 w-4 flex-shrink-0" />
          <span className="text-xs truncate">{prevChart.name}</span>
        </button>

        {/* Dot indicators */}
        <div className="flex items-center justify-center flex-1 overflow-hidden">
          {charts.map((chart, i) => (
            <button
              key={chart.id}
              onClick={() => goTo(i)}
              className="p-1.5 flex-shrink-0"
              aria-label={`Go to ${chart.name}`}
            >
              <span className={cn(
                "block w-1.5 h-1.5 rounded-full transition-colors",
                i === currentIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )} />
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={goNext}
          className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors w-16 flex-shrink-0 justify-end"
          aria-label={`Next: ${nextChart.name}`}
        >
          <span className="text-xs truncate">{nextChart.name}</span>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        </button>
      </div>
    </div>
  )
}

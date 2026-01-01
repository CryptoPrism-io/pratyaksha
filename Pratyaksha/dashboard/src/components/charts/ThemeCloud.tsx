import { useTagCloudData } from "../../hooks/useEntries"

export function ThemeCloud() {
  const { data, isLoading, error } = useTagCloudData()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Failed to load data
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  // Calculate font sizes based on frequency
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  const getFontSize = (value: number) => {
    const normalized = (value - minValue) / range
    return 12 + normalized * 20 // 12px to 32px
  }

  const getOpacity = (value: number) => {
    const normalized = (value - minValue) / range
    return 0.5 + normalized * 0.5 // 0.5 to 1.0
  }

  return (
    <div className="flex h-full flex-wrap items-center justify-center gap-2 p-4">
      {data.slice(0, 20).map((tag, index) => (
        <span
          key={tag.text}
          className="cursor-default rounded-lg px-2 py-1 transition-all hover:bg-primary/10"
          style={{
            fontSize: `${getFontSize(tag.value)}px`,
            opacity: getOpacity(tag.value),
            color: index < 5 ? "hsl(var(--primary))" : "hsl(var(--foreground))",
          }}
        >
          {tag.text}
        </span>
      ))}
    </div>
  )
}

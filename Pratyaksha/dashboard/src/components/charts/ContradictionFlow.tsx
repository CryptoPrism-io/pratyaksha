import { useSankeyData } from "../../hooks/useEntries"

export function ContradictionFlow() {
  const { data, isLoading, error } = useSankeyData()

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

  if (data.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  // Simplified flow visualization (Sankey would require D3)
  // For now, showing a summary
  const types = data.nodes.slice(0, 3).map((n) => n.name)
  const totalLinks = data.links.length

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-primary">{data.nodes.length}</p>
        <p className="text-sm text-muted-foreground">Unique Nodes</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-secondary">{totalLinks}</p>
        <p className="text-sm text-muted-foreground">Flow Connections</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {types.map((type) => (
          <span
            key={type}
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            {type}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Type → Contradiction → Mode
      </p>
    </div>
  )
}

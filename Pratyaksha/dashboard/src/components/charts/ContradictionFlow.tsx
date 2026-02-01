import { useMemo, useCallback, useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey"
import type { SankeyNode, SankeyLink } from "d3-sankey"
import { useSankeyData, useStats } from "../../hooks/useEntries"
import { useDateFilter } from "../../contexts/DateFilterContext"
import { useIsMobile } from "../../hooks/useMediaQuery"
import { EmptyState } from "../ui/empty-state"
import { useFilterAwareEmptyState } from "../../hooks/useFilterAwareEmptyState"
import { GitBranch } from "lucide-react"
import { ChartExplainer } from "./ChartExplainer"

// Node data with layer info
interface NodeData {
  name: string
  layer: "type" | "contradiction" | "mode"
}

// Extended types for d3-sankey
type SNode = SankeyNode<NodeData, object>

// Layer colors - Teal, Rose, Amber brand palette
const LAYER_COLORS: Record<string, string> = {
  type: "#14b8a6",         // Teal-500
  contradiction: "#f43f5e", // Rose-500
  mode: "#f59e0b",         // Amber-500
}

// Default fallback color
const DEFAULT_COLOR = "#888888"

export function ContradictionFlow() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useSankeyData()
  const { data: stats } = useStats()
  const { getDateRangeLabel } = useDateFilter()
  const { getEmptyStateProps } = useFilterAwareEmptyState()
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Prepare AI explainer data
  const explainerData = useMemo(() => {
    if (!data || data.nodes.length === 0) return null

    // Categorize nodes
    const allSources = data.links.map(l => typeof l.source === 'number' ? l.source : 0)
    const allTargets = data.links.map(l => typeof l.target === 'number' ? l.target : 0)
    const sourceOnly = new Set(allSources.filter(s => !allTargets.includes(s)))
    const targetOnly = new Set(allTargets.filter(t => !allSources.includes(t)))

    const types = data.nodes.filter((_, idx) => sourceOnly.has(idx)).map(n => n.name)
    const modes = data.nodes.filter((_, idx) => targetOnly.has(idx)).map(n => n.name)
    const contradictions = data.nodes.filter((_, idx) => !sourceOnly.has(idx) && !targetOnly.has(idx)).map(n => n.name)

    // Calculate most frequent contradictions
    const contradictionCounts: Record<string, number> = {}
    data.links.forEach(link => {
      const sourceName = data.nodes[typeof link.source === 'number' ? link.source : 0]?.name
      const targetName = data.nodes[typeof link.target === 'number' ? link.target : 0]?.name
      if (contradictions.includes(sourceName)) {
        contradictionCounts[sourceName] = (contradictionCounts[sourceName] || 0) + link.value
      }
      if (contradictions.includes(targetName)) {
        contradictionCounts[targetName] = (contradictionCounts[targetName] || 0) + link.value
      }
    })

    const topContradictions = Object.entries(contradictionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    return {
      flow: {
        types,
        contradictions,
        modes,
        topContradictions,
        linkCount: data.links.length
      }
    }
  }, [data])

  const explainerSummary = useMemo(() => {
    if (!stats) return undefined
    return {
      totalEntries: stats.totalEntries,
      dateRange: getDateRangeLabel(),
      topItems: explainerData?.flow?.topContradictions
    }
  }, [stats, getDateRangeLabel, explainerData])

  // Measure container width dynamically
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width && width > 0) setContainerWidth(width)
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Process data and create layer lookup map
  const { sankeyData, layerMap } = useMemo(() => {
    if (!data || data.nodes.length === 0 || containerWidth === 0) return { sankeyData: null, layerMap: new Map() }

    // Find where contradictions start and end
    const allSources = data.links.map(l => typeof l.source === 'number' ? l.source : 0)
    const allTargets = data.links.map(l => typeof l.target === 'number' ? l.target : 0)

    // Types are sources that are never targets
    const sourceOnly = new Set(allSources.filter(s => !allTargets.includes(s)))
    // Modes are targets that are never sources
    const targetOnly = new Set(allTargets.filter(t => !allSources.includes(t)))

    // Create layer lookup by node name
    const layers = new Map<string, "type" | "contradiction" | "mode">()

    const nodes: NodeData[] = data.nodes.map((node, idx) => {
      let layer: "type" | "contradiction" | "mode" = "contradiction"
      if (sourceOnly.has(idx)) layer = "type"
      else if (targetOnly.has(idx)) layer = "mode"
      layers.set(node.name, layer)
      return { name: node.name, layer }
    })

    // Use actual container width for full stretch
    const width = containerWidth
    const height = isMobile ? 300 : 350
    const nodeWidth = isMobile ? 8 : 14
    const nodePadding = isMobile ? 6 : 10

    const sankeyGenerator = sankey<NodeData, object>()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .nodeAlign(sankeyLeft)
      .extent([[60, 10], [width - 80, height - 10]])

    try {
      const result = sankeyGenerator({
        nodes: nodes.map(d => ({ ...d })),
        links: data.links.map(l => ({
          source: l.source,
          target: l.target,
          value: l.value,
        })),
      })
      return {
        sankeyData: { ...result, width, height },
        layerMap: layers
      }
    } catch (e) {
      console.error("Sankey error:", e)
      return { sankeyData: null, layerMap: layers }
    }
  }, [data, isMobile, containerWidth])

  // Get color for a node by looking up its name in the layer map
  const getNodeColor = useCallback((nodeName: string) => {
    const layer = layerMap.get(nodeName)
    return layer ? LAYER_COLORS[layer] : DEFAULT_COLOR
  }, [layerMap])

  // Get layer for a node
  const getNodeLayer = useCallback((nodeName: string) => {
    return layerMap.get(nodeName) || "contradiction"
  }, [layerMap])

  // Handle node click - navigate to logs with filter
  const handleNodeClick = useCallback((nodeName: string) => {
    const layer = layerMap.get(nodeName)
    const params = new URLSearchParams()

    if (layer === "type") {
      params.set("type", nodeName)
    } else if (layer === "contradiction") {
      params.set("contradiction", nodeName)
    } else if (layer === "mode") {
      params.set("mode", nodeName)
    }

    navigate(`/logs?${params.toString()}`)
  }, [navigate, layerMap])

  if (isLoading || containerWidth === 0) {
    return (
      <div ref={containerRef} className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div ref={containerRef} className="flex h-full items-center justify-center text-muted-foreground">
        Failed to load data
      </div>
    )
  }

  if (!sankeyData || sankeyData.nodes.length === 0) {
    const emptyProps = getEmptyStateProps({
      noDataTitle: "No contradiction patterns yet",
      noDataDescription: "Log entries with inner conflicts to visualize your thought patterns",
      filteredTitle: "No patterns in selected range",
      filteredDescription: "Try a different date range or log a new entry",
    })
    return (
      <div ref={containerRef} className="flex h-full items-center justify-center">
        <EmptyState icon={GitBranch} height="h-full" {...emptyProps} />
      </div>
    )
  }

  const { nodes, links, width, height } = sankeyData

  return (
    <div ref={containerRef} className={`flex flex-col h-full ${isMobile ? "-mx-1" : ""}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Links - curved paths connecting nodes */}
        <g className="links">
          {links.map((link, i) => {
            const sourceNode = link.source as SNode
            const targetNode = link.target as SNode

            if (!sourceNode || !targetNode) return null

            // Get link path using d3-sankey's link generator
            const linkGen = sankeyLinkHorizontal()
            const path = linkGen(link as SankeyLink<NodeData, object>)
            if (!path) return null

            // Make link width proportional but visible
            const linkWidth = Math.max(2, (link.width || 1) * 0.8)

            // Get color from source node name
            const sourceName = sourceNode.name || ""
            const linkColor = getNodeColor(sourceName)

            return (
              <path
                key={`link-${i}`}
                d={path}
                fill="none"
                stroke={linkColor}
                strokeWidth={linkWidth}
                opacity={0.4}
                className="transition-opacity duration-200 hover:opacity-80"
                style={{ cursor: "pointer" }}
              >
                <title>
                  {sourceName} → {targetNode.name || ""}: {link.value}
                </title>
              </path>
            )
          })}
        </g>

        {/* Nodes - rectangular bars */}
        <g className="nodes">
          {nodes.map((node, i) => {
            const n = node as SNode
            if (n.x0 === undefined || n.y0 === undefined || n.x1 === undefined || n.y1 === undefined) {
              return null
            }

            const nodeHeight = n.y1 - n.y0
            const rectWidth = n.x1 - n.x0
            const nodeName = n.name || ""
            const color = getNodeColor(nodeName)
            const layer = getNodeLayer(nodeName)

            // Show full labels - we have space now with full-width stretch
            const maxChars = isMobile ? 10 : 25
            const displayName = nodeName.length > maxChars
              ? nodeName.slice(0, maxChars - 1) + "…"
              : nodeName

            return (
              <g
                key={`node-${i}`}
                className="cursor-pointer"
                onClick={() => handleNodeClick(nodeName)}
              >
                <rect
                  x={n.x0}
                  y={n.y0}
                  width={rectWidth}
                  height={nodeHeight}
                  fill={color}
                  rx={2}
                  className="transition-opacity hover:opacity-80"
                >
                  <title>{nodeName} ({n.value || 0})</title>
                </rect>

                {/* Node label - positioned based on layer */}
                {nodeHeight >= (isMobile ? 8 : 12) && (
                  <text
                    x={layer === "mode" ? (n.x1 || 0) + 5 : (n.x0 || 0) - 5}
                    y={(n.y0 + n.y1) / 2}
                    dy="0.35em"
                    textAnchor={layer === "mode" ? "start" : "end"}
                    fontSize={isMobile ? 7 : 10}
                    fill="currentColor"
                    className="pointer-events-none opacity-90"
                  >
                    {displayName}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Legend with AI Explainer */}
      <div className="flex justify-center items-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: LAYER_COLORS.type }} />
          <span>Type</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: LAYER_COLORS.contradiction }} />
          <span>Contradiction</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: LAYER_COLORS.mode }} />
          <span>Mode</span>
        </div>
        {/* AI Explainer Button */}
        {explainerData && !isMobile && (
          <ChartExplainer
            chartType="contradictionFlow"
            chartData={explainerData}
            summary={explainerSummary}
          />
        )}
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-1">
        Click a node to filter logs
      </p>
    </div>
  )
}

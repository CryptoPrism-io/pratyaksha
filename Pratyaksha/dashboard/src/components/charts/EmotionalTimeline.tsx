import { useState } from "react"
import { createPortal } from "react-dom"
import {
  ComposedChart,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import { useEnrichedTimelineData } from "../../hooks/useEntries"
import { Skeleton } from "../ui/skeleton"
import { AlertCircle, RefreshCw, X, TrendingUp } from "lucide-react"
import { EmptyState } from "../ui/empty-state"
import { useFilterAwareEmptyState } from "../../hooks/useFilterAwareEmptyState"
import { useIsMobile } from "../../hooks/useMediaQuery"
import type { EnrichedTimelineEntry } from "../../lib/transforms"

// Sentiment color palette
const SENTIMENT_COLORS = {
  positive: "#22c55e",  // Green
  negative: "#ef4444",  // Red
  neutral: "#6b7280",   // Gray
}

// Get dot radius based on entry length
function getRadiusFromLength(length: number, isMobile: boolean): number {
  const base = isMobile ? 4 : 6
  if (length > 100) return base + 4
  if (length > 30) return base + 2
  return base
}

// Custom dot component for scatter plot
interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: EnrichedTimelineEntry
  isMobile?: boolean
}

function CustomDot({ cx, cy, payload, isMobile = false }: CustomDotProps) {
  if (!cx || !cy || !payload) return null

  const radius = getRadiusFromLength(payload.entryLength, isMobile)
  const fillColor = SENTIMENT_COLORS[payload.sentimentCategory]

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={fillColor}
      fillOpacity={0.85}
      stroke="white"
      strokeWidth={1.5}
      style={{ cursor: "pointer" }}
      className="transition-transform duration-150 hover:scale-125"
    />
  )
}

// Simple tooltip - just shows basic info, no interactive elements
interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: EnrichedTimelineEntry }>
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null

  const entry = payload[0].payload
  const sentimentColor = SENTIMENT_COLORS[entry.sentimentCategory]

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg pointer-events-none">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: sentimentColor }}
        />
        <span className="text-sm font-medium">{entry.sentimentLabel}</span>
        <span className="text-xs text-muted-foreground">
          {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{entry.mode} · Click to view</p>
    </div>
  )
}

// Entry detail modal
interface EntryModalProps {
  entry: EnrichedTimelineEntry
  onClose: () => void
}

function EntryModal({ entry, onClose }: EntryModalProps) {
  const sentimentColor = SENTIMENT_COLORS[entry.sentimentCategory]

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl glass-card p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{entry.name}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(entry.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close entry details"
              className="rounded-full p-2 hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="rounded-full px-3 py-1 text-sm font-medium"
              style={{ backgroundColor: sentimentColor + "20", color: sentimentColor }}
            >
              {entry.sentimentLabel}
            </span>
            <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
              {entry.mode}
            </span>
            {entry.energyShape && (
              <span className="rounded-full bg-muted px-3 py-1 text-sm">
                {entry.energyShape}
              </span>
            )}
          </div>

          {/* Entry Text */}
          <div className="mb-4 rounded-lg bg-muted/50 p-4 max-h-48 overflow-y-auto">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {entry.text || "No content"}
            </p>
          </div>

          {/* AI Insights */}
          {entry.actionableInsightsAI && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-xs font-medium text-primary mb-1">AI Insight</p>
              <p className="text-sm text-foreground">{entry.actionableInsightsAI}</p>
            </div>
          )}

          {/* Theme Tags */}
          {entry.themeTagsAI.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.themeTagsAI.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Skeleton loader
function TimelineSkeleton() {
  return (
    <div className="h-[280px] w-full space-y-4 p-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="flex justify-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

// Sentiment legend component
function SentimentLegend() {
  return (
    <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: SENTIMENT_COLORS.positive }}
        />
        <span>Positive</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: SENTIMENT_COLORS.neutral }}
        />
        <span>Neutral</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: SENTIMENT_COLORS.negative }}
        />
        <span>Negative</span>
      </div>
    </div>
  )
}

export function EmotionalTimeline() {
  const { data, isLoading, error, refetch } = useEnrichedTimelineData()
  const { getEmptyStateProps } = useFilterAwareEmptyState()
  const isMobile = useIsMobile()
  const [selectedEntry, setSelectedEntry] = useState<EnrichedTimelineEntry | null>(null)

  if (isLoading) {
    return <TimelineSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Failed to load timeline</p>
        <button
          onClick={() => refetch?.()}
          className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    )
  }

  if (data.entries.length === 0) {
    const emptyProps = getEmptyStateProps({
      noDataTitle: "No timeline data yet",
      noDataDescription: "Start logging entries to see your emotional pulse over time",
      filteredTitle: "No entries in selected range",
      filteredDescription: "Try a different date range or log a new entry",
    })
    return <EmptyState icon={TrendingUp} height="h-[280px]" {...emptyProps} />
  }

  const { entries } = data

  // Handle dot click
  const handleDotClick = (dotData: { payload: EnrichedTimelineEntry }) => {
    setSelectedEntry(dotData.payload)
  }

  // Chart margins
  const chartMargin = isMobile
    ? { top: 10, right: 15, left: 0, bottom: 0 }
    : { top: 15, right: 25, left: 10, bottom: 0 }

  // Calculate tick positions for x-axis (show ~5-6 date labels evenly spaced)
  const totalEntries = entries.length
  const tickInterval = Math.max(1, Math.floor(totalEntries / 5))
  const xTicks = entries
    .filter((_, i) => i % tickInterval === 0 || i === totalEntries - 1)
    .map(e => e.entryIndex)

  return (
    <div className={isMobile ? "-mx-2" : ""}>
      <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
        <ComposedChart data={entries} margin={chartMargin}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
            horizontal={true}
            vertical={false}
          />

          <XAxis
            dataKey="entryIndex"
            type="number"
            domain={[0, totalEntries - 1]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={isMobile ? 9 : 11}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={isMobile ? 45 : 55}
            ticks={xTicks}
            tickFormatter={(value) => {
              const entry = entries.find(e => e.entryIndex === value)
              if (!entry) return ""
              const date = new Date(entry.timestamp || entry.date)
              return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            }}
          />

          <YAxis
            dataKey="sentiment"
            type="number"
            domain={[-1.3, 1.3]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={isMobile ? 8 : 10}
            tickLine={false}
            axisLine={false}
            width={isMobile ? 50 : 60}
            ticks={[1, 0, -1]}
            tickFormatter={(value) => {
              if (value === 1) return "Positive"
              if (value === 0) return "Neutral"
              if (value === -1) return "Negative"
              return ""
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Reference lines for sentiment bands */}
          <ReferenceLine y={1} stroke="hsl(var(--positive))" strokeOpacity={0.2} />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.4} />
          <ReferenceLine y={-1} stroke="hsl(var(--negative))" strokeOpacity={0.2} />

          {/* Individual entry dots - connected by a subtle line */}
          <Area
            type="monotone"
            dataKey="sentiment"
            stroke="hsl(var(--primary))"
            strokeWidth={1}
            strokeOpacity={0.3}
            fill="url(#trendGradient)"
            animationDuration={800}
            dot={false}
          />

          {/* Scatter dots on top */}
          <Scatter
            dataKey="sentiment"
            onClick={handleDotClick}
            shape={(props: CustomDotProps) => <CustomDot {...props} isMobile={isMobile} />}
          >
            {entries.map((entry) => (
              <Cell
                key={entry.id}
                fill={SENTIMENT_COLORS[entry.sentimentCategory]}
              />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>

      {/* Sentiment Legend */}
      <SentimentLegend />

      {/* Entry Modal */}
      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  )
}

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useEntries } from "../../hooks/useEntries"
import {
  toTagCloudDataEnriched,
  type TagSortBy,
  type TagLimit,
  type TagSentimentFilter
} from "../../lib/transforms"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { EmptyState } from "../ui/empty-state"
import { useFilterAwareEmptyState } from "../../hooks/useFilterAwareEmptyState"
import { Tags } from "lucide-react"

type ViewMode = "cloud" | "list" | "compact"

export function ThemeCloud() {
  const navigate = useNavigate()
  const { data: entries, isLoading, error } = useEntries()
  const { getEmptyStateProps } = useFilterAwareEmptyState()

  // Filter state
  const [viewMode, setViewMode] = useState<ViewMode>("cloud")
  const [sortBy, setSortBy] = useState<TagSortBy>("frequency")
  const [limit, setLimit] = useState<TagLimit>(20)
  const [sentiment, setSentiment] = useState<TagSentimentFilter>("all")

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <FilterHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          limit={limit}
          setLimit={setLimit}
          sentiment={sentiment}
          setSentiment={setSentiment}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col">
        <FilterHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          limit={limit}
          setLimit={setLimit}
          sentiment={sentiment}
          setSentiment={setSentiment}
        />
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Failed to load data
        </div>
      </div>
    )
  }

  // Transform data with current options
  const data = entries
    ? toTagCloudDataEnriched(entries, { sortBy, limit, sentiment })
    : []

  if (data.length === 0) {
    const emptyProps = getEmptyStateProps({
      noDataTitle: "No themes found",
      noDataDescription: "Log entries with rich content to discover recurring themes",
      filteredTitle: "No themes in selected range",
      filteredDescription: "Try a different date range or log a new entry",
    })
    return (
      <div className="flex h-full flex-col">
        <FilterHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          limit={limit}
          setLimit={setLimit}
          sentiment={sentiment}
          setSentiment={setSentiment}
        />
        <EmptyState icon={Tags} height="h-full" className="flex-1" {...emptyProps} />
      </div>
    )
  }

  // Handle tag click - navigate to logs with tag filter
  const handleTagClick = (tag: string) => {
    navigate(`/logs?tag=${encodeURIComponent(tag)}`)
  }

  // Calculate font sizes for cloud view
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  const getFontSize = (value: number) => {
    const normalized = (value - minValue) / range
    return 12 + normalized * 20 // 12px to 32px
  }

  const getOpacity = (value: number) => {
    const normalized = (value - minValue) / range
    return 0.6 + normalized * 0.4 // 0.6 to 1.0
  }

  return (
    <div className="flex h-full flex-col">
      <FilterHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        limit={limit}
        setLimit={setLimit}
        sentiment={sentiment}
        setSentiment={setSentiment}
      />

      <div className="flex-1 overflow-auto p-3">
        {viewMode === "cloud" && (
          <CloudView
            data={data}
            getFontSize={getFontSize}
            getOpacity={getOpacity}
            onTagClick={handleTagClick}
          />
        )}
        {viewMode === "list" && (
          <ListView data={data} onTagClick={handleTagClick} />
        )}
        {viewMode === "compact" && (
          <CompactView data={data} onTagClick={handleTagClick} />
        )}
      </div>
    </div>
  )
}

// Filter header component
interface FilterHeaderProps {
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  sortBy: TagSortBy
  setSortBy: (v: TagSortBy) => void
  limit: TagLimit
  setLimit: (v: TagLimit) => void
  sentiment: TagSentimentFilter
  setSentiment: (v: TagSentimentFilter) => void
}

function FilterHeader({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  limit,
  setLimit,
  sentiment,
  setSentiment,
}: FilterHeaderProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-white/10 px-3 py-2">
      <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <SelectTrigger className="h-7 w-[90px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cloud">Cloud</SelectItem>
          <SelectItem value="list">List</SelectItem>
          <SelectItem value="compact">Compact</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(v) => setSortBy(v as TagSortBy)}>
        <SelectTrigger className="h-7 w-[100px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="frequency">Frequency</SelectItem>
          <SelectItem value="alphabetical">A-Z</SelectItem>
          <SelectItem value="recent">Recent</SelectItem>
        </SelectContent>
      </Select>

      <Select value={String(limit)} onValueChange={(v) => setLimit(v === "all" ? "all" : Number(v) as TagLimit)}>
        <SelectTrigger className="h-7 w-[80px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">Top 10</SelectItem>
          <SelectItem value="20">Top 20</SelectItem>
          <SelectItem value="30">Top 30</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sentiment} onValueChange={(v) => setSentiment(v as TagSentimentFilter)}>
        <SelectTrigger className="h-7 w-[90px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="positive">Positive</SelectItem>
          <SelectItem value="neutral">Neutral</SelectItem>
          <SelectItem value="negative">Negative</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

// Cloud view - variable font sizes
interface CloudViewProps {
  data: Array<{ text: string; value: number }>
  getFontSize: (value: number) => number
  getOpacity: (value: number) => number
  onTagClick: (tag: string) => void
}

function CloudView({ data, getFontSize, getOpacity, onTagClick }: CloudViewProps) {
  return (
    <div className="flex h-full flex-wrap items-center justify-center gap-2">
      {data.map((tag, index) => (
        <button
          key={tag.text}
          onClick={() => onTagClick(tag.text)}
          className="cursor-pointer rounded-lg px-2 py-1 transition-all hover:bg-primary/20 hover:scale-105"
          style={{
            fontSize: `${getFontSize(tag.value)}px`,
            opacity: getOpacity(tag.value),
            color: index < 5 ? "hsl(var(--primary))" : "hsl(var(--foreground))",
          }}
        >
          {tag.text}
        </button>
      ))}
    </div>
  )
}

// List view - vertical list with counts
interface ListViewProps {
  data: Array<{ text: string; value: number }>
  onTagClick: (tag: string) => void
}

function ListView({ data, onTagClick }: ListViewProps) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="space-y-1">
      {data.map((tag, index) => {
        const barWidth = (tag.value / maxValue) * 100
        return (
          <button
            key={tag.text}
            onClick={() => onTagClick(tag.text)}
            className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-all hover:bg-primary/10"
          >
            <span className="w-6 text-xs text-muted-foreground">
              {index + 1}.
            </span>
            <span className="flex-1 text-sm group-hover:text-primary">
              {tag.text}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary/60"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-muted-foreground">
                {tag.value}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Compact view - horizontal pill badges
interface CompactViewProps {
  data: Array<{ text: string; value: number }>
  onTagClick: (tag: string) => void
}

function CompactView({ data, onTagClick }: CompactViewProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {data.map((tag) => (
        <button
          key={tag.text}
          onClick={() => onTagClick(tag.text)}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs transition-all hover:bg-primary/20 hover:scale-105"
        >
          <span>{tag.text}</span>
          <span className="text-muted-foreground">({tag.value})</span>
        </button>
      ))}
    </div>
  )
}

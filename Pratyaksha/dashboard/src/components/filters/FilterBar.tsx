import { useState, type RefObject } from "react"
import { Search, X, Calendar, Filter, RefreshCw, Star } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { cn } from "../../lib/utils"
import { ExportButton } from "../ui/export-button"
import type { Entry } from "../../lib/airtable"

export interface FilterState {
  search: string
  dateRange: "all" | "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth" | "7" | "30" | "custom"
  type: string
  sentiment: string
  mode: string
  energy: string
  bookmarked: "all" | "bookmarked" | "not-bookmarked"
}

interface FilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableTypes: string[]
  availableModes: string[]
  availableEnergies?: string[]
  className?: string
  searchInputRef?: RefObject<HTMLInputElement>
  entries?: Entry[]
  filteredCount?: number
  onRefresh?: () => void
  isRefreshing?: boolean
}

const DATE_RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisWeek", label: "This Week" },
  { value: "lastWeek", label: "Last Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "30", label: "Last 30 days" },
  { value: "all", label: "All time" },
]

const SENTIMENT_OPTIONS = [
  { value: "all", label: "All sentiments" },
  { value: "Positive", label: "Positive" },
  { value: "Negative", label: "Negative" },
  { value: "Neutral", label: "Neutral" },
]

const BOOKMARK_OPTIONS = [
  { value: "all", label: "All entries" },
  { value: "bookmarked", label: "Bookmarked only" },
  { value: "not-bookmarked", label: "Not bookmarked" },
]

export function FilterBar({
  filters,
  onFiltersChange,
  availableTypes,
  availableModes,
  availableEnergies = [],
  className,
  searchInputRef,
  entries = [],
  filteredCount,
  onRefresh,
  isRefreshing = false,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      dateRange: "thisWeek",
      type: "all",
      sentiment: "all",
      mode: "all",
      energy: "all",
      bookmarked: "all",
    })
  }

  const activeFilterCount = [
    filters.search !== "",
    filters.dateRange !== "all",
    filters.type !== "all",
    filters.sentiment !== "all",
    filters.mode !== "all",
    filters.energy !== "all",
    filters.bookmarked !== "all",
  ].filter(Boolean).length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main filter row — always a single row; icon-only on mobile */}
      <div className="flex flex-row items-center gap-1.5 sm:gap-2">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search…"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search entries"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Date range dropdown — icon-only on mobile */}
        <Select
          value={filters.dateRange}
          onValueChange={(value) => updateFilter("dateRange", value as FilterState["dateRange"])}
        >
          <SelectTrigger
            className="w-9 sm:w-[160px] h-9 sm:h-auto sm:min-h-[44px] shrink-0 px-0 sm:px-3 justify-center sm:justify-between"
            aria-label="Select date range"
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="hidden sm:flex items-center gap-1 ml-1 flex-1 truncate">
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bookmark toggle — icon-only on mobile */}
        <Button
          variant={filters.bookmarked === "bookmarked" ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter("bookmarked", filters.bookmarked === "bookmarked" ? "all" : "bookmarked")}
          className={cn(
            "h-9 w-9 sm:h-auto sm:w-auto sm:min-h-[44px] sm:min-w-[44px] px-0 sm:px-3 shrink-0",
            filters.bookmarked === "bookmarked" && "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
          )}
          aria-label={filters.bookmarked === "bookmarked" ? "Show all entries" : "Show bookmarked only"}
        >
          <Star className={cn("h-4 w-4", filters.bookmarked === "bookmarked" && "fill-current")} />
          <span className="hidden sm:inline sm:ml-2">Starred</span>
        </Button>

        {/* Refresh button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 sm:h-auto sm:min-h-[44px] sm:min-w-[44px] px-0 sm:px-2 shrink-0"
            aria-label="Refresh entries"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        )}

        {/* Filter popover — icon-only on mobile */}
        <Popover open={isExpanded} onOpenChange={setIsExpanded}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 sm:h-auto sm:min-h-[44px] sm:min-w-[44px] px-0 sm:px-3 shrink-0 relative"
              aria-label="Toggle advanced filters"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-2 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[10px] sm:text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>

              {/* Type filter with tooltip (#2 Quick Win) */}
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-sm font-medium cursor-help flex items-center gap-1">
                        Entry Type
                        <span className="text-muted-foreground text-xs">(hover for info)</span>
                      </label>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">Filter by entry category like Emotional, Work, Health, etc. Based on AI classification.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select
                  value={filters.type}
                  onValueChange={(value) => updateFilter("type", value)}
                >
                  <SelectTrigger aria-label="Filter by entry type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sentiment filter with tooltip */}
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-sm font-medium cursor-help">Sentiment</label>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">Filter by emotional tone: Positive (uplifting), Negative (challenging), or Neutral (balanced).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select
                  value={filters.sentiment}
                  onValueChange={(value) => updateFilter("sentiment", value)}
                >
                  <SelectTrigger aria-label="Filter by sentiment">
                    <SelectValue placeholder="All sentiments" />
                  </SelectTrigger>
                  <SelectContent>
                    {SENTIMENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode filter with tooltip */}
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-sm font-medium cursor-help">Cognitive Mode</label>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">Your mental state when writing: Hopeful, Calm, Anxious, Reflective, etc. AI-inferred from your words.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select
                  value={filters.mode}
                  onValueChange={(value) => updateFilter("mode", value)}
                >
                  <SelectTrigger aria-label="Filter by cognitive mode">
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All modes</SelectItem>
                    {availableModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Energy filter with tooltip */}
              {availableEnergies.length > 0 && (
                <div className="space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label className="text-sm font-medium cursor-help">Energy Level</label>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-sm">Your energy state: High, Balanced, Low, Scattered, etc. Reflects your vitality at time of writing.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Select
                    value={filters.energy}
                    onValueChange={(value) => updateFilter("energy", value)}
                  >
                    <SelectTrigger aria-label="Filter by energy level">
                      <SelectValue placeholder="All energy levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All energy levels</SelectItem>
                      {availableEnergies.map((energy) => (
                        <SelectItem key={energy} value={energy}>
                          {energy}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Bookmark filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Bookmarked
                </label>
                <Select
                  value={filters.bookmarked}
                  onValueChange={(value) => updateFilter("bookmarked", value as FilterState["bookmarked"])}
                >
                  <SelectTrigger aria-label="Filter by bookmark status">
                    <SelectValue placeholder="All entries" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKMARK_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear all button */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear all filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Export button */}
        {entries.length > 0 && (
          <ExportButton
            entries={entries}
            filteredCount={filteredCount}
            className="h-9 w-9 sm:h-auto sm:w-auto sm:min-h-[44px] px-0 sm:px-3 shrink-0"
          />
        )}

        {/* Clear All — icon-only on mobile, hidden when no active filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 w-9 sm:h-auto sm:w-auto sm:min-h-[44px] px-0 sm:px-2 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-1">Clear</span>
          </Button>
        )}
      </div>

      {/* Active filter pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-row flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground shrink-0">Filters:</span>
          {filters.search && (
            <FilterPill
              label={`Search: "${filters.search}"`}
              onRemove={() => updateFilter("search", "")}
            />
          )}
          {filters.dateRange !== "all" && (
            <FilterPill
              label={DATE_RANGE_OPTIONS.find(o => o.value === filters.dateRange)?.label || ""}
              onRemove={() => updateFilter("dateRange", "all")}
            />
          )}
          {filters.type !== "all" && (
            <FilterPill
              label={`Type: ${filters.type}`}
              onRemove={() => updateFilter("type", "all")}
            />
          )}
          {filters.sentiment !== "all" && (
            <FilterPill
              label={`Sentiment: ${filters.sentiment}`}
              onRemove={() => updateFilter("sentiment", "all")}
            />
          )}
          {filters.mode !== "all" && (
            <FilterPill
              label={`Mode: ${filters.mode}`}
              onRemove={() => updateFilter("mode", "all")}
            />
          )}
          {filters.energy !== "all" && (
            <FilterPill
              label={`Energy: ${filters.energy}`}
              onRemove={() => updateFilter("energy", "all")}
            />
          )}
          {filters.bookmarked !== "all" && (
            <FilterPill
              label={BOOKMARK_OPTIONS.find(o => o.value === filters.bookmarked)?.label || ""}
              onRemove={() => updateFilter("bookmarked", "all")}
            />
          )}
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-sm min-h-[44px]">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 rounded-full p-1 hover:bg-muted min-w-[36px] min-h-[36px] flex items-center justify-center"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-4 w-4" />
      </button>
    </span>
  )
}

import { useState, type RefObject } from "react"
import { Search, X, Calendar, Filter, RefreshCw } from "lucide-react"
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
import { cn } from "../../lib/utils"
import { ExportButton } from "../ui/export-button"
import type { Entry } from "../../lib/airtable"

export interface FilterState {
  search: string
  dateRange: "all" | "7" | "30" | "90" | "custom"
  type: string
  sentiment: string
  mode: string
  energy: string
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
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
]

const SENTIMENT_OPTIONS = [
  { value: "all", label: "All sentiments" },
  { value: "Positive", label: "Positive" },
  { value: "Negative", label: "Negative" },
  { value: "Neutral", label: "Neutral" },
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
      dateRange: "all",
      type: "all",
      sentiment: "all",
      mode: "all",
      energy: "all",
    })
  }

  const activeFilterCount = [
    filters.search !== "",
    filters.dateRange !== "all",
    filters.type !== "all",
    filters.sentiment !== "all",
    filters.mode !== "all",
    filters.energy !== "all",
  ].filter(Boolean).length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main filter row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search entries... (press / to focus)"
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

        {/* Date range quick buttons - visible on larger screens */}
        <div className="hidden md:flex items-center gap-1">
          {DATE_RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={filters.dateRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("dateRange", option.value as FilterState["dateRange"])}
              className="min-h-[36px]"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Mobile date range dropdown */}
        <div className="flex md:hidden">
          <Select
            value={filters.dateRange}
            onValueChange={(value) => updateFilter("dateRange", value as FilterState["dateRange"])}
          >
            <SelectTrigger className="w-full" aria-label="Select date range">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="min-h-[36px] min-w-[36px] px-2"
            aria-label="Refresh entries"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        )}

        {/* Filter toggle button */}
        <Popover open={isExpanded} onOpenChange={setIsExpanded}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[36px] min-w-[100px]"
              aria-label="Toggle advanced filters"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>

              {/* Type filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Entry Type</label>
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

              {/* Sentiment filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sentiment</label>
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

              {/* Mode filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cognitive Mode</label>
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

              {/* Energy filter */}
              {availableEnergies.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Energy Level</label>
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
            className="min-h-[36px]"
          />
        )}
      </div>

      {/* Active filter pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
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
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-muted"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

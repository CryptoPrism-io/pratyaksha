import { useDateFilter } from "../contexts/DateFilterContext"
import { useEntriesRaw } from "./useEntries"

/**
 * Hook that provides filter-aware empty state configuration.
 * Returns different messages and actions based on whether:
 * 1. There's no data at all (show "Log Entry")
 * 2. Filters are active but no matches (show "Clear Filters" + "Log Entry")
 */
export function useFilterAwareEmptyState() {
  const { preset, setPreset } = useDateFilter()
  const { data: allEntries } = useEntriesRaw()

  const hasAnyData = allEntries && allEntries.length > 0
  const isFiltered = preset !== "all"

  const clearFilters = () => setPreset("all")

  // If we have data but filters are hiding it
  const isFilteredEmpty = hasAnyData && isFiltered

  return {
    isFiltered,
    hasAnyData,
    isFilteredEmpty,
    clearFilters,
    // Helper to get appropriate empty state props
    getEmptyStateProps: (config: {
      noDataTitle: string
      noDataDescription: string
      filteredTitle?: string
      filteredDescription?: string
    }) => {
      if (isFilteredEmpty) {
        return {
          title: config.filteredTitle || "No data in selected range",
          description: config.filteredDescription || "Try adjusting your date filter or log a new entry",
          secondaryAction: { label: "Clear Filters", onClick: clearFilters },
          action: { label: "Log Entry", href: "/logs" },
        }
      }
      return {
        title: config.noDataTitle,
        description: config.noDataDescription,
        action: { label: "Log Entry", href: "/logs" },
      }
    },
  }
}

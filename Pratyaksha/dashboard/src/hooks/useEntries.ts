import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { fetchEntries, createEntry, type CreateEntryInput } from "../lib/airtable"
import {
  toTimelineData,
  toEnrichedTimelineData,
  toModeDistribution,
  toEnergyShapeData,
  toTypeDistribution,
  toCalendarData,
  toTagCloudData,
  toContradictionData,
  toSankeyData,
  calculateStats,
} from "../lib/transforms"
import { useDateFilter } from "../contexts/DateFilterContext"
import { isDateInRange } from "../lib/dateFilters"

// Fetch all entries (unfiltered)
export function useEntriesRaw() {
  return useQuery({
    queryKey: ["entries"],
    queryFn: fetchEntries,
    staleTime: 1000 * 30,       // 30 seconds
    refetchInterval: 1000 * 30, // Poll every 30 seconds
    refetchOnWindowFocus: true, // Refresh when switching back to tab
  })
}

// Entries filtered by global date filter
export function useEntries() {
  const { data: entries, ...rest } = useEntriesRaw()
  const { dateRange } = useDateFilter()

  const filtered = useMemo(() => {
    if (!entries) return undefined
    if (!dateRange) return entries // "all" preset
    return entries.filter((entry) => isDateInRange(entry.date, dateRange))
  }, [entries, dateRange])

  return {
    data: filtered,
    ...rest,
  }
}

export function useTimelineData() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toTimelineData(entries) : [],
    ...rest,
  }
}

export function useEnrichedTimelineData() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toEnrichedTimelineData(entries) : { entries: [], trend: [], dateLabels: [] },
    ...rest,
  }
}

export function useModeDistribution() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toModeDistribution(entries) : [],
    ...rest,
  }
}

export function useEnergyShapeData() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toEnergyShapeData(entries) : [],
    ...rest,
  }
}

export function useTypeDistribution() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toTypeDistribution(entries) : [],
    ...rest,
  }
}

export function useCalendarData() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toCalendarData(entries) : [],
    ...rest,
  }
}

export function useTagCloudData() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toTagCloudData(entries) : [],
    ...rest,
  }
}

export function useContradictionData() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toContradictionData(entries) : [],
    ...rest,
  }
}

export function useSankeyData() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toSankeyData(entries) : { nodes: [], links: [] },
    ...rest,
  }
}

export function useStats() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? calculateStats(entries) : null,
    ...rest,
  }
}

// Filter hook
export function useFilteredEntries(filter?: {
  type?: string
  mode?: string
  dateRange?: { start: string; end: string }
}) {
  const { data: entries, ...rest } = useEntries()

  const filtered = entries?.filter((entry) => {
    if (filter?.type && entry.type !== filter.type) return false
    if (filter?.mode && entry.inferredMode !== filter.mode) return false
    if (filter?.dateRange) {
      const entryDate = new Date(entry.date)
      const start = new Date(filter.dateRange.start)
      const end = new Date(filter.dateRange.end)
      if (entryDate < start || entryDate > end) return false
    }
    return true
  })

  return {
    data: filtered || [],
    ...rest,
  }
}

// Create entry mutation hook
export function useCreateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEntryInput) => createEntry(input),
    onSuccess: () => {
      // Invalidate and refetch entries after successful creation
      queryClient.invalidateQueries({ queryKey: ["entries"] })
    },
  })
}

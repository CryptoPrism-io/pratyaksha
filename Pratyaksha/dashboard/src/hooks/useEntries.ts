import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import {
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  toggleBookmark,
  type CreateEntryInput,
  type UpdateEntryInput,
} from "../lib/airtable"
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

// Entries filtered by global date filter and excluding deleted
export function useEntries() {
  const { data: entries, ...rest } = useEntriesRaw()
  const { dateRange } = useDateFilter()

  const filtered = useMemo(() => {
    if (!entries) return undefined
    
    // Start by filtering out deleted entries
    let result = entries.filter((entry) => !entry.isDeleted)
    
    // Apply date filter if set
    if (dateRange) {
      result = result.filter((entry) => isDateInRange(entry.date, dateRange))
    }
    
    return result
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

// Update entry mutation hook (triggers AI re-analysis)
export function useUpdateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateEntryInput) => updateEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] })
    },
  })
}

// Delete entry mutation hook (soft delete)
export function useDeleteEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recordId: string) => deleteEntry(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] })
    },
  })
}

// Toggle bookmark mutation hook
export function useToggleBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordId, bookmarked }: { recordId: string; bookmarked: boolean }) =>
      toggleBookmark(recordId, bookmarked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] })
    },
  })
}

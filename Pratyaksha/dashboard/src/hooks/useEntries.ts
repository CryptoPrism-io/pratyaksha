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
  toEnergyShapePercentages,
  toTypeDistribution,
  toCalendarData,
  toTagCloudData,
  toContradictionData,
  toSankeyData,
  calculateStats,
} from "../lib/transforms"
import { useDateFilter } from "../contexts/DateFilterContext"
import { isDateInRange } from "../lib/dateFilters"
import { useAuth } from "../contexts/AuthContext"
import { useDemoPersona } from "../contexts/DemoPersonaContext"

// Fetch all entries (filtered by logged-in user or demo persona)
export function useEntriesRaw() {
  const { user } = useAuth()
  const { persona } = useDemoPersona()
  const userId = user?.uid

  return useQuery({
    queryKey: ["entries", userId, persona],
    queryFn: () => fetchEntries(userId, persona),
    staleTime: 1000 * 30,       // 30 seconds
    refetchInterval: 1000 * 30, // Poll every 30 seconds
    refetchOnWindowFocus: true, // Refresh when switching back to tab
    enabled: true, // Always enabled - shows demo data if no user, user's entries if logged in
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

// Energy shape data with percentages of grand total and benchmark status
export function useEnergyShapePercentages() {
  const { data: entries, ...rest } = useEntries()
  return {
    data: entries ? toEnergyShapePercentages(entries) : [],
    totalEntries: entries?.length || 0,
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
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<CreateEntryInput, "userId">) =>
      createEntry({ ...input, userId: user?.uid }),
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

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
  type Entry,
  type EntryFormat,
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

// ========== Decomposition Hooks ==========

// Entry with children grouped together
export interface EntryWithChildren extends Entry {
  children: Entry[]
}

/**
 * Get entries organized by parent-child relationships
 * Parent entries include their child entries, orphan entries stand alone
 */
export function useEntriesWithDecomposition() {
  const { data: entries, ...rest } = useEntries()

  const organized = useMemo(() => {
    if (!entries) return { parents: [], standalone: [] }

    // Separate entries into parents, children, and standalone
    const parentMap = new Map<string, EntryWithChildren>()
    const childrenByParent = new Map<string, Entry[]>()
    const standalone: Entry[] = []

    // First pass: identify structure
    for (const entry of entries) {
      if (entry.isDecomposed) {
        // This is a parent entry
        parentMap.set(entry.id, { ...entry, children: [] })
      } else if (entry.parentEntryId) {
        // This is a child entry
        const existing = childrenByParent.get(entry.parentEntryId) || []
        existing.push(entry)
        childrenByParent.set(entry.parentEntryId, existing)
      } else {
        // This is a standalone entry
        standalone.push(entry)
      }
    }

    // Second pass: attach children to parents
    for (const [parentId, children] of childrenByParent) {
      const parent = parentMap.get(parentId)
      if (parent) {
        // Sort children by sequence order
        parent.children = children.sort(
          (a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0)
        )
      } else {
        // Parent not found (maybe filtered out), treat children as standalone
        standalone.push(...children)
      }
    }

    // Convert parent map to array, sorted by date (newest first)
    const parents = Array.from(parentMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return { parents, standalone }
  }, [entries])

  return {
    data: organized,
    ...rest,
  }
}

/**
 * Get child entries for a specific parent entry
 */
export function useChildEntries(parentId: string | null) {
  const { data: entries, ...rest } = useEntries()

  const children = useMemo(() => {
    if (!entries || !parentId) return []

    return entries
      .filter((entry) => entry.parentEntryId === parentId)
      .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0))
  }, [entries, parentId])

  return {
    data: children,
    ...rest,
  }
}

/**
 * Get entry format distribution data
 */
export function useFormatDistribution() {
  const { data: entries, ...rest } = useEntries()

  const distribution = useMemo(() => {
    if (!entries) return []

    const counts: Record<string, number> = {}
    for (const entry of entries) {
      const format = entry.entryFormat || "Quick Log"
      counts[format] = (counts[format] || 0) + 1
    }

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [entries])

  return {
    data: distribution,
    ...rest,
  }
}

/**
 * Filter entries by format type
 */
export function useEntriesByFormat(format: EntryFormat | null) {
  const { data: entries, ...rest } = useEntries()

  const filtered = useMemo(() => {
    if (!entries) return []
    if (!format) return entries

    return entries.filter((entry) => entry.entryFormat === format)
  }, [entries, format])

  return {
    data: filtered,
    ...rest,
  }
}

/**
 * Get only decomposed (parent) entries
 */
export function useDecomposedEntries() {
  const { data: entries, ...rest } = useEntries()

  const decomposed = useMemo(() => {
    if (!entries) return []
    return entries.filter((entry) => entry.isDecomposed)
  }, [entries])

  return {
    data: decomposed,
    ...rest,
  }
}

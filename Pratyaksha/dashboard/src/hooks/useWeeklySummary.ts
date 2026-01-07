import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWeeklySummary, type WeeklySummaryResponse } from "../lib/airtable"

/**
 * Hook to fetch weekly summary
 * @param weekId - ISO week ID (YYYY-Wnn) or "current"
 */
export function useWeeklySummary(weekId: string) {
  return useQuery<WeeklySummaryResponse>({
    queryKey: ["weekly-summary", weekId],
    queryFn: () => fetchWeeklySummary(weekId),
    staleTime: 1000 * 60 * 60, // 1 hour - summaries don't change often
    refetchOnWindowFocus: false,
    enabled: !!weekId,
    retry: 1, // Only retry once since generation can be slow
  })
}

/**
 * Hook to regenerate a weekly summary
 */
export function useRegenerateWeeklySummary() {
  const queryClient = useQueryClient()

  return useMutation<WeeklySummaryResponse, Error, string>({
    mutationFn: (weekId: string) => fetchWeeklySummary(weekId, true),
    onSuccess: (data, weekId) => {
      // Update the cache with the new summary
      queryClient.setQueryData(["weekly-summary", weekId], data)
    },
  })
}

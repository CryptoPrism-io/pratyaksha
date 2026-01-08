import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchMonthlySummary, type MonthlySummaryResponse } from "../lib/airtable"

/**
 * Hook to fetch monthly summary
 * @param monthId - Month ID (YYYY-MM) or "current"
 */
export function useMonthlySummary(monthId: string) {
  return useQuery<MonthlySummaryResponse>({
    queryKey: ["monthly-summary", monthId],
    queryFn: () => fetchMonthlySummary(monthId),
    staleTime: 1000 * 60 * 60 * 2, // 2 hours - monthly summaries change even less frequently
    refetchOnWindowFocus: false,
    enabled: !!monthId,
    retry: 1, // Only retry once since generation can be slow
  })
}

/**
 * Hook to regenerate a monthly summary
 */
export function useRegenerateMonthlySummary() {
  const queryClient = useQueryClient()

  return useMutation<MonthlySummaryResponse, Error, string>({
    mutationFn: (monthId: string) => fetchMonthlySummary(monthId, true),
    onSuccess: (data, monthId) => {
      // Update the cache with the new summary
      queryClient.setQueryData(["monthly-summary", monthId], data)
    },
  })
}

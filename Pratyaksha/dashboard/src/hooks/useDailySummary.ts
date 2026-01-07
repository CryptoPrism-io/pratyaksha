import { useQuery } from "@tanstack/react-query"
import { fetchDailySummary, type DailySummaryResponse } from "../lib/airtable"

/**
 * Hook to fetch daily summary
 * @param date - YYYY-MM-DD format or "today"
 */
export function useDailySummary(date: string) {
  return useQuery<DailySummaryResponse>({
    queryKey: ["daily-summary", date],
    queryFn: () => fetchDailySummary(date),
    staleTime: 1000 * 60 * 5, // 5 minutes - daily summaries can refresh more often
    refetchOnWindowFocus: false,
    enabled: !!date,
    retry: 1,
  })
}

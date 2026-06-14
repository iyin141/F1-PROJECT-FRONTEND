import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsRestoring } from "@/_Stores/QueryProvider";
import { fetchDriversForSeason, fetchDriversByName } from "@/Lib/queryFunctions/drivers";
import { queryKeys } from "@/Lib/queryKeys";

export function useDriversForSeason(year: number) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.driverSearch.season(year),
    queryFn: () => fetchDriversForSeason(year, qc),
    enabled: !isRestoring,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useDriverSearch(q: string, year?: number) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.driverSearch.byName(q, year),
    queryFn: () => fetchDriversByName(q, year, qc),
    enabled: Boolean(q) && !isRestoring,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

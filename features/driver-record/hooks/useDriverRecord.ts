import { useQuery } from "@tanstack/react-query";
import { cacheConfig, queryKeys, resolveCacheConfig } from "@/Lib/queryKeys";
import { adaptDriverCareer, adaptDriverSeason } from "@/Lib/adapters";
import { getDriverCareer, getDriverSeason } from "@/Lib/api/services";

export function useDriverCareer(driverCode: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.driverStandings.career(driverCode),
    queryFn: () => getDriverCareer(driverCode),
    select: (raw: any) => (raw ? adaptDriverCareer(raw) : adaptDriverCareer({} as any)),
    enabled: enabled && !!driverCode,
    ...cacheConfig.historical,
  });
}

export function useDriverSeason(
  driverCode: string,
  year: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.driverStandings.season(driverCode, year ?? 0),
    queryFn: () => getDriverSeason(driverCode, year!),
    select: (raw: any) => (raw ? adaptDriverSeason(raw) : adaptDriverSeason({} as any)),
    enabled: enabled && !!driverCode && year !== null,
    ...resolveCacheConfig(year!),
  });
}

// Temporary alias to keep existing callers working until phase 4 component swap.
export const useDriverSeasonBreakdown = useDriverSeason;

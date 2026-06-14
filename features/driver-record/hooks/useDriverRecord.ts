import { useQuery } from "@tanstack/react-query";
import { useIsRestoring } from "@/_Stores/QueryProvider";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, cacheConfig } from "@/Lib/queryKeys";
import { adaptDriverCareer, adaptDriverSeason } from "@/Lib/adapters";
import { fetchDriverCareer, fetchDriverSeason } from "@/Lib/queryFunctions";

export function useDriverCareer(driverCode: string, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.driverStandings.career(driverCode),
    queryFn: () => fetchDriverCareer(driverCode, qc),
    select: (raw?: import("@/types/endpoints/driverrecordtypes").DriverCareerResponse) =>
      raw
        ? adaptDriverCareer(raw)
        : adaptDriverCareer({
            driver_code: "",
            driver_name: null,
            nationality: null,
            career: [],
            career_totals: { total_wins: 0, total_podiums: 0, championships: 0 },
            readiness: { can_proceed: false, available_data: [], unavailable_data: [], message: null, warnings: [] },
          }),
    enabled: enabled && !!driverCode && !isRestoring,
    ...cacheConfig.historical,
  });
}


export function useDriverSeason(
  driverCode: string,
  year: number | null,
  enabled = true,
) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.driverStandings.season(driverCode, year ?? 0),
    queryFn: () => fetchDriverSeason(driverCode, year!, qc),
    select: (raw?: import("@/types/endpoints/driverrecordtypes").DriverSeasonBreakdownResponse) =>
      raw
        ? adaptDriverSeason(raw)
        : adaptDriverSeason({
            driver_code: driverCode,
            driver_name: null,
            year: year ?? 0,
            total_races: 0,
            sprint_weekends: 0,
            races: [],
            readiness: { can_proceed: false, available_data: [], unavailable_data: [], message: null, warnings: [] },
          }),
    enabled: enabled && !!driverCode && year !== null && !isRestoring,
    ...cacheConfig.historical,
  });
}

// Temporary alias to keep existing callers working until phase 4 component swap.
export const useDriverSeasonBreakdown = useDriverSeason;

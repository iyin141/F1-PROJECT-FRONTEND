import { useQuery } from "@tanstack/react-query";
import { useIsRestoring } from "@/_Stores/QueryProvider";

import {
  getSeasonSchedule,
  getDriverStandings,
  getConstructorStandings,
} from "@/Lib/api/services/standings";
import { queryKeys, resolveCacheConfig } from "@/Lib/queryKeys";
import { adaptSeasonSchedule, adaptDriverStandings, adaptConstructorStandings } from "@/Lib/adapters";
import type { SeasonScheduleResponse } from "@/types/endpoints/racestypes";
import type { DriverStandingsResponse } from "@/types/endpoints/driverstandingstypes";
import type { ConstructorStandingsResponse } from "@/types/endpoints/constructorstandingstypes";

export function useSeasonSchedule(year: number) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.schedule.season(year),
    queryFn: () => getSeasonSchedule(year),
    select: (raw: SeasonScheduleResponse | undefined) => (raw ? adaptSeasonSchedule(raw) : undefined),
    retry: 2,
    enabled: !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function useDriverStandings(year: number) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.driverStandings.grid(year),
    queryFn: () => getDriverStandings(year),
    select: (raw: DriverStandingsResponse | undefined) => (raw ? adaptDriverStandings(raw) : undefined),
    enabled: !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function useConstructorStandings(year: number) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.constructorStandings.year(year),
    queryFn: () => getConstructorStandings(year),
    select: (raw: ConstructorStandingsResponse | undefined) => (raw ? adaptConstructorStandings(raw) : undefined),
    enabled: !isRestoring,
    ...resolveCacheConfig(year),
  });
}


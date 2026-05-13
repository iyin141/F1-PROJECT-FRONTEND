import { useQuery } from "@tanstack/react-query";

import {
  getSeasonSchedule,
  getDriverStandings,
  getConstructorStandings,
} from "@/Lib/api/services";
import { queryKeys, resolveCacheConfig } from "@/Lib/queryKeys";
import { adaptSeasonSchedule, adaptDriverStandings, adaptConstructorStandings } from "@/Lib/adapters";

export function useSeasonSchedule(year: number) {
  return useQuery({
    queryKey: queryKeys.schedule.season(year),
    queryFn: () => getSeasonSchedule(year),
    select: (raw: any) => (raw ? adaptSeasonSchedule(raw) : undefined),
    retry: 2,
    ...resolveCacheConfig(year),
  });
}

export function useDriverStandings(year: number) {
  return useQuery({
    queryKey: queryKeys.driverStandings.grid(year),
    queryFn: () => getDriverStandings(year),
    select: (raw: any) => (raw ? adaptDriverStandings(raw) : undefined),
    ...resolveCacheConfig(year),
  });
}

export function useConstructorStandings(year: number) {
  return useQuery({
    queryKey: queryKeys.constructorStandings.year(year),
    queryFn: () => getConstructorStandings(year),
    select: (raw: any) => (raw ? adaptConstructorStandings(raw) : undefined),
    ...resolveCacheConfig(year),
  });
}


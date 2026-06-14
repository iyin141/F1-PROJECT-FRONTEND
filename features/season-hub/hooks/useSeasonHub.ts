import { useQuery } from "@tanstack/react-query";
import { useIsRestoring } from "@/_Stores/QueryProvider";

import { useQueryClient } from "@tanstack/react-query";
import { fetchSeasonSchedule, fetchDriverStandings, fetchConstructorStandings, fetchRaceWeekend } from "@/Lib/queryFunctions";
import { queryKeys } from "@/Lib/queryKeys";
import { adaptSeasonSchedule, adaptDriverStandings, adaptConstructorStandings } from "@/Lib/adapters";
import type { SeasonScheduleResponse } from "@/types/endpoints/racestypes";
import type { DriverStandingsResponse } from "@/types/endpoints/driverstandingstypes";
import type { ConstructorStandingsResponse } from "@/types/endpoints/constructorstandingstypes";

export function useSeasonSchedule(year: number) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.schedule.season(year),
    queryFn: () => fetchSeasonSchedule(year, qc),
    select: (raw: SeasonScheduleResponse | undefined) => (raw ? adaptSeasonSchedule(raw, year) : undefined),
    retry: 2,
    enabled: !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useDriverStandings(year: number) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.driverStandings.grid(year),
    queryFn: () => fetchDriverStandings(year, qc),
    select: (raw: DriverStandingsResponse | undefined) => (raw ? adaptDriverStandings(raw) : undefined),
    enabled: !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useConstructorStandings(year: number) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.constructorStandings.year(year),
    queryFn: () => fetchConstructorStandings(year, qc),
    select: (raw: ConstructorStandingsResponse | undefined) => (raw ? adaptConstructorStandings(raw) : undefined),
    enabled: !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useRaceWeekend(year: number, round: number) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.raceResults.weekend(year, round),
    queryFn: () => fetchRaceWeekend(year, round, qc),
    enabled: !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}


import { useQuery, useQueries } from "@tanstack/react-query";

import {
  getRaceDetail,
  getRaceResults,
  getQualifyingResults,
  getPracticeResults,
  getRaceWeather,
  getRaceIncidents,
} from "@/Api_services/race-detail";
import {
  getUnifiedPositions,
  getUnifiedIncidents,
  getUnifiedPitStops,
} from "@/Api_services/unified";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";
import type { PracticeSessionName } from "@/types/api";

export function useRaceDetail(year: number, round: number) {
  return useQuery({
    queryKey: queryKeys.races.detail(year, round),
    queryFn: () => getRaceDetail(year, round),
    ...cacheConfig.historical,
  });
}

export function useRaceResults(year: number, round: number) {
  return useQuery({
    queryKey: queryKeys.races.results(year, round),
    queryFn: () => getRaceResults(year, round),
    ...cacheConfig.historical,
  });
}

export function useQualifyingResults(year: number, round: number) {
  return useQuery({
    queryKey: queryKeys.races.qualifying(year, round),
    queryFn: () => getQualifyingResults(year, round),
    ...cacheConfig.historical,
  });
}

export function usePracticeResults(
  year: number,
  round: number,
  session: PracticeSessionName,
) {
  return useQuery({
    queryKey: queryKeys.races.practice(year, round, session),
    queryFn: () => getPracticeResults(year, round, session),
    ...cacheConfig.historical,
  });
}

export function useRaceWeather(year: number, round: number) {
  return useQuery({
    queryKey: queryKeys.unified.weather(year, round),
    queryFn: () => getRaceWeather(year, round, "R"),
    ...cacheConfig.historical,
  });
}

export function useRaceIncidents(year: number, round: number) {
  return useQuery({
    queryKey: queryKeys.unified.incidents(year, round),
    queryFn: () => getRaceIncidents(year, round, "R"),
    ...cacheConfig.historical,
  });
}

/**
 * Fires three parallel queries for race replay data.
 * All are gated behind the `enabled` flag — only load when the user
 * explicitly requests the replay view (heavy payloads).
 */
export function useReplayData(year: number, round: number, enabled: boolean) {
  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.unified.positions(year, round),
        queryFn: () => getUnifiedPositions(year, round, { session: "R" }),
        ...cacheConfig.heavyOptIn,
        enabled,
      },
      {
        queryKey: queryKeys.unified.incidents(year, round),
        queryFn: () => getUnifiedIncidents(year, round, { session: "R" }),
        ...cacheConfig.heavyOptIn,
        enabled,
      },
      {
        queryKey: queryKeys.unified.pitStops(year, round),
        queryFn: () => getUnifiedPitStops(year, round, { session: "R" }),
        ...cacheConfig.heavyOptIn,
        enabled,
      },
    ],
  });

  const [positions, incidents, pitStops] = results;

  return {
    positions,
    incidents,
    pitStops,
    isPending: results.some((r) => r.isPending),
    isError: results.some((r) => r.isError),
  };
}

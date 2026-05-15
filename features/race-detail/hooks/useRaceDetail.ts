import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { useIsRestoring } from "@/_Stores/QueryProvider";

import {
  getRaceDetail,
  getRaceResults,
  getQualifyingResults,
  getPracticeResults,
  getSprintResults,
  getSprintShootoutResults,
} from "@/Lib/api/services/races";
import { getUnifiedPositions, getUnifiedIncidents, getUnifiedPitStops, getUnifiedWeather, getUnifiedDrs, getUnifiedTrackStatus, getFullSession } from "@/Lib/api/services/unified";
import { getLapsAnalysis } from "@/Lib/api/services/analysis";
import { cacheConfig, queryKeys, resolveCacheConfig } from "@/Lib/queryKeys";
import type { PracticeSessionName } from "@/types/api";
import {
  adaptRaceDetail,
  adaptRaceResults,
  adaptQualifyingResults,
  adaptPracticeResults,
  adaptSprintResults,
  adaptSprintShootoutResults,
  adaptWeather,
  adaptIncidents,
} from "@/Lib/adapters";
import type { RaceDetailResponse } from "@/types/endpoints/racestypes";
import type { RaceResultsResponse } from "@/types/endpoints/resultstypes";
import type { QualifyingResultsResponse } from "@/types/endpoints/qualifyingtypes";
import type { PracticeResultsResponse } from "@/types/endpoints/practicetypes";
import type { SprintResultsResponse, SprintShootoutResultsResponse } from "@/types/endpoints/sprinttypes";
import type { UnifiedWeatherResponse } from "@/types/endpoints/weathertypes";
import type { UnifiedIncidentsResponse } from "@/types/endpoints/incidentstypes";
import type { UnifiedPositionsResponse } from "@/types/endpoints/positionstypes";
import type { UnifiedPitStopsResponse } from "@/types/endpoints/pitstopstypes";
import type { LapsAnalysisResponse } from "@/types/endpoints/lapstypes";

export const raceDetailQueryFn = getRaceDetail;
export const raceResultsQueryFn = getRaceResults;

export function useRaceDetail(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.raceResults.detail(year, round),
    queryFn: () => getRaceDetail(year, round),
    select: (raw: RaceDetailResponse | undefined) => (raw ? adaptRaceDetail(raw, year) : undefined),
    enabled: enabled && !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function useRaceResults(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, "R"),
    queryFn: () => getRaceResults(year, round),
    select: (raw: RaceResultsResponse | undefined) => (raw ? adaptRaceResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function useQualifyingResults(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.raceResults.qualifying(year, round),
    queryFn: () => getQualifyingResults(year, round),
    select: (raw: QualifyingResultsResponse | undefined) => (raw ? adaptQualifyingResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function usePracticeResults(
  year: number,
  round: number,
  session: PracticeSessionName,
  enabled = true,
) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, session),
    queryFn: () => getPracticeResults(year, round, session),
    select: (raw: PracticeResultsResponse | undefined) => (raw ? adaptPracticeResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function useSprintResults(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, "S"),
    queryFn: () => getSprintResults(year, round),
    select: (raw: SprintResultsResponse | undefined) => (raw ? adaptSprintResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function useSprintShootoutResults(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, "SS"),
    queryFn: () => getSprintShootoutResults(year, round),
    select: (raw: SprintShootoutResultsResponse | undefined) => (raw ? adaptSprintShootoutResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function useRaceWeather(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "weather"),
    queryFn: () => getUnifiedWeather(year, round, "R"),
    select: (raw: UnifiedWeatherResponse | undefined) => (raw ? adaptWeather(raw) : undefined),
    enabled: enabled && !isRestoring,
    ...cacheConfig.completedRace,
  });
}

export function useRaceIncidents(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "incidents"),
    queryFn: () => getUnifiedIncidents(year, round, "R"),
    select: (raw: UnifiedIncidentsResponse | undefined) => (raw ? adaptIncidents(raw) : undefined),
    enabled: enabled && !isRestoring,
    ...cacheConfig.completedRace,
  });
}

export function useDrs(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "drs"),
    queryFn: () => getUnifiedDrs(year, round, "R"),
    enabled: enabled && !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function useTrackStatus(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "track-status"),
    queryFn: () => getUnifiedTrackStatus(year, round, "R"),
    enabled: enabled && !isRestoring,
    ...resolveCacheConfig(year),
  });
}

export function useFullSession(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  return useQuery({
    queryKey: queryKeys.fullSession.byRace(year, round),
    queryFn: () => getFullSession(year, round, { include: [], session: "R" }),
    enabled: enabled && !isRestoring,
    ...resolveCacheConfig(year),
  });
}

/**
 * Fires three parallel queries for race replay data.
 * All are gated behind the `enabled` flag — only load when the user
 * explicitly requests the replay view (heavy payloads).
 */
export function useReplayData(year: number, round: number, enabled: boolean) {
  const qc = useQueryClient();

  const alreadyCached = (key: readonly unknown[]) => !!qc.getQueryState(key)?.data;

  const queries = [
    {
      queryKey: queryKeys.replayPositions(year, round),
      queryFn: () => getUnifiedPositions(year, round, "R", 1),
      ...cacheConfig.heavyOptIn,
      enabled: enabled || alreadyCached(queryKeys.replayPositions(year, round)),
    },
    {
      queryKey: queryKeys.replayIncidents(year, round),
      queryFn: () => getUnifiedIncidents(year, round, "R"),
      ...cacheConfig.heavyOptIn,
      enabled: enabled || alreadyCached(queryKeys.replayIncidents(year, round)),
    },
    {
      queryKey: queryKeys.replayPitStops(year, round),
      queryFn: () => getUnifiedPitStops(year, round, "R"),
      ...cacheConfig.heavyOptIn,
      enabled: enabled || alreadyCached(queryKeys.replayPitStops(year, round)),
    },
    {
      queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
      queryFn: () => getLapsAnalysis(year, round, { session: "R" }),
      ...cacheConfig.heavyOptIn,
      enabled: enabled || alreadyCached(queryKeys.lapAnalysis.byType(year, round, "laps", undefined)),
    },
  ];

  const results = useQueries({ queries });

  /* Type results individually to avoid broad `any` casts. */
  const positions = results[0] as UseQueryResult<UnifiedPositionsResponse | undefined, unknown>;
  const incidents = results[1] as UseQueryResult<UnifiedIncidentsResponse | undefined, unknown>;
  const pitStops = results[2] as UseQueryResult<UnifiedPitStopsResponse | undefined, unknown>;
  const laps = results[3] as UseQueryResult<LapsAnalysisResponse | undefined, unknown>;

  return {
    positions,
    incidents,
    pitStops,
    laps,
    isPending: results.some((r) => r.isPending),
    isError: results.some((r) => r.isError),
  };
}

import { useMemo } from "react";
import { adaptReplayFrames } from "@/Lib/adapters";

export function useReplayFrames(year: number, round: number, enabled: boolean) {
  const { positions, incidents, pitStops, laps, isPending, isError } = useReplayData(year, round, enabled);

  const frames = useMemo(() => {
    const p = positions.data ?? undefined;
    const ps = pitStops.data ?? undefined;
    const i = incidents.data ?? undefined;
    const l = laps.data ?? undefined;
    if (!p && !ps && !i && !l) return [];
    return adaptReplayFrames(p, ps, i, l);
  }, [positions.data, pitStops.data, incidents.data, laps.data]);

  return { frames, positions, incidents, pitStops, laps, isPending, isError };
}

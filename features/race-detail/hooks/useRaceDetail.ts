import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { useIsRestoring } from "@/_Stores/QueryProvider";

import {
  fetchRaceDetail,
  fetchRaceResults,
  fetchQualifyingResults,
  fetchPracticeResults,
  fetchSprintResults,
  fetchSprintShootoutResults,
  fetchUnifiedWeather,
  fetchUnifiedIncidents,
  fetchUnifiedPositions,
  fetchUnifiedPitStops,
  fetchUnifiedDrs,
  fetchUnifiedTrackStatus,
  fetchFullSession,
  fetchLapsAnalysis,
} from "@/Lib/queryFunctions";
import { queryKeys } from "@/Lib/queryKeys";
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


export function useRaceDetail(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.raceResults.detail(year, round),
    queryFn: () => fetchRaceDetail(year, round, qc),
    select: (raw: RaceDetailResponse | undefined) => (raw ? adaptRaceDetail(raw, year) : undefined),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useRaceResults(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, "R"),
    queryFn: () => fetchRaceResults(year, round, qc),
    select: (raw: RaceResultsResponse | undefined) => (raw ? adaptRaceResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useQualifyingResults(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.raceResults.qualifying(year, round),
    queryFn: () => fetchQualifyingResults(year, round, qc),
    select: (raw: QualifyingResultsResponse | undefined) => (raw ? adaptQualifyingResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function usePracticeResults(
  year: number,
  round: number,
  session: PracticeSessionName,
  enabled = true,
) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, session),
    queryFn: () => fetchPracticeResults(year, round, session, qc),
    select: (raw: PracticeResultsResponse | undefined) => (raw ? adaptPracticeResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useSprintResults(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, "S"),
    queryFn: () => fetchSprintResults(year, round, qc),
    select: (raw: SprintResultsResponse | undefined) => (raw ? adaptSprintResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useSprintShootoutResults(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, "SS"),
    queryFn: () => fetchSprintShootoutResults(year, round, qc),
    select: (raw: SprintShootoutResultsResponse | undefined) => (raw ? adaptSprintShootoutResults(raw) : undefined),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useRaceWeather(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "weather"),
    queryFn: () => fetchUnifiedWeather(year, round, "R", qc),
    select: (raw: UnifiedWeatherResponse | undefined) => (raw ? adaptWeather(raw) : undefined),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useRaceIncidents(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "incidents"),
    queryFn: () => fetchUnifiedIncidents(year, round, "R", qc),
    select: (raw: UnifiedIncidentsResponse | undefined) => (raw ? adaptIncidents(raw) : undefined),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useDrs(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "drs"),
    queryFn: () => fetchUnifiedDrs(year, round, "R", qc),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useTrackStatus(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "track-status"),
    queryFn: () => fetchUnifiedTrackStatus(year, round, "R", qc),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useFullSession(year: number, round: number, enabled = true) {
  const isRestoring = useIsRestoring();
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.fullSession.byRace(year, round),
    queryFn: () => fetchFullSession(year, round, { include: [], session: "R" }, qc),
    enabled: enabled && !isRestoring,
    staleTime: 86400000,
    gcTime: 86400000,
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
      queryFn: () => fetchUnifiedPositions(year, round, "R", 1, qc),
      staleTime: 86400000,
      gcTime: 86400000,
      enabled: enabled || alreadyCached(queryKeys.replayPositions(year, round)),
    },
    {
      queryKey: queryKeys.replayIncidents(year, round),
      queryFn: () => fetchUnifiedIncidents(year, round, "R", qc),
      staleTime: 86400000,
      gcTime: 86400000,
      enabled: enabled || alreadyCached(queryKeys.replayIncidents(year, round)),
    },
    {
      queryKey: queryKeys.replayPitStops(year, round),
      queryFn: () => fetchUnifiedPitStops(year, round, "R", qc),
      staleTime: 86400000,
      gcTime: 86400000,
      enabled: enabled || alreadyCached(queryKeys.replayPitStops(year, round)),
    },
    {
      queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
      queryFn: () => fetchLapsAnalysis(year, round, { session: "R" }, qc),
      staleTime: 86400000,
      gcTime: 86400000,
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

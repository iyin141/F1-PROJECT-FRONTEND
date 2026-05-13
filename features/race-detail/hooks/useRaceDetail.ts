import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";

import {
  getRaceDetail,
  getRaceResults,
  getQualifyingResults,
  getPracticeResults,
  getSprintResults,
  getSprintShootoutResults,
  getUnifiedPositions,
  getUnifiedIncidents,
  getUnifiedPitStops,
  getUnifiedWeather,
  getUnifiedDrs,
  getUnifiedTrackStatus,
  getFullSession,
  getLapsAnalysis,
} from "@/Lib/api/services";
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

export const raceDetailQueryFn = getRaceDetail;
export const raceResultsQueryFn = getRaceResults;

export function useRaceDetail(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.raceResults.detail(year, round),
    queryFn: () => getRaceDetail(year, round),
    select: (raw: any) => (raw ? adaptRaceDetail(raw, year) : undefined),
    enabled,
    ...resolveCacheConfig(year),
  });
}

export function useRaceResults(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, "R"),
    queryFn: () => getRaceResults(year, round),
    select: (raw: any) => (raw ? adaptRaceResults(raw) : undefined),
    enabled,
    ...resolveCacheConfig(year),
  });
}

export function useQualifyingResults(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.raceResults.qualifying(year, round),
    queryFn: () => getQualifyingResults(year, round),
    select: (raw: any) => (raw ? adaptQualifyingResults(raw) : undefined),
    enabled,
    ...resolveCacheConfig(year),
  });
}

export function usePracticeResults(
  year: number,
  round: number,
  session: PracticeSessionName,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, session),
    queryFn: () => getPracticeResults(year, round, session),
    select: (raw: any) => (raw ? adaptPracticeResults(raw) : undefined),
    enabled,
    ...resolveCacheConfig(year),
  });
}

export function useSprintResults(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, "S"),
    queryFn: () => getSprintResults(year, round),
    select: (raw: any) => (raw ? adaptSprintResults(raw) : undefined),
    enabled,
    ...resolveCacheConfig(year),
  });
}

export function useSprintShootoutResults(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.raceResults.session(year, round, "SS"),
    queryFn: () => getSprintShootoutResults(year, round),
    select: (raw: any) => (raw ? adaptSprintShootoutResults(raw) : undefined),
    enabled,
    ...resolveCacheConfig(year),
  });
}

export function useRaceWeather(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "weather"),
    queryFn: () => getUnifiedWeather(year, round, "R"),
    select: (raw: any) => (raw ? adaptWeather(raw) : undefined),
    enabled,
    ...cacheConfig.completedRace,
  });
}

export function useRaceIncidents(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "incidents"),
    queryFn: () => getUnifiedIncidents(year, round, "R"),
    select: (raw: any) => (raw ? adaptIncidents(raw) : undefined),
    enabled,
    ...cacheConfig.completedRace,
  });
}

export function useDrs(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "drs"),
    queryFn: () => getUnifiedDrs(year, round, "R"),
    enabled,
    ...resolveCacheConfig(year),
  });
}

export function useTrackStatus(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sessionData.byType(year, round, "track-status"),
    queryFn: () => getUnifiedTrackStatus(year, round, "R"),
    enabled,
    ...resolveCacheConfig(year),
  });
}

export function useFullSession(year: number, round: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.fullSession.byRace(year, round),
    queryFn: () => getFullSession(year, round, { include: [], session: "R" }),
    enabled,
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

  const alreadyCached = (key: readonly unknown[]) => !!qc.getQueryState(key as any)?.data;

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

  const [positions, incidents, pitStops, laps] = results as any[];

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
    const p = positions.data ?? null;
    const ps = pitStops.data ?? null;
    const i = incidents.data ?? null;
    const l = laps.data ?? null;
    if (!p && !ps && !i && !l) return [];
    return adaptReplayFrames(p, ps, i, l);
  }, [positions.data, pitStops.data, incidents.data, laps.data]);

  return { frames, positions, incidents, pitStops, laps, isPending, isError };
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";
import type { AnalysisSessionName } from "@/types/api";
import { fetchLapsAnalysis, fetchDriverPace, fetchDriverStints, fetchTyreStrategy,
         fetchSectorAnalysis, fetchTelemetryOverlay,
         fetchTelemetrySummary, fetchUnifiedPositions, fetchPracticeResults } from "@/Lib/queryFunctions";
import type { UnifiedPositionsResponse, TelemetryResponse, TelemetryOverlayResponse, TelemetrySummaryResponse } from "@/types/endpoints";
import {
  adaptRaceLapFrames,
  adaptLapTimes,
  adaptStints,
  adaptTyreStrategy,
  adaptSectorAnalysis,
  adaptTeammateBattles,
  adaptConsistencyByStint,
  adaptPracticeResults,
} from "@/Lib/adapters";
import { DRIVERS } from "@/Lib/data/drivers";
import type {
  RaceLapFrame,
  LapTime,
  Stint,
  SectorAnalysis,
  ConsistencyScore,
  TeammateBattle,
  PracticeResult,
} from "@/types/ui";

import { computeRanges, aggregateDriverMetricsByRange, computeTopNPerRange, computeConsistencyByRange, type LapRow } from "@/features/race-analysis/utils/overviewUtils";

// ---------------------------------------------------------------------------
// Grid-wide (no driver filter)
// ---------------------------------------------------------------------------

// (tyre strategy hook implemented later with proper select)

// ---------------------------------------------------------------------------
// Driver-filtered analysis
// All are gated with enabled: !!driver so they only fire once a driver is selected.
// ---------------------------------------------------------------------------

export function useDriverLaps(
  year: number,
  round: number,
  driver: string | undefined,
  session: string = "R",
) {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", driver, session),
    queryFn: () => fetchLapsAnalysis(year, round, { session, driver }),
    ...cacheConfig.historical,
    enabled: !!driver,
  });
}

export function useDriverPace(
  year: number,
  round: number,
  driver: string | undefined,
  session: string = "R",
) {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "pace", driver, session),
    queryFn: () => fetchDriverPace(year, round, driver!, session),
    ...cacheConfig.completedRace,
    enabled: !!driver,
  });
}

export function useDriverStints(
  year: number,
  round: number,
  driver: string | undefined,
  session: string = "R",
) {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "stints", driver, session),
    queryFn: () => fetchDriverStints(year, round, driver, session),
    ...cacheConfig.historical,
    enabled: !!driver,
  });
}

export function useAllLaps(year: number, round: number, session: string = "R") {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined, session),
    queryFn: () => fetchLapsAnalysis(year, round, { session }),
    ...cacheConfig.historical,
  });
}

export function useAllStints(year: number, round: number, session: string = "R") {
  return useQuery<Stint[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "stints", undefined, session),
    queryFn: () => fetchDriverStints(year, round, undefined, session) as Promise<any>,
    select: (raw: any) => (raw ? adaptStints(raw) : undefined),
    ...cacheConfig.historical,
  });
}

export function usePracticeResultsBySession(
  year: number,
  round: number,
  sessions: string[] = ["FP1", "FP2", "FP3"],
  enabled = true,
) {
  const qc = useQueryClient();
  return useQuery<(PracticeResult[] | undefined)[] | undefined>({
    queryKey: ["practice", "bySessions", year, round, sessions.join(",")],
    queryFn: async () => {
      const raw = await Promise.all(sessions.map((s) => fetchPracticeResults(year, round, s as any, qc)));
      return raw.map((r) => (r ? adaptPracticeResults(r) : undefined));
    },
    ...cacheConfig.historical,
    enabled,
  });
}

export function useRaceLapFrames(year: number, round: number, session: string = "R", enabled = true) {
  return useQuery<RaceLapFrame[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined, session),
    queryFn: () => fetchLapsAnalysis(year, round, { session }) as Promise<any>,
    select: (raw: any) => (raw ? adaptRaceLapFrames(raw) : undefined),
    ...cacheConfig.historical,
    enabled,
  });
}

export function useLapTimes(year: number, round: number, session: string = "R", enabled = true) {
  return useQuery<LapTime[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined, session),
    queryFn: () => fetchLapsAnalysis(year, round, { session }) as Promise<any>,
    select: (raw: any) => (raw ? adaptLapTimes(raw) : undefined),
    ...cacheConfig.historical,
    enabled,
  });
}

export function useTyreStrategy(year: number, round: number, session: string = "R") {
  return useQuery<Stint[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "tyre", undefined, session),
    queryFn: () => fetchTyreStrategy(year, round, session) as Promise<any>,
    select: (raw: any) => (raw ? adaptTyreStrategy(raw) : undefined),
    ...cacheConfig.historical,
  });
}

export function useSectorAnalysis(year: number, round: number, session: string = "R") {
  return useQuery<SectorAnalysis[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined, session),
    queryFn: () => fetchLapsAnalysis(year, round, { session }) as Promise<any>,
    select: (raw: any) => (raw ? adaptSectorAnalysis(raw) : undefined),
    ...cacheConfig.historical,
  });
}

export function useConsistencyByStint(year: number, round: number, session: string = "R", enabled = true) {
  const framesQuery = useRaceLapFrames(year, round, session, enabled);
  const frames = framesQuery.data ?? [];
  const data = useMemo(() => (frames.length ? adaptConsistencyByStint(frames, DRIVERS) : new Map<number | "overall", ConsistencyScore[]>()), [frames]);
  return { data, isLoading: framesQuery.isLoading, isError: framesQuery.isError } as {
    data: Map<number | "overall", ConsistencyScore[]>;
    isLoading: boolean;
    isError: boolean;
  };
}

export function useTeammateBattles(year: number, round: number, session: string = "R", enabled = true) {
  const framesQuery = useRaceLapFrames(year, round, session, enabled);
  const frames = framesQuery.data ?? [];
  const data = useMemo(() => {
    if (!frames.length) return [] as TeammateBattle[];
    const raceDriverCodes = new Set<string>();
    for (const frame of frames) for (const code of Object.keys(frame.drivers)) raceDriverCodes.add(code);
    const raceDrivers = DRIVERS.filter((d) => raceDriverCodes.has(d.code));
    return adaptTeammateBattles(frames, raceDrivers);
  }, [frames]) as TeammateBattle[];
  return { data, isLoading: framesQuery.isLoading, isError: framesQuery.isError } as {
    data: TeammateBattle[];
    isLoading: boolean;
    isError: boolean;
  };
}

export function useDriverSectors(
  year: number,
  round: number,
  driver: string | undefined,
  session: string = "R",
) {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "sectors", driver, session),
    queryFn: () => fetchSectorAnalysis(year, round, driver, session),
    ...cacheConfig.historical,
    enabled: !!driver,
  });
}

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------



export function useTelemetryOverlay(
  year: number,
  round: number,
  driverA: string | undefined,
  driverB: string | undefined,
  lapA: number | undefined,
  lapB: number | undefined,
  session: AnalysisSessionName = "R",
  options?: import("@/Lib/queryFunctions/analysis").TelemetryOverlayOptions
) {
  return useQuery<TelemetryOverlayResponse>({
    queryKey: [...queryKeys.telemetry.overlay(
      year,
      round,
      driverA ?? "",
      driverB ?? "",
      lapA,
      session,
    ), lapB, options],
    queryFn: () => fetchTelemetryOverlay(year, round, driverA!, driverB!, lapA, lapB, session, options),
    ...cacheConfig.heavyOptIn,
    enabled: !!driverA && !!driverB,
  });
}

export function useTelemetrySummary(
  year: number,
  round: number,
  driver: string | undefined,
  lap: number | null,
  session: AnalysisSessionName = "R",
) {
  return useQuery<TelemetrySummaryResponse>({
    queryKey: queryKeys.telemetry.summary(
      year,
      round,
      driver ?? "",
      lap ?? 0,
    ),
    queryFn: () => fetchTelemetrySummary(year, round, driver!, lap!, session),
    ...cacheConfig.heavyOptIn,
    enabled: !!driver && lap !== null,
  });
}

// ---------------------------------------------------------------------------
// Unified — Positions
// ---------------------------------------------------------------------------

export function useRacePositions(year: number, round: number, enabled = true, session = "R") {
  const qc = useQueryClient();
  return useQuery<UnifiedPositionsResponse>({
    queryKey: queryKeys.sessionData.byType(year, round, "positions", session),
    queryFn: () => fetchUnifiedPositions(year, round, session, undefined, undefined, qc),
    ...cacheConfig.completedRace,
    enabled,
  });
}

export function useRaceOverviewData(year: number, round: number, session: string = 'R', options: { enabled?: boolean } = {}) {
  const enabled = options.enabled ?? true;
  // Use useRaceLapFrames so all times go through adaptRaceLapFrames -> parseTimeMs.
  // The previous approach read row.lap_time (a time string like "1:37.456") as if it
  // were a numeric ms value, causing NaN in all arithmetic downstream.
  const framesQuery = useRaceLapFrames(year, round, session, enabled);

  const data = useMemo(() => {
    const frames = framesQuery.data;
    if (!frames || frames.length === 0) return undefined;

    const lapsByDriver: Record<string, LapRow[]> = {};
    for (const frame of frames) {
      for (const [code, entry] of Object.entries(frame.drivers)) {
        if (!lapsByDriver[code]) lapsByDriver[code] = [];
        lapsByDriver[code].push({
          driverCode: code,
          lapNumber: frame.lap,
          lapTimeMs: entry.lapTimeMs,
          sector1Ms: entry.sector1Ms,
          sector2Ms: entry.sector2Ms,
          sector3Ms: entry.sector3Ms,
          compound: entry.compound,
        });
      }
    }

    const totalLaps = frames[frames.length - 1]?.lap ?? 0;
    const ranges = computeRanges(totalLaps, 4);
    const metrics = aggregateDriverMetricsByRange(lapsByDriver, ranges);
    const topByRange = computeTopNPerRange(metrics, 3);
    const consistency = computeConsistencyByRange(lapsByDriver, ranges);

    // shape for UI: ranges + topByRange mapped to driver objects
    const rangeTopPerformers = ranges.map((r, i) => ({
      label: r.label,
      performers: (topByRange[i] || []).map((p: any) => {
        const driverObj = DRIVERS.find((d) => d.code === p.driverCode) ?? { code: p.driverCode, id: p.driverCode.toLowerCase(), firstName: p.driverCode, lastName: '', number: 0, team: 'unknown' };
        return { driver: driverObj, avgLapMs: p.avgLapMs, compoundsUsed: p.compoundsUsed || [], lapCount: p.lapCount };
      }),
    }));

    return { ranges, metrics, topByRange, consistency, rangeTopPerformers };
  }, [framesQuery.data]);

  return { data, isLoading: framesQuery.isLoading, isError: framesQuery.isError } as {
    data: any | undefined;
    isLoading: boolean;
    isError: boolean;
  };
}

// ---------------------------------------------------------------------------
// Prefetch — warms tyre strategy + position cache when race detail loads.
// Call this in a useEffect in RaceAnalysisShell after race data is available.
// ---------------------------------------------------------------------------

export function usePrefetchRaceAnalysis(year: number, round: number, session = "R", enabled = true) {
  const queryClient = useQueryClient();

  useMemo(() => {
    if (!enabled) return;

    queryClient.prefetchQuery({
      queryKey: queryKeys.lapAnalysis.byType(year, round, "tyre", undefined, session),
      queryFn: () => fetchTyreStrategy(year, round, session),
      staleTime: cacheConfig.historical.staleTime,
    });

    queryClient.prefetchQuery({
      queryKey: queryKeys.sessionData.byType(year, round, "positions", session),
      queryFn: () => fetchUnifiedPositions(year, round, session, undefined, undefined, queryClient),
      staleTime: cacheConfig.completedRace.staleTime,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, round, session, enabled]);
}

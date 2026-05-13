import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";
import type { AnalysisSessionName } from "@/types/api";
import { getAnalysis, getTelemetry, getTelemetryOverlay, getTelemetrySummary, getUnifiedPositions } from "@/Lib/api/services";
import type { UnifiedPositionsResponse, TelemetryResponse, TelemetryOverlayResponse, TelemetrySummaryResponse } from "@/types/endpoints";
import {
  adaptRaceLapFrames,
  adaptLapTimes,
  adaptStints,
  adaptTyreStrategy,
  adaptSectorAnalysis,
  adaptTeammateBattles,
  adaptConsistencyByStint,
} from "@/Lib/adapters";
import { DRIVERS } from "@/Lib/data/drivers";
import type {
  RaceLapFrame,
  LapTime,
  Stint,
  SectorAnalysis,
  ConsistencyScore,
  TeammateBattle,
} from "@/types/ui";

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
) {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", driver),
    queryFn: () => getAnalysis(year, round, "laps", { session: "R", driver }),
    ...cacheConfig.historical,
    enabled: !!driver,
  });
}

export function useDriverPace(
  year: number,
  round: number,
  driver: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "pace", driver),
    queryFn: () => getAnalysis(year, round, "pace", { session: "R", driver }),
    ...cacheConfig.historical,
    enabled: !!driver,
  });
}

export function useDriverStints(
  year: number,
  round: number,
  driver: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "stints", driver),
    queryFn: () => getAnalysis(year, round, "stints", { session: "R", driver }),
    ...cacheConfig.historical,
    enabled: !!driver,
  });
}

export function useAllLaps(year: number, round: number) {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
    queryFn: () => getAnalysis(year, round, "laps", { session: "R" }),
    ...cacheConfig.historical,
  });
}

export function useAllStints(year: number, round: number) {
  return useQuery<Stint[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "stints", undefined),
    queryFn: () => getAnalysis(year, round, "stints", { session: "R" }),
    select: (raw: any) => (raw ? adaptStints(raw) : undefined),
    ...cacheConfig.historical,
  });
}

export function useRaceLapFrames(year: number, round: number, enabled = true) {
  return useQuery<RaceLapFrame[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
    queryFn: () => getAnalysis(year, round, "laps", { session: "R" }),
    select: (raw: any) => (raw ? adaptRaceLapFrames(raw) : undefined),
    ...cacheConfig.historical,
    enabled,
  });
}

export function useLapTimes(year: number, round: number, enabled = true) {
  return useQuery<LapTime[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
    queryFn: () => getAnalysis(year, round, "laps", { session: "R" }),
    select: (raw: any) => (raw ? adaptLapTimes(raw) : undefined),
    ...cacheConfig.historical,
    enabled,
  });
}

export function useTyreStrategy(year: number, round: number) {
  return useQuery<Stint[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "tyre"),
    queryFn: () => getAnalysis(year, round, "tyre-strategy", { session: "R" }),
    select: (raw: any) => (raw ? adaptTyreStrategy(raw) : undefined),
    ...cacheConfig.historical,
  });
}

export function useSectorAnalysis(year: number, round: number) {
  return useQuery<SectorAnalysis[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
    queryFn: () => getAnalysis(year, round, "laps", { session: "R" }),
    select: (raw: any) => (raw ? adaptSectorAnalysis(raw) : undefined),
    ...cacheConfig.historical,
  });
}

export function useConsistencyByStint(year: number, round: number, enabled = true) {
  const framesQuery = useRaceLapFrames(year, round, enabled);
  const frames = framesQuery.data ?? [];
  const data = useMemo(() => (frames.length ? adaptConsistencyByStint(frames, DRIVERS) : new Map<number | "overall", ConsistencyScore[]>()), [frames]);
  return { data, isLoading: framesQuery.isLoading, isError: framesQuery.isError } as {
    data: Map<number | "overall", ConsistencyScore[]>;
    isLoading: boolean;
    isError: boolean;
  };
}

export function useTeammateBattles(year: number, round: number, enabled = true) {
  const framesQuery = useRaceLapFrames(year, round, enabled);
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
) {
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "sectors", driver),
    queryFn: () => getAnalysis(year, round, "sector-analysis", { session: "R", driver }),
    ...cacheConfig.historical,
    enabled: !!driver,
  });
}

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

export function useTelemetry(
  year: number,
  round: number,
  driver: string | undefined,
  lap: number | null,
  session: AnalysisSessionName = "R",
) {
  return useQuery<TelemetryResponse>({
    queryKey: queryKeys.telemetry.single(
      year,
      round,
      driver ?? "",
      lap ?? 0,
      session,
    ),
    queryFn: () => getTelemetry(year, round, { driver: driver!, lap: lap!, session }),
    ...cacheConfig.heavyOptIn,
    enabled: !!driver && lap !== null,
  });
}

export function useTelemetryOverlay(
  year: number,
  round: number,
  driverA: string | undefined,
  driverB: string | undefined,
  lap: number | undefined,
  session: AnalysisSessionName = "R",
) {
  return useQuery<TelemetryOverlayResponse>({
    queryKey: queryKeys.telemetry.overlay(
      year,
      round,
      driverA ?? "",
      driverB ?? "",
      lap,
    ),
    queryFn: () => {
      const params: Record<string, string | number> = { driver_a: driverA!, driver_b: driverB!, session };
      if (lap !== undefined) params.lap = lap;
      return getTelemetryOverlay(year, round, params);
    },
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
    queryFn: () => getTelemetrySummary(year, round, { driver: driver!, lap: lap!, session }),
    ...cacheConfig.heavyOptIn,
    enabled: !!driver && lap !== null,
  });
}

// ---------------------------------------------------------------------------
// Unified — Positions
// ---------------------------------------------------------------------------

export function useRacePositions(year: number, round: number, enabled = true) {
  return useQuery<UnifiedPositionsResponse>({
    queryKey: queryKeys.sessionData.byType(year, round, "positions"),
    queryFn: () => getUnifiedPositions(year, round, "R"),
    ...cacheConfig.historical,
    enabled,
  });
}

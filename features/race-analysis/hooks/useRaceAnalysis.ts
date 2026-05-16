import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";
import type { AnalysisSessionName } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { fetchLapsAnalysis, fetchDriverPace, fetchDriverStints, fetchTyreStrategy,
         fetchSectorAnalysis, fetchTelemetry, fetchTelemetryOverlay,
         fetchTelemetrySummary, fetchUnifiedPositions } from "@/Lib/queryFunctions";
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
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", driver),
    queryFn: () => fetchLapsAnalysis(year, round, { session: "R", driver }, qc),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled: !!driver,
  });
}

export function useDriverPace(
  year: number,
  round: number,
  driver: string | undefined,
) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "pace", driver),
    queryFn: () => fetchDriverPace(year, round, driver!, qc),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled: !!driver,
  });
}

export function useDriverStints(
  year: number,
  round: number,
  driver: string | undefined,
) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "stints", driver),
    queryFn: () => fetchDriverStints(year, round, driver, qc),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled: !!driver,
  });
}

export function useAllLaps(year: number, round: number) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
    queryFn: () => fetchLapsAnalysis(year, round, { session: "R" }, qc),
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useAllStints(year: number, round: number) {
  const qc = useQueryClient();
  return useQuery<Stint[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "stints", undefined),
    queryFn: () => fetchDriverStints(year, round, undefined, qc) as Promise<any>,
    select: (raw: any) => (raw ? adaptStints(raw) : undefined),
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useRaceLapFrames(year: number, round: number, enabled = true) {
  const qc = useQueryClient();
  return useQuery<RaceLapFrame[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
    queryFn: () => fetchLapsAnalysis(year, round, { session: "R" }, qc) as Promise<any>,
    select: (raw: any) => (raw ? adaptRaceLapFrames(raw) : undefined),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled,
  });
}

export function useLapTimes(year: number, round: number, enabled = true) {
  const qc = useQueryClient();
  return useQuery<LapTime[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
    queryFn: () => fetchLapsAnalysis(year, round, { session: "R" }, qc) as Promise<any>,
    select: (raw: any) => (raw ? adaptLapTimes(raw) : undefined),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled,
  });
}

export function useTyreStrategy(year: number, round: number) {
  const qc = useQueryClient();
  return useQuery<Stint[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "tyre"),
    queryFn: () => fetchTyreStrategy(year, round, qc) as Promise<any>,
    select: (raw: any) => (raw ? adaptTyreStrategy(raw) : undefined),
    staleTime: 86400000,
    gcTime: 86400000,
  });
}

export function useSectorAnalysis(year: number, round: number) {
  const qc = useQueryClient();
  return useQuery<SectorAnalysis[] | undefined>({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "laps", undefined),
    queryFn: () => fetchLapsAnalysis(year, round, { session: "R" }, qc) as Promise<any>,
    select: (raw: any) => (raw ? adaptSectorAnalysis(raw) : undefined),
    staleTime: 86400000,
    gcTime: 86400000,
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
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.lapAnalysis.byType(year, round, "sectors", driver),
    queryFn: () => fetchSectorAnalysis(year, round, driver, qc),
    staleTime: 86400000,
    gcTime: 86400000,
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
  const qc = useQueryClient();
  return useQuery<TelemetryResponse>({
    queryKey: queryKeys.telemetry.single(
      year,
      round,
      driver ?? "",
      lap ?? 0,
      session,
    ),
    queryFn: () => fetchTelemetry(year, round, driver!, lap!, session, qc),
    staleTime: 86400000,
    gcTime: 86400000,
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
  const qc = useQueryClient();
  return useQuery<TelemetryOverlayResponse>({
    queryKey: queryKeys.telemetry.overlay(
      year,
      round,
      driverA ?? "",
      driverB ?? "",
      lap,
    ),
    queryFn: () => fetchTelemetryOverlay(year, round, driverA!, driverB!, lap, qc, session),
    staleTime: 86400000,
    gcTime: 86400000,
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
  const qc = useQueryClient();
  return useQuery<TelemetrySummaryResponse>({
    queryKey: queryKeys.telemetry.summary(
      year,
      round,
      driver ?? "",
      lap ?? 0,
    ),
    queryFn: () => fetchTelemetrySummary(year, round, driver!, lap!, session, qc),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled: !!driver && lap !== null,
  });
}

// ---------------------------------------------------------------------------
// Unified — Positions
// ---------------------------------------------------------------------------

export function useRacePositions(year: number, round: number, enabled = true) {
  const qc = useQueryClient();
  return useQuery<UnifiedPositionsResponse>({
    queryKey: queryKeys.sessionData.byType(year, round, "positions"),
    queryFn: () => fetchUnifiedPositions(year, round, "R", undefined, qc),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled,
  });
}

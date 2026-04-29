import { useQuery } from "@tanstack/react-query";

import {
  getLapsAnalysis,
  getPaceAnalysis,
  getStintsAnalysis,
  getSectorAnalysis,
  getTyreStrategyAnalysis,
  getTelemetry,
  getTelemetryOverlay,
  getTelemetrySummary,
} from "@/Api_services/race-analysis";
import {
  getPersistenceCoverageByYear,
  getPersistenceCoverageByRace,
} from "@/Api_services/coverage";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";
import type { AnalysisSessionName } from "@/types/api";

// ---------------------------------------------------------------------------
// Coverage
// ---------------------------------------------------------------------------

export function useCoverageSeason(year: number) {
  return useQuery({
    queryKey: queryKeys.coverage.season(year),
    queryFn: () => getPersistenceCoverageByYear(year),
    ...cacheConfig.coverage,
  });
}

export function useCoverageRound(year: number, round: number) {
  return useQuery({
    queryKey: queryKeys.coverage.round(year, round),
    queryFn: () => getPersistenceCoverageByRace(year, round),
    ...cacheConfig.coverage,
  });
}

// ---------------------------------------------------------------------------
// Grid-wide (no driver filter)
// ---------------------------------------------------------------------------

export function useTyreStrategy(year: number, round: number) {
  return useQuery({
    queryKey: queryKeys.analysis.tyre(year, round),
    queryFn: () => getTyreStrategyAnalysis(year, round, { session: "R" }),
    ...cacheConfig.historical,
  });
}

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
    queryKey: queryKeys.analysis.laps(year, round, driver),
    queryFn: () => getLapsAnalysis(year, round, { session: "R", driver }),
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
    queryKey: queryKeys.analysis.pace(year, round, driver),
    queryFn: () => getPaceAnalysis(year, round, { session: "R", driver }),
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
    queryKey: queryKeys.analysis.stints(year, round, driver),
    queryFn: () => getStintsAnalysis(year, round, { session: "R", driver }),
    ...cacheConfig.historical,
    enabled: !!driver,
  });
}

export function useDriverSectors(
  year: number,
  round: number,
  driver: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.analysis.sectors(year, round, driver),
    queryFn: () => getSectorAnalysis(year, round, { session: "R", driver }),
    ...cacheConfig.historical,
    enabled: !!driver,
  });
}

// ---------------------------------------------------------------------------
// Telemetry — coverage-gated
// Each hook first checks coverage before enabling the actual fetch.
// ---------------------------------------------------------------------------

export function useTelemetry(
  year: number,
  round: number,
  driver: string | undefined,
  lap: number | null,
  session: AnalysisSessionName = "R",
) {
  const { data: coverage } = useCoverageRound(year, round);

  const sessionKey = session === "Race" ? "R" : session === "Qualifying" ? "Q" : session;
  const telemetryAvailable =
    coverage?.sessions?.[sessionKey]?.telemetry === true;

  return useQuery({
    queryKey: queryKeys.analysis.telemetry(
      year,
      round,
      driver ?? "",
      lap ?? 0,
      session,
    ),
    queryFn: () =>
      getTelemetry(year, round, {
        session,
        driver: driver!,
        lap: lap!,
      }),
    ...cacheConfig.heavyOptIn,
    enabled: telemetryAvailable && !!driver && lap !== null,
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
  const { data: coverage } = useCoverageRound(year, round);

  const sessionKey = session === "Race" ? "R" : session === "Qualifying" ? "Q" : session;
  const telemetryAvailable =
    coverage?.sessions?.[sessionKey]?.telemetry === true;

  return useQuery({
    queryKey: queryKeys.analysis.telemetryOverlay(
      year,
      round,
      driverA ?? "",
      driverB ?? "",
      lap,
    ),
    queryFn: () =>
      getTelemetryOverlay(year, round, {
        session,
        driver_a: driverA!,
        driver_b: driverB!,
        lap,
      }),
    ...cacheConfig.heavyOptIn,
    enabled: telemetryAvailable && !!driverA && !!driverB,
  });
}

export function useTelemetrySummary(
  year: number,
  round: number,
  driver: string | undefined,
  lap: number | null,
  session: AnalysisSessionName = "R",
) {
  const { data: coverage } = useCoverageRound(year, round);

  const sessionKey = session === "Race" ? "R" : session === "Qualifying" ? "Q" : session;
  const telemetryAvailable =
    coverage?.sessions?.[sessionKey]?.telemetry === true;

  return useQuery({
    queryKey: queryKeys.analysis.telemetrySummary(
      year,
      round,
      driver ?? "",
      lap ?? 0,
    ),
    queryFn: () =>
      getTelemetrySummary(year, round, {
        session,
        driver: driver!,
        lap: lap!,
      }),
    ...cacheConfig.heavyOptIn,
    enabled: telemetryAvailable && !!driver && lap !== null,
  });
}

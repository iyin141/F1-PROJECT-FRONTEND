import { useQuery } from "@tanstack/react-query";

import { getPersistenceCoverageByRace } from "@/Api_services/coverage";
import { getTelemetry } from "@/Api_services/race-analysis";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";
import type { AnalysisSessionName } from "@/types/api";

/**
 * Loads coverage flags for a single race round.
 * Must be called before useDriverTelemetry — the telemetry hook
 * reads from this result to decide whether to fire.
 */
export function useDriverTelemetryCoverage(year: number, round: number) {
  return useQuery({
    queryKey: queryKeys.coverage.round(year, round),
    queryFn: () => getPersistenceCoverageByRace(year, round),
    ...cacheConfig.coverage,
  });
}

/**
 * Loads telemetry for a specific driver lap.
 * Hard-blocked until coverage confirms telemetry is available for the session.
 *
 * @param driverCode - 3-letter driver code, e.g. "VER"
 * @param year       - season year
 * @param round      - race round number
 * @param lap        - lap number (null disables the query)
 * @param session    - session code, default "R"
 */
export function useDriverTelemetry(
  driverCode: string,
  year: number,
  round: number,
  lap: number | null,
  session: AnalysisSessionName = "R",
) {
  const { data: coverage } = useDriverTelemetryCoverage(year, round);

  // Normalise session name to the short code used in the coverage map.
  const sessionKey =
    session === "Race" ? "R" : session === "Qualifying" ? "Q" : session;

  const telemetryAvailable =
    coverage?.sessions?.[sessionKey]?.telemetry === true;

  return useQuery({
    queryKey: queryKeys.driver.telemetry(
      driverCode,
      year,
      round,
      lap ?? 0,
      session,
    ),
    queryFn: () =>
      getTelemetry(year, round, {
        session,
        driver: driverCode,
        lap: lap!,
      }),
    ...cacheConfig.driverTelemetry,
    enabled: telemetryAvailable && lap !== null && !!driverCode,
  });
}

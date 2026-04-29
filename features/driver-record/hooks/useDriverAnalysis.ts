import { useQuery } from "@tanstack/react-query";

import {
  getLapsAnalysis,
  getStintsAnalysis,
  getPaceAnalysis,
  getSectorAnalysis,
} from "@/Api_services/race-analysis";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";

/**
 * All four hooks are opt-in via the `enabled` flag.
 * They fire only when the user drills into a specific race on the driver page.
 * All use driverHistorical config — this data never changes once loaded.
 */

export function useDriverRaceLaps(
  driverCode: string,
  year: number,
  round: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.driver.raceLaps(driverCode, year, round),
    queryFn: () =>
      getLapsAnalysis(year, round, { session: "R", driver: driverCode }),
    ...cacheConfig.driverHistorical,
    enabled: enabled && !!driverCode,
  });
}

export function useDriverRaceStints(
  driverCode: string,
  year: number,
  round: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.driver.raceStints(driverCode, year, round),
    queryFn: () =>
      getStintsAnalysis(year, round, { session: "R", driver: driverCode }),
    ...cacheConfig.driverHistorical,
    enabled: enabled && !!driverCode,
  });
}

export function useDriverRacePace(
  driverCode: string,
  year: number,
  round: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.driver.racePace(driverCode, year, round),
    queryFn: () =>
      getPaceAnalysis(year, round, { session: "R", driver: driverCode }),
    ...cacheConfig.driverHistorical,
    enabled: enabled && !!driverCode,
  });
}

export function useDriverRaceSectors(
  driverCode: string,
  year: number,
  round: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.driver.raceSectors(driverCode, year, round),
    queryFn: () =>
      getSectorAnalysis(year, round, { session: "R", driver: driverCode }),
    ...cacheConfig.driverHistorical,
    enabled: enabled && !!driverCode,
  });
}

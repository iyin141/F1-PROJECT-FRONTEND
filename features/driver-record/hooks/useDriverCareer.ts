import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";

import { getDriverStandings } from "@/Api_services/season-hub";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";
import type { DriverStandingRow } from "@/types/endpoints";

const CURRENT_YEAR = new Date().getFullYear();
const CAREER_SCAN_START = CURRENT_YEAR;
const MAX_CONSECUTIVE_MISSES = 3;

/**
 * Derives a driver code from a standings row's driver_name field.
 * e.g. "Max Verstappen" → "VER" won't work — but "VER" is the input driverCode.
 * We match by splitting the full name and comparing the uppercased surname
 * against what we'd expect for the given code.
 *
 * Limitation: This is a heuristic. Some driver codes don't match their surname.
 * Example edge cases: "Zhou Guanyu" → "ZHO", not "GUANYU".
 */
function driverMatchesCode(row: DriverStandingRow, driverCode: string): boolean {
  const parts = row.driver_name.trim().split(/\s+/);
  const surname = parts[parts.length - 1]?.toUpperCase() ?? "";
  return surname.startsWith(driverCode.slice(0, 3));
}

/**
 * Scans seasons backwards from the current year to find all years
 * in which the driver competed. Stops after 3 consecutive misses.
 *
 * Note: This fires sequential API calls — intentionally serialised
 * to avoid hammering the backend on first load. Results are cached
 * indefinitely (driverHistorical) once discovered.
 */
export function useDriverYearList(driverCode: string) {
  return useQuery({
    queryKey: queryKeys.driver.yearList(driverCode),
    queryFn: async () => {
      const years: number[] = [];
      let consecutiveMisses = 0;

      for (let year = CAREER_SCAN_START; year >= 1950; year--) {
        if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) break;

        try {
          const response = await getDriverStandings(year);
          const found = response.standings.some((row) =>
            driverMatchesCode(row, driverCode),
          );

          if (found) {
            years.push(year);
            consecutiveMisses = 0;
          } else {
            consecutiveMisses++;
          }
        } catch {
          consecutiveMisses++;
        }
      }

      return years;
    },
    ...cacheConfig.driverHistorical,
    enabled: !!driverCode,
  });
}

/**
 * Loads the driver's championship standing for each year they competed.
 * Cache-first: if Season Hub already fetched a year's standings,
 * this reuses that cache entry without a network call.
 */
export function useDriverCareerStandings(driverCode: string, years: number[]) {
  const queryClient = useQueryClient();

  return useQueries({
    queries: years.map((year) => ({
      queryKey: queryKeys.driver.seasonStanding(driverCode, year),
      queryFn: async () => {
        // Check if the full standings for this year are already cached
        // (e.g. from a Season Hub visit) before making a new fetch.
        const cached = queryClient.getQueryData<Awaited<ReturnType<typeof getDriverStandings>>>(
          queryKeys.standings.drivers(year),
        );

        const source = cached ?? (await getDriverStandings(year));

        const row = source.standings.find((r) => driverMatchesCode(r, driverCode));
        return row ?? null;
      },
      ...cacheConfig.driverHistorical,
      enabled: years.length > 0 && !!driverCode,
    })),
  });
}

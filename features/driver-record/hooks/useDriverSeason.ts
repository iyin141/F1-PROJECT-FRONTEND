import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";

import { getSeasonSchedule } from "@/Api_services/season-hub";
import { getRaceResults } from "@/Api_services/race-detail";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";
import type { SeasonScheduleResponse } from "@/types/endpoints";

/**
 * Loads the list of rounds for a season.
 * Reuses the shared `races.all` key — if Season Hub already fetched
 * this year's schedule, no network call is made.
 */
export function useDriverSeasonRounds(year: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.races.all(year),
    queryFn: async () => {
      // Reuse cached schedule from Season Hub if available.
      const cached = queryClient.getQueryData<SeasonScheduleResponse>(
        queryKeys.races.all(year),
      );
      return cached ?? getSeasonSchedule(year);
    },
    ...cacheConfig.activeSeason,
  });
}

/**
 * Loads race results for every round in the season, filtered to the
 * specific driver. Fires one query per round via useQueries.
 *
 * @param driverCode - 3-letter code used to match `driver_name` via surname heuristic
 * @param year       - season year
 * @param rounds     - array of round numbers (from useDriverSeasonRounds)
 * @param enabled    - gate flag — set false until rounds are loaded
 */
export function useDriverSeasonResults(
  driverCode: string,
  year: number,
  rounds: number[],
  enabled: boolean,
) {
  return useQueries({
    queries: rounds.map((round) => ({
      queryKey: queryKeys.driver.roundResult(driverCode, year, round),
      queryFn: async () => {
        const response = await getRaceResults(year, round);

        const parts = driverCode.toUpperCase();
        const row = response.results.race.find((r) => {
          const surname = r.driver_name.trim().split(/\s+/).pop()?.toUpperCase() ?? "";
          return surname.startsWith(parts.slice(0, 3));
        });

        return { round, result: row ?? null };
      },
      ...cacheConfig.driverHistorical,
      enabled: enabled && rounds.length > 0 && !!driverCode,
    })),
  });
}

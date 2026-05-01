import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";

import {
  getSeasonSchedule,
  getDriverStandings,
  getConstructorStandings,
} from "@/Api_services/season-hub";
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";

export function useSeasonSchedule(year: number) {
  return useQuery({
    queryKey: queryKeys.races.all(year),
    queryFn: () => getSeasonSchedule(year),
    ...cacheConfig.activeSeason,
  });
}

export function useSeasonScheduleFallback(baseYear: number) {
  const years = useMemo(
    () => [baseYear, baseYear - 1, baseYear + 1, baseYear - 2],
    [baseYear],
  );

  const results = useQueries({
    queries: years.map((year) => ({
      queryKey: queryKeys.races.all(year),
      queryFn: () => getSeasonSchedule(year),
      ...cacheConfig.activeSeason,
    })),
  });

  const selectedIndex = results.findIndex((q) => (q.data?.races?.length ?? 0) > 0);
  const selected = selectedIndex >= 0 ? results[selectedIndex]?.data : undefined;

  return {
    years,
    queries: results,
    data: selected,
    selectedYear: selected?.year,
    isLoading: results.some((q) => q.isPending),
    isError: results.some((q) => q.isError),
  };
}

export function useDriverStandings(year: number) {
  return useQuery({
    queryKey: queryKeys.standings.drivers(year),
    queryFn: () => getDriverStandings(year),
    ...cacheConfig.activeSeason,
  });
}

export function useConstructorStandings(year: number) {
  return useQuery({
    queryKey: queryKeys.standings.constructors(year),
    queryFn: () => getConstructorStandings(year),
    ...cacheConfig.activeSeason,
  });
}

// ---------------------------------------------------------------------------
// Theme hook — re-exported from canonical location
// ---------------------------------------------------------------------------

/** @deprecated Import useTheme from "@/Lib/hooks/useTheme" instead. */
export { useTheme } from "@/Lib/hooks/useTheme";

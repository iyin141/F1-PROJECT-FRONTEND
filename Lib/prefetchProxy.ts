import "server-only";

import { prefetchQueries } from "@/Lib/prefetch";
import { queryKeys } from "@/Lib/queryKeys";

const MIN_YEAR = 1950;

function clampYear(year: number) {
  return Math.max(MIN_YEAR, Math.min(new Date().getFullYear(), year));
}

function buildYearRange(year: number, back = 2) {
  const top = clampYear(year);
  const bottom = clampYear(year - back);
  const years: number[] = [];
  for (let y = top; y >= bottom; y--) years.push(y);
  return years;
}

/**
 * Prefetch home-related queries for a year range (year .. year-back)
 * Returns the same shape as `prefetchQueries()` so callers can hydrate.
 */
export async function prefetchHomeYears(year: number, back = 2) {
  const years = buildYearRange(year, back);
  console.log("[prefetchProxy] prefetchHomeYears: start", { year, back, years });

  const queries = years.flatMap((y) => [
    {
      queryKey: queryKeys.schedule.season(y),
      pathname: `/races/${y}/`,
    },
    {
      queryKey: queryKeys.driverStandings.grid(y),
      pathname: `/drivers/${y}/`,
    },
    {
      queryKey: queryKeys.constructorStandings.year(y),
      pathname: `/constructors/${y}/`,
    },
  ]);

  try {
    const result = await prefetchQueries(queries);
    console.log("[prefetchProxy] prefetchHomeYears: complete", { years });
    return result;
  } catch (err) {
    console.error("[prefetchProxy] prefetchHomeYears: failed", { years, err });
    throw err;
  }
}

/**
 * Generic helper: prefetch the same three core queries for one year.
 * Useful for pages that only want a single-year prefetch but still want
 * consistent logging and behaviour.
 */
export async function prefetchHomeYearSingle(year: number) {
  return prefetchHomeYears(year, 0);
}

// ---------------------------------------------------------------------------
// Season Hub
// ---------------------------------------------------------------------------

/**
 * Prefetch schedule + both standings for the Season Hub page.
 * Hydrate with HydrationBoundary so SeasonHubShell renders without re-fetching.
 */
export async function prefetchSeason(year: number) {
  console.log("[prefetchProxy] prefetchSeason: start", { year });
  try {
    const result = await prefetchQueries([
      {
        queryKey: queryKeys.schedule.season(year),
        pathname: `/races/${year}/`,
      },
      {
        queryKey: queryKeys.driverStandings.grid(year),
        pathname: `/drivers/${year}/`,
      },
      {
        queryKey: queryKeys.constructorStandings.year(year),
        pathname: `/constructors/${year}/`,
      },
    ]);
    console.log("[prefetchProxy] prefetchSeason: complete", { year });
    return result;
  } catch (err) {
    console.error("[prefetchProxy] prefetchSeason: failed", { year, err });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Drivers Hub (year grid)
// ---------------------------------------------------------------------------

/**
 * Prefetch driver standings grid for the Drivers Year page.
 */
export async function prefetchDriversYear(year: number) {
  console.log("[prefetchProxy] prefetchDriversYear: start", { year });
  try {
    const result = await prefetchQueries([
      {
        queryKey: queryKeys.driverStandings.grid(year),
        pathname: `/drivers/${year}/`,
      },
    ]);
    console.log("[prefetchProxy] prefetchDriversYear: complete", { year });
    return result;
  } catch (err) {
    console.error("[prefetchProxy] prefetchDriversYear: failed", { year, err });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Driver detail (career + season)
// ---------------------------------------------------------------------------

/**
 * Prefetch career history and season results for a single driver.
 */
export async function prefetchDriverYear(driverCode: string, year: number) {
  console.log("[prefetchProxy] prefetchDriverYear: start", { driverCode, year });
  try {
    const result = await prefetchQueries([
      {
        queryKey: queryKeys.driverStandings.career(driverCode),
        pathname: `/drivers/${driverCode}/career/`,
      },
      {
        queryKey: queryKeys.driverStandings.season(driverCode, year),
        pathname: `/drivers/${driverCode}/${year}/`,
      },
    ]);
    console.log("[prefetchProxy] prefetchDriverYear: complete", { driverCode, year });
    return result;
  } catch (err) {
    console.error("[prefetchProxy] prefetchDriverYear: failed", { driverCode, year, err });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Race detail (header + race results + qualifying)
// ---------------------------------------------------------------------------

/**
 * Prefetch the three above-the-fold queries for a Race Detail page.
 *
 * Only hydrates: race header, race results, qualifying results.
 * Heavy payloads (practice, sprint, replay, lap analysis) are NOT prefetched here
 * and should be loaded on demand from the client.
 */
export async function prefetchRaceDetail(year: number, round: number) {
  console.log("[prefetchProxy] prefetchRaceDetail: start", { year, round });
  try {
    const result = await prefetchQueries([
      {
        queryKey: queryKeys.raceResults.detail(year, round),
        pathname: `/races/${year}/${round}/`,
      },
      {
        queryKey: queryKeys.raceResults.session(year, round, "R"),
        pathname: `/races/${year}/${round}/results/`,
      },
      {
        queryKey: queryKeys.raceResults.qualifying(year, round),
        pathname: `/races/${year}/${round}/qualifying/`,
      },
    ]);
    console.log("[prefetchProxy] prefetchRaceDetail: complete", { year, round });
    return result;
  } catch (err) {
    console.error("[prefetchProxy] prefetchRaceDetail: failed", { year, round, err });
    throw err;
  }
}

import { QueryClient } from "@tanstack/react-query";
import fetchWithCache from "@/Lib/api/queryBridge";
import { queryKeys } from "@/Lib/queryKeys";
import { getSeasonSchedule, getDriverStandings, getConstructorStandings } from "@/Lib/api/services/standings";

export async function getSeasonScheduleBridged(
  client: QueryClient | undefined,
  year: number,
  opts?: { force?: boolean } & Record<string, unknown>,
) {
  if (!client) return getSeasonSchedule(year);
  return fetchWithCache(client, queryKeys.schedule.season(year), () => getSeasonSchedule(year), opts);
}

export async function getDriverStandingsBridged(
  client: QueryClient | undefined,
  year: number,
  opts?: { force?: boolean } & Record<string, unknown>,
) {
  if (!client) return getDriverStandings(year);
  return fetchWithCache(client, queryKeys.driverStandings.grid(year), () => getDriverStandings(year), opts);
}

export async function getConstructorStandingsBridged(
  client: QueryClient | undefined,
  year: number,
  opts?: { force?: boolean } & Record<string, unknown>,
) {
  if (!client) return getConstructorStandings(year);
  return fetchWithCache(client, queryKeys.constructorStandings.year(year), () => getConstructorStandings(year), opts);
}

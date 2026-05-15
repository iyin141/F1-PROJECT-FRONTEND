import { QueryClient } from "@tanstack/react-query";
import fetchWithCache from "@/Lib/api/queryBridge";
import { queryKeys } from "@/Lib/queryKeys";
import { getDriverCareer, getDriverSeason } from "@/Lib/api/services/drivers";

export async function getDriverCareerBridged(
  client: QueryClient | undefined,
  driverCode: string,
  opts?: { force?: boolean } & Record<string, unknown>,
) {
  if (!client) return getDriverCareer(driverCode);
  return fetchWithCache(client, queryKeys.driverStandings.career(driverCode), () => getDriverCareer(driverCode), opts);
}

export async function getDriverSeasonBridged(
  client: QueryClient | undefined,
  driverCode: string,
  year: number,
  opts?: { force?: boolean } & Record<string, unknown>,
) {
  if (!client) return getDriverSeason(driverCode, year);
  return fetchWithCache(client, queryKeys.driverStandings.season(driverCode, year), () => getDriverSeason(driverCode, year), opts);
}

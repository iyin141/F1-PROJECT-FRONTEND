import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/Lib/queryKeys";
import fetchWithCache from "@/Lib/api/queryBridge";
import { getRaceResults, getRaceDetail } from "@/Lib/api/services/races";

export async function getRaceResultsBridged(
  client: QueryClient | undefined,
  year: number,
  round: number,
  opts?: { force?: boolean } & Record<string, unknown>,
) {
  if (!client) return getRaceResults(year, round);
  return fetchWithCache(client, queryKeys.raceResults.detail(year, round), () => getRaceResults(year, round), opts);
}

export async function getRaceDetailBridged(
  client: QueryClient | undefined,
  year: number,
  round: number,
  opts?: { force?: boolean } & Record<string, unknown>,
) {
  if (!client) return getRaceDetail(year, round);
  return fetchWithCache(client, queryKeys.raceResults.detail(year, round), () => getRaceDetail(year, round), opts);
}

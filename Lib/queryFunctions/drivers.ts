import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/Lib/queryKeys";

import {
  getDriverCareer,
  getDriverSeason,
  getDriversForSeason,
  searchDriversByName,
} from "@/Lib/api_services/drivers";

import type { DriverCareerResponse, DriverSeasonBreakdownResponse } from "@/types/endpoints/driverrecordtypes";

export async function fetchDriverCareer(
  driverCode: string,
  queryClient: QueryClient,
): Promise<DriverCareerResponse> {
  const key = queryKeys.driverStandings.career(driverCode);
  const cached = queryClient.getQueryData<DriverCareerResponse>(key);
  if (cached) return cached;
  const data = await getDriverCareer(driverCode);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchDriverSeason(
  driverCode: string,
  year: number,
  queryClient: QueryClient,
): Promise<DriverSeasonBreakdownResponse> {
  const key = queryKeys.driverStandings.season(driverCode, year);
  const cached = queryClient.getQueryData<DriverSeasonBreakdownResponse>(key);
  if (cached) return cached;
  const data = await getDriverSeason(driverCode, year);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchDriversForSeason(
  year: number,
  queryClient: QueryClient,
): Promise<any> {
  const key = queryKeys.driverSearch.season(year);
  const cached = queryClient.getQueryData<any>(key);
  if (cached) return cached;
  const data = await getDriversForSeason(year);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchDriversByName(
  q: string,
  year: number | undefined,
  queryClient: QueryClient,
): Promise<any> {
  const key = queryKeys.driverSearch.byName(q, year);
  const cached = queryClient.getQueryData<any>(key);
  if (cached) return cached;
  const data = await searchDriversByName(q, year);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

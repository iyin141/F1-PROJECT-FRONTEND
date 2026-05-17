import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/Lib/queryKeys";

import {
  getUnifiedWeather,
  getUnifiedIncidents,
  getUnifiedPositions,
  getUnifiedPitStops,
  getUnifiedDrs,
  getUnifiedTrackStatus,
  getFullSession,
} from "@/Lib/api_services/unified";

import type { UnifiedWeatherResponse } from "@/types/endpoints/weathertypes";
import type { UnifiedIncidentsResponse } from "@/types/endpoints/incidentstypes";
import type { UnifiedPositionsResponse } from "@/types/endpoints/positionstypes";
import type { UnifiedPitStopsResponse } from "@/types/endpoints/pitstopstypes";
import type { UnifiedDrsResponse } from "@/types/endpoints/drstypes";
import type { UnifiedTrackStatusResponse } from "@/types/endpoints/trackstatustypes";
import type { FullSessionResponse } from "@/types/endpoints/fullsessiontypes";

export async function fetchUnifiedWeather(
  year: number,
  round: number,
  session: string,
  queryClient: QueryClient,
): Promise<UnifiedWeatherResponse> {
  const key = queryKeys.sessionData.byType(year, round, "weather");
  const cached = queryClient.getQueryData<UnifiedWeatherResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedWeather(year, round, session);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedIncidents(
  year: number,
  round: number,
  session: string,
  queryClient: QueryClient,
): Promise<UnifiedIncidentsResponse> {
  const key = queryKeys.sessionData.byType(year, round, "incidents");
  const cached = queryClient.getQueryData<UnifiedIncidentsResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedIncidents(year, round, session);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedPositions(
  year: number,
  round: number,
  session: string,
  sample: number | undefined,
  queryClient: QueryClient,
): Promise<UnifiedPositionsResponse> {
  const key = queryKeys.replayPositions(year, round, session);
  const cached = queryClient.getQueryData<UnifiedPositionsResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedPositions(year, round, session, sample);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedPitStops(
  year: number,
  round: number,
  session: string,
  queryClient: QueryClient,
): Promise<UnifiedPitStopsResponse> {
  const key = queryKeys.replayPitStops(year, round);
  const cached = queryClient.getQueryData<UnifiedPitStopsResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedPitStops(year, round, session);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedDrs(
  year: number,
  round: number,
  session: string,
  queryClient: QueryClient,
): Promise<UnifiedDrsResponse> {
  const key = queryKeys.sessionData.byType(year, round, "drs");
  const cached = queryClient.getQueryData<UnifiedDrsResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedDrs(year, round, session);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedTrackStatus(
  year: number,
  round: number,
  session: string,
  queryClient: QueryClient,
): Promise<UnifiedTrackStatusResponse> {
  const key = queryKeys.sessionData.byType(year, round, "track-status");
  const cached = queryClient.getQueryData<UnifiedTrackStatusResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedTrackStatus(year, round, session);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchFullSession(
  year: number,
  round: number,
  params: { include?: string[]; session?: string; driver?: string; limit?: number } | undefined,
  queryClient: QueryClient,
): Promise<FullSessionResponse> {
  const key = queryKeys.fullSession.byRace(year, round);
  const cached = queryClient.getQueryData<FullSessionResponse>(key);
  if (cached) return cached;
  const data = await getFullSession(year, round, params);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

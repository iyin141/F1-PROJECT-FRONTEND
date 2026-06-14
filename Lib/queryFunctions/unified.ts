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
import { normalizeSessionForApi } from "@/Lib/sessionCodes";

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
  perLap?: boolean,
): Promise<UnifiedWeatherResponse> {
  const norm = normalizeSessionForApi(session) ?? session;
  const baseKey = queryKeys.sessionData.byType(year, round, "weather", norm);
  const key = perLap ? ([...baseKey, "per_lap"] as const) : baseKey;
  const cached = queryClient.getQueryData<UnifiedWeatherResponse>(key as any);
  if (cached) return cached;
  const data = await getUnifiedWeather(year, round, norm, perLap);
  queryClient.setQueryData(key as any, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedIncidents(
  year: number,
  round: number,
  session: string,
  queryClient: QueryClient,
): Promise<UnifiedIncidentsResponse> {
  const norm = normalizeSessionForApi(session) ?? session;
  const key = queryKeys.sessionData.byType(year, round, "incidents", norm);
  const cached = queryClient.getQueryData<UnifiedIncidentsResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedIncidents(year, round, norm);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedPositions(
  year: number,
  round: number,
  session: string,
  sample: number | undefined,
  limit: number | undefined,
  queryClient: QueryClient,
): Promise<UnifiedPositionsResponse> {
  const norm = normalizeSessionForApi(session) ?? session;
  const key = queryKeys.replayPositions(year, round, norm);
  const cached = queryClient.getQueryData<UnifiedPositionsResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedPositions(year, round, norm, sample, limit);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedPitStops(
  year: number,
  round: number,
  session: string,
  queryClient: QueryClient,
): Promise<UnifiedPitStopsResponse> {
  const norm = normalizeSessionForApi(session) ?? session;
  const key = queryKeys.replayPitStops(year, round, norm);
  const cached = queryClient.getQueryData<UnifiedPitStopsResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedPitStops(year, round, norm);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedDrs(
  year: number,
  round: number,
  session: string,
  queryClient: QueryClient,
): Promise<UnifiedDrsResponse> {
  const norm = normalizeSessionForApi(session) ?? session;
  const key = queryKeys.sessionData.byType(year, round, "drs", norm);
  const cached = queryClient.getQueryData<UnifiedDrsResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedDrs(year, round, norm);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchUnifiedTrackStatus(
  year: number,
  round: number,
  session: string,
  queryClient: QueryClient,
): Promise<UnifiedTrackStatusResponse> {
  const norm = normalizeSessionForApi(session) ?? session;
  const key = queryKeys.sessionData.byType(year, round, "track-status", norm);
  const cached = queryClient.getQueryData<UnifiedTrackStatusResponse>(key);
  if (cached) return cached;
  const data = await getUnifiedTrackStatus(year, round, norm);
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
  const safeParams = params ? { ...params, session: params.session ? normalizeSessionForApi(params.session) ?? params.session : undefined } : undefined;
  const data = await getFullSession(year, round, safeParams);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/Lib/queryKeys";
import type { AnalysisSessionName } from "@/types/api";

import {
  getAnalysis,
  getLapsAnalysis,
  getTelemetry,
  getTelemetryOverlay,
  getTelemetrySummary,
} from "@/Lib/api_services/analysis";

import type { LapsAnalysisResponse } from "@/types/endpoints/lapstypes";
import type { TelemetryResponse } from "@/types/endpoints/telemetrytypes";
import type { TelemetryOverlayResponse } from "@/types/endpoints/telemetryoverlaytypes";
import type { TelemetrySummaryResponse } from "@/types/endpoints/telemetrysummarytypes";

export async function fetchLapsAnalysis(
  year: number,
  round: number,
  params: Record<string, string | number | undefined> | undefined,
  queryClient: QueryClient,
): Promise<LapsAnalysisResponse> {
  const driver = params?.driver as string | undefined;
  const key = queryKeys.lapAnalysis.byType(year, round, "laps", driver);
  const cached = queryClient.getQueryData<LapsAnalysisResponse>(key);
  if (cached) return cached;
  const data = await getLapsAnalysis(year, round, params);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchDriverPace(
  year: number,
  round: number,
  driver: string,
  queryClient: QueryClient,
): Promise<any> {
  const key = queryKeys.lapAnalysis.byType(year, round, "pace", driver);
  const cached = queryClient.getQueryData(key);
  if (cached) return cached;
  const data = await getAnalysis(year, round, "pace", { session: "R", driver });
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchDriverStints(
  year: number,
  round: number,
  driver: string | undefined,
  queryClient: QueryClient,
): Promise<any> {
  const key = queryKeys.lapAnalysis.byType(year, round, "stints", driver);
  const cached = queryClient.getQueryData(key);
  if (cached) return cached;
  const data = await getAnalysis(year, round, "stints", { session: "R", driver });
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchTyreStrategy(
  year: number,
  round: number,
  queryClient: QueryClient,
): Promise<any> {
  const key = queryKeys.lapAnalysis.byType(year, round, "tyre");
  const cached = queryClient.getQueryData(key);
  if (cached) return cached;
  const data = await getAnalysis(year, round, "tyre-strategy", { session: "R" });
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchSectorAnalysis(
  year: number,
  round: number,
  driver: string | undefined,
  queryClient: QueryClient,
): Promise<any> {
  const key = queryKeys.lapAnalysis.byType(year, round, "sectors", driver);
  const cached = queryClient.getQueryData(key);
  if (cached) return cached;
  const data = await getAnalysis(year, round, "sector-analysis", { session: "R", driver });
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchTelemetry(
  year: number,
  round: number,
  driver: string,
  lap: number,
  session: AnalysisSessionName,
  queryClient: QueryClient,
): Promise<TelemetryResponse> {
  const key = queryKeys.telemetry.single(year, round, driver, lap, session);
  const cached = queryClient.getQueryData<TelemetryResponse>(key);
  if (cached) return cached;
  const data = await getTelemetry(year, round, { driver, lap, session });
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchTelemetryOverlay(
  year: number,
  round: number,
  driverA: string,
  driverB: string,
  lap: number | undefined,
  queryClient: QueryClient,
  session: AnalysisSessionName = "R",
): Promise<TelemetryOverlayResponse> {
  const key = queryKeys.telemetry.overlay(year, round, driverA, driverB, lap);
  const cached = queryClient.getQueryData<TelemetryOverlayResponse>(key);
  if (cached) return cached;
  const params: Record<string, string | number> = { driver_a: driverA, driver_b: driverB, session };
  if (lap !== undefined) params.lap = lap;
  const data = await getTelemetryOverlay(year, round, params);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchTelemetrySummary(
  year: number,
  round: number,
  driver: string,
  lap: number,
  session: AnalysisSessionName,
  queryClient: QueryClient,
): Promise<TelemetrySummaryResponse> {
  const key = queryKeys.telemetry.summary(year, round, driver, lap);
  const cached = queryClient.getQueryData<TelemetrySummaryResponse>(key);
  if (cached) return cached;
  const data = await getTelemetrySummary(year, round, { driver, lap, session });
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

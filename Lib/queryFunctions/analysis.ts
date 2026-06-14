import type { AnalysisSessionName } from "@/types/api";
import { normalizeSessionForApi } from "@/Lib/sessionCodes";

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
): Promise<LapsAnalysisResponse> {
  // Normalize session in params if present
  let outParams = params;
  if (params && Object.prototype.hasOwnProperty.call(params, 'session')) {
    const raw = String(params.session ?? '').trim() || undefined;
    const norm = normalizeSessionForApi(raw) ?? raw;
    outParams = { ...params, session: norm };
  }
  return getLapsAnalysis(year, round, outParams);
}

export async function fetchDriverPace(
  year: number,
  round: number,
  driver: string,
  session: string = "R",
): Promise<any> {
  const norm = normalizeSessionForApi(session) ?? session;
  return getAnalysis(year, round, "pace", { session: norm, driver });
}

export async function fetchDriverStints(
  year: number,
  round: number,
  driver: string | undefined,
  session: string = "R",
): Promise<any> {
  const norm = normalizeSessionForApi(session) ?? session;
  return getAnalysis(year, round, "stints", { session: norm, driver });
}

export async function fetchTyreStrategy(
  year: number,
  round: number,
  session: string = "R",
): Promise<any> {
  const norm = normalizeSessionForApi(session) ?? session;
  return getAnalysis(year, round, "tyre-strategy", { session: norm });
}

export async function fetchSectorAnalysis(
  year: number,
  round: number,
  driver: string | undefined,
  session: string = "R",
): Promise<any> {
  const norm = normalizeSessionForApi(session) ?? session;
  return getAnalysis(year, round, "sector-analysis", { session: norm, driver });
}


export type TelemetryOverlayOptions = {
  limit_points?: number;
  stride?: number;
  sector_start?: number;
  sector_end?: number;
};

export async function fetchTelemetryOverlay(
  year: number,
  round: number,
  driverA: string,
  driverB: string,
  lapA: number | undefined,
  lapB: number | undefined,
  session: AnalysisSessionName = "R",
  options?: TelemetryOverlayOptions
): Promise<TelemetryOverlayResponse> {
  const norm = normalizeSessionForApi(session) ?? session;
  const params: Record<string, string | number> = { driver_a: driverA, driver_b: driverB, session: norm };
  if (lapA !== undefined && lapA !== null) params.lap_a = lapA;
  if (lapB !== undefined && lapB !== null) params.lap_b = lapB;
  if (options) {
    if (options.limit_points !== undefined) params.limit_points = options.limit_points;
    if (options.stride !== undefined) params.stride = options.stride;
    if (options.sector_start !== undefined) params.sector_start = options.sector_start;
    if (options.sector_end !== undefined) params.sector_end = options.sector_end;
  }
  return getTelemetryOverlay(year, round, params);
}

export async function fetchTelemetrySummary(
  year: number,
  round: number,
  driver: string,
  lap: number,
  session: AnalysisSessionName,
): Promise<TelemetrySummaryResponse> {
  const norm = normalizeSessionForApi(session) ?? session;
  return getTelemetrySummary(year, round, { driver, lap, session: norm });
}

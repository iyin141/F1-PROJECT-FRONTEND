import { apiFetch } from "./client";
import type { LapsAnalysisResponse } from "@/types/endpoints/lapstypes";
import type { TelemetryResponse } from "@/types/endpoints/telemetrytypes";
import type { TelemetryOverlayResponse } from "@/types/endpoints/telemetryoverlaytypes";
import type { TelemetrySummaryResponse } from "@/types/endpoints/telemetrysummarytypes";

function buildAnalysisUrl(
  year: number,
  round: number,
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) query.set(k, String(v));
    }
  }
  const qs = query.toString();
  return `/api/analysis/races/${year}/${round}/${endpoint}/${qs ? `?${qs}` : ""}`;
}

export const getAnalysis = <T = any>(year: number, round: number, endpoint: string, params?: Record<string, string | number | undefined>) =>
  apiFetch<T>(buildAnalysisUrl(year, round, endpoint, params));

export const getLapsAnalysis = (year: number, round: number, params?: Record<string, string | number | undefined>) =>
  getAnalysis<LapsAnalysisResponse>(year, round, "laps", params);

export const getTelemetry = (year: number, round: number, params?: Record<string, string | number | undefined>) =>
  getAnalysis<TelemetryResponse>(year, round, "telemetry", params);

export const getTelemetryOverlay = (year: number, round: number, params?: Record<string, string | number | undefined>) =>
  getAnalysis<TelemetryOverlayResponse>(year, round, "telemetry/overlay", params);

export const getTelemetrySummary = (year: number, round: number, params?: Record<string, string | number | undefined>) =>
  getAnalysis<TelemetrySummaryResponse>(year, round, "telemetry/summary", params);

export default { getAnalysis, getLapsAnalysis, getTelemetry, getTelemetryOverlay, getTelemetrySummary };

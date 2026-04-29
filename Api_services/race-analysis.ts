import { getJson, withQuery } from "@/Api_services/client";
import type { AnalysisSessionName } from "@/types/api";
import type {
  LapsAnalysisResponse,
  PaceAnalysisResponse,
  SectorAnalysisResponse,
  StintsAnalysisResponse,
  TelemetryOverlayResponse,
  TelemetryResponse,
  TelemetrySummaryResponse,
  TyreStrategyResponse,
} from "@/types/endpoints";

type BaseAnalysisQuery = {
  session: AnalysisSessionName;
  driver?: string;
  limit?: number;
};

export function getLapsAnalysis(
  year: number,
  round: number,
  query: BaseAnalysisQuery,
): Promise<LapsAnalysisResponse> {
  return getJson<LapsAnalysisResponse>(
    withQuery(`/api/analysis/races/${year}/${round}/laps/`, query),
  );
}

export function getStintsAnalysis(
  year: number,
  round: number,
  query: BaseAnalysisQuery,
): Promise<StintsAnalysisResponse> {
  return getJson<StintsAnalysisResponse>(
    withQuery(`/api/analysis/races/${year}/${round}/stints/`, query),
  );
}

export function getPaceAnalysis(
  year: number,
  round: number,
  query: BaseAnalysisQuery,
): Promise<PaceAnalysisResponse> {
  return getJson<PaceAnalysisResponse>(
    withQuery(`/api/analysis/races/${year}/${round}/pace/`, query),
  );
}

export function getTyreStrategyAnalysis(
  year: number,
  round: number,
  query: BaseAnalysisQuery,
): Promise<TyreStrategyResponse> {
  return getJson<TyreStrategyResponse>(
    withQuery(`/api/analysis/races/${year}/${round}/tyre-strategy/`, query),
  );
}

export function getSectorAnalysis(
  year: number,
  round: number,
  query: BaseAnalysisQuery,
): Promise<SectorAnalysisResponse> {
  return getJson<SectorAnalysisResponse>(
    withQuery(`/api/analysis/races/${year}/${round}/sector-analysis/`, query),
  );
}

export function getTelemetry(
  year: number,
  round: number,
  query: {
    session: AnalysisSessionName;
    driver: string;
    lap: number;
    limit_points?: number;
    stride?: number;
  },
): Promise<TelemetryResponse> {
  return getJson<TelemetryResponse>(
    withQuery(`/api/analysis/races/${year}/${round}/telemetry/`, query),
  );
}

export function getTelemetryOverlay(
  year: number,
  round: number,
  query: {
    session: AnalysisSessionName;
    driver_a: string;
    driver_b: string;
    lap?: number;
    limit_points?: number;
    stride?: number;
  },
): Promise<TelemetryOverlayResponse> {
  return getJson<TelemetryOverlayResponse>(
    withQuery(`/api/analysis/races/${year}/${round}/telemetry/overlay/`, query),
  );
}

export function getTelemetrySummary(
  year: number,
  round: number,
  query: {
    session: AnalysisSessionName;
    driver: string;
    lap: number;
    lap_range?: number;
    limit_points?: number;
  },
): Promise<TelemetrySummaryResponse> {
  return getJson<TelemetrySummaryResponse>(
    withQuery(`/api/analysis/races/${year}/${round}/telemetry/summary/`, query),
  );
}

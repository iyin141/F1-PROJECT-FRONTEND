import { getJson, withQuery } from "@/Api_services/client";
import type { AnalysisSessionName } from "@/types/api";
import type {
  FullSessionResponse,
  UnifiedDrsResponse,
  UnifiedIncludeType,
  UnifiedIncidentsResponse,
  UnifiedPitStopsResponse,
  UnifiedPositionsResponse,
  UnifiedTrackStatusResponse,
  UnifiedWeatherResponse,
} from "@/types/endpoints";

function toIncludeValue(values: UnifiedIncludeType[]): string {
  return values.join(",");
}

export function getFullSession(
  year: number,
  round: number,
  query: {
    include: UnifiedIncludeType[];
    session?: AnalysisSessionName;
    driver?: string;
    limit?: number;
  },
): Promise<FullSessionResponse> {
  return getJson<FullSessionResponse>(
    withQuery(`/api/unified/races/${year}/${round}/full-session/`, {
      include: toIncludeValue(query.include),
      session: query.session,
      driver: query.driver,
      limit: query.limit,
    }),
  );
}

export function getUnifiedWeather(
  year: number,
  round: number,
  query?: {
    session?: AnalysisSessionName;
    limit?: number;
  },
): Promise<UnifiedWeatherResponse> {
  return getJson<UnifiedWeatherResponse>(
    withQuery(`/api/unified/races/${year}/${round}/weather/`, query),
  );
}

export function getUnifiedPitStops(
  year: number,
  round: number,
  query?: {
    session?: AnalysisSessionName;
    driver?: string;
    limit?: number;
  },
): Promise<UnifiedPitStopsResponse> {
  return getJson<UnifiedPitStopsResponse>(
    withQuery(`/api/unified/races/${year}/${round}/pit-stops/`, query),
  );
}

export function getUnifiedIncidents(
  year: number,
  round: number,
  query?: {
    session?: AnalysisSessionName;
    limit?: number;
  },
): Promise<UnifiedIncidentsResponse> {
  return getJson<UnifiedIncidentsResponse>(
    withQuery(`/api/unified/races/${year}/${round}/incidents/`, query),
  );
}

export function getUnifiedPositions(
  year: number,
  round: number,
  query?: {
    session?: AnalysisSessionName;
    driver?: string;
    limit?: number;
  },
): Promise<UnifiedPositionsResponse> {
  return getJson<UnifiedPositionsResponse>(
    withQuery(`/api/unified/races/${year}/${round}/positions/`, query),
  );
}

export function getUnifiedDrs(
  year: number,
  round: number,
  query?: {
    session?: AnalysisSessionName;
    driver?: string;
    limit?: number;
  },
): Promise<UnifiedDrsResponse> {
  return getJson<UnifiedDrsResponse>(
    withQuery(`/api/unified/races/${year}/${round}/drs/`, query),
  );
}

export function getUnifiedTrackStatus(
  year: number,
  round: number,
  query?: {
    session?: AnalysisSessionName;
    limit?: number;
  },
): Promise<UnifiedTrackStatusResponse> {
  return getJson<UnifiedTrackStatusResponse>(
    withQuery(`/api/unified/races/${year}/${round}/track-status/`, query),
  );
}

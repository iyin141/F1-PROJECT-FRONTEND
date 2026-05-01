import { getJson, withQuery, clampYear } from "@/Api_services/client";
import type { AnalysisSessionName, PracticeSessionName } from "@/types/api";
import type {
  QualifyingResultsResponse,
  RaceDetailResponse,
  RaceResultsResponse,
  PracticeResultsResponse,
  UnifiedIncidentsResponse,
  UnifiedWeatherResponse,
} from "@/types/endpoints";

export function getRaceDetail(year: number, round: number): Promise<RaceDetailResponse> {
  return getJson<RaceDetailResponse>(`/api/races/${clampYear(year)}/${round}/`);
}

export function getRaceResults(year: number, round: number): Promise<RaceResultsResponse> {
  return getJson<RaceResultsResponse>(`/api/races/${clampYear(year)}/${round}/results/`);
}

export function getQualifyingResults(
  year: number,
  round: number,
): Promise<QualifyingResultsResponse> {
  return getJson<QualifyingResultsResponse>(`/api/races/${clampYear(year)}/${round}/qualifying/`);
}

export function getPracticeResults(
  year: number,
  round: number,
  session: PracticeSessionName,
): Promise<PracticeResultsResponse> {
  return getJson<PracticeResultsResponse>(`/api/races/${clampYear(year)}/${round}/practice/${session}/`);
}

export function getRaceWeather(
  year: number,
  round: number,
  session: AnalysisSessionName = "R",
): Promise<UnifiedWeatherResponse> {
  return getJson<UnifiedWeatherResponse>(
    withQuery(`/api/unified/races/${clampYear(year)}/${round}/weather/`, { session }),
  );
}

export function getRaceIncidents(
  year: number,
  round: number,
  session: AnalysisSessionName = "R",
): Promise<UnifiedIncidentsResponse> {
  return getJson<UnifiedIncidentsResponse>(
    withQuery(`/api/unified/races/${clampYear(year)}/${round}/incidents/`, { session }),
  );
}

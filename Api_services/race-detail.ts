import { getJson, withQuery } from "@/Api_services/client";
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
  return getJson<RaceDetailResponse>(`/api/races/${year}/${round}/`);
}

export function getRaceResults(year: number, round: number): Promise<RaceResultsResponse> {
  return getJson<RaceResultsResponse>(`/api/races/${year}/${round}/results/`);
}

export function getQualifyingResults(
  year: number,
  round: number,
): Promise<QualifyingResultsResponse> {
  return getJson<QualifyingResultsResponse>(`/api/races/${year}/${round}/qualifying/`);
}

export function getPracticeResults(
  year: number,
  round: number,
  session: PracticeSessionName,
): Promise<PracticeResultsResponse> {
  return getJson<PracticeResultsResponse>(`/api/races/${year}/${round}/practice/${session}/`);
}

export function getRaceWeather(
  year: number,
  round: number,
  session: AnalysisSessionName = "R",
): Promise<UnifiedWeatherResponse> {
  return getJson<UnifiedWeatherResponse>(
    withQuery(`/api/unified/races/${year}/${round}/weather/`, { session }),
  );
}

export function getRaceIncidents(
  year: number,
  round: number,
  session: AnalysisSessionName = "R",
): Promise<UnifiedIncidentsResponse> {
  return getJson<UnifiedIncidentsResponse>(
    withQuery(`/api/unified/races/${year}/${round}/incidents/`, { session }),
  );
}

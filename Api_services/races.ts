import type { ApiErrorResponse } from "@/types/api";
import type {
  PracticeResultsResponse,
  PracticeSessionName,
  QualifyingResultsResponse,
  RaceDetailResponse,
  RaceResultsResponse,
  SeasonScheduleResponse,
} from "@/types/races";

const API_BASE = "/api/races";

function extractErrorMessage(data: ApiErrorResponse): string {
  if (data.errors) {
    const firstField = Object.values(data.errors)[0];
    if (firstField?.length) return firstField[0];
  }
  if (Array.isArray(data.message)) return data.message[0];
  return data.error ?? data.message ?? "Something went wrong. Please try again.";
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorResponse;

  if (!response.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return data;
}

export function getSeasonSchedule(year: number): Promise<SeasonScheduleResponse> {
  return getJson<SeasonScheduleResponse>(`${API_BASE}/${year}/`);
}

export function getRaceDetail(
  year: number,
  round: number,
): Promise<RaceDetailResponse> {
  return getJson<RaceDetailResponse>(`${API_BASE}/${year}/${round}/`);
}

export function getRaceResults(
  year: number,
  round: number,
): Promise<RaceResultsResponse> {
  return getJson<RaceResultsResponse>(`${API_BASE}/${year}/${round}/results/`);
}

export function getQualifyingResults(
  year: number,
  round: number,
): Promise<QualifyingResultsResponse> {
  return getJson<QualifyingResultsResponse>(`${API_BASE}/${year}/${round}/qualifying/`);
}

export function getPracticeSessionResults(
  year: number,
  round: number,
  session: PracticeSessionName,
): Promise<PracticeResultsResponse> {
  return getJson<PracticeResultsResponse>(`${API_BASE}/${year}/${round}/practice/${session}/`);
}

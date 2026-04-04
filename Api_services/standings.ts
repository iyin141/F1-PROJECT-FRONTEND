import type { ApiErrorResponse } from "@/types/api";
import type {
  ConstructorStandingsResponse,
  DriverStandingsResponse,
} from "@/types/standings";

const API_BASE = "/api";

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

export function getDriverStandings(year: number): Promise<DriverStandingsResponse> {
  return getJson<DriverStandingsResponse>(`${API_BASE}/drivers/${year}/`);
}

export function getConstructorStandings(
  year: number,
): Promise<ConstructorStandingsResponse> {
  return getJson<ConstructorStandingsResponse>(`${API_BASE}/constructors/${year}/`);
}

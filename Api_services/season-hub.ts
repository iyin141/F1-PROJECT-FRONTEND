import { getJson, clampYear } from "@/Api_services/client";
import type {
  ConstructorStandingsResponse,
  DriverStandingsResponse,
  SeasonScheduleResponse,
} from "@/types/endpoints";

export function getSeasonSchedule(year: number): Promise<SeasonScheduleResponse> {
  return getJson<SeasonScheduleResponse>(`/api/races/${clampYear(year)}/`);
}

export function getDriverStandings(year: number): Promise<DriverStandingsResponse> {
  return getJson<DriverStandingsResponse>(`/api/drivers/${clampYear(year)}/`);
}

export function getConstructorStandings(year: number): Promise<ConstructorStandingsResponse> {
  return getJson<ConstructorStandingsResponse>(`/api/constructors/${clampYear(year)}/`);
}

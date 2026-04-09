import { getJson } from "@/Api_services/client";
import type {
  ConstructorStandingsResponse,
  DriverStandingsResponse,
  SeasonScheduleResponse,
} from "@/types/endpoints";

export function getSeasonSchedule(year: number): Promise<SeasonScheduleResponse> {
  return getJson<SeasonScheduleResponse>(`/api/races/${year}/`);
}

export function getDriverStandings(year: number): Promise<DriverStandingsResponse> {
  return getJson<DriverStandingsResponse>(`/api/drivers/${year}/`);
}

export function getConstructorStandings(year: number): Promise<ConstructorStandingsResponse> {
  return getJson<ConstructorStandingsResponse>(`/api/constructors/${year}/`);
}

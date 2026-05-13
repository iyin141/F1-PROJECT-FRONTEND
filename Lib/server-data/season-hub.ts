import "server-only";

import { clampYear, serverGetJson } from "@/Lib/server-client";
import type {
  ConstructorStandingsResponse,
  DriverStandingsResponse,
  SeasonScheduleResponse,
} from "@/types/endpoints";

export function getSeasonScheduleServer(year: number): Promise<SeasonScheduleResponse> {
  return serverGetJson<SeasonScheduleResponse>(`/races/${clampYear(year)}/`);
}

export function getDriverStandingsServer(year: number): Promise<DriverStandingsResponse> {
  return serverGetJson<DriverStandingsResponse>(`/drivers/${clampYear(year)}/`);
}

export function getConstructorStandingsServer(year: number): Promise<ConstructorStandingsResponse> {
  return serverGetJson<ConstructorStandingsResponse>(`/constructors/${clampYear(year)}/`);
}
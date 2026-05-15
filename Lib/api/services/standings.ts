import { apiFetch } from "./client";
import type { SeasonScheduleResponse } from "@/types/endpoints/racestypes";
import type { DriverStandingsResponse } from "@/types/endpoints/driverstandingstypes";
import type { ConstructorStandingsResponse } from "@/types/endpoints/constructorstandingstypes";

export const getSeasonSchedule = (year: number) => apiFetch<SeasonScheduleResponse>(`/api/races/${year}/`);
export const getDriverStandings = (year: number) => apiFetch<DriverStandingsResponse>(`/api/drivers/${year}/`);
export const getConstructorStandings = (year: number) => apiFetch<ConstructorStandingsResponse>(`/api/constructors/${year}/`);

export default { getSeasonSchedule, getDriverStandings, getConstructorStandings };

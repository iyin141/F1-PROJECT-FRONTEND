import { apiFetch } from "./client";
import type { DriverCareerResponse, DriverSeasonBreakdownResponse } from "@/types/endpoints/driverrecordtypes";

export const getDriverCareer = (driverCode: string) => apiFetch<DriverCareerResponse>(`/api/drivers/${driverCode}/career/`);
export const getDriverSeason = (driverCode: string, year: number) =>
  apiFetch<DriverSeasonBreakdownResponse>(`/api/drivers/${driverCode}/${year}/`);

export default { getDriverCareer, getDriverSeason };

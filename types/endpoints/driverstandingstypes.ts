import type { ReadinessChecklist } from "@/types/api";

// Endpoint 6: GET /api/drivers/<year>/
export type DriverStandingRow = {
  position: number;
  points: number;
  wins: number;
  driver_name: string;
  constructor: string;
};

export type DriverStandingsResponse = {
  year: number;
  standings: DriverStandingRow[];
  readiness: ReadinessChecklist;
};

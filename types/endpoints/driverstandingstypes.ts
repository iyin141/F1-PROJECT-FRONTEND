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
  /** Primary key per API docs */
  standings: DriverStandingRow[];
  /** Legacy fallback key — kept for adapter compatibility */
  drivers?: DriverStandingRow[];
  readiness: ReadinessChecklist;
};

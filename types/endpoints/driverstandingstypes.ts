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
  /** Primary key per API docs (some backends return `standings`, others `drivers`) */
  standings?: DriverStandingRow[];
  /** Alternative key actually returned by some live endpoints */
  drivers?: DriverStandingRow[];
  readiness: ReadinessChecklist;
};

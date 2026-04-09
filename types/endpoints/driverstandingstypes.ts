import type { F1DriverRef } from "@/types/api";

// Endpoint 6: GET /api/drivers/<year>/
export type DriverStandingRow = {
  position: number;
  points: number;
  wins: number;
  driver: F1DriverRef;
  constructor: string;
};

export type DriverStandingsResponse = {
  season: number;
  standings: DriverStandingRow[];
};

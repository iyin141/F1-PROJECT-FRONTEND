import type { F1DriverRef } from "@/types/api";

// Endpoint 3: GET /api/races/<year>/<round>/results/
export type RaceResultRow = {
  position: number;
  driver: F1DriverRef;
  constructor: string;
  points: number;
  winner: boolean;
};

export type RaceResultsResponse = {
  season: number;
  round: number;
  raceName: string;
  results: RaceResultRow[];
};

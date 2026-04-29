import type { ReadinessChecklist } from "@/types/api";

// Endpoint 3: GET /api/races/<year>/<round>/results/
export type QualifyingResultRow = {
  position: number;
  driver_name: string;
  constructor: string;
  grid: number;
  time: string | null;
};

export type RaceResultRow = {
  position: number;
  driver_name: string;
  constructor: string;
  grid: number;
  laps: number;
  status: string;
  time: string | null;
  points: number;
};

export type RaceResultsResponse = {
  year: number;
  round: number;
  results: {
    qualifying: QualifyingResultRow[];
    race: RaceResultRow[];
  };
  readiness: ReadinessChecklist;
};

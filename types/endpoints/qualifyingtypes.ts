import type { F1DriverRef, NumericString } from "@/types/api";

// Endpoint 4: GET /api/races/<year>/<round>/qualifying/
export type QualifyingResultRow = {
  position: number;
  driver: F1DriverRef;
  q1_time: NumericString | null;
  q2_time: NumericString | null;
  q3_time: NumericString | null;
  grid_position: number;
};

export type QualifyingResultsResponse = {
  season: number;
  round: number;
  raceName: string;
  results: QualifyingResultRow[];
};

import type { F1DriverRef, NumericString, PracticeSessionName } from "@/types/api";

// Endpoint 5: GET /api/races/<year>/<round>/practice/<session_name>/
export type PracticeResultRow = {
  position: number;
  driver: F1DriverRef;
  time: NumericString | null;
  laps: number;
  best_lap: NumericString | null;
};

export type PracticeResultsResponse = {
  season: number;
  round: number;
  session: PracticeSessionName;
  results: PracticeResultRow[];
};

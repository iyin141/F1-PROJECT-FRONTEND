import type { PracticeSessionName, ReadinessChecklist } from "@/types/api";

// Endpoint 5: GET /api/races/<year>/<round>/practice/<session_name>/
export type PracticeResultRow = {
  position: number;
  driver_name: string;
  constructor: string;
  laps: number;
  best_lap: string | null;
};

export type PracticeResultsResponse = {
  year: number;
  round: number;
  session: PracticeSessionName;
  results: PracticeResultRow[];
  readiness: ReadinessChecklist;
};

import type { ReadinessChecklist } from "@/types/api";

// Endpoint 5: GET /api/races/<year>/<round>/practice/<session_name>/
// Backend view returns { year, round, session, practice: [...], readiness }
export type PracticeResultRow = {
  position: number;
  driver_name?: string;
  driver_code?: string;
  constructor?: string;
  team?: string;
  laps?: number;
  best_lap?: string | null;
  lap_time?: string | null;
  lap_number?: number | null;
};

export type PracticeResultsResponse = {
  year: number;
  round: number;
  session: string;
  practice?: PracticeResultRow[];
  results?: PracticeResultRow[];
  readiness: ReadinessChecklist;
};

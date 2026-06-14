import type { ReadinessChecklist } from "@/types/api";

// Endpoint: GET /api/races/<year>/<round>/sprint/
// Backend serializer: RaceResultSerializer (same shape as race results)
export type SprintResultRow = {
  position: number | null;
  driver_number: number | null;
  driver_name: string;
  team: string;
  grid_position: number | null;
  laps: number;
  status: string;
  points: number;
};

export type SprintResultsResponse = SprintResultRow[] | {
  meta: {
    year: number;
    round: number;
    session: string;
    row_count: number;
    readiness: ReadinessChecklist;
  };
  data: SprintResultRow[];
};

// Endpoint: GET /api/races/<year>/<round>/sprint-shootout/
// Backend serializer: QualifyingResultSerializer (same shape as qualifying)
export type SprintShootoutResultRow = {
  position: number | null;
  driver_number: number | null;
  driver_name: string;
  team: string;
  q1_time: string | null;
  q2_time: string | null;
  q3_time: string | null;
};

export type SprintShootoutResultsResponse = SprintShootoutResultRow[] | {
  meta: {
    year: number;
    round: number;
    session: string;
    row_count: number;
    readiness: ReadinessChecklist;
  };
  data: SprintShootoutResultRow[];
};

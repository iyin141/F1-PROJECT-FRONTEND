import type { ReadinessChecklist } from "@/types/api";

// Endpoint 3: GET /api/races/<year>/<round>/results/
// Backend serializers: QualifyingResultSerializer + RaceResultSerializer
export type QualifyingResultRow = {
  position: number | null;
  driver_number: number | null;
  driver_name: string;
  team?: string;
  constructor?: string;
  q1_time: string | null;
  q2_time: string | null;
  q3_time: string | null;
};

export type RaceResultRow = {
  position: number | null;
  driver_number: number | null;
  driver_name: string;
  team?: string;
  constructor?: string;
  grid_position: number | null;
  laps: number;
  status: string;
  time?: string | null;
  points: number;
  gap?: string | null;
  fastest_lap?: string | null;
  fastest_lap_of_race?: boolean | null;
};

export type RaceResultsResponse = RaceResultRow[] | {
  meta?: {
    year: number;
    round: number;
    session: string;
    row_count: number;
  };
  data?: RaceResultRow[];
  qualifying?: QualifyingResultRow[];
  // Legacy
  year?: number;
  round?: number;
  results?: {
    qualifying: QualifyingResultRow[];
    race: RaceResultRow[];
  };
  race?: RaceResultRow[];
  readiness?: ReadinessChecklist;
};

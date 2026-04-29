import type { AnalysisSessionName, ResponseMeta } from "@/types/api";

// Endpoint 9: GET /api/analysis/races/<year>/<round>/stints/
export type StintAnalysisRow = {
  stint: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  lap_count: number;
  best_lap?: string | null;
  avg_pace?: string | null;
  pace_degradation?: string | null;
};

export type StintDriverAnalysisRow = {
  driver?: string;
  stint: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  duration_laps?: number;
};

export type StintsAnalysisResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    row_count?: number;
  };
  filters_applied: {
    driver?: string | null;
    limit?: number;
  };
  data: Array<StintAnalysisRow | StintDriverAnalysisRow>;
};

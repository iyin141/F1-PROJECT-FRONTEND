import type { ResponseFilters, ResponseMeta, RaceOnlySessionName } from "@/types/api";

// Endpoint 9: GET /api/analysis/races/<year>/<round>/stints/
export type StintAnalysisRow = {
  driver: string;
  stint: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  duration_laps: number;
};

export type StintsAnalysisResponse = {
  meta: ResponseMeta & { session: RaceOnlySessionName };
  filters: ResponseFilters & {
    session: RaceOnlySessionName;
    driver?: string | null;
    limit?: number;
  };
  data: StintAnalysisRow[];
};

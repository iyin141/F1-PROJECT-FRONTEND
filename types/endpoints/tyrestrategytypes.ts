import type { AnalysisSessionName, ResponseMeta } from "@/types/api";

// Endpoint 11: GET /api/analysis/races/<year>/<round>/tyre-strategy/
export type TyreStrategyRow = {
  driver?: string | null;
  stint: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  laps_completed?: number;
  pit_stop_lap?: number | null;
  pit_stop_loss?: string | null;
};

export type TyreStrategyResponse = {
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
  data: TyreStrategyRow[];
};

import type {
  AnalysisSessionName,
  NumericString,
  ResponseFilters,
  ResponseMeta,
} from "@/types/api";

// Endpoint 10: GET /api/analysis/races/<year>/<round>/pace/
export type PaceAnalysisRow = {
  driver: string;
  avg_pace: NumericString;
  best_lap: NumericString;
  lap_consistency: number;
  fuel_depleted_at_lap: number | null;
};

export type PaceAnalysisResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName };
  filters: ResponseFilters & {
    session: AnalysisSessionName;
    driver?: string | null;
    limit?: number;
  };
  data: PaceAnalysisRow[];
};

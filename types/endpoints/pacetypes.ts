import type { AnalysisSessionName, NumericString, ResponseMeta } from "@/types/api";

// Endpoint 10: GET /api/analysis/races/<year>/<round>/pace/
export type PaceAnalysisRow = {
  driver_code: string;
  stint: number;
  lap_count: number;
  avg_pace: NumericString;
  min_pace?: NumericString | null;
  max_pace?: NumericString | null;
  compound?: string | null;
};

export type PaceAnalysisResponse = {
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
  data: PaceAnalysisRow[];
};

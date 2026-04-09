import type {
  AnalysisSessionName,
  NumericString,
  ResponseFilters,
  ResponseMeta,
} from "@/types/api";

// Endpoint 8: GET /api/analysis/races/<year>/<round>/laps/
export type AnalysisLapRow = {
  lap_number: number;
  driver: string;
  lap_time: NumericString | null;
  compound: string | null;
  stint: number | null;
  fuel_load: number | null;
};

export type LapsAnalysisResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; lap_count: number };
  filters: ResponseFilters & {
    session: AnalysisSessionName;
    driver?: string | null;
    limit?: number;
  };
  data: AnalysisLapRow[];
};

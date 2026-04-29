import type { AnalysisSessionName, NumericString, ResponseMeta } from "@/types/api";

// Endpoint 8: GET /api/analysis/races/<year>/<round>/laps/
export type AnalysisLapRow = {
  driver_code: string;
  lap_number: number;
  lap_time: NumericString | null;
  sector1?: NumericString | null;
  sector2?: NumericString | null;
  sector3?: NumericString | null;
  compound?: string | null;
  stint?: number | null;
  is_personal_best?: boolean;
};

export type LapsAnalysisResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    row_count: number;
    limit_max?: number;
  };
  filters_applied: {
    driver?: string | null;
    limit?: number;
  };
  data: AnalysisLapRow[];
};

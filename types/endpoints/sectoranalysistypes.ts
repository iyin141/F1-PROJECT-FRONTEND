import type { AnalysisSessionName, NumericString, ResponseMeta } from "@/types/api";

export type SectorSessionName = "Race" | "Qualifying";

// Endpoint 12: GET /api/analysis/races/<year>/<round>/sector-analysis/
export type SectorAnalysisRow = {
  compound: string;
  sector: 1 | 2 | 3;
  min_time?: NumericString | null;
  avg_time: NumericString | null;
  max_time?: NumericString | null;
  lap_count?: number;
};

export type SectorAnalysisResponse = {
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
  data: SectorAnalysisRow[];
};

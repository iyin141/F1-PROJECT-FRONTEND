import type { NumericString, ResponseFilters, ResponseMeta } from "@/types/api";

export type SectorSessionName = "Race" | "Qualifying";

// Endpoint 12: GET /api/analysis/races/<year>/<round>/sector-analysis/
export type SectorAnalysisRow = {
  driver: string;
  sector: 1 | 2 | 3;
  best_time: NumericString | null;
  avg_time: NumericString | null;
  improvement_vs_previous: number | null;
};

export type SectorAnalysisResponse = {
  meta: ResponseMeta & { session: SectorSessionName };
  filters: ResponseFilters & {
    session: SectorSessionName;
    driver?: string | null;
    sector_start?: 1 | 2 | 3;
    sector_end?: 1 | 2 | 3;
  };
  data: SectorAnalysisRow[];
};

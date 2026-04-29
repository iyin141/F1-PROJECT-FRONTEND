import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 20: GET /api/unified/races/<year>/<round>/positions/
export type UnifiedPositionRow = {
  lap: number;
  driver: string;
  position: number;
  time_of_day?: string;
  gap_to_leader?: string | number;
  gap_to_next?: string | number;
};

export type UnifiedPositionsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters_applied?: ResponseFilters;
  data: UnifiedPositionRow[];
};

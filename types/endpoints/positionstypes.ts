import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 20: GET /api/unified/races/<year>/<round>/positions/
export type UnifiedPositionRow = {
  lap: number;
  driver: string;
  position: number;
  gap_to_leader: number;
  gap_to_next: number;
};

export type UnifiedPositionsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName };
  filters: ResponseFilters & {
    session: AnalysisSessionName;
    driver?: string | null;
    limit?: number;
  };
  data: UnifiedPositionRow[];
};

import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 22: GET /api/unified/races/<year>/<round>/track-status/
export type UnifiedTrackStatusRow = {
  lap: number;
  status: string;
  time: string;
  reason?: string;
};

export type UnifiedTrackStatusResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName };
  filters: ResponseFilters & {
    session: AnalysisSessionName;
    limit?: number;
  };
  data: UnifiedTrackStatusRow[];
};

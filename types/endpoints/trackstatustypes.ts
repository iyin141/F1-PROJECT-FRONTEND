import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 22: GET /api/unified/races/<year>/<round>/track-status/
export type UnifiedTrackStatusRow = {
  lap: number;
  message?: string;
  status: string;
  time: string;
  reason?: string;
};

export type UnifiedTrackStatusResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters?: ResponseFilters;
  data: UnifiedTrackStatusRow[];
};

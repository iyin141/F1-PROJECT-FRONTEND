import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 22: GET /api/unified/races/<year>/<round>/track-status/
export type UnifiedTrackStatusRow = {
  status: string;
  // Primary fields (API docs)
  lap_number?: number;
  status_duration_laps?: number | null;
  cause?: string | null;
  affected_zone?: string | null;
  // Legacy / fallback fields
  lap?: number;
  message?: string;
  time?: string;
  reason?: string;
};

export type UnifiedTrackStatusResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters?: ResponseFilters;
  data: UnifiedTrackStatusRow[];
};

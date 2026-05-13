import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 20 / Section 6.5: GET /api/unified/races/<year>/<round>/positions/
export type UnifiedPositionRow = {
  // Primary fields (from API docs)
  driver_code: string;
  driver_number?: number | null;
  lap_number: number;
  position: number;
  position_change?: number | null;
  gap_to_leader_seconds?: number | null;
  gap_to_ahead_seconds?: number | null;
  stint?: number | null;
  track_status?: string | null;
  lap_time_seconds?: number | null;
  is_fastest_lap_overall?: boolean | null;
  is_fastest_lap_of_lap_number?: boolean | null;
  // Legacy / fallback fields kept for backward compat
  lap?: number;
  driver?: string;
  time_of_day?: string;
  gap_to_leader?: string | number;
  gap_to_next?: string | number;
};

export type UnifiedPositionsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters_applied?: ResponseFilters & {
    sample_interval?: number;
  };
  data: UnifiedPositionRow[];
};

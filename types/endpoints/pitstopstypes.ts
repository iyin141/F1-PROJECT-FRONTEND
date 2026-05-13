import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 18 / Section 6.3: GET /api/unified/races/<year>/<round>/pit-stops/
export type UnifiedPitStopRow = {
  // Primary fields (from API docs)
  driver_code: string;
  driver_number?: number | null;
  stop_number?: number | null;
  lap_in?: number | null;
  lap_out?: number | null;
  stop_duration_seconds?: number | null;
  compound_in?: string | null;
  compound_out?: string | null;
  time_gain_loss_seconds?: number | null;
  // Legacy / fallback fields kept for backward compat
  driver?: string;
  lap?: number;
  duration?: string;
  duration_seconds?: number;
  compound?: string;
  tyres_changed?: number;
  time_of_day?: string;
};

export type UnifiedPitStopsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters?: ResponseFilters;
  filters_applied?: {
    driver?: string | null;
    limit?: number | null;
  };
  data: UnifiedPitStopRow[];
};

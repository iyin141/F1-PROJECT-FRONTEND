import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 18: GET /api/unified/races/<year>/<round>/pit-stops/
export type UnifiedPitStopRow = {
  driver: string;
  lap: number;
  time_of_day?: string;
  duration?: string;
  compound?: string;
  stop_number?: number;
  duration_seconds?: number;
  compound_in?: string;
  compound_out?: string;
  tyres_changed?: number;
};

export type UnifiedPitStopsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters?: ResponseFilters;
  data: UnifiedPitStopRow[];
};

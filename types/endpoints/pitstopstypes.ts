import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 18: GET /api/unified/races/<year>/<round>/pit-stops/
export type UnifiedPitStopRow = {
  driver: string;
  stop_number: number;
  lap: number;
  duration_seconds: number;
  compound_in: string;
  compound_out: string;
  tyres_changed: number;
};

export type UnifiedPitStopsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName };
  filters: ResponseFilters & {
    session: AnalysisSessionName;
    driver?: string | null;
    limit?: number;
  };
  data: UnifiedPitStopRow[];
};

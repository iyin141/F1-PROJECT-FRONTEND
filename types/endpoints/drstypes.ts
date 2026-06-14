import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 21: GET /api/unified/races/<year>/<round>/drs/
export type UnifiedDrsRow = {
  // Primary fields (API docs)
  driver_code?: string;
  driver_number?: number | null;
  lap_number?: number;
  drs_available?: boolean;
  drs_activated?: boolean;
  gap_behind_seconds?: number | null;
  performance_delta_ms?: number | null;
  // Legacy / fallback fields
  lap?: number;
  driver?: string;
  time?: string;
  drs_zone?: number;
  status?: string;
  drs_engaged?: boolean;
  drs_detection_lap?: number | null;
};

export type UnifiedDrsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters?: ResponseFilters;
  data: UnifiedDrsRow[];
};

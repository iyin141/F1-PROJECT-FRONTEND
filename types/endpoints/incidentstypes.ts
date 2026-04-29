import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Endpoint 19: GET /api/unified/races/<year>/<round>/incidents/
export type UnifiedIncidentRow = {
  lap: number;
  time: string;
  driver: string | null;
  message: string;
  type?: string;
  category?: string;
  severity?: IncidentSeverity;
};

export type UnifiedIncidentsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters?: ResponseFilters;
  data: UnifiedIncidentRow[];
};

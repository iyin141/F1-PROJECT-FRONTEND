import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Endpoint 19: GET /api/unified/races/<year>/<round>/incidents/
export type UnifiedIncidentRow = {
  lap: number;
  time: string;
  driver: string | null;
  message: string;
  category: string;
  severity: IncidentSeverity;
};

export type UnifiedIncidentsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName };
  filters: ResponseFilters & {
    session: AnalysisSessionName;
    limit?: number;
  };
  data: UnifiedIncidentRow[];
};

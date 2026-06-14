import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "low" | "medium" | "high" | "critical";

// Endpoint 19: GET /api/unified/races/<year>/<round>/incidents/
export type UnifiedIncidentRow = {
  lap?: number;
  lap_number?: number;
  time?: string;
  timestamp_seconds?: number;
  driver?: string | null;
  drivers_involved?: string[];
  message?: string;
  message_text?: string;
  message_type?: string;
  flag?: string;
  scope?: string;
  sector?: number | null;
  impact_on_race?: string;
  type?: string;
  category?: string;
  severity?: IncidentSeverity;
};

export type UnifiedIncidentsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters?: ResponseFilters;
  filters_applied?: {
    driver?: string | null;
    limit?: number | null;
    include_radio?: boolean;
  };
  data: UnifiedIncidentRow[];
};

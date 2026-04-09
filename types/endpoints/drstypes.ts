import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 21: GET /api/unified/races/<year>/<round>/drs/
export type UnifiedDrsRow = {
  lap: number;
  driver: string;
  drs_available: boolean;
  drs_engaged: boolean;
  drs_detection_lap: number | null;
};

export type UnifiedDrsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName };
  filters: ResponseFilters & {
    session: AnalysisSessionName;
    driver?: string | null;
    limit?: number;
  };
  data: UnifiedDrsRow[];
};

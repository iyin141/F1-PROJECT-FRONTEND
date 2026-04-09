import type { AnalysisSessionName, ResponseMeta } from "@/types/api";

// Endpoint 15: GET /api/analysis/races/<year>/<round>/telemetry/summary/
export type TelemetrySummaryData = {
  max_speed: number;
  avg_speed: number;
  min_speed: number;
  max_throttle: number;
  avg_throttle: number;
  max_brake: number;
  drs_activations: number;
  gear_changes: number;
};

export type TelemetrySummaryResponse = {
  meta: ResponseMeta & {
    session: AnalysisSessionName;
    driver: string;
  };
  data: TelemetrySummaryData;
};

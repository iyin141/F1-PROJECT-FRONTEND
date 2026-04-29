import type { AnalysisSessionName, ResponseMeta } from "@/types/api";

// Endpoint 15: GET /api/analysis/races/<year>/<round>/telemetry/summary/
export type TelemetrySummaryLap = {
  lap: number;
  max_speed: number;
  avg_speed: number;
  min_speed?: number;
  avg_throttle?: number;
  brake_events?: number;
  gear_changes?: number;
  drs_activations: number;
  fuel_delta?: number;
};

export type TelemetrySummaryLegacyData = {
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
    year: number;
    round: number;
    session: AnalysisSessionName;
    driver: string;
    lap_count?: number;
    total_row_count?: number;
  };
  filters_applied?: {
    driver: string;
    lap: number;
    lap_range?: number;
  };
  data: TelemetrySummaryLap[] | TelemetrySummaryLegacyData;
};

import type { AnalysisSessionName, ResponseMeta } from "@/types/api";

// Endpoint 13: GET /api/analysis/races/<year>/<round>/telemetry/
export type TelemetryPoint = {
  distance: number;
  speed: number;
  throttle: number;
  brake: boolean;
  drs: number;
  gear: number;
  rpm?: number;
  kers?: number | null;
  mguh_deploy?: number | null;
  mguk_deploy?: number | null;
  n_gear?: number;
  fuel?: number | null;
  lap?: number;
  relative_distance?: number;
};

export type TelemetryResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    lap: number;
    driver: string;
    row_count?: number;
  };
  filters_applied: {
    driver: string;
    lap: number;
    limit_points?: number;
    stride?: number;
    sector_start?: number;
    sector_end?: number;
  };
  data: TelemetryPoint[];
};

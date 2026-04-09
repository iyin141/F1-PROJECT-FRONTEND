import type {
  AnalysisSessionName,
  ResponseFilters,
  ResponseMeta,
} from "@/types/api";

// Endpoint 13: GET /api/analysis/races/<year>/<round>/telemetry/
export type TelemetryPoint = {
  time_delta: number;
  speed: number;
  throttle: number;
  brake: number;
  drs: number;
  gear: number;
  rpm: number;
};

export type TelemetryResponse = {
  meta: ResponseMeta & {
    session: AnalysisSessionName;
    lap: number;
    driver: string;
  };
  filters: ResponseFilters & {
    session: AnalysisSessionName;
    limit_points?: number;
    stride?: number;
  };
  data: TelemetryPoint[];
};

import type { AnalysisSessionName, ResponseMeta } from "@/types/api";
import type { TelemetryPoint } from "@/types/endpoints/telemetrytypes";

export type TelemetryOverlayPoint = {
  distance: number;
  delta_speed?: number;
  delta_throttle?: number;
  [driverCode: string]: number | Record<string, unknown> | undefined;
};

// Endpoint 14: GET /api/analysis/races/<year>/<round>/telemetry/overlay/
export type TelemetryOverlayResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    drivers: [string, string];
    lap: number;
    comparison_metric?: string;
    row_count?: number;
  };
  filters_applied: {
    driver_a: string;
    driver_b: string;
    lap?: number;
  };
  data: TelemetryOverlayPoint[] | Record<string, TelemetryPoint[]>;
};

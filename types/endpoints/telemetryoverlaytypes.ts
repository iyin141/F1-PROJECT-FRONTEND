import type { AnalysisSessionName, ResponseMeta } from "@/types/api";
import type { TelemetryPoint } from "@/types/endpoints/telemetrytypes";

// Endpoint 14: GET /api/analysis/races/<year>/<round>/telemetry/overlay/
export type TelemetryOverlayResponse = {
  meta: ResponseMeta & {
    session: AnalysisSessionName;
    lap: number;
    drivers: [string, string];
  };
  data: Record<string, TelemetryPoint[]>;
};

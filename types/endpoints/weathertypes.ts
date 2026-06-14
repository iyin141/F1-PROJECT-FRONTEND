import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 17: GET /api/unified/races/<year>/<round>/weather/
export type UnifiedWeatherRow = {
  time?: string;
  lap_number?: number | null;
  driver_code?: string | null;
  air_temp?: number;
  air_temp_c?: number;
  track_temp?: number;
  track_temp_c?: number;
  humidity?: number;
  humidity_pct?: number;
  wind_speed?: number;
  wind_speed_ms?: number;
  wind_direction?: number;
  wind_direction_deg?: number;
  track_status?: string;
  rainfall: boolean;
};

export type UnifiedWeatherResponse = {
  meta: ResponseMeta & {
    row_count?: number;
    session: AnalysisSessionName;
  };
  filters?: ResponseFilters;
  filters_applied?: {
    driver?: string | null;
    limit?: number | null;
    include_per_lap?: boolean;
  };
  data: UnifiedWeatherRow[];
};

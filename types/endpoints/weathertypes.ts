import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 17: GET /api/unified/races/<year>/<round>/weather/
export type UnifiedWeatherRow = {
  time?: string;
  air_temp: number;
  track_temp: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  track_status: string;
  rainfall: boolean;
};

export type UnifiedWeatherResponse = {
  meta: ResponseMeta & {
    row_count?: number;
    session: AnalysisSessionName;
  };
  filters?: ResponseFilters;
  data: UnifiedWeatherRow[];
};

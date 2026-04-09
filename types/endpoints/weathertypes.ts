import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

// Endpoint 17: GET /api/unified/races/<year>/<round>/weather/
export type UnifiedWeatherRow = {
  lap: number;
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
    session: AnalysisSessionName;
    timestamp?: string;
  };
  filters: ResponseFilters & {
    session: AnalysisSessionName;
    limit?: number;
  };
  data: UnifiedWeatherRow[];
};

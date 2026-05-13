import "server-only";

import { clampYear, serverGetJson } from "@/Lib/server-client";
import type { AnalysisSessionName } from "@/types/api";
import type {
  UnifiedIncidentsResponse,
  UnifiedWeatherResponse,
} from "@/types/endpoints";

export function getUnifiedWeatherServer(
  year: number,
  round: number,
  query?: {
    session?: AnalysisSessionName;
    limit?: number;
    per_lap?: boolean;
  },
): Promise<UnifiedWeatherResponse> {
  return serverGetJson<UnifiedWeatherResponse>(`/unified/races/${clampYear(year)}/${round}/weather/`, query);
}

export function getUnifiedIncidentsServer(
  year: number,
  round: number,
  query?: {
    session?: AnalysisSessionName;
    limit?: number;
    radio?: boolean;
  },
): Promise<UnifiedIncidentsResponse> {
  return serverGetJson<UnifiedIncidentsResponse>(`/unified/races/${clampYear(year)}/${round}/incidents/`, query);
}
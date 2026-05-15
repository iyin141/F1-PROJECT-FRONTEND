import { apiFetch } from "./client";
import type { UnifiedWeatherResponse } from "@/types/endpoints/weathertypes";
import type { UnifiedIncidentsResponse } from "@/types/endpoints/incidentstypes";
import type { UnifiedPositionsResponse } from "@/types/endpoints/positionstypes";
import type { UnifiedPitStopsResponse } from "@/types/endpoints/pitstopstypes";
import type { UnifiedDrsResponse } from "@/types/endpoints/drstypes";
import type { UnifiedTrackStatusResponse } from "@/types/endpoints/trackstatustypes";
import type { FullSessionResponse } from "@/types/endpoints/fullsessiontypes";

export const getUnifiedWeather = (year: number, round: number, session = "R") =>
  apiFetch<UnifiedWeatherResponse>(`/api/unified/races/${year}/${round}/weather/?session=${session}`);

export const getUnifiedIncidents = (year: number, round: number, session = "R") =>
  apiFetch<UnifiedIncidentsResponse>(`/api/unified/races/${year}/${round}/incidents/?session=${session}`);

export const getUnifiedPositions = (year: number, round: number, session = "R", sample?: number) =>
  apiFetch<UnifiedPositionsResponse>(`/api/unified/races/${year}/${round}/positions/?session=${session}${sample ? `&sample_interval=${sample}` : ""}`);

export const getUnifiedPitStops = (year: number, round: number, session = "R") =>
  apiFetch<UnifiedPitStopsResponse>(`/api/unified/races/${year}/${round}/pit-stops/?session=${session}`);

export const getUnifiedDrs = (year: number, round: number, session = "R") =>
  apiFetch<UnifiedDrsResponse>(`/api/unified/races/${year}/${round}/drs/?session=${session}`);

export const getUnifiedTrackStatus = (year: number, round: number, session = "R") =>
  apiFetch<UnifiedTrackStatusResponse>(`/api/unified/races/${year}/${round}/track-status/?session=${session}`);

export const getFullSession = (year: number, round: number, params?: { include?: string[]; session?: string; driver?: string; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.include && params.include.length) qs.set("include", params.include.join(","));
  if (params?.session) qs.set("session", params.session);
  if (params?.driver) qs.set("driver", params.driver);
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  const qstr = qs.toString();
  return apiFetch<FullSessionResponse>(`/api/unified/races/${year}/${round}/full-session/${qstr ? `?${qstr}` : ""}`);
};

export default {
  getUnifiedWeather,
  getUnifiedIncidents,
  getUnifiedPositions,
  getUnifiedPitStops,
  getUnifiedDrs,
  getUnifiedTrackStatus,
  getFullSession,
};


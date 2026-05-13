import "server-only";

import { clampYear, serverGetJson } from "@/Lib/server-client";
import type {
  RaceDetailResponse,
  RaceResultsResponse,
} from "@/types/endpoints";

export function getRaceDetailServer(year: number, round: number): Promise<RaceDetailResponse> {
  return serverGetJson<RaceDetailResponse>(`/races/${clampYear(year)}/${round}/`);
}

export function getRaceResultsServer(year: number, round: number): Promise<RaceResultsResponse> {
  return serverGetJson<RaceResultsResponse>(`/races/${clampYear(year)}/${round}/results/`);
}
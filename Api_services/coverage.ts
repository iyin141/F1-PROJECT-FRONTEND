import { getJson } from "@/Api_services/client";
import type {
  PersistenceCoverageRaceResponse,
  PersistenceCoverageSeasonResponse,
} from "@/types/endpoints";

export function getPersistenceCoverageByYear(
  year: number,
): Promise<PersistenceCoverageSeasonResponse> {
  return getJson<PersistenceCoverageSeasonResponse>(`/api/coverage/persistence/${year}/`);
}

export function getPersistenceCoverageByRace(
  year: number,
  round: number,
): Promise<PersistenceCoverageRaceResponse> {
  return getJson<PersistenceCoverageRaceResponse>(
    `/api/coverage/persistence/${year}/${round}/`,
  );
}

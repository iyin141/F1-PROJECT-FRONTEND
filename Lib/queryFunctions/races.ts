import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/Lib/queryKeys";
import type { PracticeSessionName } from "@/types/api";

import {
  getSeasonSchedule,
  getDriverStandings,
  getConstructorStandings,
  getRaceDetail,
  getRaceResults,
  getQualifyingResults,
  getPracticeResults,
  getSprintResults,
  getSprintShootoutResults,
} from "@/Lib/api_services/races";

import type { SeasonScheduleResponse, RaceDetailResponse } from "@/types/endpoints/racestypes";
import type { RaceResultsResponse } from "@/types/endpoints/resultstypes";
import type { QualifyingResultsResponse } from "@/types/endpoints/qualifyingtypes";
import type { PracticeResultsResponse } from "@/types/endpoints/practicetypes";
import type { SprintResultsResponse, SprintShootoutResultsResponse } from "@/types/endpoints/sprinttypes";
import type { DriverStandingsResponse } from "@/types/endpoints/driverstandingstypes";
import type { ConstructorStandingsResponse } from "@/types/endpoints/constructorstandingstypes";

export async function fetchSeasonSchedule(
  year: number,
  queryClient: QueryClient,
): Promise<SeasonScheduleResponse> {
  const key = queryKeys.schedule.season(year);
  const cached = queryClient.getQueryData<SeasonScheduleResponse>(key);
  if (cached) return cached;
  const data = await getSeasonSchedule(year);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchDriverStandings(
  year: number,
  queryClient: QueryClient,
): Promise<DriverStandingsResponse> {
  const key = queryKeys.driverStandings.grid(year);
  const cached = queryClient.getQueryData<DriverStandingsResponse>(key);
  if (cached) return cached;
  const data = await getDriverStandings(year);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchConstructorStandings(
  year: number,
  queryClient: QueryClient,
): Promise<ConstructorStandingsResponse> {
  const key = queryKeys.constructorStandings.year(year);
  const cached = queryClient.getQueryData<ConstructorStandingsResponse>(key);
  if (cached) return cached;
  const data = await getConstructorStandings(year);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchRaceDetail(
  year: number,
  round: number,
  queryClient: QueryClient,
): Promise<RaceDetailResponse> {
  const key = queryKeys.raceResults.detail(year, round);
  const cached = queryClient.getQueryData<RaceDetailResponse>(key);
  if (cached) return cached;
  const data = await getRaceDetail(year, round);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchRaceResults(
  year: number,
  round: number,
  queryClient: QueryClient,
): Promise<RaceResultsResponse> {
  const key = queryKeys.raceResults.session(year, round, "R");
  const cached = queryClient.getQueryData<RaceResultsResponse>(key);
  if (cached) return cached;
  const data = await getRaceResults(year, round);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchQualifyingResults(
  year: number,
  round: number,
  queryClient: QueryClient,
): Promise<QualifyingResultsResponse> {
  const key = queryKeys.raceResults.qualifying(year, round);
  const cached = queryClient.getQueryData<QualifyingResultsResponse>(key);
  if (cached) return cached;
  const data = await getQualifyingResults(year, round);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchPracticeResults(
  year: number,
  round: number,
  session: PracticeSessionName,
  queryClient: QueryClient,
): Promise<PracticeResultsResponse> {
  const key = queryKeys.raceResults.session(year, round, session);
  const cached = queryClient.getQueryData<PracticeResultsResponse>(key);
  if (cached) return cached;
  const data = await getPracticeResults(year, round, session);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchSprintResults(
  year: number,
  round: number,
  queryClient: QueryClient,
): Promise<SprintResultsResponse> {
  const key = queryKeys.raceResults.session(year, round, "S");
  const cached = queryClient.getQueryData<SprintResultsResponse>(key);
  if (cached) return cached;
  const data = await getSprintResults(year, round);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

export async function fetchSprintShootoutResults(
  year: number,
  round: number,
  queryClient: QueryClient,
): Promise<SprintShootoutResultsResponse> {
  const key = queryKeys.raceResults.session(year, round, "SS");
  const cached = queryClient.getQueryData<SprintShootoutResultsResponse>(key);
  if (cached) return cached;
  const data = await getSprintShootoutResults(year, round);
  queryClient.setQueryData(key, data, { updatedAt: Date.now() });
  return data;
}

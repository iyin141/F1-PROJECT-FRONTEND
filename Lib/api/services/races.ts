import { apiFetch } from "./client";
import type { RaceDetailResponse } from "@/types/endpoints/racestypes";
import type { RaceResultsResponse } from "@/types/endpoints/resultstypes";
import type { QualifyingResultsResponse } from "@/types/endpoints/qualifyingtypes";
import type { PracticeResultsResponse } from "@/types/endpoints/practicetypes";
import type { SprintResultsResponse, SprintShootoutResultsResponse } from "@/types/endpoints/sprinttypes";
import type { UnifiedPositionsResponse } from "@/types/endpoints/positionstypes";
import type { UnifiedIncidentsResponse } from "@/types/endpoints/incidentstypes";
import type { UnifiedPitStopsResponse } from "@/types/endpoints/pitstopstypes";

export const getRaceDetail = (year: number, round: number) =>
	apiFetch<RaceDetailResponse>(`/api/races/${year}/${round}/`);

export const getRaceResults = (year: number, round: number) =>
	apiFetch<RaceResultsResponse>(`/api/races/${year}/${round}/results/`);

export const getQualifyingResults = (year: number, round: number) =>
	apiFetch<QualifyingResultsResponse>(`/api/races/${year}/${round}/qualifying/`);

export const getPracticeResults = (year: number, round: number, session: string) =>
	apiFetch<PracticeResultsResponse>(`/api/races/${year}/${round}/practice/${session}/`);

export const getSprintResults = (year: number, round: number) =>
	apiFetch<SprintResultsResponse>(`/api/races/${year}/${round}/sprint/`);

export const getSprintShootoutResults = (year: number, round: number) =>
	apiFetch<SprintShootoutResultsResponse>(`/api/races/${year}/${round}/sprint-shootout/`);

// Replay helpers (race-related heavy payloads)
export const getReplayPositions = (year: number, round: number) =>
	apiFetch<UnifiedPositionsResponse>(`/api/unified/races/${year}/${round}/positions/?session=R&sample_interval=1`);
export const getReplayIncidents = (year: number, round: number) =>
	apiFetch<UnifiedIncidentsResponse>(`/api/unified/races/${year}/${round}/incidents/?session=R`);
export const getReplayPitStops = (year: number, round: number) =>
	apiFetch<UnifiedPitStopsResponse>(`/api/unified/races/${year}/${round}/pit-stops/?session=R`);

export default {
	getRaceDetail,
	getRaceResults,
	getQualifyingResults,
	getPracticeResults,
	getSprintResults,
	getSprintShootoutResults,
	getReplayPositions,
	getReplayIncidents,
	getReplayPitStops,
};

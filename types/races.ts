export interface Race {
  round: number;
  name: string;
  date: string | null;
  location: string;
  country: string;
}

export interface QualifyingResult {
  position: number | null;
  driver_number: number | null;
  driver_name: string;
  team: string;
  q1_time: string | null;
  q2_time: string | null;
  q3_time: string | null;
}

export interface PracticeResult {
  position: number;
  driver_code: string;
  team: string;
  lap_time: string | null;
  lap_number: number | null;
}

export type PracticeSessionName = "fp1" | "fp2" | "fp3";

export interface RaceResult {
  position: number | null;
  driver_number: number | null;
  driver_name: string;
  team: string;
  points: number;
  status: string;
  grid_position: number | null;
  laps: number;
}

export interface RaceResultsPayload {
  qualifying: QualifyingResult[];
  race: RaceResult[];
}

export interface SeasonScheduleResponse {
  year: number;
  races: Race[];
}

export type RaceDetailResponse = Race;

export interface RaceResultsResponse {
  year: number;
  round: number;
  results: RaceResultsPayload;
}

export interface QualifyingResultsResponse {
  year: number;
  round: number;
  qualifying: QualifyingResult[];
}

export interface PracticeResultsResponse {
  year: number;
  round: number;
  session: string;
  practice: PracticeResult[];
}

export interface YearRouteParams {
  year: string;
}

export interface RaceRouteParams {
  year: string;
  round: string;
}

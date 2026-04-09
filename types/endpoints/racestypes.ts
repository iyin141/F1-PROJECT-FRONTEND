import type { F1CircuitRef } from "@/types/api";

// Endpoint 1: GET /api/races/<year>/
export type SeasonRace = {
  round: number;
  raceName: string;
  date: string;
  time: string;
  location: string;
  circuit: F1CircuitRef;
};

export type SeasonScheduleResponse = {
  season: number;
  races: SeasonRace[];
};

// Endpoint 2: GET /api/races/<year>/<round>/
export type RaceDetailResponse = {
  round: number;
  raceName: string;
  date: string;
  time: string;
  location: string;
  circuit: F1CircuitRef;
  sessions: string[];
};

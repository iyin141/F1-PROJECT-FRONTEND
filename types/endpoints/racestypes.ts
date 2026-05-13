import type { ReadinessChecklist } from "@/types/api";

// Endpoint 1: GET /api/races/<year>/
export type SeasonRace = {
  round: number;
  date: string;
  name: string;
  location: string;
  circuit: string;
  country: string;
  event_format?: string | null;
  session1?: string | null;
  session1_date_utc?: string | null;
  session2?: string | null;
  session2_date_utc?: string | null;
  session3?: string | null;
  session3_date_utc?: string | null;
  session4?: string | null;
  session4_date_utc?: string | null;
  session5?: string | null;
  session5_date_utc?: string | null;
};

// Legacy support while migrating consumers.
export type LegacySeasonRace = {
  round: number;
  raceName: string;
  date: string;
  location: string;
  circuit: {
    name: string;
    location: string;
    country: string;
  };
};

export type SeasonScheduleResponse = {
  year: number;
  races: SeasonRace[];
  readiness: ReadinessChecklist;
};

// Endpoint 2: GET /api/races/<year>/<round>/
export type RaceDetailResponse = {
  round: number;
  date: string;
  name: string;
  location: string;
  circuit: string;
  country: string;
  event_format?: string | null;
  session1?: string | null;
  session1_date_utc?: string | null;
  session2?: string | null;
  session2_date_utc?: string | null;
  session3?: string | null;
  session3_date_utc?: string | null;
  session4?: string | null;
  session4_date_utc?: string | null;
  session5?: string | null;
  session5_date_utc?: string | null;
  readiness: ReadinessChecklist;
  sessions?: string[];
};

// Legacy support while migrating consumers.
export type LegacyRaceDetailResponse = {
  round: number;
  raceName: string;
  date: string;
  time: string;
  location: string;
  circuit: {
    name: string;
    location: string;
    country: string;
  };
  sessions: string[];
};

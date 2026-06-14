import type { ReadinessChecklist } from "@/types/api";

export type DriverCareerSeasonRow = {
  year: number;
  races: number;
  wins: number;
  podiums: number;
  champion: boolean;
};

export type DriverCareerTotals = {
  total_wins: number;
  total_podiums: number;
  championships: number;
};

export type DriverCareerResponse = {
  driver_code: string;
  driver_name: string | null;
  nationality: string | null;
  career: DriverCareerSeasonRow[];
  career_totals: DriverCareerTotals;
  readiness: ReadinessChecklist;
};

export type DriverSeasonRaceRow = {
  year: number;
  round: number;
  race_name: string;
  location: string;
  race_date: string;
  grid_position: number | null;
  finish_position: number | null;
  points: number;
  status: string;
  fastest_lap: boolean;
  laps_completed: number | null;
  qualifying_position: number | null;
  qualifying_time: string | null;
  sprint_position?: number | null;
  sprint_points?: number | null;
  sprint_status?: string | null;
  sprint_grid?: number | null;
  sprint_laps?: number | null;
  sprint_fastest_lap?: boolean | null;
};

export type DriverSeasonBreakdownResponse = {
  driver_code: string;
  driver_name: string | null;
  year: number;
  total_races: number;
  sprint_weekends: number;
  races: DriverSeasonRaceRow[];
  readiness: ReadinessChecklist;
};

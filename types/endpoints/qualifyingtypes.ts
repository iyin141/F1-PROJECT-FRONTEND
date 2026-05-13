import type { ReadinessChecklist } from "@/types/api";

// Endpoint 4: GET /api/races/<year>/<round>/qualifying/
// Backend view returns { year, round, qualifying: [...], readiness }
export type QualifyingOnlyResultRow = {
  position: number | null;
  driver_number: number | null;
  driver_name: string;
  team?: string;
  constructor?: string;
  q1_time: string | null;
  q2_time: string | null;
  q3_time: string | null;
};

export type QualifyingResultsResponse = {
  year: number;
  round: number;
  qualifying?: QualifyingOnlyResultRow[];
  results?: QualifyingOnlyResultRow[];
  readiness: ReadinessChecklist;
};

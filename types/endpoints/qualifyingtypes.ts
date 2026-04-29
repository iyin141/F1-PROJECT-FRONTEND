import type { ReadinessChecklist } from "@/types/api";

// Endpoint 4: GET /api/races/<year>/<round>/qualifying/
export type QualifyingOnlyResultRow = {
  position: number;
  driver_name: string;
  constructor: string;
  grid: number;
  time: string | null;
};

export type QualifyingResultsResponse = {
  year: number;
  round: number;
  results: QualifyingOnlyResultRow[];
  readiness: ReadinessChecklist;
};

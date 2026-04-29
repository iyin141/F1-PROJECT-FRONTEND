import type { ReadinessChecklist } from "@/types/api";

// Endpoint 7: GET /api/constructors/<year>/
export type ConstructorStandingRow = {
  position: number;
  points: number;
  constructor: string;
  wins?: number;
};

export type ConstructorStandingsResponse = {
  year: number;
  standings: ConstructorStandingRow[];
  readiness: ReadinessChecklist;
};

import type { ReadinessChecklist } from "@/types/api";

// Endpoint 7: GET /api/constructors/<year>/
export type ConstructorStandingRow = {
  position: number;
  points: number;
  /** Primary field per API docs */
  constructor: string;
  /** Legacy alias — kept for adapter compatibility */
  constructor_name?: string;
  wins: number;
};

export type ConstructorStandingsResponse = {
  year: number;
  /** Primary key per API docs (may be `standings` or legacy `constructors`) */
  standings?: ConstructorStandingRow[];
  /** Alternative key returned by some endpoints */
  constructors?: ConstructorStandingRow[];
  readiness: ReadinessChecklist;
};

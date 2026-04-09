// Endpoint 7: GET /api/constructors/<year>/
export type ConstructorStandingRow = {
  position: number;
  points: number;
  wins: number;
  constructor: string;
};

export type ConstructorStandingsResponse = {
  season: number;
  standings: ConstructorStandingRow[];
};

export interface DriverStanding {
  position: number;
  driver_name: string;
  points: number;
  wins: number;
  constructor: string;
}

export interface ConstructorStanding {
  position: number;
  constructor_name: string;
  points: number;
  wins: number;
}

export interface DriverStandingsResponse {
  year: number;
  drivers: DriverStanding[];
}

export interface ConstructorStandingsResponse {
  year: number;
  constructors: ConstructorStanding[];
}

export interface YearRouteParams {
  year: string;
}

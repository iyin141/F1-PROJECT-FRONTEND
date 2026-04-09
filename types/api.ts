export type ApiErrorResponse = {
  detail: string;
};

export type NumericString = string;

export type PracticeSessionName = "FP1" | "FP2" | "FP3";
export type AnalysisSessionName = "Race" | "Qualifying" | PracticeSessionName;
export type RaceOnlySessionName = "Race";

export type F1DriverRef = {
  code: string;
  name: string;
};

export type F1CircuitRef = {
  name: string;
  location: string;
  country: string;
};

export type ResponseMeta = {
  season: number;
  round: number;
  session?: string;
  timestamp?: string;
};

export type ResponseFilters = {
  [key: string]: string | number | boolean | null | undefined;
};

export type ApiErrorResponse = {
  detail?: string;
  error?: string;
  error_code?: string;
  message?: string | null;
  warnings?: string[];
  readiness?: ReadinessChecklist;
};

export type NumericString = string;

export type PracticeSessionName = "FP1" | "FP2" | "FP3";
export type AnalysisSessionCode = "R" | "Q" | PracticeSessionName;
export type AnalysisSessionName = AnalysisSessionCode | "Race" | "Qualifying";
export type RaceOnlySessionName = "R" | "Race";

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
  season?: number;
  year?: number;
  round?: number;
  session?: string;
  timestamp?: string;
  can_proceed?: boolean;
  available_data?: string[];
  unavailable_data?: string[];
  message?: string | null;
  warnings?: string[];
};

export type ResponseFilters = {
  [key: string]: string | number | boolean | null | undefined;
};

export type ReadinessChecklist = {
  can_proceed: boolean;
  available_data: string[];
  unavailable_data: string[];
  message: string | null;
  warnings: string[];
};

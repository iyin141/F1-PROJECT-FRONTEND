export interface ApiErrorResponse {
  error?: string;
  message?: string | string[];
  errors?: Record<string, string[]>;
}

export interface ApiSuccessMessage {
  message: string;
}

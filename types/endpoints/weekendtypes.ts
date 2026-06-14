import type { ResponseMeta } from "@/types/api";

// Endpoint: GET /api/races/{year}/{round}/weekend/
export type RaceWeekendResponse = {
  meta?: ResponseMeta & { year?: number; round?: number };
  year?: number;
  round?: number;
  summary?: Record<string, unknown>;
  readiness?: { can_proceed?: boolean; available_data?: string[]; message?: string | null };
  // Allow other properties from backend (flexible shape)
  [key: string]: unknown;
};

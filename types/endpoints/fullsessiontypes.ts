import type { AnalysisSessionName, ResponseFilters, ResponseMeta } from "@/types/api";

export type UnifiedIncludeType =
  | "telemetry"
  | "weather"
  | "pit_stops"
  | "incidents"
  | "positions"
  | "drs"
  | "track_status";

export type UnifiedCacheStats = {
  cached_sessions?: number;
  hits?: number;
  misses?: number;
  hit_rate?: number;
  hit_rate_percent?: number;
};

// Endpoint 16: GET /api/unified/races/<year>/<round>/full-session/
export type FullSessionResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    requested_types?: UnifiedIncludeType[];
    cache_stats: UnifiedCacheStats;
  };
  filters?: ResponseFilters;
  data: Partial<
    Record<
      UnifiedIncludeType,
      {
        meta?: {
          row_count?: number;
        };
        data?: unknown[];
        error?: string;
        status?: "failed" | "partial" | "ok";
      }
    >
  >;
};

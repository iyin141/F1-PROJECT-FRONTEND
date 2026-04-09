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
  hits: number;
  misses: number;
  hit_rate: number;
};

// Endpoint 16: GET /api/unified/races/<year>/<round>/full-session/
export type FullSessionResponse = {
  meta: ResponseMeta & {
    session: AnalysisSessionName;
    cache_hit: boolean;
    cache_stats: UnifiedCacheStats;
  };
  filters: ResponseFilters & {
    included_types: UnifiedIncludeType[];
    session: AnalysisSessionName;
    driver?: string | null;
    limit?: number;
  };
  data: Record<UnifiedIncludeType, unknown[] | undefined>;
};

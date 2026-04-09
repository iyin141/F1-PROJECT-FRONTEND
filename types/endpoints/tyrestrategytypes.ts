import type { NumericString, ResponseFilters, ResponseMeta, RaceOnlySessionName } from "@/types/api";

// Endpoint 11: GET /api/analysis/races/<year>/<round>/tyre-strategy/
export type TyreStrategyRow = {
  compound: string;
  stint: number;
  degradation_rate: number;
  min_lap_time: NumericString | null;
  max_lap_time: NumericString | null;
  avg_lap_time: NumericString | null;
};

export type TyreStrategyResponse = {
  meta: ResponseMeta & { session: RaceOnlySessionName };
  filters: ResponseFilters & {
    session: RaceOnlySessionName;
    driver?: string | null;
  };
  data: TyreStrategyRow[];
};

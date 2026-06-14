import { useQuery } from "@tanstack/react-query";
import { ANALYSIS_CONFIG } from "@/Lib/queryKeys";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskRecord {
  task_id: string;
  task_key: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE";
  progress: number;
  created_at: string;
}

/** Standardized shape every analysis hook returns. */
export interface QueryResult<T> {
  data: T | undefined;
  /** True only on the very first fetch (no cached data yet). */
  isLoading: boolean;
  /** True whenever any fetch is in-flight, including background refetches. */
  isFetching: boolean;
  /** True when a 202 TaskRecord is in progress (PENDING or STARTED). */
  isPolling: boolean;
  /** 0–100 from the task record; 100 when data is available. */
  progress: number;
  error: Error | null;
  /** Data exists but is an empty array. */
  isEmpty: boolean;
  /** meta.can_proceed === false — pre-2018 data boundary. */
  isUnavailable: boolean;
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

function isTaskRecord(value: unknown): value is TaskRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    typeof (value as TaskRecord).status === "string"
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Wrapper around useQuery that detects HTTP 202 task records and polls
 * every 2 seconds until the backend returns real data (STATUS SUCCESS/FAILURE
 * or no status field at all). Normalizes the return shape into QueryResult<T>.
 */
export function useAsyncTask<TData>(
  queryKey: readonly unknown[],
  fetchFn: () => Promise<TData | TaskRecord>,
  options?: {
    enabled?: boolean;
    /** Override the default ANALYSIS_CONFIG cache settings. */
    cacheConfig?: { staleTime?: number; gcTime?: number };
  },
): QueryResult<TData> {
  const mergedConfig = { ...ANALYSIS_CONFIG, ...(options?.cacheConfig ?? {}) };

  const query = useQuery<TData | TaskRecord, Error>({
    queryKey,
    queryFn: fetchFn,
    enabled: options?.enabled ?? true,
    refetchInterval: (query) => {
      const d = query.state.data;
      if (!d) return false;
      if (isTaskRecord(d) && (d.status === "PENDING" || d.status === "STARTED")) {
        return 2000;
      }
      return false;
    },
    ...mergedConfig,
  });

  const raw = query.data;
  const isPolling = isTaskRecord(raw) && (raw.status === "PENDING" || raw.status === "STARTED");
  const progress = isTaskRecord(raw) ? raw.progress ?? 0 : raw !== undefined ? 100 : 0;

  // Only expose real data — suppress the TaskRecord shape from consumers.
  const data: TData | undefined = isTaskRecord(raw) ? undefined : (raw as TData | undefined);

  const isEmpty =
    data !== undefined &&
    Array.isArray(data) &&
    (data as unknown[]).length === 0;

  // Detect the pre-2018 boundary sentinel: any object with meta.can_proceed === false
  const isUnavailable =
    data !== undefined &&
    typeof data === "object" &&
    data !== null &&
    "meta" in (data as object) &&
    typeof (data as any).meta?.can_proceed === "boolean" &&
    (data as any).meta.can_proceed === false;

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPolling,
    progress,
    error: query.error,
    isEmpty,
    isUnavailable,
  };
}

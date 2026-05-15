import { QueryClient } from "@tanstack/react-query";

/**
 * Cache-bridge utility for imperative callers.
 *
 * Behavior:
 *  - If the queryClient already has data for `queryKey`, return it synchronously (fast path).
 *  - Otherwise call `queryClient.fetchQuery()` to fetch, populate the cache and return the result.
 *  - `options.force` forces a network fetch via `fetchQuery` even when cache exists.
 */
export async function fetchWithCache<T>(
  client: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: { force?: boolean } & Record<string, unknown>
): Promise<T> {
  // Fast-path: return cached data if available and not forced
  if (!options?.force) {
    const cached = client.getQueryData<T>(queryKey);
    if (cached !== undefined) return cached;
  }

  // Otherwise fetch via react-query so the cache is populated/updated.
  const { force, ...fetchOpts } = (options ?? {}) as Record<string, unknown>;

  // Use the object overload so we don't need to reason about overload tuples here
  return client.fetchQuery({ queryKey, queryFn, ...(fetchOpts as any) } as any) as Promise<T>;
}

export default fetchWithCache;

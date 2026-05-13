import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cache } from "react";

/**
 * Query prefetch configuration.
 * Used with prefetchQueries to specify which queries should be prefetched
 * on the server before sending HTML to client.
 */
export interface PrefetchQueryConfig {
  queryKey: readonly unknown[];
  pathname: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  adapter?: (raw: any) => unknown;
  options?: any;
}

/**
 * Server-side prefetch helper.
 * Creates a QueryClient, prefetches specified queries, dehydrates state.
 *
 * NOTE: This function BLOCKS the page render. For streaming pages, do NOT use this.
 * Instead, call fetchDataWithCache() directly in individual Server Components
 * and wrap them in Suspense boundaries.
 *
 * Usage in a Server Component (legacy, blocks render):
 *
 *   import { prefetchQueries } from "@/Lib/prefetch";
 *   import { queryKeys } from "@/Lib/queryKeys";
 *
 *   const { dehydratedState } = await prefetchQueries([
 *     {
 *       queryKey: queryKeys.driverStandings.grid(2024),
 *       pathname: `/drivers/standings/2024/`,
 *     },
 *   ]);
 *
 * @param queries - Array of queries to prefetch
 * @returns QueryClient instance and dehydrated state
 *
 * Note: Uses Promise.allSettled so one failed prefetch doesn't block others.
 * Failed queries will have empty {} data, but won't crash the page.
 */
export async function prefetchQueries(queries: PrefetchQueryConfig[]) {
  const { serverGetJson } = await import("@/Lib/api");

  // Keep QueryClient default options empty — per-query cache control comes
  // from `queryKey` callers via their hooks or the optional `options` value.
  const queryClient = new QueryClient();

  // Prefetch all queries in parallel, don't let one failure block others
  // Server-side: call backend directly and store RAW JSON in the cache.
  console.log("[prefetch] starting prefetch for paths:", queries.map((q) => q.pathname));

  const tasks = queries.map(({ queryKey, pathname, query, options }) =>
    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        console.log("[prefetch] serverGetJson", { pathname, query });
        try {
          const payload = await serverGetJson(pathname, query as any);
          console.log("[prefetch] serverGetJson ok", { pathname });
          return payload;
        } catch (err) {
          console.error("[prefetch] serverGetJson failed", { pathname, err });
          throw err;
        }
      },
      // Allow callers to pass per-query options (staleTime/gcTime) if needed.
      ...options,
    })
  );

  const settled = await Promise.allSettled(tasks);
  const summary = settled.map((r, i) => ({
    pathname: queries[i]?.pathname,
    status: r.status,
    reason: r.status === "rejected" ? (r as PromiseRejectedResult).reason : undefined,
  }));
  console.log("[prefetch] results summary", summary);

  return {
    queryClient,
    dehydratedState: dehydrate(queryClient),
  };
}

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Fetch data from backend with intelligent caching.
 * - Historical years (< CURRENT_YEAR): cache forever via React.cache()
 * - Current/future years: cache for 5 minutes
 *
 * Use this in Server Components wrapped by Suspense boundaries for streaming.
 * Each call is memoized within a single request via React.cache().
 *
 * @param pathname - API path (e.g., "/drivers/standings/2024/")
 * @param year - Year parameter (used to determine cache TTL)
 * @returns Fetched data as type T
 */
export async function fetchDataWithCache<T>(
  pathname: string,
  year?: number
): Promise<T> {
  // Determine cache strategy based on year
  const isHistorical = year !== undefined && year < CURRENT_YEAR;

  if (isHistorical) {
    // Historical years: memoize identical fetches via React.cache().
    return historicalFetch(pathname) as Promise<T>;
  }

  // Current/future years: keep normal fetch/revalidate behavior.
  return uncachedFetch(pathname) as Promise<T>;
}

/**
 * Internal: Memoized fetch using React.cache()
 * Deduplicates identical requests within a single render.
 *
 * For historical data (isHistorical=true): never refetch (Infinity TTL)
 * For current/future data (isHistorical=false): revalidate every 60s (handled by serverGetJson)
 */
const historicalFetch = cache(async (pathname: string): Promise<unknown> => {
  const { serverGetJson } = await import("@/Lib/server-client");
  return serverGetJson(pathname);
});

const uncachedFetch = async (pathname: string): Promise<unknown> => {
  const { serverGetJson } = await import("@/Lib/server-client");
  return serverGetJson(pathname);
};

/**
 * Export HydrationBoundary for convenience so consumers only need to import from prefetch.ts
 */
export { HydrationBoundary };

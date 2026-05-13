import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/Lib/queryKeys";
function buildClientUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/api${normalizedPath}`;
}

export async function prefetchDriverData(
  queryClient: QueryClient,
  driverCode: string,
  year?: number,
) {
  if (!driverCode || typeof window === "undefined") return;

  const tasks: Promise<unknown>[] = [];

  tasks.push(
    queryClient.prefetchQuery({
      queryKey: queryKeys.driverStandings.career(driverCode),
      queryFn: async () => {
          const url = buildClientUrl(`/drivers/${driverCode}/career/`);
          const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
          if (!res.ok) return {} as any;
          const raw = await res.json();
          return raw;
        },
    }),
  );

  if (year !== undefined) {
    tasks.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.driverStandings.season(driverCode, year),
        queryFn: async () => {
          const url = buildClientUrl(`/drivers/${driverCode}/${year}/`);
          const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
          if (!res.ok) return {} as any;
          const raw = await res.json();
          return raw;
        },
      }),
    );
  }

  await Promise.allSettled(tasks);
}

export function prefetchDriverRouteAndData(
  queryClient: QueryClient,
  router: { prefetch?: (path: string) => void } | undefined,
  driverCode: string,
  year?: number,
) {
  try {
    router?.prefetch?.(`/drivers/${driverCode}/${year ?? new Date().getFullYear()}`);
  } catch (e) {
    // ignore router prefetch errors
  }

  // Fire-and-forget data prefetch
  void prefetchDriverData(queryClient, driverCode, year);
}

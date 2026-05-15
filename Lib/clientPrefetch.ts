import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/Lib/queryKeys";
import { getDriverCareerBridged, getDriverSeasonBridged } from "@/Lib/api/bridged/drivers";

export async function prefetchDriverData(
  queryClient: QueryClient,
  driverCode: string,
  year?: number,
) {
  if (!driverCode || typeof window === "undefined") return;

  const tasks: Promise<unknown>[] = [];

  tasks.push(getDriverCareerBridged(queryClient, driverCode));

  if (year !== undefined) {
    tasks.push(getDriverSeasonBridged(queryClient, driverCode, year));
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

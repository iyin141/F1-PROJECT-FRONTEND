import type { QueryClient } from "@tanstack/react-query";
import { fetchDriverCareer, fetchDriverSeason } from "@/Lib/queryFunctions";

export async function prefetchDriver(
  driverCode: string,
  year: number | undefined,
  queryClient: QueryClient,
  router?: { prefetch?: (url: string) => void } | undefined,
) {
  if (!driverCode) return;

  try {
    if (router && typeof router.prefetch === "function") {
      try {
        // best-effort: ask Next router to prefetch the driver route
        router.prefetch(`/drivers/${driverCode}/${year ?? ""}`);
      } catch (err) {
        // swallow navigation errors
      }
    }

    // warm react-query cache via existing queryFunctions
    void fetchDriverCareer(driverCode, queryClient);
    if (typeof year === "number") {
      void fetchDriverSeason(driverCode, year, queryClient);
    }
  } catch (err) {
    // noop
  }
}

export default prefetchDriver;

'use client';

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/Lib/queryKeys";
import { fetchTelemetryOverlay } from "@/Lib/queryFunctions";
import type {
  TelemetryOverlayResponse,
} from "@/types/endpoints";
import type { AnalysisSessionName } from "@/types/api";

export function usePersistentTelemetryOverlay(
  year: number,
  round: number,
  driverA: string | undefined,
  driverB: string | undefined,
  lapA: number | undefined,
  lapB: number | undefined,
  session: AnalysisSessionName = "R",
  options?: import("@/Lib/queryFunctions/analysis").TelemetryOverlayOptions
) {
  const query = useQuery<TelemetryOverlayResponse>({
    queryKey: [...queryKeys.telemetry.overlay(
      year,
      round,
      driverA ?? "",
      driverB ?? "",
      lapA,
      session,
    ), lapB, options],
    queryFn: () => fetchTelemetryOverlay(year, round, driverA!, driverB!, lapA, lapB, session, options),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled: !!driverA && !!driverB,
  });

  return query;
}

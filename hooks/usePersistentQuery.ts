'use client';

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/Lib/queryKeys";
import { fetchTelemetry, fetchTelemetryOverlay } from "@/Lib/queryFunctions";
import type {
  TelemetryOverlayResponse,
  TelemetryResponse,
} from "@/types/endpoints";
import type { AnalysisSessionName } from "@/types/api";

export function usePersistentTelemetry(
  year: number,
  round: number,
  driver: string | undefined,
  lap: number | null,
  session: AnalysisSessionName = "R",
) {
  const qc = useQueryClient();

  const query = useQuery<TelemetryResponse>({
    queryKey: queryKeys.telemetry.single(
      year,
      round,
      driver ?? "",
      lap ?? 0,
      session,
    ),
    queryFn: () => fetchTelemetry(year, round, driver!, lap!, session, qc),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled: !!driver && lap !== null,
  });

  return query;
}

export function usePersistentTelemetryOverlay(
  year: number,
  round: number,
  driverA: string | undefined,
  driverB: string | undefined,
  lap: number | undefined,
  session: AnalysisSessionName = "R",
) {
  const qc = useQueryClient();

  const query = useQuery<TelemetryOverlayResponse>({
    queryKey: queryKeys.telemetry.overlay(
      year,
      round,
      driverA ?? "",
      driverB ?? "",
      lap,
    ),
    queryFn: () => fetchTelemetryOverlay(year, round, driverA!, driverB!, lap, qc, session),
    staleTime: 86400000,
    gcTime: 86400000,
    enabled: !!driverA && !!driverB,
  });

  return query;
}

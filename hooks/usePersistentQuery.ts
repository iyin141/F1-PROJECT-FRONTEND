'use client';

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// Use the local analysis API routes instead of server actions
import { cacheConfig, queryKeys } from "@/Lib/queryKeys";
import { getTelemetry, getTelemetryOverlay } from "@/Lib/api/services/analysis";
import type {
  TelemetryOverlayResponse,
  TelemetryResponse,
} from "@/types/endpoints";
import type { AnalysisSessionName } from "@/types/api";

const MAX_PERSIST_SIZE = 1_000_000;

function readLocalStorageJson<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function writeLocalStorageJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(value);
    if (raw.length > MAX_PERSIST_SIZE) return;
    window.localStorage.setItem(key, raw);
  } catch {
    // Ignore quota and serialization failures.
  }
}

export function usePersistentTelemetry(
  year: number,
  round: number,
  driver: string | undefined,
  lap: number | null,
  session: AnalysisSessionName = "R",
) {
  const storageKey = useMemo(
    () =>
      `f1:telem:${year}:${round}:${session}:${driver ?? ""}:${lap ?? ""}`,
    [year, round, session, driver, lap],
  );

  const initialData = useMemo(
    () => readLocalStorageJson<TelemetryResponse>(storageKey),
    [storageKey],
  );

  const query = useQuery<TelemetryResponse>({
    queryKey: queryKeys.telemetry.single(
      year,
      round,
      driver ?? "",
      lap ?? 0,
      session,
    ),
    queryFn: () => getTelemetry(year, round, { session, driver: driver!, lap: lap! }),
    ...cacheConfig.heavyOptIn,
    enabled: !!driver && lap !== null,
    initialData,
  });

  useEffect(() => {
    if (query.data) writeLocalStorageJson(storageKey, query.data);
  }, [query.data, storageKey]);

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
  const ordered = useMemo(() => [driverA ?? "", driverB ?? ""].sort(), [driverA, driverB]);
  const storageKey = useMemo(
    () =>
      `f1:telem-ov:${year}:${round}:${session}:${ordered[0]}:${ordered[1]}:${lap ?? ""}`,
    [year, round, session, ordered, lap],
  );

  const initialData = useMemo(
    () => readLocalStorageJson<TelemetryOverlayResponse>(storageKey),
    [storageKey],
  );

  const query = useQuery<TelemetryOverlayResponse>({
    queryKey: queryKeys.telemetry.overlay(
      year,
      round,
      driverA ?? "",
      driverB ?? "",
      lap,
    ),
    queryFn: () => getTelemetryOverlay(year, round, { driver_a: driverA!, driver_b: driverB!, session, lap }),
    ...cacheConfig.heavyOptIn,
    enabled: !!driverA && !!driverB,
    initialData,
  });

  useEffect(() => {
    if (query.data) writeLocalStorageJson(storageKey, query.data);
  }, [query.data, storageKey]);

  return query;
}

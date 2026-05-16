
import type { LapsAnalysisResponse } from "@/types/endpoints/lapstypes";
import type { TelemetryResponse } from "@/types/endpoints/telemetrytypes";
import type { TelemetryOverlayResponse } from "@/types/endpoints/telemetryoverlaytypes";
import type { TelemetrySummaryResponse } from "@/types/endpoints/telemetrysummarytypes";

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractErrorMessage(data: {
  message?: string | string[];
  errors?: Record<string, string[]>;
}): string {
  if (data.errors) {
    const firstField = Object.values(data.errors)[0];
    if (firstField?.length) return firstField[0];
  }
  if (Array.isArray(data.message)) return data.message[0];
  return data.message || "Something went wrong. Please try again.";
}

// ── Analysis functions ────────────────────────────────────────────────────────

/**
 * Generic analysis fetcher. All typed helpers delegate here.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @param endpoint - Endpoint segment, e.g. "laps", "pace", "tyre-strategy"
 * @param params - Optional query params (session, driver, lap, etc.)
 * @returns Raw analysis response as type T
 * @throws Error with a human-readable message on failure.
 */
export async function getAnalysis<T = unknown>(
  year: number,
  round: number,
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
  }
  const qstr = qs.toString();
  const url = `/api/analysis/races/${year}/${round}/${endpoint}/${qstr ? `?${qstr}` : ""}`;

  console.log(`[getAnalysis] → Fetching: ${endpoint}`, year, round);

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error(`[getAnalysis] ❌ Failed (${endpoint}):`, message);
    throw new Error(message);
  }

  console.log(`[getAnalysis] ✅ Fetched: ${endpoint}`, year, round);
  return data as T;
}

/** Fetch per-lap timing data. Optionally filter by driver. */
export async function getLapsAnalysis(
  year: number,
  round: number,
  params?: Record<string, string | number | undefined>,
): Promise<LapsAnalysisResponse> {
  return getAnalysis<LapsAnalysisResponse>(year, round, "laps", params);
}

/** Fetch full telemetry channels for a single driver on a specific lap. Heavy payload. */
export async function getTelemetry(
  year: number,
  round: number,
  params?: Record<string, string | number | undefined>,
): Promise<TelemetryResponse> {
  return getAnalysis<TelemetryResponse>(year, round, "telemetry", params);
}

/** Fetch comparative telemetry for two drivers on the same lap. */
export async function getTelemetryOverlay(
  year: number,
  round: number,
  params?: Record<string, string | number | undefined>,
): Promise<TelemetryOverlayResponse> {
  return getAnalysis<TelemetryOverlayResponse>(year, round, "telemetry/overlay", params);
}

/** Fetch aggregated telemetry summary stats (averages, peaks) for a driver on a lap. */
export async function getTelemetrySummary(
  year: number,
  round: number,
  params?: Record<string, string | number | undefined>,
): Promise<TelemetrySummaryResponse> {
  return getAnalysis<TelemetrySummaryResponse>(year, round, "telemetry/summary", params);
}

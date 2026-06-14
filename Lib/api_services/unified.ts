
import type { UnifiedWeatherResponse } from "@/types/endpoints/weathertypes";
import type { UnifiedIncidentsResponse } from "@/types/endpoints/incidentstypes";
import type { UnifiedPositionsResponse } from "@/types/endpoints/positionstypes";
import type { UnifiedPitStopsResponse } from "@/types/endpoints/pitstopstypes";
import type { UnifiedDrsResponse } from "@/types/endpoints/drstypes";
import type { UnifiedTrackStatusResponse } from "@/types/endpoints/trackstatustypes";
import type { FullSessionResponse } from "@/types/endpoints/fullsessiontypes";

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

// ── Unified session data functions ────────────────────────────────────────────

/**
 * Fetch weather data for a session.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @param session - Session identifier (default "R")
 * @returns Weather readings for the session
 * @throws Error with a human-readable message on failure.
 */
export async function getUnifiedWeather(
  year: number,
  round: number,
  session = "R",
  perLap?: boolean,
): Promise<UnifiedWeatherResponse> {
  console.log("[getUnifiedWeather] → Fetching:", year, round, session, { perLap });

  const qs = new URLSearchParams();
  qs.set("session", session);
  if (perLap) qs.set("per_lap", "true");
  const qstr = qs.toString();

  const res = await fetch(`/api/unified/races/${year}/${round}/weather/${qstr ? `?${qstr}` : ""}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getUnifiedWeather] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getUnifiedWeather] ✅ Fetched:", year, round, session);
  return data as UnifiedWeatherResponse;
}

/**
 * Fetch safety car, red flag, and incident events for a session.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @param session - Session identifier (default "R")
 * @returns Incidents list for the session
 * @throws Error with a human-readable message on failure.
 */
export async function getUnifiedIncidents(
  year: number,
  round: number,
  session = "R",
): Promise<UnifiedIncidentsResponse> {
  console.log("[getUnifiedIncidents] → Fetching:", year, round, session);

  const res = await fetch(`/api/unified/races/${year}/${round}/incidents/?session=${session}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getUnifiedIncidents] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getUnifiedIncidents] ✅ Fetched:", year, round, session);
  return data as UnifiedIncidentsResponse;
}

/**
 * Fetch car position data for a session (heavy payload).
 *
 * Pass `sample` to downsample — e.g. `1` returns every 1-second frame for replay.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @param session - Session identifier (default "R")
 * @param sample - Optional sample_interval in seconds for downsampling
 * @returns Position frames for every car in the session
 * @throws Error with a human-readable message on failure.
 */
export async function getUnifiedPositions(
  year: number,
  round: number,
  session = "R",
  sample?: number,
  limit?: number,
): Promise<UnifiedPositionsResponse> {
  console.log("[getUnifiedPositions] → Fetching:", year, round, session, { sample, limit });

  const qs = new URLSearchParams();
  qs.set("session", session);
  if (sample !== undefined) qs.set("sample_interval", String(sample));
  if (limit !== undefined) qs.set("limit", String(limit));

  const res = await fetch(`/api/unified/races/${year}/${round}/positions/?${qs.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getUnifiedPositions] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getUnifiedPositions] ✅ Fetched:", year, round, session);
  return data as UnifiedPositionsResponse;
}

/**
 * Fetch pit stop data for a session.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @param session - Session identifier (default "R")
 * @returns Pit stop records for every driver
 * @throws Error with a human-readable message on failure.
 */
export async function getUnifiedPitStops(
  year: number,
  round: number,
  session = "R",
): Promise<UnifiedPitStopsResponse> {
  console.log("[getUnifiedPitStops] → Fetching:", year, round, session);

  const res = await fetch(`/api/unified/races/${year}/${round}/pit-stops/?session=${session}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getUnifiedPitStops] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getUnifiedPitStops] ✅ Fetched:", year, round, session);
  return data as UnifiedPitStopsResponse;
}

/**
 * Fetch DRS activation zones and status for a session.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @param session - Session identifier (default "R")
 * @returns DRS status frames for the session
 * @throws Error with a human-readable message on failure.
 */
export async function getUnifiedDrs(
  year: number,
  round: number,
  session = "R",
): Promise<UnifiedDrsResponse> {
  console.log("[getUnifiedDrs] → Fetching:", year, round, session);

  const res = await fetch(`/api/unified/races/${year}/${round}/drs/?session=${session}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getUnifiedDrs] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getUnifiedDrs] ✅ Fetched:", year, round, session);
  return data as UnifiedDrsResponse;
}

/**
 * Fetch track status (VSC, SC, red flag) events for a session.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @param session - Session identifier (default "R")
 * @returns Track status change events for the session
 * @throws Error with a human-readable message on failure.
 */
export async function getUnifiedTrackStatus(
  year: number,
  round: number,
  session = "R",
): Promise<UnifiedTrackStatusResponse> {
  console.log("[getUnifiedTrackStatus] → Fetching:", year, round, session);

  const res = await fetch(`/api/unified/races/${year}/${round}/track-status/?session=${session}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getUnifiedTrackStatus] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getUnifiedTrackStatus] ✅ Fetched:", year, round, session);
  return data as UnifiedTrackStatusResponse;
}

/**
 * Fetch a bundled full-session data payload.
 *
 * Use the `include` param to restrict which sub-sections are returned.
 * Use `limit` to cap the number of rows per sub-section.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @param params - Optional filter: include, session, driver, limit
 * @returns Composite full-session payload
 * @throws Error with a human-readable message on failure.
 */
export async function getFullSession(
  year: number,
  round: number,
  params?: { include?: string[]; session?: string; driver?: string; limit?: number },
): Promise<FullSessionResponse> {
  console.log("[getFullSession] → Fetching:", year, round, params);

  const qs = new URLSearchParams();
  if (params?.include?.length) qs.set("include", params.include.join(","));
  if (params?.session) qs.set("session", params.session);
  if (params?.driver) qs.set("driver", params.driver);
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  const qstr = qs.toString();

  const res = await fetch(`/api/unified/races/${year}/${round}/full-session/${qstr ? `?${qstr}` : ""}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getFullSession] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getFullSession] ✅ Fetched:", year, round);
  return data as FullSessionResponse;
}

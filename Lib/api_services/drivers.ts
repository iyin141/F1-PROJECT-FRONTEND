
import type { DriverCareerResponse, DriverSeasonBreakdownResponse } from "@/types/endpoints/driverrecordtypes";

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

// ── Driver functions ──────────────────────────────────────────────────────────

/**
 * Fetch full career history for a driver across all seasons.
 *
 * @param driverCode - Three-letter driver code (e.g. "VER", "HAM")
 * @returns Career summary with per-season win/podium totals and championship data
 * @throws Error with a human-readable message on failure.
 */
export async function getDriverCareer(driverCode: string): Promise<DriverCareerResponse> {
  console.log("[getDriverCareer] → Fetching:", driverCode);

  const res = await fetch(`/api/drivers/${driverCode}/career/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getDriverCareer] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getDriverCareer] ✅ Fetched:", driverCode);
  return data as DriverCareerResponse;
}

/**
 * Fetch race-by-race breakdown for a driver in a specific season.
 *
 * @param driverCode - Three-letter driver code (e.g. "VER", "HAM")
 * @param year - F1 season year
 * @returns Season breakdown with per-race positions, points and incident data
 * @throws Error with a human-readable message on failure.
 */
export async function getDriverSeason(driverCode: string, year: number): Promise<DriverSeasonBreakdownResponse> {
  console.log("[getDriverSeason] → Fetching:", driverCode, year);

  const res = await fetch(`/api/drivers/${driverCode}/${year}/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getDriverSeason] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getDriverSeason] ✅ Fetched:", driverCode, year);
  return data as DriverSeasonBreakdownResponse;
}

/**
 * Fetch drivers available for a given season (useful for season grid/search pages).
 *
 * @param year - F1 season year
 */
export async function getDriversForSeason(year: number): Promise<any> {
  console.log("[getDriversForSeason] → Fetching:", year);

  const res = await fetch(`/api/drivers/search/?year=${year}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getDriversForSeason] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getDriversForSeason] ✅ Fetched:", year);
  return data;
}

/**
 * Search drivers by free-text name query, optional year to restrict results.
 *
 * @param q - Search query string
 * @param year - Optional season year to restrict search
 */
export async function searchDriversByName(q: string, year?: number): Promise<any> {
  console.log("[searchDriversByName] → Fetching:", q, year);
  const qs = `?q=${encodeURIComponent(q)}${year ? `&year=${year}` : ""}`;

  const res = await fetch(`/api/drivers/search-by-name/${qs}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[searchDriversByName] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[searchDriversByName] ✅ Fetched:", q, year);
  return data;
}

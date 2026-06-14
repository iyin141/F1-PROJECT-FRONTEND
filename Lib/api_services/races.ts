
import type { SeasonScheduleResponse, RaceDetailResponse } from "@/types/endpoints/racestypes";
import type { RaceResultsResponse } from "@/types/endpoints/resultstypes";
import type { QualifyingResultsResponse } from "@/types/endpoints/qualifyingtypes";
import type { PracticeResultsResponse } from "@/types/endpoints/practicetypes";
import type { SprintResultsResponse, SprintShootoutResultsResponse } from "@/types/endpoints/sprinttypes";
import type { DriverStandingsResponse } from "@/types/endpoints/driverstandingstypes";
import type { ConstructorStandingsResponse } from "@/types/endpoints/constructorstandingstypes";
import type { RaceWeekendResponse } from "@/types/endpoints/weekendtypes";

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

// ── Season / Standings functions ──────────────────────────────────────────────

/**
 * Fetch the full season schedule for a given year.
 *
 * @param year - F1 season year
 * @returns Season schedule with all races
 * @throws Error with a human-readable message on failure.
 */
export async function getSeasonSchedule(year: number): Promise<SeasonScheduleResponse> {
  console.log("[getSeasonSchedule] → Fetching:", year);

  const res = await fetch(`/api/races/${year}/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getSeasonSchedule] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getSeasonSchedule] ✅ Fetched:", year);
  return data as SeasonScheduleResponse;
}

/**
 * Fetch driver championship standings for a given year.
 *
 * @param year - F1 season year
 * @returns Driver standings list ordered by position
 * @throws Error with a human-readable message on failure.
 */
export async function getDriverStandings(year: number): Promise<DriverStandingsResponse> {
  console.log("[getDriverStandings] → Fetching:", year);

  const res = await fetch(`/api/drivers/${year}/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getDriverStandings] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getDriverStandings] ✅ Fetched:", year);
  return data as DriverStandingsResponse;
}

/**
 * Fetch constructor championship standings for a given year.
 *
 * @param year - F1 season year
 * @returns Constructor standings list ordered by position
 * @throws Error with a human-readable message on failure.
 */
export async function getConstructorStandings(year: number): Promise<ConstructorStandingsResponse> {
  console.log("[getConstructorStandings] → Fetching:", year);

  // Use canonical constructors path; middleware rewrites to existing app route.
  const res = await fetch(`/api/constructors/${year}/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getConstructorStandings] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getConstructorStandings] ✅ Fetched:", year);
  return data as ConstructorStandingsResponse;
}

// ── Race Detail functions ─────────────────────────────────────────────────────

/**
 * Fetch race event metadata (circuit info, round header) for a specific race.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @returns Race detail header data
 * @throws Error with a human-readable message on failure.
 */
export async function getRaceDetail(year: number, round: number): Promise<RaceDetailResponse> {
  console.log("[getRaceDetail] → Fetching:", year, round);

  const res = await fetch(`/api/races/${year}/${round}/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getRaceDetail] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getRaceDetail] ✅ Fetched:", year, round);
  return data as RaceDetailResponse;
}

/**
 * Fetch race session results for a specific round.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @returns Full race results with driver finishing positions
 * @throws Error with a human-readable message on failure.
 */
export async function getRaceResults(year: number, round: number): Promise<RaceResultsResponse> {
  console.log("[getRaceResults] → Fetching:", year, round);

  const res = await fetch(`/api/races/${year}/${round}/results/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getRaceResults] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getRaceResults] ✅ Fetched:", year, round);
  return data as RaceResultsResponse;
}

/**
 * Fetch qualifying session results for a specific round.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @returns Qualifying results with Q1/Q2/Q3 times per driver
 * @throws Error with a human-readable message on failure.
 */
export async function getQualifyingResults(year: number, round: number): Promise<QualifyingResultsResponse> {
  console.log("[getQualifyingResults] → Fetching:", year, round);

  const res = await fetch(`/api/races/${year}/${round}/qualifying/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getQualifyingResults] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getQualifyingResults] ✅ Fetched:", year, round);
  return data as QualifyingResultsResponse;
}

/**
 * Fetch practice session results for a specific round.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @param session - Practice session identifier ("FP1" | "FP2" | "FP3")
 * @returns Practice results for the specified session
 * @throws Error with a human-readable message on failure.
 */
export async function getPracticeResults(year: number, round: number, session: string): Promise<PracticeResultsResponse> {
  console.log("[getPracticeResults] → Fetching:", year, round, session);

  const res = await fetch(`/api/races/${year}/${round}/practice/${session}/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getPracticeResults] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getPracticeResults] ✅ Fetched:", year, round, session);
  return data as PracticeResultsResponse;
}

/**
 * Fetch sprint race results for a specific round.
 *
 * @param year - F1 season year
 * @param round - Race round number (sprint weekend only)
 * @returns Sprint race results
 * @throws Error with a human-readable message on failure.
 */
export async function getSprintResults(year: number, round: number): Promise<SprintResultsResponse> {
  console.log("[getSprintResults] → Fetching:", year, round);

  const res = await fetch(`/api/races/${year}/${round}/sprint/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getSprintResults] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getSprintResults] ✅ Fetched:", year, round);
  return data as SprintResultsResponse;
}

/**
 * Fetch sprint shootout qualifying results for a specific round.
 *
 * @param year - F1 season year
 * @param round - Race round number (sprint weekend only)
 * @returns Sprint shootout qualifying results
 * @throws Error with a human-readable message on failure.
 */
export async function getSprintShootoutResults(year: number, round: number): Promise<SprintShootoutResultsResponse> {
  console.log("[getSprintShootoutResults] → Fetching:", year, round);

  const res = await fetch(`/api/races/${year}/${round}/sprint-shootout/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getSprintShootoutResults] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getSprintShootoutResults] ✅ Fetched:", year, round);
  return data as SprintShootoutResultsResponse;
}

/**
 * Fetch weekend summary for a specific round.
 *
 * @param year - F1 season year
 * @param round - Race round number
 * @returns Weekend summary payload
 * @throws Error with a human-readable message on failure.
 */
export async function getRaceWeekend(year: number, round: number): Promise<RaceWeekendResponse> {
  console.log("[getRaceWeekend] → Fetching:", year, round);

  const res = await fetch(`/api/races/${year}/${round}/weekend/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = extractErrorMessage(data);
    console.error("[getRaceWeekend] ❌ Failed:", message);
    throw new Error(message);
  }

  console.log("[getRaceWeekend] ✅ Fetched:", year, round);
  return data as RaceWeekendResponse;
}

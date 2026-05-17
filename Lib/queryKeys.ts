import type { AnalysisSessionName } from "@/types/api";

// ---------------------------------------------------------------------------
// Cache config presets
// Every hook spreads one of these — no hardcoded staleTime/gcTime in hook files.
// ---------------------------------------------------------------------------

export const cacheConfig = {
  /** Completed race data — never changes once available. */
  historical: {
    staleTime: Infinity,
    // Treat historical years as immutable: never garbage-collect and don't refetch
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },

  /** Live season data — refreshes after each race weekend. */
  activeSeason: {
    staleTime: 5 * 60 * 1000,
    // Keep current season relatively short-lived, but avoid automatic refetchs
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },

  /** Completed race payloads — large but stable once the race is finished. */
  completedRace: {
    staleTime: Infinity,
    gcTime: 20 * 60 * 1000,
  },

  /** Short-lived per-session data (positions, weather, etc.). */
  raceSession: {
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },

  /** Replay / positions — large payload, opt-in only. */
  heavyOptIn: {
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
  },

} as const;

export function resolveCacheConfig(year: number, raceStatus?: string) {
  const currentYear = new Date().getFullYear();
  if (year < currentYear) return cacheConfig.historical;
  if (raceStatus === "completed") return cacheConfig.completedRace;
  return cacheConfig.activeSeason;
}

// ---------------------------------------------------------------------------
// Discriminator union types — mirror DB session column values
// ---------------------------------------------------------------------------

/** Maps to DriverLapAnalysis.session column values used by analysis endpoints. */
export type LapAnalysisType = "laps" | "pace" | "stints" | "tyre" | "sectors";

/** Maps to SessionData.session column values used by unified endpoints. */
export type SessionDataType =
  | "positions"
  | "incidents"
  | "pit-stops"
  | "weather"
  | "track-status"
  | "drs";

function sessionDataByType(year: number, round: number, type: SessionDataType, session: string = "R") {
  return ["sessionData", year, round, type, session] as const;
}

// ---------------------------------------------------------------------------
// Query key factory — namespaces mirror DB table primary key patterns
// All query keys come from here — no raw arrays in hook files.
// ---------------------------------------------------------------------------

export const queryKeys = {
  // ── SeasonSchedule (pk: year) ──────────────────────────────────────────
  schedule: {
    season: (year: number) =>
      ["schedule", year] as const,
  },

  // ── RaceResultData (pk: year, round, session) ──────────────────────────
  // Also covers QualifyingResultData and PracticeResultData by session value
  raceResults: {
    /** Race event metadata (round header, circuit info). */
    detail: (year: number, round: number) =>
      ["raceResults", year, round] as const,

    /** Any session keyed by its string identifier (R, S, SS, FP1, FP2, FP3). */
    session: (year: number, round: number, session: string) =>
      ["raceResults", year, round, session] as const,

    /** Qualifying — QualifyingResultData table (pk: year, round). */
    qualifying: (year: number, round: number) =>
      ["raceResults", year, round, "Q"] as const,
  },

  // ── DriverStandings (pk: year?, driver_code?) ──────────────────────────
  // Three DB usage patterns unified under one namespace:
  //   grid(year)        → year=Y,  driver=NULL  (full grid standings)
  //   career(code)      → year=NULL, driver=VER (all seasons for a driver)
  //   season(code,year) → year=Y,  driver=VER   (one driver in one season)
  driverStandings: {
    grid: (year: number) =>
      ["driverStandings", year] as const,

    career: (code: string) =>
      ["driverStandings", "career", code] as const,

    season: (code: string, year: number) =>
      ["driverStandings", year, code] as const,
  },

  // ── ConstructorStandings (pk: year) ────────────────────────────────────
  constructorStandings: {
    year: (year: number) =>
      ["constructorStandings", year] as const,
  },

  // ── DriverLapAnalysis (pk: year, round, session, driver?) ──────────────
  lapAnalysis: {
    byType: (year: number, round: number, type: LapAnalysisType, driver?: string, session: string = "R") =>
      ["lapAnalysis", year, round, type, driver, session] as const,
  },

  // ── DriverTelemetry (pk: year, round, session, driver?, lap?) ──────────
  telemetry: {
    single: (
      year: number,
      round: number,
      driver: string,
      lap: number,
      session: AnalysisSessionName,
    ) => ["telemetry", year, round, session, driver, lap] as const,

    overlay: (
      year: number,
      round: number,
      driverA: string,
      driverB: string,
      lap?: number,
      session: AnalysisSessionName = "R",
    ) =>
      [
        "telemetry",
        year,
        round,
        session,
        "overlay",
        [driverA, driverB].sort().join("+"),
        lap,
      ] as const,

    summary: (year: number, round: number, driver: string, lap: number) =>
      ["telemetry", year, round, "summary", driver, lap] as const,
  },

  // ── SessionData (pk: year, round, session) ─────────────────────────────
  // Covers positions, incidents, pit-stops, weather, track-status, drs
  sessionData: {
    byType: (year: number, round: number, type: SessionDataType, session: string = "R") =>
      sessionDataByType(year, round, type, session),
  },

  // Replay aliases — delegate to the sessionData key shape so multiple
  // replay consumers share the same underlying cache entry.
  replayPositions: (year: number, round: number, session: string = "R") =>
    sessionDataByType(year, round, "positions", session),
  replayIncidents: (year: number, round: number, session: string = "R") =>
    sessionDataByType(year, round, "incidents", session),
  replayPitStops: (year: number, round: number, session: string = "R") =>
    sessionDataByType(year, round, "pit-stops", session),

  // ── FullSessionData (pk: year, round) ──────────────────────────────────
  fullSession: {
    byRace: (year: number, round: number) =>
      ["fullSession", year, round] as const,
  },

  // ── Theme ──────────────────────────────────────────────────────────────
  theme: {
    root: () => ["theme"] as const,
  },
} as const;

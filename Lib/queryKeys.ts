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

// ---------------------------------------------------------------------------
// Named cache config aliases — used by the new hook pattern.
// These map to the same underlying values as cacheConfig presets above.
// ---------------------------------------------------------------------------

/** Completed race data — never refetch. Alias of cacheConfig.historical. */
export const HISTORICAL_CONFIG = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60,     // 1 hour
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const;

/** Current season standings — changes after each race. */
export const STANDINGS_CONFIG = {
  staleTime: 1000 * 60 * 5,   // 5 minutes
  gcTime: 1000 * 60 * 30,     // 30 minutes
} as const;

/** Analysis endpoints — expensive to generate, stable once cached. */
export const ANALYSIS_CONFIG = {
  staleTime: 1000 * 60 * 60,  // 1 hour
  gcTime: 1000 * 60 * 60 * 2, // 2 hours
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const;

/** Telemetry — most expensive, very stable once cached. */
export const TELEMETRY_CONFIG = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 30,     // 30 minutes
  refetchOnMount: false,
  refetchOnWindowFocus: false,
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

    /** Weekend summary (combined weekend payload). */
    weekend: (year: number, round: number) =>
      ["raceResults", year, round, "weekend"] as const,

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

  // ── Driver search keys ─────────────────────────────────────────────────
  driverSearch: {
    season: (year: number) => ["driverSearch", "season", year] as const,
    byName: (q: string, year?: number) => ["driverSearch", "byName", q, year] as const,
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

  // ── Alias namespaces — same underlying arrays as above. ────────────────
  // These allow new call sites to use semantic names while sharing the same
  // cache entries as the original keys.

  analysis: {
    laps: (year: number, round: number, session: string, driver?: string) =>
      ["lapAnalysis", year, round, "laps", driver, session] as const,
    pace: (year: number, round: number, session: string, driver?: string) =>
      ["lapAnalysis", year, round, "pace", driver, session] as const,
    stints: (year: number, round: number, session: string, driver?: string) =>
      ["lapAnalysis", year, round, "stints", driver, session] as const,
    tyreStrategy: (year: number, round: number, session: string) =>
      ["lapAnalysis", year, round, "tyre", undefined, session] as const,
    sectorAnalysis: (year: number, round: number, session: string, driver?: string) =>
      ["lapAnalysis", year, round, "sectors", driver, session] as const,
  },

  unified: {
    positions: (year: number, round: number, session: string) =>
      ["sessionData", year, round, "positions", session] as const,
    pitStops: (year: number, round: number, session: string = "R") =>
      ["sessionData", year, round, "pit-stops", session] as const,
    incidents: (year: number, round: number, session: string = "R") =>
      ["sessionData", year, round, "incidents", session] as const,
    weather: (year: number, round: number, session: string = "R") =>
      ["sessionData", year, round, "weather", session] as const,
    trackStatus: (year: number, round: number, session: string = "R") =>
      ["sessionData", year, round, "track-status", session] as const,
  },

  driver: {
    career: (code: string) => ["driverStandings", "career", code] as const,
    season: (code: string, year: number) => ["driverStandings", year, code] as const,
    search: (year: number) => ["driverSearch", "season", year] as const,
  },

} as const;

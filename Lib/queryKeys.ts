import type { AnalysisSessionName, PracticeSessionName } from "@/types/api";

// ---------------------------------------------------------------------------
// Cache config presets
// Every hook spreads one of these — no hardcoded staleTime/gcTime in hook files.
// ---------------------------------------------------------------------------

export const cacheConfig = {
  /** Completed race data — never changes once available. */
  historical: {
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  },

  /** Live season data — refreshes after each race weekend. */
  activeSeason: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },

  /** Replay / positions — large payload, opt-in only, never changes. */
  heavyOptIn: {
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  },

  /** Backend populates over time — check periodically. */
  coverage: {
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  },

  /** Past seasons for a driver — never changes. */
  driverHistorical: {
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  },

  /** Current season for a driver — refreshes after each race. */
  driverActive: {
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  },

  /** Telemetry data — heavy, opt-in, never changes once loaded. */
  driverTelemetry: {
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  },

  /** Client-side computed / derived values. */
  driverDerived: {
    staleTime: Infinity,
    gcTime: 20 * 60 * 1000,
  },
} as const;

// ---------------------------------------------------------------------------
// Query key factory
// All query keys come from here — no raw arrays in hook files.
// ---------------------------------------------------------------------------

export const queryKeys = {
  // ── Races ──────────────────────────────────────────────────────────────
  races: {
    all: (year: number) =>
      ["races", year] as const,

    detail: (year: number, round: number) =>
      ["races", year, round] as const,

    results: (year: number, round: number) =>
      ["races", year, round, "results"] as const,

    qualifying: (year: number, round: number) =>
      ["races", year, round, "qualifying"] as const,

    practice: (year: number, round: number, session: PracticeSessionName) =>
      ["races", year, round, "practice", session] as const,
  },

  // ── Standings ──────────────────────────────────────────────────────────
  standings: {
    all: (year: number) =>
      ["standings", year] as const,

    drivers: (year: number) =>
      ["standings", year, "drivers"] as const,

    constructors: (year: number) =>
      ["standings", year, "constructors"] as const,
  },

  // ── Analysis ───────────────────────────────────────────────────────────
  analysis: {
    all: (year: number, round: number) =>
      ["analysis", year, round] as const,

    laps: (year: number, round: number, driver?: string) =>
      ["analysis", year, round, "laps", driver] as const,

    pace: (year: number, round: number, driver?: string) =>
      ["analysis", year, round, "pace", driver] as const,

    stints: (year: number, round: number, driver?: string) =>
      ["analysis", year, round, "stints", driver] as const,

    tyre: (year: number, round: number, driver?: string) =>
      ["analysis", year, round, "tyre", driver] as const,

    sectors: (year: number, round: number, driver?: string) =>
      ["analysis", year, round, "sectors", driver] as const,

    telemetry: (
      year: number,
      round: number,
      driver: string,
      lap: number,
      session: AnalysisSessionName,
    ) => ["analysis", year, round, "telemetry", session, driver, lap] as const,

    telemetryOverlay: (
      year: number,
      round: number,
      driverA: string,
      driverB: string,
      lap?: number,
    ) =>
      [
        "analysis",
        year,
        round,
        "telemetry",
        "overlay",
        [driverA, driverB].sort().join("+"),
        lap,
      ] as const,

    telemetrySummary: (year: number, round: number, driver: string, lap: number) =>
      ["analysis", year, round, "telemetry", "summary", driver, lap] as const,
  },

  // ── Unified ────────────────────────────────────────────────────────────
  unified: {
    all: (year: number, round: number) =>
      ["unified", year, round] as const,

    positions: (year: number, round: number, driver?: string) =>
      ["unified", year, round, "positions", driver] as const,

    incidents: (year: number, round: number) =>
      ["unified", year, round, "incidents"] as const,

    pitStops: (year: number, round: number) =>
      ["unified", year, round, "pit-stops"] as const,

    weather: (year: number, round: number) =>
      ["unified", year, round, "weather"] as const,

    trackStatus: (year: number, round: number) =>
      ["unified", year, round, "track-status"] as const,

    drs: (year: number, round: number) =>
      ["unified", year, round, "drs"] as const,
  },

  // ── Coverage ───────────────────────────────────────────────────────────
  coverage: {
    season: (year: number) =>
      ["coverage", year] as const,

    round: (year: number, round: number) =>
      ["coverage", year, round] as const,
  },

  // ── Driver ─────────────────────────────────────────────────────────────
  driver: {
    all: (driverCode: string) =>
      ["driver", driverCode] as const,

    career: (driverCode: string) =>
      ["driver", driverCode, "career"] as const,

    yearList: (driverCode: string) =>
      ["driver", driverCode, "years"] as const,

    seasonStanding: (driverCode: string, year: number) =>
      ["driver", driverCode, year, "standing"] as const,

    seasonResults: (driverCode: string, year: number) =>
      ["driver", driverCode, year, "season-results"] as const,

    roundResult: (driverCode: string, year: number, round: number) =>
      ["driver", driverCode, year, round, "result"] as const,

    roundQualifying: (driverCode: string, year: number, round: number) =>
      ["driver", driverCode, year, round, "qualifying"] as const,

    raceLaps: (driverCode: string, year: number, round: number) =>
      ["driver", driverCode, year, round, "laps"] as const,

    raceStints: (driverCode: string, year: number, round: number) =>
      ["driver", driverCode, year, round, "stints"] as const,

    racePace: (driverCode: string, year: number, round: number) =>
      ["driver", driverCode, year, round, "pace"] as const,

    raceSectors: (driverCode: string, year: number, round: number) =>
      ["driver", driverCode, year, round, "sectors"] as const,

    telemetry: (
      driverCode: string,
      year: number,
      round: number,
      lap: number,
      session: AnalysisSessionName,
    ) => ["driver", driverCode, year, round, "telemetry", session, lap] as const,

    telemetrySummary: (driverCode: string, year: number, round: number, lap: number) =>
      ["driver", driverCode, year, round, "telemetry", "summary", lap] as const,

    consistencyBySeason: (driverCode: string, year: number) =>
      ["driver", driverCode, year, "consistency"] as const,

    careerStats: (driverCode: string) =>
      ["driver", driverCode, "stats"] as const,
  },

  // ── Theme ──────────────────────────────────────────────────────────────
  theme: {
    root: () => ["theme"] as const,
  },
} as const;

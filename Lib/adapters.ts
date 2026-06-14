/**
 * Lib/adapters.ts
 *
 * Transform API response shapes (from actions/) into UI types (types/ui.ts).
 * All functions are pure — no side effects.
 */

import { DRIVERS, TEAMS } from "@/Lib/data/drivers";
import type {
  Race,
  RaceResult,
  QualifyingResult,
  PracticeResult,
  DriverStanding,
  ConstructorStanding,
  WeatherSnapshot,
  Incident,
  LapTime,
  Stint,
  Driver,
  Team,
  TeamId,
  Compound,
  ReplayFrame,
  ReplayPosition,
  ReplayLapIncident,
  ReplayStatus,
  FlagType,
  SessionSchedule,
  SessionId,
  DriverCareer,
  DriverSeason,
} from "@/types/ui";

import type {
  SectorAnalysis,
  ConsistencyScore,
  RaceLapDriverEntry,
  RaceLapFrame,
  TeammateBattle,
  PhaseBattle,
  RacePhase,
} from "@/types/ui";

import type {
  SeasonScheduleResponse,
  SeasonRace,
  RaceDetailResponse,
  LegacySeasonRace,
  LegacyRaceDetailResponse,
} from "@/types/endpoints/racestypes";
import type { RaceResultsResponse } from "@/types/endpoints/resultstypes";
import type { QualifyingResultsResponse } from "@/types/endpoints/qualifyingtypes";
import type { PracticeResultsResponse } from "@/types/endpoints/practicetypes";
import type { SprintResultsResponse, SprintShootoutResultsResponse } from "@/types/endpoints/sprinttypes";
import type { DriverStandingsResponse } from "@/types/endpoints/driverstandingstypes";
import type { ConstructorStandingsResponse } from "@/types/endpoints/constructorstandingstypes";
import type { UnifiedWeatherResponse } from "@/types/endpoints/weathertypes";
import type { UnifiedIncidentsResponse, UnifiedIncidentRow } from "@/types/endpoints/incidentstypes";
import type { LapsAnalysisResponse } from "@/types/endpoints/lapstypes";
import type { StintsAnalysisResponse } from "@/types/endpoints/stintstypes";
import type { TyreStrategyResponse } from "@/types/endpoints/tyrestrategytypes";
import type { UnifiedPositionsResponse } from "@/types/endpoints/positionstypes";
import type { UnifiedPitStopsResponse } from "@/types/endpoints/pitstopstypes";
import type { DriverCareerResponse, DriverSeasonBreakdownResponse } from "@/types/endpoints/driverrecordtypes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Match an API "First Last" string against the DRIVERS static list. */
function findDriver(name: string, constructor?: string): Driver | undefined {
  const lower = name.toLowerCase().trim();
  const found = DRIVERS.find(
    (d) =>
      `${d.firstName} ${d.lastName}`.toLowerCase() === lower ||
      d.lastName.toLowerCase() === lower ||
      d.code.toLowerCase() === lower,
  );
  
  if (!found) return undefined;
  
  const driver = { ...found };
  if (constructor) {
    const historicalTeam = findTeam(constructor) ?? stubTeam(constructor);
    driver.team = historicalTeam.id;
  }
  return driver;
}

/** Build a minimal fallback Driver when the name doesn't match the static list.
 *  Pass `constructor` so the correct team colour is applied instead of Haas. */
function stubDriver(name: string, constructor?: string): Driver {
  const parts = name.trim().split(" ");
  const resolvedTeam = constructor ? (findTeam(constructor)?.id ?? "haas") : "haas";
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    code: (parts.at(-1) ?? "UNK").slice(0, 3).toUpperCase(),
    number: 0,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
    team: resolvedTeam as TeamId,
  };
}

/** Match an API constructor string against the TEAMS static map. */
function findTeam(constructor: string): Team | undefined {
  if (!constructor || typeof constructor !== "string") return undefined;
  const lower = constructor.toLowerCase().trim();
  return Object.values(TEAMS).find(
    (t) =>
      t.shortName.toLowerCase() === lower ||
      t.name.toLowerCase().includes(lower) ||
      lower.includes(t.shortName.toLowerCase()),
  );
}

/** Build a minimal fallback Team when the constructor string doesn't match.
 *  Uses a neutral muted colour rather than Haas red. */
function stubTeam(constructor: string): Team {
  return {
    id: "haas" as TeamId,
    name: constructor,
    shortName: constructor,
    colorVar: "--muted",
  };
}

/** Infer race status from its date string. */
function inferStatus(dateStr: string): Race["status"] {
  const raceDate = new Date(dateStr);
  const now = new Date();
  const diffHours = (now.getTime() - raceDate.getTime()) / (1000 * 60 * 60);
  if (diffHours > 4) return "completed";
  if (diffHours > -24) return "live";
  return "upcoming";
}

/** Maps API country name strings → ISO 3166-1 alpha-2 codes for flagcdn.com */
const COUNTRY_TO_ISO: Record<string, string> = {
  "Bahrain": "bh",
  "Saudi Arabia": "sa",
  "Australia": "au",
  "Japan": "jp",
  "China": "cn",
  "USA": "us",
  "United States": "us",
  "Italy": "it",
  "Monaco": "mc",
  "Canada": "ca",
  "Spain": "es",
  "Austria": "at",
  "UK": "gb",
  "United Kingdom": "gb",
  "Great Britain": "gb",
  "Hungary": "hu",
  "Belgium": "be",
  "Netherlands": "nl",
  "Azerbaijan": "az",
  "Singapore": "sg",
  "Mexico": "mx",
  "Brazil": "br",
  "Qatar": "qa",
  "UAE": "ae",
  "United Arab Emirates": "ae",
  "Las Vegas": "us",
  "Miami": "us",
};

function resolveCountryCode(country: string, location: string): string {
  const iso = COUNTRY_TO_ISO[country] ?? COUNTRY_TO_ISO[location];
  if (iso) return iso.toUpperCase();
  // last resort: first 2 chars of country — not ISO-safe but better than nothing
  return (country || location || "UN").slice(0, 2).toUpperCase();
}

type NormalizedSeasonRace = {
  round: number;
  date: string;
  name: string;
  location: string;
  circuit: string;
  country: string;
};

/**
 * Lookup: [API country string, location substring (empty = unambiguous), f1-circuits.json id]
 * Checked in order — location-aware entries should come before country-only ones.
 */
const COUNTRY_CIRCUIT_LOOKUP: Array<[string, string, string]> = [
  // USA — disambiguate by location
  ["USA", "austin", "austin"],
  ["USA", "cota", "austin"],
  ["USA", "miami", "miami"],
  ["USA", "las vegas", "las-vegas"],
  ["United States", "austin", "austin"],
  ["United States", "cota", "austin"],
  ["United States", "miami", "miami"],
  ["United States", "las vegas", "las-vegas"],
  // Italy — disambiguate by location
  ["Italy", "monza", "monza"],
  ["Italy", "imola", "imola"],
  // Spain — disambiguate by location (2026: Barcelona + Madrid)
  ["Spain", "barcelona", "catalunya"],
  ["Spain", "montmelo", "catalunya"],
  ["Spain", "montmeló", "catalunya"],
  ["Spain", "madrid", "madring"],
  ["Spain", "madring", "madring"],
  // Unambiguous — single active circuit per country
  ["Bahrain", "", "bahrain"],
  ["Saudi Arabia", "", "jeddah"],
  ["Australia", "", "melbourne"],
  ["Japan", "", "suzuka"],
  ["China", "", "shanghai"],
  ["Monaco", "", "monaco"],
  ["Canada", "", "montreal"],
  ["Austria", "", "spielberg"],
  ["UK", "", "silverstone"],
  ["United Kingdom", "", "silverstone"],
  ["Great Britain", "", "silverstone"],
  ["Hungary", "", "hungaroring"],
  ["Belgium", "", "spa-francorchamps"],
  ["Netherlands", "", "zandvoort"],
  ["Azerbaijan", "", "baku"],
  ["Singapore", "", "marina-bay"],
  ["Mexico", "", "mexico-city"],
  ["Brazil", "", "interlagos"],
  ["Qatar", "", "lusail"],
  ["UAE", "", "yas-marina"],
  ["United Arab Emirates", "", "yas-marina"],
];

/** Legacy name-based lookup — used as final fallback for historical/non-2026 data. */
const CIRCUIT_NAME_TO_ID: Array<[string, string]> = [
  ["bahrain", "bahrain"],
  ["jeddah", "jeddah"],
  ["albert", "melbourne"],
  ["melbourne", "melbourne"],
  ["suzuka", "suzuka"],
  ["shanghai", "shanghai"],
  ["miami", "miami"],
  ["imola", "imola"],
  ["enzo e dino", "imola"],
  ["monaco", "monaco"],
  ["gilles-villeneuve", "montreal"],
  ["montreal", "montreal"],
  ["barcelona", "catalunya"],
  ["catalunya", "catalunya"],
  ["red bull ring", "spielberg"],
  ["spielberg", "spielberg"],
  ["silverstone", "silverstone"],
  ["hungaroring", "hungaroring"],
  ["budapest", "hungaroring"],
  ["spa", "spa-francorchamps"],
  ["francorchamps", "spa-francorchamps"],
  ["zandvoort", "zandvoort"],
  ["monza", "monza"],
  ["baku", "baku"],
  ["marina bay", "marina-bay"],
  ["singapore", "marina-bay"],
  ["americas", "austin"],
  ["austin", "austin"],
  ["hermanos", "mexico-city"],
  ["mexico", "mexico-city"],
  ["interlagos", "interlagos"],
  ["são paulo", "interlagos"],
  ["sao paulo", "interlagos"],
  ["carlos pace", "interlagos"],
  ["las vegas", "las-vegas"],
  ["lusail", "lusail"],
  ["qatar", "lusail"],
  ["yas marina", "yas-marina"],
  ["abu dhabi", "yas-marina"],
  ["madring", "madring"],
  ["madrid", "madring"],
];

function resolveCircuitIdFromContext(
  country: string,
  location: string,
  circuitName: string,
): string {
  const locLower = location.toLowerCase();
  // Pass 1: country + location substring (handles multi-circuit countries)
  for (const [c, hint, id] of COUNTRY_CIRCUIT_LOOKUP) {
    if (c === country && hint && locLower.includes(hint)) return id;
  }
  // Pass 2: country-only match (unambiguous countries)
  for (const [c, hint, id] of COUNTRY_CIRCUIT_LOOKUP) {
    if (c === country && !hint) return id;
  }
  // Pass 3: legacy circuit name substring match (historical/unknown data)
  const nameLower = circuitName.toLowerCase();
  for (const [key, id] of CIRCUIT_NAME_TO_ID) {
    if (nameLower.includes(key)) return id;
  }
  // Final fallback: slugify
  return nameLower.replace(/\s+/g, "-");
}

function stringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeSeasonRaceRow(
  row: SeasonRace | LegacySeasonRace | Record<string, unknown>,
  index: number,
): NormalizedSeasonRace {
  const roundValue = "round" in row ? (row.round as number) : index + 1;
  const legacyCircuit =
    typeof row.circuit === "object" && row.circuit !== null
      ? (row.circuit as { name?: unknown; country?: unknown; location?: unknown })
      : undefined;

  const name =
    stringOrEmpty("name" in row ? row.name : undefined) ||
    stringOrEmpty("raceName" in row ? row.raceName : undefined) ||
    `Round ${roundValue}`;

  const circuitName =
    stringOrEmpty("circuit" in row && typeof row.circuit === "string" ? row.circuit : undefined) ||
    stringOrEmpty(legacyCircuit?.name) ||
    "Unknown Circuit";

  const location =
    stringOrEmpty("location" in row ? row.location : undefined) ||
    stringOrEmpty(legacyCircuit?.location);

  const country =
    stringOrEmpty("country" in row ? row.country : undefined) ||
    stringOrEmpty(legacyCircuit?.country) ||
    location;

  return {
    round: Number.isFinite(roundValue) && roundValue > 0 ? roundValue : index + 1,
    date: stringOrEmpty("date" in row ? row.date : undefined),
    name,
    location,
    circuit: circuitName,
    country,
  };
}

function normalizeRaceDetailRow(
  row: RaceDetailResponse | LegacyRaceDetailResponse,
): {
  round: number;
  date: string;
  name: string;
  location: string;
  circuit: string;
  country: string;
} {
  const legacyCircuit =
    typeof row.circuit === "object" && row.circuit !== null
      ? (row.circuit as { name?: unknown; country?: unknown; location?: unknown })
      : undefined;

  const roundValue = "round" in row ? row.round : 1;
  const name =
    stringOrEmpty("name" in row ? row.name : undefined) ||
    stringOrEmpty("raceName" in row ? row.raceName : undefined) ||
    `Round ${roundValue}`;
  const location =
    stringOrEmpty("location" in row ? row.location : undefined) ||
    stringOrEmpty(legacyCircuit?.location);
  const circuit =
    stringOrEmpty(typeof row.circuit === "string" ? row.circuit : undefined) ||
    stringOrEmpty(legacyCircuit?.name) ||
    "Unknown Circuit";
  const country =
    stringOrEmpty("country" in row ? row.country : undefined) ||
    stringOrEmpty(legacyCircuit?.country) ||
    location;

  return {
    round: Number.isFinite(roundValue) && roundValue > 0 ? roundValue : 1,
    date: stringOrEmpty("date" in row ? row.date : undefined),
    name,
    location,
    circuit,
    country,
  };
}

// ---------------------------------------------------------------------------
// Session schedule parsing (from session1–session5 fields)
// ---------------------------------------------------------------------------

/** Map backend session name strings to UI SessionId values. */
const SESSION_NAME_TO_ID: Record<string, SessionId> = {
  "practice 1": "fp1",
  "practice 2": "fp2",
  "practice 3": "fp3",
  "qualifying": "qualifying",
  "race": "race",
  // Sprint variants
  "sprint": "sprint",
  "sprint qualifying": "sprint-qualifying",
  "sprint-qualifying": "sprint-qualifying",
  "sprint shootout": "sprint-shootout",
  "sprint-shootout": "sprint-shootout",
};

/**
 * Parse session1–session5 fields from a race detail/schedule row
 * into a structured SessionSchedule array.
 */
export function parseSessionSchedule(
  row: Record<string, unknown>,
): SessionSchedule[] {
  const sessions: SessionSchedule[] = [];
  for (let i = 1; i <= 5; i++) {
    const nameKey = `session${i}`;
    const dateKey = `session${i}_date_utc`;
    const name = row[nameKey];
    if (typeof name === "string" && name.trim()) {
      const sessionId = SESSION_NAME_TO_ID[name.toLowerCase().trim()] ?? (name.toLowerCase().replace(/\s+/g, "-") as SessionId);
      sessions.push({
        id: sessionId,
        startsAt: typeof row[dateKey] === "string" ? row[dateKey] as string : "",
        durationMin: 0,
      });
    }
  }
  return sessions;
}

/**
 * Extract the list of available practice session names (FP1, FP2, FP3)
 * from the session1–session5 fields.
 */
export function extractPracticeSessions(
  row: Record<string, unknown>,
): ("FP1" | "FP2" | "FP3")[] {
  const result: ("FP1" | "FP2" | "FP3")[] = [];
  for (let i = 1; i <= 5; i++) {
    const name = row[`session${i}`];
    if (typeof name === "string") {
      const lower = name.toLowerCase().trim();
      if (lower === "practice 1") result.push("FP1");
      else if (lower === "practice 2") result.push("FP2");
      else if (lower === "practice 3") result.push("FP3");
    }
  }
  return result;
}

/**
 * Check if the session1–session5 fields contain any sprint sessions.
 */
export function hasSprintSessions(
  row: Record<string, unknown>,
): boolean {
  for (let i = 1; i <= 5; i++) {
    const name = row[`session${i}`];
    if (typeof name === "string" && name.toLowerCase().includes("sprint")) {
      return true;
    }
  }
  return false;
}

/**
 * Get the raw session names from session1–session5 as an array of { name, date } pairs.
 */
export function getRawSessionList(
  row: Record<string, unknown>,
): Array<{ name: string; date: string }> {
  const sessions: Array<{ name: string; date: string }> = [];
  for (let i = 1; i <= 5; i++) {
    const name = row[`session${i}`];
    const date = row[`session${i}_date_utc`];
    if (typeof name === "string" && name.trim()) {
      sessions.push({
        name: name.trim(),
        date: typeof date === "string" ? date : "",
      });
    }
  }
  return sessions;
}

// ---------------------------------------------------------------------------
// Season / Race adapters
// ---------------------------------------------------------------------------

export function adaptSeasonSchedule(res: SeasonScheduleResponse, fallbackYear: number): Race[] {
  const races = Array.isArray(res) ? res : (res?.races ?? []);
  const year = Array.isArray(res) ? fallbackYear : (res?.year ?? fallbackYear);
  return races.map((r, index) => {
    const row = normalizeSeasonRaceRow(r as SeasonRace, index);
    const countryCode = resolveCountryCode(row.country, row.location);
    const sessions = parseSessionSchedule(r as unknown as Record<string, unknown>);
    return {
      year,
      round: row.round,
      name: row.name,
      shortName: row.name.replace(/\s*Grand Prix\s*/i, " GP").trim(),
      date: row.date,
      circuit: {
        id: resolveCircuitIdFromContext(row.country, row.location, row.circuit),
        name: row.circuit,
        country: row.country,
        countryCode,
        city: row.location,
        laps: 0,
        lengthKm: 0,
      },
      status: inferStatus(row.date),
      sessions,
      eventFormat: (r as Record<string, unknown>).event_format as string | undefined,
    };
  });
}

export function adaptRaceDetail(res: RaceDetailResponse, year: number): Race {
  const row = normalizeRaceDetailRow(res);
  const countryCode = resolveCountryCode(row.country, row.location);
  const sessions = parseSessionSchedule(res as unknown as Record<string, unknown>);
  return {
    year,
    round: row.round,
    name: row.name,
    shortName: row.name.replace(/\s*Grand Prix\s*/i, " GP").trim(),
    date: row.date,
    circuit: {
      id: resolveCircuitIdFromContext(row.country, row.location, row.circuit),
      name: row.circuit,
      country: row.country,
      countryCode,
      city: row.location,
      laps: 0,
      lengthKm: 0,
    },
    status: inferStatus(row.date),
    sessions,
    eventFormat: res.event_format ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Race results
// ---------------------------------------------------------------------------

export function adaptRaceResults(res: RaceResultsResponse): RaceResult[] {
  const results = Array.isArray(res) ? res : (res?.data ?? res?.results?.race ?? res?.race ?? []);
  return results.map((r) => {
    const constructor = r.constructor ?? r.team ?? "";
    const driver = findDriver(r.driver_name, constructor) ?? stubDriver(r.driver_name, constructor);
    return {
      position: r.position === 0 || r.position === null ? "DNF" : r.position,
      driver,
      laps: r.laps,
      time: r.time ?? undefined,
      gap: r.gap ?? undefined,
      points: r.points,
      fastestLap: r.fastest_lap_of_race ?? false,
      fastestLapTime: r.fastest_lap ?? null,
      status: r.status,
      startGrid: r.grid_position ?? 0,
    } as RaceResult;
  });
}

export function adaptBundledQualifyingResults(res: RaceResultsResponse): QualifyingResult[] {
  const results = Array.isArray(res) ? [] : (res?.qualifying ?? res?.results?.qualifying ?? []);
  return results.map((r) => {
    const constructor = r.constructor ?? r.team ?? "";
    const driver = findDriver(r.driver_name, constructor) ?? stubDriver(r.driver_name, constructor);
    const q1Ms = parseTimeMs(r.q1_time ?? null);
    const q2Ms = parseTimeMs(r.q2_time ?? null);
    const q3Ms = parseTimeMs(r.q3_time ?? null);
    return {
      position: r.position ?? 0,
      driver,
      q1: r.q1_time ?? undefined,
      q2: r.q2_time ?? undefined,
      q3: r.q3_time ?? undefined,
      q1Ms: q1Ms ?? undefined,
      q2Ms: q2Ms ?? undefined,
      q3Ms: q3Ms ?? undefined,
    };
  });
}

export function adaptQualifyingResults(res: QualifyingResultsResponse): QualifyingResult[] {
  const rows = Array.isArray(res) ? res : (res?.data ?? res?.results ?? res?.qualifying ?? []);
  return rows.map((r) => {
    const constructor = r.constructor ?? r.team ?? "";
    const driver = findDriver(r.driver_name, constructor) ?? stubDriver(r.driver_name, constructor);
    const q1Ms = parseTimeMs(r.q1_time ?? null);
    const q2Ms = parseTimeMs(r.q2_time ?? null);
    const q3Ms = parseTimeMs(r.q3_time ?? null);
    return {
      position: r.position ?? 0,
      driver,
      q1: r.q1_time ?? undefined,
      q2: r.q2_time ?? undefined,
      q3: r.q3_time ?? undefined,
      q1Ms: q1Ms ?? undefined,
      q2Ms: q2Ms ?? undefined,
      q3Ms: q3Ms ?? undefined,
    };
  });
}

export function adaptPracticeResults(res: PracticeResultsResponse): PracticeResult[] {
  const results = Array.isArray(res) ? res : (res?.practice ?? res?.results ?? []);
  return results.map((r) => {
    const driverName = r.driver_name ?? r.driver_code ?? "";
    const constructor = r.constructor ?? r.team ?? "";
    const driver = findDriver(driverName, constructor) ?? stubDriver(driverName, constructor);
    const bestRaw = r.best_lap ?? r.lap_time ?? null;
    const bestLapMs = parseTimeMs(bestRaw);
    return {
      position: r.position,
      driver,
      bestLap: r.best_lap ?? r.lap_time ?? "—",
      bestLapMs: bestLapMs ?? undefined,
      laps: r.laps ?? r.lap_number ?? 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Sprint results
// ---------------------------------------------------------------------------

export function adaptSprintResults(res: SprintResultsResponse): RaceResult[] {
  const data = Array.isArray(res) ? res : (res?.data ?? []);
  return data.map((r) => {
    const driver = findDriver(r.driver_name, r.team) ?? stubDriver(r.driver_name, r.team);
    return {
      position: r.position === 0 || r.position === null ? "DNF" : r.position,
      driver,
      laps: r.laps,
      time: undefined,
      gap: undefined,
      points: r.points,
      fastestLap: false,
      status: r.status,
      startGrid: r.grid_position ?? 0,
    } as RaceResult;
  });
}

export function adaptSprintShootoutResults(res: SprintShootoutResultsResponse): QualifyingResult[] {
  const data = Array.isArray(res) ? res : (res?.data ?? []);
  return data.map((r) => {
    const driver = findDriver(r.driver_name, r.team) ?? stubDriver(r.driver_name, r.team);
    return {
      position: r.position ?? 0,
      driver,
      q1: r.q1_time ?? undefined,
      q2: r.q2_time ?? undefined,
      q3: r.q3_time ?? undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// Standings
// ---------------------------------------------------------------------------

export function adaptDriverStandings(res: DriverStandingsResponse): DriverStanding[] {
  const list = res?.drivers ?? res?.standings ?? [];
  return list.map((s) => {
    const constructor = s.constructor ?? "";
    const driver = findDriver(s.driver_name, constructor) ?? stubDriver(s.driver_name, constructor);

    return { position: s.position, driver, points: s.points, wins: s.wins, podiums: 0 };
  });
}

export function adaptConstructorStandings(
  res: ConstructorStandingsResponse,
): ConstructorStanding[] {
  const list = res?.constructors ?? res?.standings ?? [];
  return list.map((s) => {
    const name = s.constructor_name ?? s.constructor ?? "";
    const team = findTeam(name) ?? stubTeam(name);
    return { position: s.position, team, points: s.points, wins: s.wins ?? 0 };
  });
}

/**
 * Adapt a DriverCareerResponse (raw endpoint) into a UI `DriverCareer`.
 */
export function adaptDriverCareer(raw: any): DriverCareer {
  const data = raw?.data || raw?.results || raw || {};
  return {
    driverCode: data.driver_code || data.canonical_code || data.driver_id || "",
    driverName: data.driver_name ?? "",
    nationality: data.nationality ?? "",
    seasons: (data.career ?? []).map((s: any) => ({
      year: s.year,
      races: s.races ?? 0,
      wins: s.wins ?? 0,
      podiums: s.podiums ?? 0,
      champion: !!s.champion,
    })),
    totalWins: data.career_totals?.total_wins ?? 0,
    totalPodiums: data.career_totals?.total_podiums ?? 0,
    championships: data.career_totals?.championships ?? 0,
  };
}

/**
 * Adapt a DriverSeasonBreakdownResponse into the UI `DriverSeason` shape.
 */
export function adaptDriverSeason(raw: any): DriverSeason {
  const data = raw?.data || raw?.results || raw || {};
  return {
    driverCode: data.driver_code || data.canonical_code || data.driver_id || "",
    driverName: data.driver_name ?? "",
    year: data.year ?? 0,
    totalRaces: data.total_races ?? 0,
    sprintWeekends: data.sprint_weekends ?? 0,
    races: (data.races ?? []).map((r: any) => ({
      year: r.year,
      round: r.round,
      raceName: r.race_name,
      location: r.location,
      raceDate: r.race_date,
      gridPosition: r.grid_position ?? null,
      finishPosition: r.finish_position ?? null,
      points: r.points ?? 0,
      status: r.status ?? "",
      fastestLap: !!r.fastest_lap,
      lapsCompleted: r.laps_completed ?? null,
      qualifyingPosition: r.qualifying_position ?? null,
      qualifyingTime: r.qualifying_time ?? null,
      sprintPosition: r.sprint_position ?? null,
      sprintPoints: r.sprint_points ?? null,
      sprintStatus: r.sprint_status ?? null,
      sprintGrid: r.sprint_grid ?? null,
      sprintLaps: r.sprint_laps ?? null,
      sprintFastestLap: r.sprint_fastest_lap ?? null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Weather / Incidents
// ---------------------------------------------------------------------------

export function adaptWeather(res: UnifiedWeatherResponse): WeatherSnapshot | undefined {
  const row = res.data[0];
  if (!row) return undefined;

  const airTemp = row.air_temp_c ?? row.air_temp;
  const trackTemp = row.track_temp_c ?? row.track_temp;
  const windSpeed = row.wind_speed_ms ?? row.wind_speed;
  const humidity = row.humidity_pct ?? row.humidity;

  return {
    airTempC: airTemp ?? 0,
    trackTempC: trackTemp ?? 0,
    conditions: row.rainfall ? "Wet" : "Dry",
    windKph: Math.round((windSpeed ?? 0) * 3.6), // m/s → km/h
    humidity: humidity ?? 0,
  };
}

export function adaptIncidents(res: UnifiedIncidentsResponse): Incident[] {
  return (res?.data ?? []).map((r) => ({
    lap: r.lap ?? r.lap_number ?? 0,
    type: (r.message_type ?? r.type ?? r.category ?? "SC") as Incident["type"],
    description: r.message_text ?? r.message ?? "No incident message",
    drivers: r.drivers_involved?.length
      ? r.drivers_involved
      : r.driver
        ? [r.driver]
        : undefined,
  }));
}

// ---------------------------------------------------------------------------
// Analysis — laps / stints
// ---------------------------------------------------------------------------

export function adaptLapTimes(res: LapsAnalysisResponse): LapTime[] {
  return res.data
    .map((r) => {
      const ms = parseTimeMs((r as any).lap_time ?? null);
      if (ms === null) return null;
      const driverId = (r as any).driver_code ?? (r as any).driver ?? "";
      const lapNum = (r as any).lap_number ?? (r as any).lap ?? 0;
      return {
        lap: lapNum,
        driverId: String(driverId ?? ""),
        timeMs: ms,
        sector1Ms: parseTimeMs((r as any).sector1 ?? (r as any).sector_1_time ?? (r as any).sector1_time ?? (r as any).Sector1Time ?? null) ?? undefined,
        sector2Ms: parseTimeMs((r as any).sector2 ?? (r as any).sector_2_time ?? (r as any).sector2_time ?? (r as any).Sector2Time ?? null) ?? undefined,
        sector3Ms: parseTimeMs((r as any).sector3 ?? (r as any).sector_3_time ?? (r as any).sector3_time ?? (r as any).Sector3Time ?? null) ?? undefined,
        position: (r as any).position ?? 0,
        compound: ((r as any).compound ?? "medium").toLowerCase() as Compound,
        pit: !!(r as any).pit,
      } as LapTime;
    })
    .filter((x): x is LapTime => x !== null)
    // stable sort by lap asc then driverId
    .sort((a, b) => a.lap - b.lap || a.driverId.localeCompare(b.driverId));
}

export function adaptStints(res: StintsAnalysisResponse): Stint[] {
  return res.data
    .filter((r) => "driver" in r && (r as { driver?: string }).driver)
    .map((r) => {
      const row = r as {
        driver: string;
        stint: number;
        compound: string;
        lap_start: number;
        lap_end: number;
      };
      return {
        driverId: row.driver,
        stintNumber: row.stint,
        startLap: row.lap_start,
        endLap: row.lap_end,
        compound: (row.compound?.toLowerCase() ?? "medium") as Compound,
        avgPaceMs: parseTimeMs((row as any).avg_pace) ?? 0,
        bestLapMs: parseTimeMs((row as any).best_lap) ?? null,
        degradationMs: parseTimeMs((row as any).pace_degradation) ?? null,
      };
    });
}

export function adaptTyreStrategy(res: TyreStrategyResponse): Stint[] {
  return res.data
    .filter((r) => !!r.driver)
    .map((r) => ({
      driverId: r.driver!,
      stintNumber: r.stint,
      startLap: r.lap_start,
      endLap: r.lap_end,
      compound: (r.compound?.toLowerCase() ?? "medium") as Compound,
      avgPaceMs: 0,
    }));
}

// ---------------------------------------------------------------------------
// Parse a pandas timedelta or plain seconds string to milliseconds.
// Handles:  "0 days 00:01:37.123000"  →  97123
//           "97.123"                   →  97123
// ---------------------------------------------------------------------------
export function parseTimeMs(raw: string | null | undefined): number | null {
  if (!raw) return null;
  let parsedMs: number | null = null;
  const dayMatch = raw.match(/(\d+) days? (\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/);
  if (dayMatch) {
    const [, d, h, m, s, frac] = dayMatch;
    const fracMs = frac ? parseFloat("0." + frac) * 1000 : 0;
    parsedMs = (
      (parseInt(d, 10) * 86400 +
        parseInt(h, 10) * 3600 +
        parseInt(m, 10) * 60 +
        parseInt(s, 10)) *
      1000 +
      fracMs
    );
  } else {
    // Handle HH:MM:SS.mmm and MM:SS.mmm formats
    const hmsMatch = raw.match(/^(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
    if (hmsMatch) {
      const [, h, m, s, frac] = hmsMatch;
      const fracMs = frac ? parseFloat("0." + frac) * 1000 : 0;
      parsedMs = (parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10)) * 1000 + fracMs;
    } else {
      const msMatch = raw.match(/^(\d{1,2}):(\d{2})(?:\.(\d+))?$/);
      if (msMatch) {
        const [, m, s, frac] = msMatch;
        const fracMs = frac ? parseFloat("0." + frac) * 1000 : 0;
        parsedMs = (parseInt(m, 10) * 60 + parseInt(s, 10)) * 1000 + fracMs;
      } else {
        const sec = parseFloat(raw);
        parsedMs = isNaN(sec) ? null : sec * 1000;
      }
    }
  }

  // Filter out impossibly fast or 0 times (e.g. 0 days 00:00:00)
  if (parsedMs !== null && parsedMs < 10000) {
    return null;
  }
  return parsedMs;
}

// ---------------------------------------------------------------------------
// Unified Consistency Score Calculation Helper
// ---------------------------------------------------------------------------
export function calculateConsistencyMetrics(lapTimesMs: number[]): { score: number; avgLapMs: number; bestLapMs: number } | null {
  // Filter out impossible laps (e.g., 0ms or anything under 50 seconds)
  const validLaps = lapTimesMs.filter((t) => t > 50000);
  if (validLaps.length < 3) return null;

  // Find median for robust outlier detection
  const sorted = [...validLaps].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  
  // Filter laps > 1.07x median (approx +6s on a 1:25 lap)
  const cleanLaps = validLaps.filter((t) => t <= median * 1.07);
  if (cleanLaps.length < 2) return null;

  const sum = cleanLaps.reduce((a, b) => a + b, 0);
  const avg = sum / cleanLaps.length;
  const variance = cleanLaps.reduce((acc, t) => acc + (t - avg) ** 2, 0) / cleanLaps.length;
  const std = Math.sqrt(variance);

  // Score mapping: CV * 25
  const cv = avg > 0 ? std / avg : 1;
  const score = Math.max(0, Math.round(100 * (1 - cv * 25)));
  
  // Always use overall best valid lap
  const best = Math.min(...validLaps);

  return { score, avgLapMs: avg, bestLapMs: best };
}

// ---------------------------------------------------------------------------
// Derive per-driver ConsistencyScore from all-laps analysis response.
// No additional API call needed — uses the same payload that gates the page.
// ---------------------------------------------------------------------------
export function adaptConsistencyScores(res: LapsAnalysisResponse): ConsistencyScore[] {
  const byDriver = new Map<string, { timeMs: number; compound: string }[]>();

  for (const row of res.data) {
    if (!row.lap_time) continue;
    const ms = parseTimeMs(row.lap_time);
    if (ms === null || ms < 5000) continue; // filter out safety-car / invalid laps
    if (!byDriver.has(row.driver_code)) byDriver.set(row.driver_code, []);
    byDriver.get(row.driver_code)!.push({
      timeMs: ms,
      compound: row.compound?.toLowerCase() ?? "medium",
    });
  }

  const scores: ConsistencyScore[] = [];

  for (const [driverId, laps] of byDriver) {
    const driver = DRIVERS.find((d) => d.id === driverId);
    if (!driver || laps.length < 3) continue;

    const times = laps.map((l) => l.timeMs);
    const metrics = calculateConsistencyMetrics(times);
    if (!metrics) continue;

    const compoundCounts = new Map<string, number>();
    for (const l of laps) {
      compoundCounts.set(l.compound, (compoundCounts.get(l.compound) ?? 0) + 1);
    }
    const topCompound =
      [...compoundCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "medium";

    scores.push({ driver, score: metrics.score, bestLapMs: metrics.bestLapMs, avgLapMs: metrics.avgLapMs, topCompound: topCompound as Compound });
  }

  // Sort by average pace (fastest → slowest)
  return scores.sort((a, b) => a.avgLapMs - b.avgLapMs);
}

// ---------------------------------------------------------------------------
// Derive per-driver best sector times from all-laps analysis response.
// Returns one SectorAnalysis row per driver that has all three sectors.
// ---------------------------------------------------------------------------
export function adaptSectorAnalysis(res: LapsAnalysisResponse): SectorAnalysis[] {
  const best = new Map<string, { s1: number | null; s2: number | null; s3: number | null }>();

  for (const row of res.data) {
    if (!best.has(row.driver_code)) best.set(row.driver_code, { s1: null, s2: null, s3: null });
    const entry = best.get(row.driver_code)!;
    const s1 = parseTimeMs(row.sector1 ?? null);
    const s2 = parseTimeMs(row.sector2 ?? null);
    const s3 = parseTimeMs(row.sector3 ?? null);
    if (s1 !== null && (entry.s1 === null || s1 < entry.s1)) entry.s1 = s1;
    if (s2 !== null && (entry.s2 === null || s2 < entry.s2)) entry.s2 = s2;
    if (s3 !== null && (entry.s3 === null || s3 < entry.s3)) entry.s3 = s3;
  }

  const result: SectorAnalysis[] = [];
  for (const [driverId, sectors] of best) {
    if (sectors.s1 === null || sectors.s2 === null || sectors.s3 === null) continue;
    result.push({ driverId, s1Ms: sectors.s1, s2Ms: sectors.s2, s3Ms: sectors.s3 });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Nullable per-lap analysis model
// ---------------------------------------------------------------------------

/** Normalise a compound string to the typed Compound union, or null. */
function normalizeCompoundNullable(value?: string | null): import("@/types/ui").Compound | null {
  if (!value) return null;
  const v = value.toLowerCase().trim();
  if (v === "soft") return "soft";
  if (v === "medium") return "medium";
  if (v === "hard") return "hard";
  if (v === "inter" || v === "intermediate") return "inter";
  if (v === "wet") return "wet";
  return null;
}

/**
 * Build a `RaceLapFrame[]` from laps API data.
 * Each frame represents one lap, with per-driver nullable entries.
 * All time values go through parseTimeMs — null if absent or unparseable.
 */
export function adaptRaceLapFrames(res: LapsAnalysisResponse): RaceLapFrame[] {
  const byLap = new Map<number, Record<string, RaceLapDriverEntry>>();

  for (const row of res.data) {
    const lap = (row as any).lap_number ?? (row as any).lap ?? 0;
    if (!byLap.has(lap)) byLap.set(lap, {});
    const drivers = byLap.get(lap)!;
    const code = (row as any).driver_code ?? (row as any).driver ?? "";
    drivers[String(code ?? "")] = {
      lapTimeMs: parseTimeMs((row as any).lap_time ?? null),
      compound: normalizeCompoundNullable((row as any).compound),
      stint: (row as any).stint ?? null,
      sector1Ms: parseTimeMs((row as any).sector1 ?? null),
      sector2Ms: parseTimeMs((row as any).sector2 ?? null),
      sector3Ms: parseTimeMs((row as any).sector3 ?? null),
      isPersonalBest: (row as any).is_personal_best ?? null,
    };
  }

  // Sort frames by lap ascending
  return Array.from(byLap.entries())
    .sort(([a], [b]) => a - b)
    .map(([lap, drivers]) => ({ lap, drivers }));
}

/**
 * Build consistency scores grouped by stint (and overall).
 * Returns a Map keyed by stint number or the string "overall".
 * Drivers with fewer than MIN_LAPS qualifying laps in a stint are omitted for that key.
 */
const MIN_LAPS = 3;

function consistencyFromLapTimes(
  lapTimesMs: number[],
  driver: Driver,
  topCompound: import("@/types/ui").Compound,
): ConsistencyScore | null {
  const metrics = calculateConsistencyMetrics(lapTimesMs);
  if (!metrics) return null;
  return { driver, score: metrics.score, bestLapMs: metrics.bestLapMs, avgLapMs: metrics.avgLapMs, topCompound };
}

export function adaptConsistencyByStint(
  frames: RaceLapFrame[],
  driversById: Driver[],
): Map<number | "overall", ConsistencyScore[]> {
  // Collect lap times per driver, split by stint and overall
  const overallMap = new Map<string, { times: number[]; compoundCounts: Map<string, number> }>();
  const stintMap = new Map<number, Map<string, { times: number[]; compoundCounts: Map<string, number> }>>();

  const SC_THRESHOLD = 5000; // ms — discard safety-car-paced laps below this

  for (const frame of frames) {
    for (const [code, entry] of Object.entries(frame.drivers)) {
      const ms = entry.lapTimeMs;
      if (ms === null || ms < SC_THRESHOLD) continue;

      // overall
      if (!overallMap.has(code)) overallMap.set(code, { times: [], compoundCounts: new Map() });
      const ov = overallMap.get(code)!;
      ov.times.push(ms);
      if (entry.compound) ov.compoundCounts.set(entry.compound, (ov.compoundCounts.get(entry.compound) ?? 0) + 1);

      // per-stint
      if (entry.stint !== null) {
        if (!stintMap.has(entry.stint)) stintMap.set(entry.stint, new Map());
        const sDrivers = stintMap.get(entry.stint)!;
        if (!sDrivers.has(code)) sDrivers.set(code, { times: [], compoundCounts: new Map() });
        const sd = sDrivers.get(code)!;
        sd.times.push(ms);
        if (entry.compound) sd.compoundCounts.set(entry.compound, (sd.compoundCounts.get(entry.compound) ?? 0) + 1);
      }
    }
  }

  function topCompoundFrom(counts: Map<string, number>): import("@/types/ui").Compound {
    let best = "medium" as import("@/types/ui").Compound;
    let bestCount = 0;
    for (const [c, count] of counts) {
      if (count > bestCount) { best = c as import("@/types/ui").Compound; bestCount = count; }
    }
    return best;
  }

  function buildScores(
    driverDataMap: Map<string, { times: number[]; compoundCounts: Map<string, number> }>,
  ): ConsistencyScore[] {
    const scores: ConsistencyScore[] = [];
    for (const [code, data] of driverDataMap) {
      const driver = driversById.find((d) => d.code === code);
      if (!driver) continue;
      const score = consistencyFromLapTimes(data.times, driver, topCompoundFrom(data.compoundCounts));
      if (score) scores.push(score);
    }
    return scores.sort((a, b) => b.score - a.score);
  }

  const result = new Map<number | "overall", ConsistencyScore[]>();
  result.set("overall", buildScores(overallMap));
  for (const [stintNum, driverDataMap] of stintMap) {
    result.set(stintNum, buildScores(driverDataMap));
  }
  return result;
}

/**
 * Compute teammate lap-time battles across race thirds.
 * Returns one TeammateBattle per team that has exactly 2 drivers in the data.
 */
export function adaptTeammateBattles(
  frames: RaceLapFrame[],
  driversInRace: Driver[],
): TeammateBattle[] {
  if (frames.length === 0) return [];

  const totalLaps = frames[frames.length - 1].lap;
  const thirdLap = Math.floor(totalLaps / 3);
  const phases: { phase: RacePhase; from: number; to: number }[] = [
    { phase: "early", from: 1, to: thirdLap },
    { phase: "mid", from: thirdLap + 1, to: thirdLap * 2 },
    { phase: "late", from: thirdLap * 2 + 1, to: totalLaps },
  ];

  // Group drivers by team
  const teamDrivers = new Map<string, Driver[]>();
  for (const driver of driversInRace) {
    if (!teamDrivers.has(driver.team)) teamDrivers.set(driver.team, []);
    teamDrivers.get(driver.team)!.push(driver);
  }

  // Pre-index frames for fast lookup
  const frameByLap = new Map<number, RaceLapFrame>();
  for (const frame of frames) frameByLap.set(frame.lap, frame);

  function avgForDriver(code: string, lapFrom: number, lapTo: number): number | null {
    const times: number[] = [];
    for (let l = lapFrom; l <= lapTo; l++) {
      const entry = frameByLap.get(l)?.drivers[code];
      if (entry?.lapTimeMs !== null && entry?.lapTimeMs !== undefined) times.push(entry.lapTimeMs);
    }
    if (times.length < 2) return null;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  const battles: TeammateBattle[] = [];

  for (const [teamId, members] of teamDrivers) {
    if (members.length !== 2) continue;
    const [dA, dB] = members;

    const phaseBattles: PhaseBattle[] = phases.map(({ phase, from, to }) => {
      const aAvgMs = avgForDriver(dA.code, from, to);
      const bAvgMs = avgForDriver(dB.code, from, to);
      let winner: string | null = null;
      let deltaMs: number | null = null;
      if (aAvgMs !== null && bAvgMs !== null) {
        deltaMs = Math.abs(aAvgMs - bAvgMs);
        winner = aAvgMs <= bAvgMs ? dA.code : dB.code;
      }
      return { phase, lapFrom: from, lapTo: to, aAvgMs, bAvgMs, winner, deltaMs };
    });

    // Overall winner: sum wins across phases
    const aWins = phaseBattles.filter((p) => p.winner === dA.code).length;
    const bWins = phaseBattles.filter((p) => p.winner === dB.code).length;
    const overallWinner = aWins > bWins ? dA.code : bWins > aWins ? dB.code : null;

    battles.push({
      teamId: teamId as import("@/types/ui").TeamId,
      driverA: dA,
      driverB: dB,
      phases: phaseBattles,
      overallWinner,
    });
  }

  return battles;
}

// ---------------------------------------------------------------------------
// Replay frames
// ---------------------------------------------------------------------------

export function adaptReplayFrames(
  positions: UnifiedPositionsResponse | undefined,
  pitStops: UnifiedPitStopsResponse | undefined,
  incidents?: UnifiedIncidentsResponse | undefined,
  laps?: LapsAnalysisResponse | undefined,
): ReplayFrame[] {
  if (!positions?.data?.length) return [];

  const normalizeCompound = (value?: string | null): Compound => {
    if (!value) return "medium";
    const v = value.toLowerCase().trim();
    if (v === "soft") return "soft";
    if (v === "medium") return "medium";
    if (v === "hard") return "hard";
    if (v === "inter" || v === "intermediate") return "inter";
    if (v === "wet") return "wet";
    return "medium";
  };

  const normalizeFlag = (raw?: string | null): FlagType | null => {
    if (!raw) return null;
    const v = raw.trim().toUpperCase();
    if (v.includes("RED")) return "RED";
    if (v === "SC" || v.includes("SAFETY_CAR") || v.includes("SAFETY CAR")) return "SC";
    if (v === "VSC" || v.includes("VIRTUAL_SAFETY_CAR") || v.includes("VIRTUAL SAFETY CAR")) return "VSC";
    if (v.includes("YELLOW")) return "YELLOW";
    if (v.includes("GREEN")) return "GREEN";
    return null;
  };

  const formatLapTime = (raw?: string | null): string | null => {
    if (!raw) return null;
    const match = raw.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
    if (!match) return null;
    const [, h, m, s, ms] = match;
    const totalMin = parseInt(h, 10) * 60 + parseInt(m, 10);
    return `${totalMin}:${s}.${ms}`;
  };

  // ── Track all drivers ────────────────────────────────────────────────────
  const allDrivers = new Set<string>();
  const lastLapPerDriver = new Map<string, number>();
  for (const row of positions?.data ?? []) {
    const code = row.driver_code;
    if (!code) continue;
    const lap = row.lap_number ?? row.lap ?? 0;
    allDrivers.add(code);
    if (!lastLapPerDriver.has(code) || (lastLapPerDriver.get(code) ?? 0) < lap) {
      lastLapPerDriver.set(code, lap);
    }
  }

  // ── Lap times and compounds from laps analysis (most accurate source) ────
  const lapTimeByDriverLap = new Map<string, Map<number, string>>();
  const lapCompoundByDriverLap = new Map<string, Map<number, Compound>>();
  for (const row of laps?.data ?? []) {
    const code = row.driver_code;
    const lapNum = row.lap_number;
    if (!code || !lapNum) continue;
    const formatted = formatLapTime(row.lap_time);
    if (formatted) {
      if (!lapTimeByDriverLap.has(code)) lapTimeByDriverLap.set(code, new Map());
      lapTimeByDriverLap.get(code)!.set(lapNum, formatted);
    }
    if (row.compound) {
      if (!lapCompoundByDriverLap.has(code)) lapCompoundByDriverLap.set(code, new Map());
      lapCompoundByDriverLap.get(code)!.set(lapNum, normalizeCompound(row.compound));
    }
  }

  // ── Pit-stop lookups ─────────────────────────────────────────────────────
  const pitLaps = new Map<string, Set<number>>();
  const pitByDriverLap = new Map<string, Map<number, UnifiedPitStopsResponse["data"][number]>>();
  const startCompound = new Map<string, Compound>();
  const pitStopsByDriver = new Map<string, UnifiedPitStopsResponse["data"][number][]>();

  for (const p of pitStops?.data ?? []) {
    const code = p.driver_code ?? p.driver ?? "";
    if (!code) continue;
    const lapNum = p.lap_in ?? p.lap;
    if (lapNum == null) continue;

    if (!pitLaps.has(code)) pitLaps.set(code, new Set());
    pitLaps.get(code)!.add(lapNum);

    if (!pitByDriverLap.has(code)) pitByDriverLap.set(code, new Map());
    pitByDriverLap.get(code)!.set(lapNum, p);

    if (!pitStopsByDriver.has(code)) pitStopsByDriver.set(code, []);
    pitStopsByDriver.get(code)!.push(p);
  }

  for (const [code, stops] of pitStopsByDriver) {
    stops.sort((a, b) => (a.lap_in ?? a.lap ?? 0) - (b.lap_in ?? b.lap ?? 0));
    const first = stops[0];
    if (first?.compound_in) startCompound.set(code, normalizeCompound(first.compound_in));
  }

  // ── Incidents by lap (for frame-level display) ────────────────────────────
  const flagsByLap = new Map<number, FlagType[]>();
  const incidentsByLap = new Map<number, ReplayLapIncident[]>();
  for (const inc of incidents?.data ?? []) {
    const lap = inc.lap_number ?? inc.lap;
    if (!lap) continue;
    const normalized = normalizeFlag(inc.flag) ?? normalizeFlag(inc.message_type);
    if (normalized) {
      if (!flagsByLap.has(lap)) flagsByLap.set(lap, []);
      flagsByLap.get(lap)!.push(normalized);
    }
    if (!incidentsByLap.has(lap)) incidentsByLap.set(lap, []);
    incidentsByLap.get(lap)!.push({
      type: inc.message_type ?? inc.type ?? inc.category ?? "UNKNOWN",
      message: inc.message_text ?? inc.message,
      flag: inc.flag ?? undefined,
      drivers: inc.drivers_involved ?? (inc.driver ? [inc.driver] : undefined),
      severity: inc.severity,
    });
  }

  // ── Group positions by lap ────────────────────────────────────────────────
  const byLap = new Map<number, typeof positions.data>();
  for (const row of positions.data) {
    const lap = row.lap_number ?? row.lap ?? 0;
    if (!byLap.has(lap)) byLap.set(lap, []);
    byLap.get(lap)!.push(row);
  }

  const lapsArr = [...byLap.keys()].sort((a, b) => a - b);

  const currentCompound = new Map<string, Compound>();
  const currentTyreLap = new Map<string, number>();
  const driverStintHistory = new Map<string, Compound[]>();
  const usedCompoundsSet = new Set<Compound>();

  return lapsArr.map((lap): ReplayFrame => {
    const rows = byLap.get(lap)!.slice().sort((a, b) => a.position - b.position);
    const driversOnTrack = new Set(rows.map((r) => r.driver_code).filter(Boolean) as string[]);
    const replayPositions: ReplayPosition[] = [];

    for (const row of rows) {
      const driverCode = row.driver_code;
      if (!driverCode) continue;
      const driver = findDriver(driverCode);
      const team = (driver?.team ?? "haas") as TeamId;

      const pitEntry = pitByDriverLap.get(driverCode)?.get(lap);
      const lapDataCompound = lapCompoundByDriverLap.get(driverCode)?.get(lap);
      const prevCompound = currentCompound.get(driverCode);

      let tyre: Compound;
      if (pitEntry?.compound_out) {
        tyre = normalizeCompound(pitEntry.compound_out);
      } else if (lapDataCompound) {
        tyre = lapDataCompound;
      } else if (prevCompound) {
        tyre = prevCompound;
      } else {
        tyre = startCompound.get(driverCode) ?? "medium";
      }

      if (!prevCompound) {
        currentTyreLap.set(driverCode, lap);
        driverStintHistory.set(driverCode, [tyre]);
      } else if (prevCompound !== tyre) {
        currentTyreLap.set(driverCode, lap);
        const history = driverStintHistory.get(driverCode)!;
        if (history[history.length - 1] !== tyre) history.push(tyre);
      }

      currentCompound.set(driverCode, tyre);
      usedCompoundsSet.add(tyre);

      const tyreLap = Math.max(1, lap - (currentTyreLap.get(driverCode) ?? lap) + 1);
      const stints = [...(driverStintHistory.get(driverCode) ?? [tyre])];
      const inPit = pitLaps.get(driverCode)?.has(lap) ?? false;

      const gapToLeader = row.gap_to_leader_seconds ?? row.gap_to_leader;
      const gapToAhead = row.gap_to_ahead_seconds ?? row.gap_to_next;
      const gap =
        row.position === 1
          ? "LEADER"
          : typeof gapToLeader === "number"
            ? `+${gapToLeader.toFixed(3)}`
            : (gapToLeader ?? "—").toString();
      const interval =
        typeof gapToAhead === "number"
          ? `+${gapToAhead.toFixed(3)}`
          : (gapToAhead ?? "—").toString();

      replayPositions.push({
        driver: driver?.code ?? driverCode.slice(0, 3).toUpperCase(),
        name: driver ? `${driver.firstName} ${driver.lastName}` : driverCode,
        driverNumber: row.driver_number ?? undefined,
        team,
        gap,
        interval,
        positionChange: row.position_change ?? null,
        tyre,
        tyreLap,
        stints,
        lastLapTime: lapTimeByDriverLap.get(driverCode)?.get(lap) ?? null,
        stopNumber: pitEntry?.stop_number ?? undefined,
        pitDurationSeconds: pitEntry?.stop_duration_seconds ?? pitEntry?.duration_seconds ?? null,
        pitTyreIn: pitEntry?.compound_in ? normalizeCompound(pitEntry.compound_in) : undefined,
        pitTyreOut: pitEntry?.compound_out ? normalizeCompound(pitEntry.compound_out) : undefined,
        inPit,
        pole: row.position === 1 && lap === 1,
        status: null,
      });
    }

    for (const driverCode of allDrivers) {
      if (driversOnTrack.has(driverCode)) continue;
      const lastLap = lastLapPerDriver.get(driverCode) ?? 0;
      const status: ReplayStatus = lastLap > 0 && lap > lastLap ? "DNF" : "DNS";
      const driver = findDriver(driverCode);
      const stints = [
        ...(driverStintHistory.get(driverCode) ?? [
          startCompound.get(driverCode) ?? ("medium" as Compound),
        ]),
      ];
      replayPositions.push({
        driver: driver?.code ?? driverCode.slice(0, 3).toUpperCase(),
        name: driver ? `${driver.firstName} ${driver.lastName}` : driverCode,
        driverNumber: driver?.number,
        team: (driver?.team ?? "haas") as TeamId,
        gap: "—",
        interval: "—",
        tyre: stints[stints.length - 1] ?? "medium",
        tyreLap: 0,
        stints,
        lastLapTime: null,
        inPit: false,
        pole: false,
        status,
      });
    }

    replayPositions.sort((a, b) => {
      const order = (s?: ReplayStatus | null) =>
        s === null || s === undefined ? 0 : s === "DNF" ? 1 : 2;
      return order(a.status) - order(b.status);
    });

    const flagSequence = flagsByLap.get(lap)?.filter((f, i, arr) => arr.indexOf(f) === i) ?? [];
    const flag = flagSequence[0] ?? ("GREEN" as FlagType);

    return {
      lap,
      flag,
      flagSequence: flagSequence.length ? flagSequence : undefined,
      usedCompounds: Array.from(usedCompoundsSet),
      lapIncidents: incidentsByLap.get(lap),
      positions: replayPositions,
    };
  });
}

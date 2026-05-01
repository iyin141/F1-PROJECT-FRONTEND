/**
 * Lib/adapters.ts
 *
 * Transform API response shapes (from Api_services/) into UI types (types/ui.ts).
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
  FlagType,
} from "@/types/ui";

import type {
  SeasonScheduleResponse,
  RaceDetailResponse,
  LegacySeasonRace,
  LegacyRaceDetailResponse,
} from "@/types/endpoints/racestypes";
import type { RaceResultsResponse } from "@/types/endpoints/resultstypes";
import type { QualifyingResultsResponse } from "@/types/endpoints/qualifyingtypes";
import type { PracticeResultsResponse } from "@/types/endpoints/practicetypes";
import type { DriverStandingsResponse } from "@/types/endpoints/driverstandingstypes";
import type { ConstructorStandingsResponse } from "@/types/endpoints/constructorstandingstypes";
import type { UnifiedWeatherResponse } from "@/types/endpoints/weathertypes";
import type { UnifiedIncidentsResponse } from "@/types/endpoints/incidentstypes";
import type { LapsAnalysisResponse } from "@/types/endpoints/lapstypes";
import type { StintsAnalysisResponse } from "@/types/endpoints/stintstypes";
import type { UnifiedPositionsResponse } from "@/types/endpoints/positionstypes";
import type { UnifiedPitStopsResponse } from "@/types/endpoints/pitstopstypes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Match an API "First Last" string against the DRIVERS static list. */
function findDriver(name: string): Driver | undefined {
  const lower = name.toLowerCase().trim();
  return DRIVERS.find(
    (d) =>
      `${d.firstName} ${d.lastName}`.toLowerCase() === lower ||
      d.lastName.toLowerCase() === lower ||
      d.code.toLowerCase() === lower,
  );
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
  "Bahrain":       "bh",
  "Saudi Arabia":  "sa",
  "Australia":     "au",
  "Japan":         "jp",
  "China":         "cn",
  "USA":           "us",
  "United States": "us",
  "Italy":         "it",
  "Monaco":        "mc",
  "Canada":        "ca",
  "Spain":         "es",
  "Austria":       "at",
  "UK":            "gb",
  "United Kingdom":"gb",
  "Great Britain": "gb",
  "Hungary":       "hu",
  "Belgium":       "be",
  "Netherlands":   "nl",
  "Azerbaijan":    "az",
  "Singapore":     "sg",
  "Mexico":        "mx",
  "Brazil":        "br",
  "Qatar":         "qa",
  "UAE":           "ae",
  "United Arab Emirates": "ae",
  "Las Vegas":     "us",
  "Miami":         "us",
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
  ["USA",                  "austin",    "austin"],
  ["USA",                  "cota",      "austin"],
  ["USA",                  "miami",     "miami"],
  ["USA",                  "las vegas", "las-vegas"],
  ["United States",        "austin",    "austin"],
  ["United States",        "cota",      "austin"],
  ["United States",        "miami",     "miami"],
  ["United States",        "las vegas", "las-vegas"],
  // Italy — disambiguate by location
  ["Italy",                "monza",     "monza"],
  ["Italy",                "imola",     "imola"],
  // Spain — disambiguate by location (2026: Barcelona + Madrid)
  ["Spain",                "barcelona", "catalunya"],
  ["Spain",                "montmelo",  "catalunya"],
  ["Spain",                "montmeló",  "catalunya"],
  ["Spain",                "madrid",    "madring"],
  ["Spain",                "madring",   "madring"],
  // Unambiguous — single active circuit per country
  ["Bahrain",              "", "bahrain"],
  ["Saudi Arabia",         "", "jeddah"],
  ["Australia",            "", "melbourne"],
  ["Japan",                "", "suzuka"],
  ["China",                "", "shanghai"],
  ["Monaco",               "", "monaco"],
  ["Canada",               "", "montreal"],
  ["Austria",              "", "spielberg"],
  ["UK",                   "", "silverstone"],
  ["United Kingdom",       "", "silverstone"],
  ["Great Britain",        "", "silverstone"],
  ["Hungary",              "", "hungaroring"],
  ["Belgium",              "", "spa-francorchamps"],
  ["Netherlands",          "", "zandvoort"],
  ["Azerbaijan",           "", "baku"],
  ["Singapore",            "", "marina-bay"],
  ["Mexico",               "", "mexico-city"],
  ["Brazil",               "", "interlagos"],
  ["Qatar",                "", "lusail"],
  ["UAE",                  "", "yas-marina"],
  ["United Arab Emirates", "", "yas-marina"],
];

/** Legacy name-based lookup — used as final fallback for historical/non-2026 data. */
const CIRCUIT_NAME_TO_ID: Array<[string, string]> = [
  ["bahrain",        "bahrain"],
  ["jeddah",         "jeddah"],
  ["albert",         "melbourne"],
  ["melbourne",      "melbourne"],
  ["suzuka",         "suzuka"],
  ["shanghai",       "shanghai"],
  ["miami",          "miami"],
  ["imola",          "imola"],
  ["enzo e dino",    "imola"],
  ["monaco",         "monaco"],
  ["gilles-villeneuve", "montreal"],
  ["montreal",       "montreal"],
  ["barcelona",      "catalunya"],
  ["catalunya",      "catalunya"],
  ["red bull ring",  "spielberg"],
  ["spielberg",      "spielberg"],
  ["silverstone",    "silverstone"],
  ["hungaroring",    "hungaroring"],
  ["budapest",       "hungaroring"],
  ["spa",            "spa-francorchamps"],
  ["francorchamps",  "spa-francorchamps"],
  ["zandvoort",      "zandvoort"],
  ["monza",          "monza"],
  ["baku",           "baku"],
  ["marina bay",     "marina-bay"],
  ["singapore",      "marina-bay"],
  ["americas",       "austin"],
  ["austin",         "austin"],
  ["hermanos",       "mexico-city"],
  ["mexico",         "mexico-city"],
  ["interlagos",     "interlagos"],
  ["são paulo",      "interlagos"],
  ["sao paulo",      "interlagos"],
  ["carlos pace",    "interlagos"],
  ["las vegas",      "las-vegas"],
  ["lusail",         "lusail"],
  ["qatar",          "lusail"],
  ["yas marina",     "yas-marina"],
  ["abu dhabi",      "yas-marina"],
  ["madring",        "madring"],
  ["madrid",         "madring"],
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
  row: SeasonScheduleResponse["races"][number] | LegacySeasonRace | Record<string, unknown>,
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
// Season / Race adapters
// ---------------------------------------------------------------------------

export function adaptSeasonSchedule(res: SeasonScheduleResponse): Race[] {
  return (res?.races ?? []).map((r, index) => {
    const row = normalizeSeasonRaceRow(r as SeasonScheduleResponse["races"][number], index);
    const countryCode = resolveCountryCode(row.country, row.location);
    return {
    year: res.year,
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
    sessions: [],
  };
  });
}

export function adaptRaceDetail(res: RaceDetailResponse, year: number): Race {
  const row = normalizeRaceDetailRow(res);
  const countryCode = resolveCountryCode(row.country, row.location);
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
    sessions: [],
  };
}

// ---------------------------------------------------------------------------
// Race results
// ---------------------------------------------------------------------------

export function adaptRaceResults(res: RaceResultsResponse): RaceResult[] {
  return (res?.results?.race ?? []).map((r) => {
    const driver = findDriver(r.driver_name) ?? stubDriver(r.driver_name, r.constructor);
    return {
      position: r.position === 0 ? "DNF" : r.position,
      driver,
      laps: r.laps,
      time: r.time ?? undefined,
      gap: r.time ?? undefined,
      points: r.points,
      fastestLap: false,
      status: r.status,
      startGrid: r.grid,
    } as RaceResult;
  });
}

export function adaptQualifyingResults(res: QualifyingResultsResponse): QualifyingResult[] {
  return (res?.results ?? []).map((r) => {
    const driver = findDriver(r.driver_name) ?? stubDriver(r.driver_name, r.constructor);
    return { position: r.position, driver, q1: r.time ?? undefined };
  });
}

export function adaptPracticeResults(res: PracticeResultsResponse): PracticeResult[] {
  return (res?.results ?? []).map((r) => {
    const driver = findDriver(r.driver_name) ?? stubDriver(r.driver_name, r.constructor);
    return {
      position: r.position,
      driver,
      bestLap: r.best_lap ?? "—",
      laps: r.laps,
    };
  });
}

// ---------------------------------------------------------------------------
// Standings
// ---------------------------------------------------------------------------

export function adaptDriverStandings(res: DriverStandingsResponse): DriverStanding[] {
  return (res?.standings ?? []).map((s) => {
    const driver = findDriver(s.driver_name) ?? stubDriver(s.driver_name, s.constructor);
    return { position: s.position, driver, points: s.points, wins: s.wins, podiums: 0 };
  });
}

export function adaptConstructorStandings(
  res: ConstructorStandingsResponse,
): ConstructorStanding[] {
  return (res?.standings ?? []).map((s) => {
    const team = findTeam(s.constructor) ?? stubTeam(s.constructor);
    return { position: s.position, team, points: s.points, wins: s.wins ?? 0 };
  });
}

// ---------------------------------------------------------------------------
// Weather / Incidents
// ---------------------------------------------------------------------------

export function adaptWeather(res: UnifiedWeatherResponse): WeatherSnapshot | undefined {
  const row = res.data[0];
  if (!row) return undefined;
  return {
    airTempC: row.air_temp,
    trackTempC: row.track_temp,
    conditions: row.rainfall ? "Wet" : "Dry",
    windKph: Math.round(row.wind_speed * 3.6), // m/s → km/h
    humidity: row.humidity,
  };
}

export function adaptIncidents(res: UnifiedIncidentsResponse): Incident[] {
  return (res?.data ?? []).map((r) => ({
    lap: r.lap,
    type: (r.type ?? r.category ?? "SC") as Incident["type"],
    description: r.message,
    drivers: r.driver ? [r.driver] : undefined,
  }));
}

// ---------------------------------------------------------------------------
// Analysis — laps / stints
// ---------------------------------------------------------------------------

export function adaptLapTimes(res: LapsAnalysisResponse): LapTime[] {
  return res.data
    .filter((r) => r.lap_time != null)
    .map((r) => ({
      lap: r.lap_number,
      driverId: r.driver_code,
      timeMs: parseFloat(r.lap_time!) * 1000,
      position: 0,
      compound: ((r.compound ?? "medium").toLowerCase()) as Compound,
      pit: false,
    }));
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
        avgPaceMs: 0,
      };
    });
}

// ---------------------------------------------------------------------------
// Replay frames
// ---------------------------------------------------------------------------

export function adaptReplayFrames(
  positions: UnifiedPositionsResponse | undefined,
  pitStops: UnifiedPitStopsResponse | undefined,
): ReplayFrame[] {
  if (!positions?.data.length) return [];

  // Build pit-stop lookup: driver → Set of lap numbers where they pit
  const pitLaps = new Map<string, Set<number>>();
  for (const p of pitStops?.data ?? []) {
    if (!pitLaps.has(p.driver)) pitLaps.set(p.driver, new Set());
    pitLaps.get(p.driver)!.add(p.lap);
  }

  // Build compound-per-lap from pit stops (compound_out = tyre fitted on this lap)
  // Map: driver → Map<lap, compound>
  const compoundAt = new Map<string, Map<number, Compound>>();
  let startCompound = new Map<string, Compound>();
  for (const p of pitStops?.data ?? []) {
    if (!compoundAt.has(p.driver)) compoundAt.set(p.driver, new Map());
    const c = ((p.compound_out ?? p.compound ?? "medium").toLowerCase()) as Compound;
    compoundAt.get(p.driver)!.set(p.lap, c);
    // track the initial compound (first pit reveals what was on before)
    if (!startCompound.has(p.driver)) {
      startCompound.set(p.driver, ((p.compound_in ?? p.compound ?? "medium").toLowerCase()) as Compound);
    }
  }

  // Group rows by lap
  const byLap = new Map<number, typeof positions.data>();
  for (const row of positions.data) {
    if (!byLap.has(row.lap)) byLap.set(row.lap, []);
    byLap.get(row.lap)!.push(row);
  }

  const laps = [...byLap.keys()].sort((a, b) => a - b);

  // Track current compound per driver across laps
  const currentCompound = new Map<string, Compound>();
  const currentTyreLap = new Map<string, number>();

  return laps.map((lap): ReplayFrame => {
    const rows = byLap.get(lap)!.slice().sort((a, b) => a.position - b.position);

    const replayPositions: ReplayPosition[] = rows.map((row) => {
      const driver = findDriver(row.driver);
      const team = (driver?.team ?? "haas") as TeamId;

      // Update compound tracking
      const pitEntry = compoundAt.get(row.driver)?.get(lap);
      if (pitEntry) {
        currentCompound.set(row.driver, pitEntry);
        currentTyreLap.set(row.driver, lap);
      } else if (!currentCompound.has(row.driver)) {
        currentCompound.set(row.driver, startCompound.get(row.driver) ?? "medium");
        currentTyreLap.set(row.driver, 1);
      }

      const tyre = currentCompound.get(row.driver) ?? "medium";
      const tyreLap = lap - (currentTyreLap.get(row.driver) ?? 1) + 1;
      const inPit = pitLaps.get(row.driver)?.has(lap) ?? false;

      const gap =
        row.position === 1
          ? "LEADER"
          : typeof row.gap_to_leader === "number"
          ? `+${row.gap_to_leader.toFixed(3)}`
          : (row.gap_to_leader ?? "—").toString();

      const interval =
        typeof row.gap_to_next === "number"
          ? `+${row.gap_to_next.toFixed(3)}`
          : (row.gap_to_next ?? "—").toString();

      return {
        driver: driver?.code ?? row.driver.slice(0, 3).toUpperCase(),
        name: driver ? `${driver.firstName} ${driver.lastName}` : row.driver,
        team,
        gap,
        interval,
        tyre,
        tyreLap,
        inPit,
        dnf: false,
        fastLap: false,
        pole: row.position === 1 && lap === 1,
      };
    });

    return { lap, flag: "GREEN" as FlagType, positions: replayPositions };
  });
}

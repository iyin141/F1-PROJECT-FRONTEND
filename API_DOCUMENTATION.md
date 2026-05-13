# F1 Frontend — API Documentation

> **Base URL (backend):** `http://localhost:8000/api`
> **Frontend proxy prefix:** `/api` (Next.js route handlers in `app/api/`)
> All calls from components go to the Next.js proxy, which relays to the Django backend.

---

## Table of Contents

1. [Next.js Route Handlers](#1-nextjs-route-handlers)
2. [API Service Functions](#2-api-service-functions)
3. [TypeScript Types](#3-typescript-types)

---

## 1. Next.js Route Handlers

All handlers live under `app/api/` and use `proxyBackendGet()` from `app/api/_lib/backend.ts`.
Query parameters are forwarded transparently. All routes are `force-dynamic`.

### Schedule & Race Info

| Method | Route                                           | File                                                       |
| ------ | ----------------------------------------------- | ---------------------------------------------------------- |
| GET    | `/api/races/[year]/`                            | `app/api/races/[year]/route.ts`                            |
| GET    | `/api/races/[year]/[round]/`                    | `app/api/races/[year]/[round]/route.ts`                    |
| GET    | `/api/races/[year]/[round]/results/`            | `app/api/races/[year]/[round]/results/route.ts`            |
| GET    | `/api/races/[year]/[round]/qualifying/`         | `app/api/races/[year]/[round]/qualifying/route.ts`         |
| GET    | `/api/races/[year]/[round]/practice/[session]/` | `app/api/races/[year]/[round]/practice/[session]/route.ts` |

### Standings

| Method | Route                       | File                                   |
| ------ | --------------------------- | -------------------------------------- |
| GET    | `/api/drivers/[year]/`      | `app/api/drivers/[year]/route.ts`      |
| GET    | `/api/constructors/[year]/` | `app/api/constructors/[year]/route.ts` |

### Analysis

| Method | Route                                                   | File                                                               |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/api/analysis/races/[year]/[round]/laps/`              | `app/api/analysis/races/[year]/[round]/laps/route.ts`              |
| GET    | `/api/analysis/races/[year]/[round]/pace/`              | `app/api/analysis/races/[year]/[round]/pace/route.ts`              |
| GET    | `/api/analysis/races/[year]/[round]/stints/`            | `app/api/analysis/races/[year]/[round]/stints/route.ts`            |
| GET    | `/api/analysis/races/[year]/[round]/tyre-strategy/`     | `app/api/analysis/races/[year]/[round]/tyre-strategy/route.ts`     |
| GET    | `/api/analysis/races/[year]/[round]/sector-analysis/`   | `app/api/analysis/races/[year]/[round]/sector-analysis/route.ts`   |
| GET    | `/api/analysis/races/[year]/[round]/telemetry/`         | `app/api/analysis/races/[year]/[round]/telemetry/route.ts`         |
| GET    | `/api/analysis/races/[year]/[round]/telemetry/overlay/` | `app/api/analysis/races/[year]/[round]/telemetry/overlay/route.ts` |
| GET    | `/api/analysis/races/[year]/[round]/telemetry/summary/` | `app/api/analysis/races/[year]/[round]/telemetry/summary/route.ts` |

### Unified (multi-data)

| Method | Route                                             | File                                                         |
| ------ | ------------------------------------------------- | ------------------------------------------------------------ |
| GET    | `/api/unified/races/[year]/[round]/full-session/` | `app/api/unified/races/[year]/[round]/full-session/route.ts` |
| GET    | `/api/unified/races/[year]/[round]/weather/`      | `app/api/unified/races/[year]/[round]/weather/route.ts`      |
| GET    | `/api/unified/races/[year]/[round]/pit-stops/`    | `app/api/unified/races/[year]/[round]/pit-stops/route.ts`    |
| GET    | `/api/unified/races/[year]/[round]/incidents/`    | `app/api/unified/races/[year]/[round]/incidents/route.ts`    |
| GET    | `/api/unified/races/[year]/[round]/positions/`    | `app/api/unified/races/[year]/[round]/positions/route.ts`    |
| GET    | `/api/unified/races/[year]/[round]/drs/`          | `app/api/unified/races/[year]/[round]/drs/route.ts`          |
| GET    | `/api/unified/races/[year]/[round]/track-status/` | `app/api/unified/races/[year]/[round]/track-status/route.ts` |

### Coverage

| Method | Route                                       | File                                                   |
| ------ | ------------------------------------------- | ------------------------------------------------------ |
| GET    | `/api/coverage/persistence/[year]/`         | `app/api/coverage/persistence/[year]/route.ts`         |
| GET    | `/api/coverage/persistence/[year]/[round]/` | `app/api/coverage/persistence/[year]/[round]/route.ts` |

---

## 2. API Service Functions

All functions live under `actions/` and are re-exported from `actions/index.ts`.
They call the server-side `actions` helpers (which call the backend directly via `Lib/server-client`).

### `actions/season-hub.ts`

```ts
getSeasonSchedule(year: number): Promise<SeasonScheduleResponse>
```

- Calls `GET /api/races/{year}/`
- Returns the full season calendar.

```ts
getDriverStandings(year: number): Promise<DriverStandingsResponse>
```

- Calls `GET /api/drivers/{year}/`
- Returns driver championship standings for the year.

```ts
getConstructorStandings(year: number): Promise<ConstructorStandingsResponse>
```

- Calls `GET /api/constructors/{year}/`
- Returns constructor (team) standings for the year.

---

### `actions/race-detail.ts`

```ts
getRaceDetail(year: number, round: number): Promise<RaceDetailResponse>
```

- Calls `GET /api/races/{year}/{round}/`

```ts
getRaceResults(year: number, round: number): Promise<RaceResultsResponse>
```

- Calls `GET /api/races/{year}/{round}/results/`
- Returns both qualifying and race result arrays.

```ts
getQualifyingResults(year: number, round: number): Promise<QualifyingResultsResponse>
```

- Calls `GET /api/races/{year}/{round}/qualifying/`

```ts
getPracticeResults(
  year: number,
  round: number,
  session: PracticeSessionName   // "FP1" | "FP2" | "FP3"
): Promise<PracticeResultsResponse>
```

- Calls `GET /api/races/{year}/{round}/practice/{session}/`

```ts
getRaceWeather(
  year: number,
  round: number,
  session?: AnalysisSessionName  // default "R"
): Promise<UnifiedWeatherResponse>
```

- Calls `GET /api/unified/races/{year}/{round}/weather/`

```ts
getRaceIncidents(
  year: number,
  round: number,
  session?: AnalysisSessionName  // default "R"
): Promise<UnifiedIncidentsResponse>
```

- Calls `GET /api/unified/races/{year}/{round}/incidents/`

---

### `actions/race-analysis.ts`

All analysis functions accept a `BaseAnalysisQuery`:

```ts
type BaseAnalysisQuery = {
  session: AnalysisSessionName; // "R" | "Q" | "FP1" | "FP2" | "FP3" | "Race" | "Qualifying"
  driver?: string; // 3-letter driver code, e.g. "LEC"
  limit?: number;
};
```

```ts
getLapsAnalysis(year, round, query: BaseAnalysisQuery): Promise<LapsAnalysisResponse>
```

- Calls `GET /api/analysis/races/{year}/{round}/laps/`

```ts
getPaceAnalysis(year, round, query: BaseAnalysisQuery): Promise<PaceAnalysisResponse>
```

- Calls `GET /api/analysis/races/{year}/{round}/pace/`

```ts
getStintsAnalysis(year, round, query: BaseAnalysisQuery): Promise<StintsAnalysisResponse>
```

- Calls `GET /api/analysis/races/{year}/{round}/stints/`

```ts
getTyreStrategyAnalysis(year, round, query: BaseAnalysisQuery): Promise<TyreStrategyResponse>
```

- Calls `GET /api/analysis/races/{year}/{round}/tyre-strategy/`

```ts
getSectorAnalysis(year, round, query: BaseAnalysisQuery): Promise<SectorAnalysisResponse>
```

- Calls `GET /api/analysis/races/{year}/{round}/sector-analysis/`

```ts
getTelemetry(
  year: number,
  round: number,
  query: {
    session: AnalysisSessionName;
    driver: string;       // REQUIRED
    lap: number;          // REQUIRED
    limit_points?: number;
    stride?: number;
  }
): Promise<TelemetryResponse>
```

- Calls `GET /api/analysis/races/{year}/{round}/telemetry/`

```ts
getTelemetryOverlay(
  year: number,
  round: number,
  query: {
    session: AnalysisSessionName;
    driver_a: string;     // REQUIRED
    driver_b: string;     // REQUIRED
    lap?: number;         // optional — defaults to each driver's fastest lap
    limit_points?: number;
    stride?: number;
  }
): Promise<TelemetryOverlayResponse>
```

- Calls `GET /api/analysis/races/{year}/{round}/telemetry/overlay/`

```ts
getTelemetrySummary(
  year: number,
  round: number,
  query: {
    session: AnalysisSessionName;
    driver: string;       // REQUIRED
    lap: number;          // REQUIRED
    lap_range?: number;
    limit_points?: number;
  }
): Promise<TelemetrySummaryResponse>
```

- Calls `GET /api/analysis/races/{year}/{round}/telemetry/summary/`

---

### `actions/unified.ts`

```ts
getFullSession(
  year: number,
  round: number,
  query: {
    include: UnifiedIncludeType[];   // REQUIRED — e.g. ["weather", "pit_stops"]
    session?: AnalysisSessionName;
    driver?: string;
    limit?: number;
  }
): Promise<FullSessionResponse>
```

- Calls `GET /api/unified/races/{year}/{round}/full-session/`
- `UnifiedIncludeType` = `"telemetry" | "weather" | "pit_stops" | "incidents" | "positions" | "drs" | "track_status"`

```ts
getUnifiedWeather(year, round, query?: { session?, limit? }): Promise<UnifiedWeatherResponse>
getUnifiedPitStops(year, round, query?: { session?, driver?, limit? }): Promise<UnifiedPitStopsResponse>
getUnifiedIncidents(year, round, query?: { session?, limit? }): Promise<UnifiedIncidentsResponse>
getUnifiedPositions(year, round, query?: { session?, driver?, limit? }): Promise<UnifiedPositionsResponse>
getUnifiedDrs(year, round, query?: { session?, driver?, limit? }): Promise<UnifiedDrsResponse>
getUnifiedTrackStatus(year, round, query?: { session?, limit? }): Promise<UnifiedTrackStatusResponse>
```

- Each calls its corresponding `/api/unified/races/{year}/{round}/{endpoint}/` route.

---

### `actions/coverage.ts`

```ts
getPersistenceCoverageByYear(year: number): Promise<PersistenceCoverageSeasonResponse>
```

- Calls `GET /api/coverage/persistence/{year}/`
- Returns coverage for all rounds in a season.

```ts
getPersistenceCoverageByRace(year: number, round: number): Promise<PersistenceCoverageRaceResponse>
```

- Calls `GET /api/coverage/persistence/{year}/{round}/`
- Returns coverage for a single race.

---

### `Lib/server-client.ts` (utilities)

```ts
getJson<T>(path: string): Promise<T>
```

- Generic `fetch` wrapper. Throws with a human-readable message on non-2xx responses.

```ts
withQuery(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>
): string
```

- Builds a URL with query params. Skips `null`/`undefined` values.

---

## 3. TypeScript Types

All types are exported from `types/endpoints/index.ts` and re-exported via `types/mvp-api.ts`.

### Shared (`types/api.ts`)

```ts
type AnalysisSessionName =
  | "R"
  | "Q"
  | "FP1"
  | "FP2"
  | "FP3"
  | "Race"
  | "Qualifying";
type PracticeSessionName = "FP1" | "FP2" | "FP3";
type AnalysisSessionCode = "R" | "Q" | "FP1" | "FP2" | "FP3";
type RaceOnlySessionName = "R" | "Race";

type ReadinessChecklist = {
  can_proceed: boolean;
  available_data: string[];
  unavailable_data: string[];
  message: string | null;
  warnings: string[];
};

type ResponseMeta = {
  year?: number;
  round?: number;
  session?: string;
  can_proceed?: boolean;
  available_data?: string[];
  unavailable_data?: string[];
  message?: string | null;
  warnings?: string[];
};
```

---

### Schedule & Race (`types/endpoints/racestypes.ts`)

```ts
type SeasonRace = {
  round: number;
  date: string;
  name: string;
  location: string;
  circuit: string;
  country: string;
};

type SeasonScheduleResponse = {
  year: number;
  races: SeasonRace[];
  readiness: ReadinessChecklist;
};

type RaceDetailResponse = {
  round: number;
  date: string;
  name: string;
  location: string;
  circuit: string;
  country: string;
  readiness: ReadinessChecklist;
  sessions?: string[];
};
```

---

### Results (`types/endpoints/resultstypes.ts`)

```ts
type QualifyingResultRow = {
  position: number;
  driver_name: string;
  constructor: string;
  grid: number;
  time: string | null;
};

type RaceResultRow = {
  position: number;
  driver_name: string;
  constructor: string;
  grid: number;
  laps: number;
  status: string;
  time: string | null;
  points: number;
};

type RaceResultsResponse = {
  year: number;
  round: number;
  results: { qualifying: QualifyingResultRow[]; race: RaceResultRow[] };
  readiness: ReadinessChecklist;
};
```

---

### Qualifying (`types/endpoints/qualifyingtypes.ts`)

```ts
type QualifyingOnlyResultRow = {
  position: number;
  driver_name: string;
  constructor: string;
  grid: number;
  time: string | null;
};

type QualifyingResultsResponse = {
  year: number;
  round: number;
  results: QualifyingOnlyResultRow[];
  readiness: ReadinessChecklist;
};
```

---

### Practice (`types/endpoints/practicetypes.ts`)

```ts
type PracticeResultRow = {
  position: number;
  driver_name: string;
  constructor: string;
  laps: number;
  best_lap: string | null;
};

type PracticeResultsResponse = {
  year: number;
  round: number;
  session: PracticeSessionName;
  results: PracticeResultRow[];
  readiness: ReadinessChecklist;
};
```

---

### Driver Standings (`types/endpoints/driverstandingstypes.ts`)

```ts
type DriverStandingRow = {
  position: number;
  points: number;
  wins: number;
  driver_name: string;
  constructor: string;
};

type DriverStandingsResponse = {
  year: number;
  standings: DriverStandingRow[];
  readiness: ReadinessChecklist;
};
```

---

### Constructor Standings (`types/endpoints/constructorstandingstypes.ts`)

```ts
type ConstructorStandingRow = {
  position: number;
  points: number;
  constructor: string;
  wins?: number;
};

type ConstructorStandingsResponse = {
  year: number;
  standings: ConstructorStandingRow[];
  readiness: ReadinessChecklist;
};
```

---

### Laps Analysis (`types/endpoints/lapstypes.ts`)

```ts
type AnalysisLapRow = {
  driver_code: string;
  lap_number: number;
  lap_time: string | null;
  sector1?: string | null;
  sector2?: string | null;
  sector3?: string | null;
  compound?: string | null;
  stint?: number | null;
  is_personal_best?: boolean;
};

type LapsAnalysisResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    row_count: number;
    limit_max?: number;
  };
  filters_applied: { driver?: string | null; limit?: number };
  data: AnalysisLapRow[];
};
```

---

### Pace Analysis (`types/endpoints/pacetypes.ts`)

```ts
type PaceAnalysisRow = {
  driver_code: string;
  stint: number;
  lap_count: number;
  avg_pace: string;
  min_pace?: string | null;
  max_pace?: string | null;
  compound?: string | null;
};

type PaceAnalysisResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    row_count?: number;
  };
  filters_applied: { driver?: string | null; limit?: number };
  data: PaceAnalysisRow[];
};
```

---

### Stints Analysis (`types/endpoints/stintstypes.ts`)

```ts
type StintAnalysisRow = {
  stint: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  lap_count: number;
  best_lap?: string | null;
  avg_pace?: string | null;
  pace_degradation?: string | null;
};

type StintsAnalysisResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    row_count?: number;
  };
  filters_applied: { driver?: string | null; limit?: number };
  data: StintAnalysisRow[];
};
```

---

### Tyre Strategy (`types/endpoints/tyrestrategytypes.ts`)

```ts
type TyreStrategyRow = {
  stint: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  laps_completed?: number;
  pit_stop_lap?: number | null;
  pit_stop_loss?: string | null;
};

type TyreStrategyResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    row_count?: number;
  };
  filters_applied: { driver?: string | null; limit?: number };
  data: TyreStrategyRow[];
};
```

---

### Sector Analysis (`types/endpoints/sectoranalysistypes.ts`)

```ts
// Kept as a narrower alias — SectorSessionName = "Race" | "Qualifying"
type SectorAnalysisRow = {
  compound: string;
  sector: 1 | 2 | 3;
  min_time?: string | null;
  avg_time: string | null;
  max_time?: string | null;
  lap_count?: number;
};

type SectorAnalysisResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    row_count?: number;
  };
  filters_applied: { driver?: string | null; limit?: number };
  data: SectorAnalysisRow[];
};
```

---

### Telemetry (`types/endpoints/telemetrytypes.ts`)

```ts
type TelemetryPoint = {
  distance: number;
  speed: number;
  throttle: number;
  brake: boolean;
  drs: number;
  gear: number;
  rpm?: number;
  kers?: number | null;
  mguh_deploy?: number | null;
  mguk_deploy?: number | null;
  n_gear?: number;
  fuel?: number | null;
  lap?: number;
  relative_distance?: number;
};

type TelemetryResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    lap: number;
    driver: string;
    row_count?: number;
  };
  filters_applied: {
    driver: string;
    lap: number;
    limit_points?: number;
    stride?: number;
    sector_start?: number;
    sector_end?: number;
  };
  data: TelemetryPoint[];
};
```

---

### Telemetry Overlay (`types/endpoints/telemetryoverlaytypes.ts`)

```ts
type TelemetryOverlayPoint = {
  distance: number;
  delta_speed?: number;
  delta_throttle?: number;
  [driverCode: string]: number | Record<string, unknown> | undefined;
};

type TelemetryOverlayResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    drivers: [string, string];
    lap: number;
    comparison_metric?: string;
    row_count?: number;
  };
  filters_applied: { driver_a: string; driver_b: string; lap?: number };
  data: TelemetryOverlayPoint[] | Record<string, TelemetryPoint[]>;
};
```

---

### Telemetry Summary (`types/endpoints/telemetrysummarytypes.ts`)

```ts
type TelemetrySummaryLap = {
  lap: number;
  avg_speed: number;
  max_speed: number;
  min_speed?: number;
  avg_throttle?: number;
  brake_events?: number;
  gear_changes?: number;
  drs_activations: number;
  fuel_delta?: number;
};

type TelemetrySummaryResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    driver: string;
    lap_count?: number;
    total_row_count?: number;
  };
  filters_applied?: { driver: string; lap: number; lap_range?: number };
  data: TelemetrySummaryLap[];
};
```

---

### Full Session (`types/endpoints/fullsessiontypes.ts`)

```ts
type UnifiedIncludeType =
  | "telemetry"
  | "weather"
  | "pit_stops"
  | "incidents"
  | "positions"
  | "drs"
  | "track_status";

type FullSessionResponse = {
  meta: ResponseMeta & {
    year: number;
    round: number;
    session: AnalysisSessionName;
    requested_types?: UnifiedIncludeType[];
    cache_stats: UnifiedCacheStats;
  };
  data: Partial<
    Record<
      UnifiedIncludeType,
      {
        meta?: { row_count?: number };
        data?: unknown[];
        error?: string;
        status?: "failed" | "partial" | "ok";
      }
    >
  >;
};
```

---

### Weather (`types/endpoints/weathertypes.ts`)

```ts
type UnifiedWeatherRow = {
  time?: string;
  air_temp: number;
  track_temp: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  track_status: string;
  rainfall: boolean;
};

type UnifiedWeatherResponse = {
  meta: ResponseMeta & { row_count?: number; session: AnalysisSessionName };
  data: UnifiedWeatherRow[];
};
```

---

### Pit Stops (`types/endpoints/pitstopstypes.ts`)

```ts
type UnifiedPitStopRow = {
  driver: string;
  lap: number;
  time_of_day?: string;
  duration?: string;
  compound?: string;
  stop_number?: number;
  duration_seconds?: number;
  compound_in?: string;
  compound_out?: string;
  tyres_changed?: number;
};

type UnifiedPitStopsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  data: UnifiedPitStopRow[];
};
```

---

### Incidents (`types/endpoints/incidentstypes.ts`)

```ts
type UnifiedIncidentRow = {
  lap: number;
  time: string;
  driver: string | null;
  message: string;
  type?: string;
  category?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

type UnifiedIncidentsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  data: UnifiedIncidentRow[];
};
```

---

### Positions (`types/endpoints/positionstypes.ts`)

```ts
type UnifiedPositionRow = {
  lap: number;
  driver: string;
  position: number;
  time_of_day?: string;
  gap_to_leader?: string | number;
  gap_to_next?: string | number;
};

type UnifiedPositionsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  filters_applied?: ResponseFilters;
  data: UnifiedPositionRow[];
};
```

---

### DRS (`types/endpoints/drstypes.ts`)

```ts
type UnifiedDrsRow = {
  lap: number;
  driver: string;
  time?: string;
  drs_zone?: number;
  status?: string;
  drs_available?: boolean;
  drs_engaged?: boolean;
  drs_detection_lap?: number | null;
};

type UnifiedDrsResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  data: UnifiedDrsRow[];
};
```

---

### Track Status (`types/endpoints/trackstatustypes.ts`)

```ts
type UnifiedTrackStatusRow = {
  lap: number;
  time: string;
  status: string;
  message?: string;
  reason?: string;
};

type UnifiedTrackStatusResponse = {
  meta: ResponseMeta & { session: AnalysisSessionName; row_count?: number };
  data: UnifiedTrackStatusRow[];
};
```

---

### Coverage (`types/endpoints/coveragetypes.ts`)

```ts
type CoverageSessionFlags = {
  available: boolean;
  telemetry: boolean;
  incidents: boolean;
};

type CoverageSessionMap = {
  FP1?: CoverageSessionFlags;
  FP2?: CoverageSessionFlags;
  FP3?: CoverageSessionFlags;
  Q?: CoverageSessionFlags;
  R?: CoverageSessionFlags;
  [session: string]: CoverageSessionFlags | undefined;
};

type PersistenceCoverageSeasonResponse = {
  year: number;
  coverage: Array<{
    round: number;
    race_name: string;
    sessions: CoverageSessionMap;
  }>;
};

type PersistenceCoverageRaceResponse = {
  year: number;
  round: number;
  race_name: string;
  sessions: CoverageSessionMap;
};
```

---

_Last updated: April 29, 2026_

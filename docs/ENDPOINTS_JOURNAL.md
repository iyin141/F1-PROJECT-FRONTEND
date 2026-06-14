# Endpoints Journal

Summary: a working catalogue of frontend-facing API endpoints and their TypeScript response types (as defined in `types/endpoints`). This maps the client wrappers in `Lib/api_services` / `Lib/queryFunctions` to the response types the UI consumes.

---

## How to read this file

- **Endpoint**: client-visible route pattern
- **Method**: HTTP method
- **Client wrapper**: where the frontend calls this endpoint (`Lib/api_services` and/or `Lib/queryFunctions`)
- **Response type**: exported TypeScript response type and its file
- **Notes**: short description

---

## Analysis endpoints

- Endpoint: `GET /api/analysis/races/{year}/{round}/laps/`
  - Client wrapper: `Lib/api_services/analysis.getLapsAnalysis` → `Lib/queryFunctions/analysis.fetchLapsAnalysis`
  - Response type: `LapsAnalysisResponse` — [types/endpoints/lapstypes.ts](types/endpoints/lapstypes.ts)
  - Notes: Per-lap timing rows (driver_code, lap_number, lap_time, sectors, compound, stint)

- Endpoint: `GET /api/analysis/races/{year}/{round}/pace/`
  - Client wrapper: `getAnalysis(..., "pace")` → `Lib/queryFunctions/analysis.fetchDriverPace`
  - Response type: `PaceAnalysisResponse` — [types/endpoints/pacetypes.ts](types/endpoints/pacetypes.ts)
  - Notes: Average/min/max pace summaries per driver/stint

- Endpoint: `GET /api/analysis/races/{year}/{round}/stints/`
  - Client wrapper: `getAnalysis(..., "stints")` → `Lib/queryFunctions/analysis.fetchDriverStints`
  - Response type: `StintsAnalysisResponse` — [types/endpoints/stintstypes.ts](types/endpoints/stintstypes.ts)
  - Notes: Stint-level aggregates (start/end laps, compound, best lap)

- Endpoint: `GET /api/analysis/races/{year}/{round}/tyre-strategy/`
  - Client wrapper: `getAnalysis(..., "tyre-strategy")` → `Lib/queryFunctions/analysis.fetchTyreStrategy`
  - Response type: `TyreStrategyResponse` — [types/endpoints/tyrestrategytypes.ts](types/endpoints/tyrestrategytypes.ts)
  - Notes: Gantt-style stint rows per driver (compound, lap ranges)

- Endpoint: `GET /api/analysis/races/{year}/{round}/sector-analysis/`
  - Client wrapper: `getAnalysis(..., "sector-analysis")` → `Lib/queryFunctions/analysis.fetchSectorAnalysis`
  - Response type: `SectorAnalysisResponse` — [types/endpoints/sectoranalysistypes.ts](types/endpoints/sectoranalysistypes.ts)
  - Notes: Sector-level min/avg/max times grouped by compound/session

- Endpoint: `GET /api/analysis/races/{year}/{round}/telemetry/`
  - Client wrapper: `Lib/api_services/analysis.getTelemetry` → `Lib/queryFunctions/analysis.fetchTelemetry`
  - Response type: `TelemetryResponse` — [types/endpoints/telemetrytypes.ts](types/endpoints/telemetrytypes.ts)
  - Notes: Full telemetry point arrays (distance, speed, throttle, brake, gear, etc.)

- Endpoint: `GET /api/analysis/races/{year}/{round}/telemetry/overlay/`
  - Client wrapper: `Lib/api_services/analysis.getTelemetryOverlay` → `Lib/queryFunctions/analysis.fetchTelemetryOverlay`
  - Response type: `TelemetryOverlayResponse` — [types/endpoints/telemetryoverlaytypes.ts](types/endpoints/telemetryoverlaytypes.ts)
  - Notes: Comparative telemetry for two drivers (per distance) or keyed object of arrays

- Endpoint: `GET /api/analysis/races/{year}/{round}/telemetry/summary/`
  - Client wrapper: `Lib/api_services/analysis.getTelemetrySummary` → `Lib/queryFunctions/analysis.fetchTelemetrySummary`
  - Response type: `TelemetrySummaryResponse` — [types/endpoints/telemetrysummarytypes.ts](types/endpoints/telemetrysummarytypes.ts)
  - Notes: Aggregated telemetry summary stats per lap (avg/max/min speeds, throttle, gear changes)

---

## Unified endpoints (`/api/unified/...`)

- Endpoint: `GET /api/unified/races/{year}/{round}/weather/` (query: `session`, `per_lap=true`)
  - Client wrapper: `Lib/api_services/unified.getUnifiedWeather` → `Lib/queryFunctions/unified.fetchUnifiedWeather`
  - Response type: `UnifiedWeatherResponse` — [types/endpoints/weathertypes.ts](types/endpoints/weathertypes.ts)
  - Notes: Weather readings (air/track temp, humidity, wind, track_status). `per_lap` returns per-lap aggregation when supported.

- Endpoint: `GET /api/unified/races/{year}/{round}/incidents/` (query: `session`)
  - Client wrapper: `Lib/api_services/unified.getUnifiedIncidents`
  - Response type: `UnifiedIncidentsResponse` — [types/endpoints/incidentstypes.ts](types/endpoints/incidentstypes.ts)
  - Notes: Safety car / incidents / messages

- Endpoint: `GET /api/unified/races/{year}/{round}/positions/` (query: `session`, `sample_interval`)
  - Client wrapper: `Lib/api_services/unified.getUnifiedPositions`
  - Response type: `UnifiedPositionsResponse` — [types/endpoints/positionstypes.ts](types/endpoints/positionstypes.ts)
  - Notes: Position frames for all cars (heavy payload; `sample_interval` reduces resolution)

- Endpoint: `GET /api/unified/races/{year}/{round}/pit-stops/` (query: `session`)
  - Client wrapper: `Lib/api_services/unified.getUnifiedPitStops`
  - Response type: `UnifiedPitStopsResponse` — [types/endpoints/pitstopstypes.ts](types/endpoints/pitstopstypes.ts)
  - Notes: Pit stop records per driver

- Endpoint: `GET /api/unified/races/{year}/{round}/drs/` (query: `session`)
  - Client wrapper: `Lib/api_services/unified.getUnifiedDrs`
  - Response type: `UnifiedDrsResponse` — [types/endpoints/drstypes.ts](types/endpoints/drstypes.ts)
  - Notes: DRS availability/activation frames

- Endpoint: `GET /api/unified/races/{year}/{round}/track-status/` (query: `session`)
  - Client wrapper: `Lib/api_services/unified.getUnifiedTrackStatus`
  - Response type: `UnifiedTrackStatusResponse` — [types/endpoints/trackstatustypes.ts](types/endpoints/trackstatustypes.ts)
  - Notes: VSC/SC/red flag intervals and messages

- Endpoint: `GET /api/unified/races/{year}/{round}/full-session/` (query: `include`, `session`, `driver`, `limit`)
  - Client wrapper: `Lib/api_services/unified.getFullSession`
  - Response type: `FullSessionResponse` — [types/endpoints/fullsessiontypes.ts](types/endpoints/fullsessiontypes.ts)
  - Notes: Bundled payload combining many unified sub-endpoints (used for heavy prefetching)

---

## Race & standings endpoints

- Endpoint: `GET /api/races/{year}/`
  - Client wrapper: `Lib/api_services/races.getSeasonSchedule`
  - Response type: `SeasonScheduleResponse` — [types/endpoints/racestypes.ts](types/endpoints/racestypes.ts)
  - Notes: Season schedule with race metadata

- Endpoint: `GET /api/drivers/standings/{year}/`
  - Client wrapper: `Lib/api_services/races.getDriverStandings`
  - Response type: `DriverStandingsResponse` — [types/endpoints/driverstandingstypes.ts](types/endpoints/driverstandingstypes.ts)

- Endpoint: `GET /api/constructors/{year}/`
  - Client wrapper: `Lib/api_services/races.getConstructorStandings`
  - Response type: `ConstructorStandingsResponse` — [types/endpoints/constructorstandingstypes.ts](types/endpoints/constructorstandingstypes.ts)

- Endpoint: `GET /api/races/{year}/{round}/`
  - Client wrapper: `Lib/api_services/races.getRaceDetail`
  - Response type: `RaceDetailResponse` — [types/endpoints/racestypes.ts](types/endpoints/racestypes.ts)

- Endpoint: `GET /api/races/{year}/{round}/results/`
  - Client wrapper: `Lib/api_services/races.getRaceResults`
  - Response type: `RaceResultsResponse` — [types/endpoints/resultstypes.ts](types/endpoints/resultstypes.ts)

- Endpoint: `GET /api/races/{year}/{round}/qualifying/`
  - Client wrapper: `Lib/api_services/races.getQualifyingResults`
  - Response type: `QualifyingResultsResponse` — [types/endpoints/qualifyingtypes.ts](types/endpoints/qualifyingtypes.ts)

- Endpoint: `GET /api/races/{year}/{round}/practice/{session}/`
  - Client wrapper: `Lib/api_services/races.getPracticeResults`
  - Response type: `PracticeResultsResponse` — [types/endpoints/practicetypes.ts](types/endpoints/practicetypes.ts)

- Endpoint: `GET /api/races/{year}/{round}/sprint/`
  - Client wrapper: `Lib/api_services/races.getSprintResults`
  - Response type: `SprintResultsResponse` — [types/endpoints/sprinttypes.ts](types/endpoints/sprinttypes.ts)

- Endpoint: `GET /api/races/{year}/{round}/sprint-shootout/`
  - Client wrapper: `Lib/api_services/races.getSprintShootoutResults`
  - Response type: `SprintShootoutResultsResponse` — [types/endpoints/sprinttypes.ts](types/endpoints/sprinttypes.ts)

---

## Driver endpoints

- Endpoint: `GET /api/drivers/{driverCode}/career/`
  - Client wrapper: `Lib/api_services/drivers.getDriverCareer` → `Lib/queryFunctions/drivers.fetchDriverCareer`
  - Response type: `DriverCareerResponse` — [types/endpoints/driverrecordtypes.ts](types/endpoints/driverrecordtypes.ts)

- Endpoint: `GET /api/drivers/{driverCode}/{year}/`
  - Client wrapper: `Lib/api_services/drivers.getDriverSeason` → `Lib/queryFunctions/drivers.fetchDriverSeason`
  - Response type: `DriverSeasonBreakdownResponse` — [types/endpoints/driverrecordtypes.ts](types/endpoints/driverrecordtypes.ts)

---

## Implementation notes

- Many `app/api` route handlers proxy to `BACKEND_API_URL` and thus mirror the backend API; the frontend normalizes sessions and uses the typed wrappers in `Lib/queryFunctions`.
- Response shapes are authoritative in `types/endpoints/*.ts` — open those files to inspect fields and nested types.
- If you need request payload types (for POST/PUT), search `app/api` routes for non-GET handlers — current analysis predominantly uses GET endpoints.

---

## Next steps / TODO

- Add short example payloads for each endpoint (optional)
- Mark any missing or `any`-typed queryFunctions and update them with concrete response types (e.g., `fetchDriverPace` currently returns `any`)

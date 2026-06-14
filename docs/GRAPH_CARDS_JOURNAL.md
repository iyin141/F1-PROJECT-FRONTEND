# Graphs & Cards Journal

This document lists every graph/card component displayed in the app, the hook(s) they use, the query function(s) invoked, and the API endpoint patterns called.

---

## Race Analysis (features/race-analysis/components)

- `PaceComparison` (features/race-analysis/components/PaceComparison.tsx)
  - Hook: `useLapTimes(year, round, session)` → `Lib/queryFunctions` → `fetchLapsAnalysis`
  - API: `/api/analysis/races/{year}/{round}/laps/?session={session}` (via `getLapsAnalysis`)
  - Types:
    - Hook: `useLapTimes(year: number, round: number, session?: string, enabled?: boolean): UseQueryResult<LapTime[] | undefined, unknown>`
      (defined in `features/race-analysis/hooks/useRaceAnalysis.ts`)
    - Query function: `fetchLapsAnalysis(year: number, round: number, params?: Record<string, string | number | undefined>): Promise<LapsAnalysisResponse>`
      (defined in `Lib/queryFunctions/analysis.ts`)
    - API service: `getLapsAnalysis(year: number, round: number, params?: Record<string, string | number | undefined>): Promise<LapsAnalysisResponse>`
      (defined in `Lib/api_services/analysis.ts`)
    - Endpoint response type: `LapsAnalysisResponse` (`@/types/endpoints/lapstypes`)
    - Adapter → UI type: `adaptLapTimes(res: LapsAnalysisResponse): LapTime[]` (`@/Lib/adapters.ts`, `@/types/ui`)

- `PaceDistribution` (features/race-analysis/components/PaceDistribution.tsx)
  - Hook: `useLapTimes(year, round, session)`
  - API: same as `PaceComparison` (`laps` endpoint)
  - Types:
    - Hook: `useLapTimes(year: number, round: number, session?: string, enabled?: boolean): UseQueryResult<LapTime[] | undefined, unknown>`
    - Query function: `fetchLapsAnalysis(...) : Promise<LapsAnalysisResponse>`
    - API service: `getLapsAnalysis(...) : Promise<LapsAnalysisResponse>`
    - Adapter → UI type: `LapTime[]` (from `adaptLapTimes`)

- `SectorHeatmap` (features/race-analysis/components/SectorHeatmap.tsx)
  - Hooks: `useDriverSectors(year, round, driver, session)` or `useSectorAnalysis(year, round, session)`
  - API(s): `fetchSectorAnalysis` → `/api/analysis/races/{year}/{round}/laps/?session={session}&driver={driver}` (adaptor varies)
  - Types:
    - `useDriverSectors(year: number, round: number, driver?: string, session?: string): UseQueryResult<any, unknown>` (driver-filtered)
    - `useSectorAnalysis(year: number, round: number, session?: string): UseQueryResult<SectorAnalysis[] | undefined, unknown>`
      (select uses `adaptSectorAnalysis` → `SectorAnalysis[]`, `@/types/ui`)
    - Query function: `fetchSectorAnalysis(year, round, driver?: string, session?: string): Promise<any>`
    - Underlying endpoint type: `LapsAnalysisResponse` (raw), adapter produces `SectorAnalysis[]`

- `PositionTracker` (features/race-analysis/components/PositionTracker.tsx)
  - Hook: `useRacePositions(year, round, session)` → `fetchUnifiedPositions`
  - API: `/api/unified/races/{year}/{round}/positions/?session={session}&sample_interval={sample}`
  - Types:
    - Hook: `useRacePositions(year: number, round: number, enabled?: boolean, session?: string): UseQueryResult<UnifiedPositionsResponse, unknown>`
      (defined in `features/race-analysis/hooks/useRaceAnalysis.ts`)
    - Query function: `fetchUnifiedPositions(year: number, round: number, session: string, sample?: number, queryClient: QueryClient): Promise<UnifiedPositionsResponse>`
      (defined in `Lib/queryFunctions/unified.ts`)
    - API service: `getUnifiedPositions(year: number, round: number, session?: string, sample?: number): Promise<UnifiedPositionsResponse>`
      (defined in `Lib/api_services/unified.ts`)
    - Endpoint response type: `UnifiedPositionsResponse` (`@/types/endpoints/positionstypes`)

- `TyreStrategy` (features/race-analysis/components/TyreStrategy.tsx)
  - Hook: `useTyreStrategy(year, round, session)` → `fetchTyreStrategy`
  - API: `/api/analysis/races/{year}/{round}/tyre-strategy/?session={session}`
  - Types:
    - Hook: `useTyreStrategy(year: number, round: number, session?: string): UseQueryResult<Stint[] | undefined, unknown>`
      (select uses `adaptTyreStrategy` → `Stint[]`, `@/types/ui`)
    - Query function: `fetchTyreStrategy(year: number, round: number, session?: string): Promise<any>`
    - API service: `getAnalysis(...)` with endpoint `tyre-strategy` returning `TyreStrategyResponse` (adapted to `Stint[]`)

- `TelemetryOverlay` (features/race-analysis/components/TelemetryOverlay.tsx)
  - Hook: `usePersistentTelemetryOverlay(year, round, driverA, driverB, lap, session)` → `fetchTelemetryOverlay`
  - API: `/api/analysis/races/{year}/{round}/telemetry/overlay/?driver_a={a}&driver_b={b}&lap={lap}&session={session}`
  - Types:
    - Hook: `useTelemetryOverlay(year: number, round: number, driverA?: string, driverB?: string, lap?: number, session?: AnalysisSessionName): UseQueryResult<TelemetryOverlayResponse, unknown>`
    - Query function: `fetchTelemetryOverlay(year: number, round: number, driverA: string, driverB: string, lap?: number, session?: AnalysisSessionName): Promise<TelemetryOverlayResponse>`
    - API service: `getTelemetryOverlay(year: number, round: number, params?): Promise<TelemetryOverlayResponse>` (`@/Lib/api_services/analysis.ts`)
    - Endpoint response type: `TelemetryOverlayResponse` (`@/types/endpoints/telemetryoverlaytypes`)

- `DriverTelemetryPanel` (features/race-analysis/components/DriverTelemetryPanel.tsx)
  - Hook: `usePersistentTelemetry(year, round, driver, lap, session)` → `fetchTelemetry`
  - API: `/api/analysis/races/{year}/{round}/telemetry/?driver={driver}&lap={lap}&session={session}`
  - Types:
    - Hook: `useTelemetry(year: number, round: number, driver?: string, lap?: number | null, session?: AnalysisSessionName): UseQueryResult<TelemetryResponse, unknown>`
    - Query function: `fetchTelemetry(year: number, round: number, driver: string, lap: number, session: AnalysisSessionName): Promise<TelemetryResponse>`
    - API service: `getTelemetry(year: number, round: number, params?): Promise<TelemetryResponse>`
    - Endpoint response type: `TelemetryResponse` (`@/types/endpoints/telemetrytypes`)

- `TelemetrySummaryCard` (features/race-analysis/components/TelemetrySummaryCard.tsx)
  - Hook: `useTelemetrySummary(year, round, driverId, lap, session)` → `fetchTelemetrySummary`
  - API: `/api/analysis/races/{year}/{round}/telemetry/summary/?driver={driver}&lap={lap}&session={session}`
  - Types:
    - Hook: `useTelemetrySummary(year: number, round: number, driver?: string, lap?: number | null, session?: AnalysisSessionName): UseQueryResult<TelemetrySummaryResponse, unknown>`
    - Query function: `fetchTelemetrySummary(year: number, round: number, driver: string, lap: number, session: AnalysisSessionName): Promise<TelemetrySummaryResponse>`
    - Endpoint response type: `TelemetrySummaryResponse` (`@/types/endpoints/telemetrysummarytypes`)

- `StintAnalysis` (features/race-analysis/components/StintAnalysis.tsx)
  - Hook: `useAllStints(year, round, session)` → `fetchDriverStints`
  - API: `/api/analysis/races/{year}/{round}/stints/?session={session}`
  - Types:
    - Hook: `useAllStints(year: number, round: number, session?: string): UseQueryResult<Stint[] | undefined, unknown>`
    - Query function: `fetchDriverStints(year: number, round: number, driver?: string, session?: string): Promise<any>`
    - Endpoint response type (raw): `StintsAnalysisResponse` (`@/types/endpoints/stintstypes`), adapted to `Stint[]`

- `RaceSummaryStats` (features/race-analysis/components/RaceSummaryStats.tsx)
  - Hook: `useRaceLapFrames(year, round, session)` → `fetchLapsAnalysis`
  - API: `/api/analysis/races/{year}/{round}/laps/?session={session}`
  - Types:
    - Hook: `useRaceLapFrames(year: number, round: number, session?: string, enabled?: boolean): UseQueryResult<RaceLapFrame[] | undefined, unknown>`
    - Query function: `fetchLapsAnalysis(...) : Promise<LapsAnalysisResponse>`
    - Adapter → UI type: `adaptRaceLapFrames(res: LapsAnalysisResponse): RaceLapFrame[]` (`@/types/ui`)

- `ConsistencyCards` (features/race-analysis/components/ConsistencyCards.tsx)
  - Hook: `useConsistencyByStint(year, round, session)` → uses `useRaceLapFrames`
  - API: `/api/analysis/races/{year}/{round}/laps/?session={session}`
  - Types:
    - Hook returns: `{ data: Map<number | "overall", ConsistencyScore[]>; isLoading: boolean; isError: boolean }`
      where `ConsistencyScore` is in `@/types/ui` and is derived from `RaceLapFrame[]`

- `TeammateBattles` (features/race-analysis/components/TeammateBattles.tsx)
  - Hook: `useTeammateBattles(year, round, session)` → uses `useRaceLapFrames`
  - API: `/api/analysis/races/{year}/{round}/laps/?session={session}`
  - Types:
    - Hook returns: `{ data: TeammateBattle[]; isLoading: boolean; isError: boolean }` (`TeammateBattle` in `@/types/ui`)

- `AnalysisTabs` / `LapAnalysisTab` / `TelemetryAnalysisTab` / `StintAnalysisTab` / `StrategyAnalysisTab`
  - These compose the above panels and use `useAllLaps` / `useAllStints` etc.

---

## Race Detail (features/race-detail/components)

- `ReplayScrubber` (features/race-detail/components/ReplayScrubber.tsx)
  - Hook: `useReplayFrames(year, round, enabled)` which uses `useReplayData`
  - Query functions: `fetchUnifiedPositions`, `fetchUnifiedIncidents`, `fetchUnifiedPitStops`, `fetchLapsAnalysis`
  - APIs:
    - `/api/unified/races/{year}/{round}/positions/?session={session}&sample_interval={sample}`
    - `/api/unified/races/{year}/{round}/incidents/?session={session}`
    - `/api/unified/races/{year}/{round}/pit-stops/?session={session}`
    - `/api/analysis/races/{year}/{round}/laps/?session={session}`
  - Types:
    - Hook: `useReplayFrames(year: number, round: number, enabled: boolean): { frames: ReplayFrame[]; positions: UseQueryResult<UnifiedPositionsResponse | undefined, unknown>; incidents: UseQueryResult<UnifiedIncidentsResponse | undefined, unknown>; pitStops: UseQueryResult<UnifiedPitStopsResponse | undefined, unknown>; laps: UseQueryResult<LapsAnalysisResponse | undefined, unknown>; isPending: boolean; isError: boolean }`
      (returns `ReplayFrame[]` produced by `adaptReplayFrames` in `@/Lib/adapters.ts`, `ReplayFrame` in `@/types/ui`)
    - Underlying query functions and endpoint response types:
      - `fetchUnifiedPositions(...) : Promise<UnifiedPositionsResponse>` (`@/types/endpoints/positionstypes`)
      - `fetchUnifiedIncidents(...) : Promise<UnifiedIncidentsResponse>` (`@/types/endpoints/incidentstypes`)
      - `fetchUnifiedPitStops(...) : Promise<UnifiedPitStopsResponse>` (`@/types/endpoints/pitstopstypes`)
      - `fetchLapsAnalysis(...) : Promise<LapsAnalysisResponse>` (`@/types/endpoints/lapstypes`)

- `PracticeTab` / `QualifyingTab` / `OverviewTab`
  - Hooks: `usePracticeResults`, `useQualifyingResults`, `useRaceDetail`, `useRaceResults`, `useRaceWeather`, `useRaceIncidents`
  - APIs: `/api/races/{year}/{round}/practice/{session}/`, `/api/races/{year}/{round}/qualifying/`, `/api/races/{year}/{round}/`, `/api/races/{year}/{round}/results/`, `/api/unified/...` (weather/incidents)
  - Types (summary):
    - `useRaceDetail(year: number, round: number, enabled?: boolean): UseQueryResult<Race | undefined, unknown>` — `Race` is a UI type adapted from `RaceDetailResponse` (`@/types/ui`, adapter `adaptRaceDetail`).
    - `usePracticeResults(year: number, round: number, session: PracticeSessionName, enabled?: boolean): UseQueryResult<PracticeResult[] | undefined, unknown>` — adapted from `PracticeResultsResponse` (`@/types/endpoints/practicetypes`).
    - `useQualifyingResults(...) : UseQueryResult<QualifyingResult[] | undefined, unknown>` — adapted from `QualifyingResultsResponse`.
    - `useRaceResults(...) : UseQueryResult<RaceResult[] | undefined, unknown>` — adapted from `RaceResultsResponse`.

---

## Home panels (features/home/components)

- `RightColumnPanels` (features/home/components/RightColumnPanels.tsx)
  - Uses `getSeasonSchedule` via `fetchSeasonSchedule` (hook `useSeasonHub`) and displays session schedule
  - API: `/api/races/{year}/` (season schedule)
  - Types:
    - Hook / query: `fetchSeasonSchedule(year: number): Promise<SeasonScheduleResponse>` (`@/types/endpoints/racestypes`)
    - Adapter: `adaptSeasonSchedule(res: SeasonScheduleResponse): Race[]` (`@/Lib/adapters.ts`, `@/types/ui`)

- `LastRacePanel` (features/home/components/LastRacePanel.tsx)
  - Data: `race`, `results`, `qualiResults`, `incidents`, `weather` — these originate from `useRaceDetail`, `useRaceResults`, `useQualifyingResults`, `useRaceIncidents`, `useRaceWeather`
  - APIs: mixed (see Race Detail above).
  - Types (summary):
    - `race`: `Race | undefined` (UI type, `@/types/ui`)
    - `results`: `RaceResult[] | undefined` (from `RaceResultsResponse`)
    - `qualiResults`: `QualifyingResult[] | undefined` (from `QualifyingResultsResponse`)
    - `incidents`: `Incident[] | undefined` (from `UnifiedIncidentsResponse` adapted via `adaptIncidents`)
    - `weather`: `WeatherSnapshot | undefined` (from `UnifiedWeatherResponse` adapted via `adaptWeather`)

---

## Notes & next steps

- I will create a Markdown file containing these entries in the repo as `docs/GRAPH_CARDS_JOURNAL.md` (done).
- Next: verify each API pattern by scanning `Lib/api_services/*` for exact parameter names and add example query strings. If you want, I can run a repo-wide grep to add the exact call sites and parameter names for every listed component.

---

Generated on: 2026-05-18

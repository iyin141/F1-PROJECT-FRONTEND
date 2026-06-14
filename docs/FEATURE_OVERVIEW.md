# Feature Inventory & Architecture — F1 Project Frontend

This document catalogs each feature in the codebase, lists its components and key files, explains the architecture and UI/data flow for each section, and points to shared libraries and cross-cutting concerns. Use the links to inspect source files.

**Index**

- **Season Hub**
- **Home (Race Control)**
- **Drivers Hub**
- **Driver Record**
- **Race Detail**
- **Race Analysis**
- **Shared Libraries & Cross-cutting**
- **App Routes & Pages**
- **Data Flow Summary**

---

**Season Hub**

- **Purpose**: Season calendar and championship standings UI.
- **Entry / Shell**:
  - **Page**: [features/season-hub/page.tsx](features/season-hub/page.tsx)
  - **Shell**: [features/season-hub/SeasonHub.tsx](features/season-hub/SeasonHub.tsx)
  - **Barrel**: [features/season-hub/index.ts](features/season-hub/index.ts)
- **API / Actions / Types**:
  - **Server actions**: [actions/season-hub.ts](actions/season-hub.ts)
  - **Local types**: [features/season-hub/types.ts](features/season-hub/types.ts)
  - **Feature config**: [features/season-hub/feature.config.json](features/season-hub/feature.config.json)
- **Hooks**:
  - [features/season-hub/hooks/useSeasonHub.ts](features/season-hub/hooks/useSeasonHub.ts) — provides `useSeasonSchedule`, `useDriverStandings`, `useConstructorStandings`, and `useSeasonScheduleFallback`.
- **Components** (UI pieces, all under features/season-hub/components):
  - [features/season-hub/components/CalendarPanel.tsx](features/season-hub/components/CalendarPanel.tsx)
  - [features/season-hub/components/SeasonHeader.tsx](features/season-hub/components/SeasonHeader.tsx)
  - [features/season-hub/components/SeasonOverview.tsx](features/season-hub/components/SeasonOverview.tsx)
  - [features/season-hub/components/StandingsPanel.tsx](features/season-hub/components/StandingsPanel.tsx)
  - [features/season-hub/components/YearSelector.tsx](features/season-hub/components/YearSelector.tsx)
- **Adapters / mappers**:
  - Uses `adaptSeasonSchedule`, `adaptDriverStandings`, `adaptConstructorStandings` from [Lib/adapters.ts](Lib/adapters.ts).
- **Architecture & Flow**:
  1. Server-layer: `actions/season-hub.ts` wraps `serverGetJson()` calls to proxy backend endpoints (e.g., `/api/races/[year]/`, `/api/drivers/[year]/`, `/api/constructors/[year]/`).
  2. Client Hooks: `useSeasonSchedule` / `useDriverStandings` call these server actions via React Query (keys from [Lib/queryKeys.ts](Lib/queryKeys.ts)).
  3. Adapters: `Lib/adapters.ts` converts backend payloads to UI-friendly `Race[]` / `DriverStanding[]` / `ConstructorStanding[]` shapes.
  4. UI: `SeasonHubShell` composes the season header, calendar, and standings panels and passes adapted data down to small focused components.
  5. Caching: `cacheConfig.activeSeason` controls revalidation/stale times for live season data.

---

**Home (Race Control)**

- **Purpose**: Main dashboard — race selection, last race details, quick standings, next race countdown, and calendar strip.
- **Entry / Server composition**:
  - **Server page (prefetch + hydration)**: [app/home/page.tsx](app/home/page.tsx) — calls `prefetchQueries()` and wraps client shell in `HydrationBoundary` + `Suspense`.
  - **Client shell**: [features/home/HomePage.tsx](features/home/HomePage.tsx) (`HomePageShell`) — client component that uses `useSearchParams()` and React Query hooks.
  - **Client header-only shell**: [features/home/HomePageClient.tsx](features/home/HomePageClient.tsx)
- **Key Components (features/home/components)**:
  - [features/home/components/ArrowSlider.tsx](features/home/components/ArrowSlider.tsx)
  - [features/home/components/CalendarStripPanel.tsx](features/home/components/CalendarStripPanel.tsx)
  - [features/home/components/LastRacePanel.tsx](features/home/components/LastRacePanel.tsx)
  - [features/home/components/LatestRaceSection.tsx](features/home/components/LatestRaceSection.tsx)
  - [features/home/components/RightColumnPanels.tsx](features/home/components/RightColumnPanels.tsx)
  - [features/home/components/ScheduleSection.tsx](features/home/components/ScheduleSection.tsx)
  - [features/home/components/StandingsSection.tsx](features/home/components/StandingsSection.tsx)
  - [features/home/components/StatusStrip.tsx](features/home/components/StatusStrip.tsx)
- **Hooks & Data**:
  - Reuses `useSeasonSchedule`, `useDriverStandings`, `useConstructorStandings` (season-hub hooks).
  - Race-specific hooks from race-detail: `useRaceDetail`, `useRaceResults`, `useRaceWeather`, `useRaceIncidents` (see [features/race-detail/hooks/useRaceDetail.ts](features/race-detail/hooks/useRaceDetail.ts)).
  - Adapters for race results / details: `adaptRaceDetail`, `adaptRaceResults`, `adaptWeather`, `adaptIncidents` in [Lib/adapters.ts](Lib/adapters.ts).
- **Architecture & Flow**:
  1. `app/home/page.tsx` server-prefetches schedule, drivers, and constructors (via `prefetchQueries`) and provides dehydrated state to the client with `HydrationBoundary`.
  2. The client shell (`HomePageShell`) uses `useSearchParams()` (requires `Suspense` boundary) to determine year/round and selects a `targetRace`.
  3. Based on `targetRace` status it conditionally loads race detail/results/weather/incidents using `useRaceDetail`, `useRaceResults`, and unified endpoints.
  4. Data is adapted by `Lib/adapters` and passed to focused UI components (e.g., `LastRacePanel`, `RightColumnPanels`).
  5. `RightColumnPanels` is a client component that handles interactive UI (drivers/constructors toggle, Show All behavior) and uses small animation touches via Framer Motion.
  6. Navigation is controlled via `router.push()` and URL params — `pushSelection()` serializes `year`/`round`.
- **Notable behavior**: Home mixes server prefetch (for fast hydration) with client-side hooks for interactivity and parameter-aware fetching.

---

**Drivers Hub**

- **Purpose**: Driver directory / search and navigation into individual driver records.
- **Entry**:
  - [features/drivers-hub/DriversHubPage.tsx](features/drivers-hub/DriversHubPage.tsx)
- **Dependencies**:
  - Uses `useDriverStandings` to retrieve the season grid or fallback to local `DRIVERS` static list ([Lib/data/drivers.ts](Lib/data/drivers.ts)).
  - Uses `DriverCode` UI primitive to display driver badge: [components/DriverCode.tsx](components/DriverCode.tsx).
- **Flow**:
  1. Read `year` prop and call `useDriverStandings(year)`.
  2. If standings exist, `adaptDriverStandings` (Lib/adapters) is used to extract driver objects; otherwise fallback to static list.
  3. Filter / search is performed client-side and results link to driver pages `/drivers/[code]/[year]`.

---

**Driver Record**

- **Purpose**: Detailed driver career + per-season breakdown view.
- **Entry / Routing**:
  - Route: `/drivers/[driverCode]/[year]` — [app/drivers/[driverCode]/[year]/page.tsx](app/drivers/[driverCode]/[year]/page.tsx) (prefetches career & selected season via `prefetchQueries` and renders `DriverRecordShell`).
  - Barrel export: [features/driver-record/index.ts](features/driver-record/index.ts)
- **Components (features/driver-record/components)**:
  - DriverRecordShell, DriverHero, CareerRow, CareerTimeline, CareerTotalsStrip, SeasonBreakdown, SeasonBreakdownRow, DataCaveatNote
  - Paths: [features/driver-record/components/DriverRecordShell.tsx](features/driver-record/components/DriverRecordShell.tsx) (exported) and supporting component files.
- **Hooks & Actions**:
  - Hooks: [features/driver-record/hooks/useDriverRecord.ts](features/driver-record/hooks/useDriverRecord.ts) → `useDriverCareer`, `useDriverSeason`.
  - Server actions: [actions/driver-record.ts](actions/driver-record.ts) → `getDriverCareer`, `getDriverSeasonBreakdown`.
- **Flow**:
  1. `app/drivers/[code]/[year]/page.tsx` prefetches `career` and `season` queries server-side and hydrates the client.
  2. `DriverRecordShell` consumes React Query cache (or calls hooks) and adapts API responses via `Lib/adapters`.
  3. UI is split into hero, career totals/timeline, and a season breakdown table.

---

**Race Detail**

- **Purpose**: Per-race detailed pages (overview, practice/qualifying/results, replay, telemetry, incidents).
- **Entry / Shell**:
  - `app/race/[year]/[round]/page.tsx` → server page that typically composes RaceDetail shell.
  - Feature shell: [features/race-detail/RaceDetail.tsx](features/race-detail/RaceDetail.tsx) (`RaceDetailShell`).
- **Components (features/race-detail/components)**:
  - RaceTabs, RaceTab, RaceHeader, OverviewTab, PracticeTab, QualifyingTab, SprintTab, ReplayTab, DriverRecordTab, NotAvailable, ReplayScrubber, and tab-types helper.
- **Hooks & Actions**:
  - Hooks: [features/race-detail/hooks/useRaceDetail.ts](features/race-detail/hooks/useRaceDetail.ts) — `useRaceDetail`, `useRaceResults`, `useQualifyingResults`, `usePracticeResults`, `useSprintResults`, `useRaceWeather`, `useRaceIncidents`, and `useReplayData` (parallel queries for large replay payloads).
  - Server actions: [actions/race-detail.ts](actions/race-detail.ts) and unified endpoints in [actions/unified.ts](actions/unified.ts) for positions/incidents/weather.
- **Architecture & Flow**:
  1. `RaceDetailShell` calls `useRaceDetail(year, round)` and adapts results via `adaptRaceDetail`.
  2. Tab visibility and behavior is driven by the presence of sessions and `hasSprintSessions()` (adapter helper).
  3. Replay/telemetry features are opt-in: `useReplayData` will fire heavy `useQueries` only when the user requests replay (to avoid loading large payloads by default).
  4. UI composition: `RaceHeader` (meta), `RaceTabs` (tab navigation) and per-tab components render results, qualifying grids, session summaries, and telemetry overlays.

---

**Race Analysis**

- **Purpose**: Deeper analysis tools for a race — lap analysis, stint analysis, pace distributions, telemetry overlays, tyre strategy.
- **Entry / Shell**:
  - [features/race-analysis/RaceAnalysis.tsx](features/race-analysis/RaceAnalysis.tsx) (`RaceAnalysisShell`).
- **Components**:
  - `AnalysisHeader`, `AnalysisPanels`, `PositionTracker`, `PaceComparison`, `TelemetryOverlay`, `TyreStrategy`, `TrackStatusPanel`, `TelemetrySummaryCard`, `DriverTelemetryPanel`, and many small cards under `components/`.
- **Hooks & Data**:
  - Heavy use of unified endpoints and analysis-specific endpoints via [actions/race-analysis.ts](actions/race-analysis.ts) and [actions/unified.ts](actions/unified.ts).
  - Example: `getLapsAnalysis` returns lap-based analysis data consumed by `StintAnalysis`, `PaceDistribution`, and `SectorHeatmap`.
- **Flow**:
  1. Shell loads race metadata with `useRaceDetail` and then the analysis panels fetch specialized analysis endpoints.
  2. Some analysis widgets are interactive and allow driver selection; telemetry overlays compare two drivers/laps and reuse cached telemetry via query keys in `Lib/queryKeys.ts`.

---

**Shared Libraries & Cross-cutting**

- **Query & Caching**:
  - `QueryProvider` sets up React Query + persist ([\_Stores/QueryProvider.tsx](/_Stores/QueryProvider.tsx)).
  - Query key factory: [Lib/queryKeys.ts](Lib/queryKeys.ts) centralizes all query key shapes.
  - `prefetchQueries()` helper for server prefetch and `HydrationBoundary` export: [Lib/prefetch.ts](Lib/prefetch.ts).
  - Cache presets: `cacheConfig` in `Lib/queryKeys.ts` (`historical`, `activeSeason`, `heavyOptIn`).
- **Server fetch wrapper & logging**:
  - `serverGetJson()` centralizes proxying to backend and enhanced logging: [Lib/server-client.ts](Lib/server-client.ts).
- **Adapters**:
  - `Lib/adapters.ts` contains adapters that transform backend payload shapes to UI models (Race, RaceResult, DriverStanding, ConstructorStanding, etc.).
- **UI primitives** (shared components):
  - Panel: [components/Panel.tsx](components/Panel.tsx)
  - Table: [components/ui/GenericTable.tsx](components/ui/GenericTable.tsx)
  - Driver badge / code: [components/DriverCode.tsx](components/DriverCode.tsx)
  - Loading states: [components/ui/F1LoadingState.tsx](components/ui/F1LoadingState.tsx)
  - Flags / images: [components/ui/DriverFlag.tsx](components/ui/DriverFlag.tsx)
  - Animations: [components/animations/SectionLoadingAnimations.tsx](components/animations/SectionLoadingAnimations.tsx)
  - Theme toggle / Year navigator: [components/ThemeToggle.tsx](components/ThemeToggle.tsx), [components/ui/YearNavigator.tsx](components/ui/YearNavigator.tsx)
- **Types**:
  - UI types: [types/ui.ts](types/ui.ts)
  - Endpoint types (many): [types/endpoints/\*](types/endpoints/) (results, races, telemetry, weather, etc.)
- **Actions barrel**: [actions/index.ts](actions/index.ts) re-exports the various server action modules.

---

**App Routes & Pages (high level)**

- Root redirect: [app/page.tsx](app/page.tsx) → redirects to `/home/<currentYear>`.
- Home: [app/home/page.tsx](app/home/page.tsx) and [app/home/[year]/page.tsx](app/home/[year]/page.tsx).
- Season hub: [app/season/[year]/page.tsx](app/season/[year]/page.tsx).
- Race detail: [app/race/[year]/[round]/page.tsx](app/race/[year]/[round]/page.tsx) and analysis [app/race/[year]/[round]/analysis/page.tsx](app/race/[year]/[round]/analysis/page.tsx).
- Drivers: [app/drivers/page.tsx], [app/drivers/[driverCode]/[year]/page.tsx].
- Driver record redirect: [app/driver-record/page.tsx](app/driver-record/page.tsx) → redirects to default driver/year.

---

**Data Flow Summary (canonical request path)**

1. UI Component (Client/Server) calls a Hook (e.g., `useRaceResults`) or receives prefetched data.
2. Hook uses React Query queryKey from `Lib/queryKeys.ts` and queryFn that calls a server action in `actions/`.
3. Server action calls `serverGetJson()` which builds backend URL (`BACKEND_API_URL`) and fetches proxied backend JSON via Next.js `app/api` proxy.
4. `Lib/adapters.ts` adapts the raw backend shape into UI-friendly models.
5. UI primitives render adapted models; shared components (Panel, GenericTable) handle presentation consistently.
6. React Query + QueryProvider handles caching, persistence, and revalidation according to `cacheConfig`.

---

**How the pieces fit (short)**

- `app/*` server pages: entry points, occasionally call `prefetchQueries()` to hydrate the client cache.
- `features/*`: encapsulated feature code (hooks, components, local api adapter), exported via `index.ts` where applicable.
- `actions/*`: server-layer helpers that read from backend via `Lib/server-client.ts`.
- `Lib/*`: cross-cutting utilities, adapters, queryKeys, and prefetch helpers.
- `components/*` and `_Components/*`: small shared UI primitives used across features.

---

**Where to look next**

- Start with the `features/` folder for feature-specific logic and `Lib/adapters.ts` for mapping rules.
- Review `app/home/page.tsx` to understand server-prefetch + streaming interaction and `HydrationBoundary` usage.
- Inspect `features/race-detail/hooks/useRaceDetail.ts` for examples of gating heavy queries and `useQueries` usage.

---

If you want, I can now:

- Expand any feature section with deeper per-file summaries and exported symbols (props, types) per file.
- Produce a cross-reference table mapping every action → adapter → hook → component.

(Generated from repository scan on May 12, 2026.)

---

**Detailed Feature Mappings**

Below are explicit action → endpoint → adapter → hook → component mappings for the primary features. This is intended as a developer-facing cross-reference so you can trace any UI field back to the server call and the adapter that shapes it.

**Season Hub**

- Actions: [actions/season-hub.ts](actions/season-hub.ts)
  - `getSeasonSchedule(year)` → backend: `/races/{year}/` → adapter: `adaptSeasonSchedule` ([Lib/adapters.ts](Lib/adapters.ts)) → hook: `useSeasonSchedule(year)` ([features/season-hub/hooks/useSeasonHub.ts](features/season-hub/hooks/useSeasonHub.ts)) → consumers: calendar components ([features/season-hub/components/CalendarPanel.tsx](features/season-hub/components/CalendarPanel.tsx)), `HomePageShell` ([features/home/HomePage.tsx](features/home/HomePage.tsx)).
  - `getDriverStandings(year)` → backend: `/drivers/{year}/` → adapter: `adaptDriverStandings` ([Lib/adapters.ts](Lib/adapters.ts)) → hook: `useDriverStandings(year)` → consumers: `RightColumnPanels` ([features/home/components/RightColumnPanels.tsx](features/home/components/RightColumnPanels.tsx)), `DriversHubPage` ([features/drivers-hub/DriversHubPage.tsx](features/drivers-hub/DriversHubPage.tsx)).
  - `getConstructorStandings(year)` → backend: `/constructors/{year}/` → adapter: `adaptConstructorStandings` → hook: `useConstructorStandings(year)` → consumers: `RightColumnPanels`, `HomePageShell`.

**Home (Race Control)**

- Composition: server-prefetch in [app/home/page.tsx](app/home/page.tsx) → client shell [features/home/HomePage.tsx](features/home/HomePage.tsx).
- Hooks used and mapping:
  - `useSeasonSchedule` → `getSeasonSchedule` (see above) → `adaptSeasonSchedule` → calendar UI.
  - `useDriverStandings` → `getDriverStandings` → `adaptDriverStandings` → `RightColumnPanels` / standings tables.
  - `useRaceDetail(year, round)` → `getRaceDetail(year, round)` ([actions/race-detail.ts](actions/race-detail.ts)) → backend: `/races/{year}/{round}/` → adapter: `adaptRaceDetail` → consumers: `LastRacePanel`, `RaceHeader`.
  - `useRaceResults(year, round)` → `getRaceResults` → `/races/{year}/{round}/results/` → adapter: `adaptRaceResults` → `LastRacePanel` / results views.
  - `useRaceWeather` / `useRaceIncidents` → unified endpoints (`/unified/.../weather/`, `/unified/.../incidents/`) via [actions/unified.ts](actions/unified.ts) → adapters `adaptWeather`, `adaptIncidents`.

**Drivers Hub**

- Hook: `useDriverStandings(year)` → `getDriverStandings` → `/drivers/{year}/` → `adaptDriverStandings` → consumer: [features/drivers-hub/DriversHubPage.tsx](features/drivers-hub/DriversHubPage.tsx).
- Fallback: when standings not available the page uses the local static driver list in [Lib/data/drivers.ts](Lib/data/drivers.ts).

**Driver Record**

- Actions: [actions/driver-record.ts](actions/driver-record.ts)
  - `getDriverCareer(driverCode)` → `/drivers/{driverCode}/career/` → consumed by `useDriverCareer` ([features/driver-record/hooks/useDriverRecord.ts](features/driver-record/hooks/useDriverRecord.ts)) → consumer: `DriverRecordShell` ([features/driver-record/components/DriverRecordShell.tsx](features/driver-record/components/DriverRecordShell.tsx)). Note: career response is passed through to components (no single `Lib/adapters` transform required in current code — components expect the `DriverCareerResponse` shape).
  - `getDriverSeasonBreakdown(driverCode, year)` → `/drivers/{driverCode}/{year}/` → `useDriverSeason` → consumed by season breakdown components (`CareerTimeline`, `CareerTotalsStrip`).

**Race Detail**

- Actions: [actions/race-detail.ts](actions/race-detail.ts)
  - `getRaceDetail(year, round)` → `/races/{year}/{round}/` → `adaptRaceDetail` → `useRaceDetail` → `RaceDetailShell`.
  - `getRaceResults`,`getQualifyingResults`,`getPracticeResults`,`getSprintResults`,`getSprintShootoutResults` → respective `/races/.../results|qualifying|practice/...|sprint/` endpoints → adapters: `adaptRaceResults`, `adaptBundledQualifyingResults`, etc. → hooks: `useRaceResults`, `useQualifyingResults`, `usePracticeResults`, `useSprintResults`.
- Unified session data: [actions/unified.ts](actions/unified.ts)
  - `getUnifiedPositions`, `getUnifiedIncidents`, `getUnifiedPitStops`, `getUnifiedWeather`, `getUnifiedDrs`, `getUnifiedTrackStatus` → endpoints under `/unified/races/{year}/{round}/.../` → consumed by hooks in `useRaceDetail` and heavy opt-in `useReplayData` (positions/incidents/pit-stops) via `useQueries`.

**Race Analysis**

- Actions: [actions/race-analysis.ts](actions/race-analysis.ts)
  - `getLapsAnalysis`, `getStintsAnalysis`, `getPaceAnalysis`, `getTyreStrategyAnalysis`, `getSectorAnalysis`, `getTelemetry*` → endpoints under `/analysis/races/{year}/{round}/...` → hooks in `features/race-analysis` call these and components render charts and telemetry overlays.

**Shared / Cross-cutting**

- Query keys: centralized in [Lib/queryKeys.ts](Lib/queryKeys.ts) — all feature hooks use these keys (see `driverStandings`, `schedule`, `raceResults`, `sessionData`, `telemetry`, `lapAnalysis`).
- Fetch: all server actions call `serverGetJson()` ([Lib/server-client.ts](Lib/server-client.ts)) which builds the proxied URL and logs request/response details.
- Adapters: `Lib/adapters.ts` contains most transforms (`adaptSeasonSchedule`, `adaptRaceDetail`, `adaptRaceResults`, `adaptDriverStandings`, `adaptConstructorStandings`, plus many helpers used by features).

**Cross-reference: actions → backend endpoints (quick list)**

- `actions/season-hub.ts`:
  - `getSeasonSchedule(year)` → `/races/{year}/`
  - `getDriverStandings(year)` → `/drivers/{year}/`
  - `getConstructorStandings(year)` → `/constructors/{year}/`
- `actions/race-detail.ts`:
  - `getRaceDetail(year, round)` → `/races/{year}/{round}/`
  - `getRaceResults(year, round)` → `/races/{year}/{round}/results/`
  - `getQualifyingResults(year, round)` → `/races/{year}/{round}/qualifying/`
  - `getPracticeResults(year, round, session)` → `/races/{year}/{round}/practice/{session}/`
  - `getSprintResults(year, round)` → `/races/{year}/{round}/sprint/`
- `actions/unified.ts` (session data): `/unified/races/{year}/{round}/[positions|incidents|pit-stops|weather|track-status|drs|full-session]/`
- `actions/driver-record.ts`:
  - `getDriverCareer(code)` → `/drivers/{code}/career/`
  - `getDriverSeasonBreakdown(code, year)` → `/drivers/{code}/{year}/`
- `actions/race-analysis.ts`:
  - `/analysis/races/{year}/{round}/[laps|stints|pace|tyre-strategy|sector-analysis|telemetry|telemetry/overlay|telemetry/summary]/`

**Notes & developer tips**

- Heavy replay and telemetry queries are opt-in and use `cacheConfig.heavyOptIn` to avoid accidental client downloads. See `useReplayData` in [features/race-detail/hooks/useRaceDetail.ts](features/race-detail/hooks/useRaceDetail.ts).
- If you need to trace a UI cell to the backend, follow: component → hook → actions/ → `serverGetJson()` → backend endpoint. Use `queryKeys` to find cache entries during runtime.

**Next steps I can take (optional)**

- Expand each feature section into a per-file exported symbol list (props/types) and add direct links to the most relevant component props.
- Produce a CSV/TSV cross-reference mapping for quick programmatic import.

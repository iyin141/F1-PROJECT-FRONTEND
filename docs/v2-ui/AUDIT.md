# F1 Control Room UI: audit for v2

Scope: `v2/ui` worktree, cut from `master` (`2e6b16c`). Plan: `docs/v2/plans/02_F1_CONTROL_ROOM_UI.md` in the backend repo: "keep its routing and data layer, migrate page by page".

The repo journals (`CODEBASE_JOURNAL.md`, `FOLDER_STRUCTURE_JOURNAL.md`) are stale in places: they describe an `actions/` folder and `Lib/server-client.ts` that are not in git (the original checkout has an untracked `actions/`; nothing in this tree imports it). The real data layer is `Lib/api_services` + `Lib/queryFunctions` + `Lib/queryKeys.ts`. Treat this file as the current map.

## 1. What exists

Stack: Next 16.2 (App Router, Turbopack), React 19.2, Tailwind 4 (tokens as HSL custom properties in `app/globals.css`), TanStack Query 5 with an IndexedDB persister, next-themes (class `dark` on `<html>`), Radix primitives, Recharts 2 for every chart, GSAP + Framer Motion for motion, d3 7 (bundle) for a few helpers, Zustand for a nav store. Fonts: Bebas Neue (display), DM Sans, DM Mono.

### Routes (`app/`)

| Route | Feature module | Notes |
|---|---|---|
| `/` | `features/home` | landing, schedule, standings |
| `/season/[year]` | `features/season-hub` | calendar, standings |
| `/race/[year]/[round]` | `features/race-detail` | tabs: overview, race, sprint, qualifying, practice, replay (a GSAP position-by-lap scrubber, not 3D), driver record |
| `/race/[year]/[round]/analysis` | `features/race-analysis` | laps, pace, tyre strategy, positions, telemetry overlay and per-driver telemetry (Recharts) |
| `/drivers`, `/drivers/year/[year]`, `/drivers/[driverCode]`, `/drivers/[driverCode]/[year]`, `/driver-record` | `features/drivers-hub`, `features/driver-record` | |
| `/api/**` | route handlers | 17 thin proxies to the Django backend |

Note the plan's URLs use `/races/...` (plural); the app uses `/race/...` (singular).

### Data layer

1. UI hooks (`features/*/hooks`, `hooks/usePersistentQuery.ts`) call
2. `Lib/queryFunctions/*` (normalise session codes, shape params) which call
3. `Lib/api_services/*` (`fetch('/api/...')` same-origin, extract errors; `getAnalysis(year, round, endpoint, params)` is the generic fetcher) which hit
4. `app/api/**` route handlers, which call `proxyToBackend` (`Lib/api/proxy.ts`): forwards to `BACKEND_URL`, injects the server-only `INTERNAL_API_KEY` as `X-API-Key`, strips cookies, streams the body back.

`app/api/analysis/races/[year]/[round]/[[...slug]]/route.ts` and the `unified` twin are catch-alls: any analysis sub-path plus the full query string is forwarded. So `track-map/`, `mini-sectors/`, `telemetry/delta/` and the new `start_m`/`end_m`/`channels`/`format` params already pass through with no new route. `/api/chaos/*` and `/api/assistant/*` have no route yet.
Query keys and cache presets live in `Lib/queryKeys.ts` (`historical`, `activeSeason`, `completedRace`, `raceSession`, `heavyOptIn`). Response types are hand-written in `types/endpoints/*`.

Providers: `_Stores/QueryProvider.tsx` (PersistQueryClientProvider, IDB persister, 5 min stale, no refetch on focus) inside next-themes `ThemeProvider`, inside `app/layout.tsx` with a fixed left `Sidebar` (15% width).

## 2. Plan pages against the codebase

### 2.1 Race hub `/races/[year]/[round]`: MIGRATE

| Existing | Verdict | Reason |
|---|---|---|
| `features/race-detail/hooks/useRaceDetail.ts`, `useRaceAnalysis` hooks for results, stints, weather, positions, incidents | **keep** | They are the data layer the plan says to keep. The hub's Results/Strategy/Positions/Weather/Incidents tabs reuse them. |
| `RaceDetail.tsx`, `RaceTabs.tsx` (Radix tabs) and tab components | **keep as legacy, build the hub beside it** | Shipping a new route at `/races/...` leaves `/race/...` working during the migration. The tab set differs (plan: Results, Strategy, Positions, Weather, Incidents); copying components risks the "no visual drift" rule in `UI_MIGRATION_CHECKLIST.md`, so U1b composes new panels and redirects `/race/...` to `/races/...` only when parity is reached. |
| `PositionChart`, `TyreStrategyPanel`, `PaceDistribution` (Recharts) | **replace in the hub** with ECharts; keep the Recharts versions on the legacy analysis page until it is retired | Plan fixes ECharts for stints, positions, heat strip. |
| `Lib/circuitSvg.ts` + `Lib/data/f1-circuits.json` (static circuit SVGs) | **keep as the fallback/poster**, replaced by the API-driven `TrackMap` | The new `track-map` endpoint gives real geometry, corners and mini-sectors. |
| `components/Sidebar.tsx` | **migrate** | Add Chaos, Stewards links and the new race routes in U1b; the Tailwind sidebar stays until all pages move. |
| Track map, chaos meter, heat strip | **new** | Not present. |

### 2.2 Telemetry lab `/races/[year]/[round]/telemetry`: REPLACE

`features/race-analysis/components/TelemetryOverlay.tsx` (175 lines) and `DriverTelemetryPanel.tsx` (488 lines) draw Recharts SVG from row-shaped JSON (an array of point objects, one object per sample). That cannot hold 60 fps while scrubbing three or four laps.

- **keep**: the services `getTelemetry`, `getTelemetryOverlay`, `getTelemetrySummary` and their keys (existing page keeps working), `DriverSelect`, lap helpers in `Lib/utils/lapFilters.ts`, `features/race-analysis/utils/*` (lap time derivation, outlier filter).
- **replace**: charting (uPlot, one plot per channel, synced cursor), the decode path (columnar JSON in a worker), and the controls (driver picker for 2-4 drivers, lap picker, brush).
- **new**: `delta` trace, mini track map with scrub marker, `start_m`/`end_m`/`channels`/`format=columnar` request builder.
- Query cache: telemetry must not go into the IndexedDB persister (a lap is 20-65 kB per driver, and columnar arrays are not worth rehydrating); v2 queries are tagged `meta: { persist: false }` and `QueryProvider` gets a `dehydrateOptions.shouldDehydrateQuery` filter (done in this phase).

### 2.3 Chaos `/chaos`: NEW

Nothing exists. Needs a proxy route (`app/api/chaos/[[...slug]]`), a typed client, ECharts for the calibration plot, heat strip, small multiples, and a model-card page. No legacy to migrate.

### 2.4 Stewards `/stewards`: NEW

Nothing exists. Needs `app/api/assistant/[[...slug]]` that streams SSE (POST for `ask`, GET for reconnect). `proxyToBackend` already returns `res.body` untouched, so SSE flows through, but it sets no `Cache-Control: no-cache` and `X-Accel-Buffering`; the new route adds them. Orb states map to SSE `status.phase` (queued, solving, searching, composing). `EventSource` cannot POST, so the client reads the stream with `fetch` + `ReadableStream` (built in this phase as `Lib/api/v2/sse.ts`).

### 2.5 3D replay `/races/[year]/[round]/3d`: NEW

`features/race-detail/components/ReplayTab.tsx` and `hooks/useRaceReplay.ts` are a lap-by-lap position scrubber (GSAP), unrelated to 3D. Keep as is. The 3D page is new; react-three-fiber and drei are deferred to U1f (not installed now). Track ribbon data comes from `track-map` `points.x/y/z`.

## 3. Cross-cutting: keep, migrate, replace

| Area | Verdict | Reason |
|---|---|---|
| App Router layout, `proxy.ts` (rewrites for `/api/drivers/{year}`), route handlers | keep | Works; the plan says keep routing. |
| `Lib/api/proxy.ts`, `Lib/api/config.ts` | keep, extend | Key injection stays server-side. Add the mock switch in front of it (see 4). |
| `Lib/api_services/*`, `Lib/queryFunctions/*`, `Lib/queryKeys.ts` | keep | Existing pages depend on them. v2 code lives in `Lib/api/v2/` and adds keys under a `v2` namespace, so nothing existing changes. |
| `types/endpoints/*` | keep | Hand-written, loosely `any` in places; v2 types are generated from OpenAPI instead. |
| `_Stores/QueryProvider.tsx` | keep, patch | Already a TanStack provider. Patch: do not persist `meta.persist === false` queries. The v2 `QueryProvider` the plan asks for is therefore this one. |
| Tailwind 4 tokens in `app/globals.css` | keep for legacy; v2 tokens added in a scoped file | Rewriting globals would change every legacy page. v2 tokens live in `styles/v2-tokens.css` scoped to `.v2` and keyed off the same `dark` class next-themes already sets. |
| Fonts (Bebas Neue, DM Sans, DM Mono) | keep Bebas Neue as an option, add a condensed face with tabular figures for numbers | See DESIGN in `docs/v2-ui/PROGRESS.md`. |
| Recharts | keep on legacy pages, no new Recharts use | Plan replaces it with uPlot/ECharts. Remove from `package.json` when the last legacy chart goes. |
| GSAP | keep (legacy replay scrubber), do not use in v2 | Framer Motion is the plan's motion library. |
| `components/*`, `_Components/ui/*` (Tailwind primitives) | keep for legacy, do not extend | New primitives are Astryx + StyleX. Two styling systems coexist until migration ends. |
| Radix primitives | keep for legacy | Astryx ships its own accessible components. |
| `next.config.ts` | extend | Needs `output: "standalone"` (plan, Docker) in U1g; StyleX PostCSS plugin now. |
| Journals and checklists | update `FOLDER_STRUCTURE_JOURNAL.md` pointers in U1b | They mention folders that do not exist. Not touched in this phase. |
| Stray artefacts in repo root (`*_test.json`, `yh.json`, `PHASE_3_GUIDE.html`, build logs) | leave | Not in the UI's path; flag to orchestrator as hygiene. |

## 4. Decisions taken in this phase

- **Mock layer: Next route handlers, not MSW.** The app already reaches the backend through same-origin `/api/*` route handlers. Serving fixtures from those same handlers (switched by `NEXT_PUBLIC_API_MODE=mock|live`) means the browser code path is identical in both modes, SSE is a plain `ReadableStream` (MSW's SSE support in browsers is thinner and needs a service worker file in `public/`), nothing extra ships to the client, and `next build` / Playwright runs need no service-worker bootstrap. Cost: mock mode needs the Next server, which is always running anyway. Existing endpoints are never mocked; they keep proxying exactly as before.
- **Typed client from OpenAPI.** `openapi-typescript` generates `Lib/api/v2/schema.d.ts` from a vendored copy of `openapi-v2.yaml` (`docs/v2-ui/openapi-v2.yaml`). The spec types most v2 payload fields as bare `object`, so precise payload types are hand-written in `Lib/api/v2/payloads.ts` from the backend progress notes and serializers, with fixtures validated against them at compile time.
- **Feature folders** follow the repo convention: `features/<name>/{components,hooks,types}`, shared v2 primitives in `components/v2/`.

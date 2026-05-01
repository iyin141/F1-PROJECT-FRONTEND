# F1 Control Room Codebase Journal

Last updated: 2026-04-29
Scope: [f1-project-frontend/](.)

This journal is a living technical map of the workspace. It complements [FOLDER_STRUCTURE_JOURNAL.md](FOLDER_STRUCTURE_JOURNAL.md) by documenting how the code actually behaves today: runtime setup, data flow, feature boundaries, conventions, risks, and suggested next evolutions.

## 1) Executive Overview

The workspace currently contains two frontend tracks:

1. Main application (primary): Next.js App Router project at repo root.
2. Secondary/prototype track: [test-ui-5/](test-ui-5/) with its own Next.js setup and dependency graph.

The primary app already has a solid typed data-access layer and React Query strategy, while much of route-level UI remains scaffolded. In short: data foundation is ahead of visual/page composition.

## 2) Runtime and Tooling Baseline

Primary app baseline:

- Framework: Next.js 16.2.x
- React: 19.2.x
- TypeScript: strict mode enabled
- Styling: Tailwind CSS v4 + CSS variables in [app/globals.css](app/globals.css)
- Data state: TanStack React Query v5

Key config files:

- [package.json](package.json)
- [tsconfig.json](tsconfig.json)
- [next.config.ts](next.config.ts)
- [eslint.config.mjs](eslint.config.mjs)
- [postcss.config.mjs](postcss.config.mjs)

Notable convention from agent guidance:

- [AGENTS.md](AGENTS.md) explicitly warns this Next.js version has breaking changes and requires checking docs in node_modules before implementation changes.

## 3) High-Level Architecture

The main application follows a layered pattern:

1. Route/UI layer: [app/](app/) + [features/](features/)
2. Data hooks layer: feature hooks under [features/**/hooks/](features/)
3. Service layer: [Api_services/](Api_services/)
4. API route proxy layer: [app/api/](app/api/)
5. Backend: Django service behind local base URL

Critical request flow:

1. UI component/hook calls service function from [Api_services/](Api_services/).
2. Service function fetches frontend route (for example /api/races/2024/...).
3. Next.js route handler in [app/api/](app/api/) forwards to backend via [app/api/_lib/backend.ts](app/api/_lib/backend.ts).
4. Proxy normalizes payload/errors and returns frontend-safe response.

## 4) Shell, Providers, and App-Wide State

Core shell:

- [app/layout.tsx](app/layout.tsx): loads fonts, applies global classes, wraps app in Query provider.
- [_Stores/QueryProvider.tsx](_Stores/QueryProvider.tsx): creates QueryClient, mounts ReactQueryDevtools in development, seeds theme query cache.

Theme mechanics:

- Theme types + helpers in [Lib/theme.ts](Lib/theme.ts)
- Storage key: localStorage
- Query cache key: [Lib/queryKeys.ts](Lib/queryKeys.ts)
- DOM updates: data-theme and color-scheme set on root element

UI foundation:

- [app/globals.css](app/globals.css) defines dark/light design tokens and atmospheric background treatment.

## 5) API Proxy Layer (Next.js Route Handlers)

Proxy utility:

- [app/api/_lib/backend.ts](app/api/_lib/backend.ts)

Responsibilities:

1. Build backend URL from route path and incoming query parameters.
2. Forward GET requests with no-store cache policy.
3. Normalize backend errors into stable { detail } shapes.
4. Handle non-JSON payload pass-through.
5. Return 502 with clear detail when backend is unreachable.

Representative route handlers:

- [app/api/races/[year]/route.ts](app/api/races/[year]/route.ts)
- [app/api/races/[year]/[round]/route.ts](app/api/races/[year]/[round]/route.ts)
- [app/api/analysis/races/[year]/[round]/telemetry/route.ts](app/api/analysis/races/[year]/[round]/telemetry/route.ts)
- [app/api/unified/races/[year]/[round]/full-session/route.ts](app/api/unified/races/[year]/[round]/full-session/route.ts)

All handlers are dynamic and mostly thin wrappers around proxyBackendGet.

## 6) Service Layer (Typed Data Access)

Index export:

- [Api_services/index.ts](Api_services/index.ts)

Core utility:

- [Api_services/client.ts](Api_services/client.ts)

Service design notes:

1. getJson<T>() provides typed JSON fetch with unified error extraction.
2. withQuery() builds query strings while omitting null/undefined values.
3. Services call frontend /api proxy endpoints (not backend directly).

Domain service modules:

- Season hub: [Api_services/season-hub.ts](Api_services/season-hub.ts)
- Race detail: [Api_services/race-detail.ts](Api_services/race-detail.ts)
- Race analysis: [Api_services/race-analysis.ts](Api_services/race-analysis.ts)
- Unified session data: [Api_services/unified.ts](Api_services/unified.ts)
- Persistence coverage: [Api_services/coverage.ts](Api_services/coverage.ts)

## 7) Query Strategy and Cache Taxonomy

Central query key + cache config registry:

- [Lib/queryKeys.ts](Lib/queryKeys.ts)

This file is a key architectural anchor. It standardizes:

1. Query key factories for races, standings, analysis, unified, coverage, driver, theme.
2. Cache policy presets by data volatility and payload cost.

Cache policy presets currently used:

- historical
- activeSeason
- heavyOptIn
- coverage
- driverHistorical
- driverActive
- driverTelemetry
- driverDerived

Practical impact:

- Hook implementations stay consistent and avoid ad-hoc staleTime/gcTime choices.
- Reuse of keys enables cache sharing across features (for example season-hub data reused in driver hooks).

## 8) Feature Layer Status

Feature-first rule is documented in [FOLDER_STRUCTURE_JOURNAL.md](FOLDER_STRUCTURE_JOURNAL.md) and [features/README.md](features/README.md).

### 8.1 Season Hub

Files:

- [features/season-hub/page.tsx](features/season-hub/page.tsx)
- [features/season-hub/hooks/useSeasonHub.ts](features/season-hub/hooks/useSeasonHub.ts)
- [features/season-hub/components/](features/season-hub/components/)

Status:

- Hooks for schedule and standings are in place.
- Page entry is scaffold-level and still basic.
- Theme hook currently co-located in season-hub hooks, though it serves app-wide concern.

### 8.2 Race Detail

Files:

- [features/race-detail/hooks/useRaceDetail.ts](features/race-detail/hooks/useRaceDetail.ts)

Status:

- Strong hook coverage for detail/results/qualifying/practice/weather/incidents.
- Replay data is correctly opt-in via enabled gate due to heavy payloads.

### 8.3 Race Analysis

Files:

- [features/race-analysis/hooks/useRaceAnalysis.ts](features/race-analysis/hooks/useRaceAnalysis.ts)

Status:

- Coverage and analysis hooks are well-structured.
- Telemetry hooks are gated by coverage availability checks.
- Session alias normalization (Race -> R, Qualifying -> Q) is repeated in multiple places and could be centralized.

### 8.4 Driver Record

Files:

- [features/driver-record/hooks/useDriverCareer.ts](features/driver-record/hooks/useDriverCareer.ts)
- [features/driver-record/hooks/useDriverSeason.ts](features/driver-record/hooks/useDriverSeason.ts)
- [features/driver-record/hooks/useDriverAnalysis.ts](features/driver-record/hooks/useDriverAnalysis.ts)
- [features/driver-record/hooks/useDriverTelemetry.ts](features/driver-record/hooks/useDriverTelemetry.ts)

Status:

- Good use of cache reuse and query key discipline.
- Driver matching uses surname-prefix heuristics against full names; this may misclassify some drivers.
- Career scan strategy walks years backward with consecutive-miss cutoff, which trades correctness for performance predictably.

## 9) Types and Contracts

Main type hubs:

- [types/api.ts](types/api.ts)
- [types/endpoints/index.ts](types/endpoints/index.ts)
- [types/mvp-api.ts](types/mvp-api.ts)

The endpoint type exports cover race schedule/results, standings, analysis sets, telemetry families, and unified payloads. Service modules map cleanly to these contracts.

## 10) Route and Page Maturity Snapshot

Primary route entry:

- [app/page.tsx](app/page.tsx)

Current maturity indicators:

1. Root page is scaffold/restoration-oriented and intentionally simple.
2. Development-only hooks playground route exists in [app/dev/hooks/page.tsx](app/dev/hooks/page.tsx).
3. Data stack appears production-oriented earlier than visual feature completion.

## 11) Environment and Endpoint Configuration

Config source:

- [Lib/api/config.ts](Lib/api/config.ts)

Defaults:

- Public API base: http://localhost:8000/api
- Backend base: http://localhost:8000

Design intent:

- Frontend code should consume /api proxy routes.
- Backend host remains configurable via environment variables.

## 12) Secondary Workspace Track: test-ui-5

The [test-ui-5/](test-ui-5/) folder is a separate Next.js project with distinct dependencies, scripts, and UI ecosystem components.

Reference files:

- [test-ui-5/package.json](test-ui-5/package.json)
- [test-ui-5/README.md](test-ui-5/README.md)

Important implications:

1. It should be treated as independent unless you explicitly decide to merge.
2. Dependency versions and React major version differ from main app.
3. Build/lint commands in this folder are separate from root workspace commands.

## 13) Strengths Observed

1. Clear layered data architecture (hooks -> services -> proxy -> backend).
2. Centralized query key and cache policy management.
3. Strong typed endpoint boundaries and service signatures.
4. Sensible heavy-data gating patterns around telemetry/replay datasets.
5. Feature-first module intent is documented and mostly followed.

## 14) Current Friction Points and Risks

1. Root-level user-facing pages are still thin compared to backend/hook maturity.
2. Cross-feature utilities (theme behavior, session normalization) are partly duplicated or placed in feature-local files.
3. Driver identity heuristic (surname prefix) can break for edge names and alternate naming formats.
4. Two frontend projects in one repo can create workflow ambiguity if boundaries are not explicit.
5. Some docs/readmes are scaffold-level and do not yet describe operational workflows deeply.

## 15) Suggested Evolution Path

Priority order for stabilization:

1. Introduce a shared driver identity utility using stable backend identifiers where possible.
2. Move app-wide theme hooks/utilities from season-hub hook file into dedicated shared domain (for example Lib or Hooks).
3. Centralize session label normalization in one helper to remove duplication.
4. Expand route-level pages to consume existing hook infrastructure fully.
5. Decide long-term role of [test-ui-5/](test-ui-5/) and document whether it is sandbox, migration target, or archive.

## 16) Contributor Quick Map

If you are adding a new feature:

1. Create/extend module in [features/](features/).
2. Add data calls in [Api_services/](Api_services/).
3. Add/extend endpoint response types in [types/endpoints/](types/endpoints/).
4. Register query keys/cache usage in [Lib/queryKeys.ts](Lib/queryKeys.ts).
5. Wire route entry in [app/](app/) and keep page-level orchestration thin.

If you are adding backend endpoint support:

1. Add route handler under [app/api/](app/api/) (proxyBackendGet pattern).
2. Add typed service function in the appropriate [Api_services/](Api_services/) module.
3. Add/update endpoint types in [types/endpoints/](types/endpoints/).
4. Add hook wrapper in owning feature module.

## 17) Journal Maintenance Rules

To keep this file useful, update it when one of these changes happens:

1. New major feature folder or route tree is introduced.
2. Query key taxonomy or cache policy strategy changes.
3. New API domain or transport pattern is added.
4. Build/runtime baseline changes (Next/React major version, monorepo move, etc.).
5. test-ui-5 status changes materially (merge/deprecate/replace).

Suggested update cadence:

- Lightweight pass each sprint
- Deep pass before major release or architectural refactor

---

Related documents:

- [FOLDER_STRUCTURE_JOURNAL.md](FOLDER_STRUCTURE_JOURNAL.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- [features/README.md](features/README.md)

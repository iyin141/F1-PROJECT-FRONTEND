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
2. Data hooks layer: feature hooks under [features/\*\*/hooks/](features/)
3. Service layer: [actions/](actions/)
4. API route proxy layer: [app/api/](app/api/)
5. Backend: Django service behind local base URL

Critical request flow:

1. UI component/hook calls service function from [actions/](actions/).
2. Service function (or server action) calls backend endpoints directly (via `Lib/server-client`).
3. Next.js route handler in [app/api/](app/api/) forwards to backend via [app/api/\_lib/backend.ts](app/api/_lib/backend.ts).
4. Proxy normalizes payload/errors and returns frontend-safe response.

## 4) Shell, Providers, and App-Wide State

Core shell:

- [app/layout.tsx](app/layout.tsx): loads fonts, applies global classes, wraps app in Query provider.
- [\_Stores/QueryProvider.tsx](_Stores/QueryProvider.tsx): creates QueryClient, mounts ReactQueryDevtools in development, seeds theme query cache.

Theme mechanics:

- Theme types + helpers in [Lib/theme.ts](Lib/theme.ts)
- Storage key: localStorage
- Query cache key: [Lib/queryKeys.ts](Lib/queryKeys.ts)
- DOM updates: data-theme and color-scheme set on root element

UI foundation:

- [app/globals.css](app/globals.css) defines dark/light design tokens and atmospheric background treatment.

## 5) API Proxy Layer (Next.js Route Handlers)

Proxy utility:

- [app/api/\_lib/backend.ts](app/api/_lib/backend.ts)

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

- [actions/index.ts](actions/index.ts)

Core utility:

- [Lib/server-client.ts](Lib/server-client.ts)

Service design notes:

1. getJson<T>() provides typed JSON fetch with unified error extraction.
2. withQuery() builds query strings while omitting null/undefined values.
3. Services call frontend /api proxy endpoints (not backend directly).

Domain service modules:

- Season hub: [actions/season-hub.ts](actions/season-hub.ts)
- Race detail: [actions/race-detail.ts](actions/race-detail.ts)
- Race analysis: [actions/race-analysis.ts](actions/race-analysis.ts)
- Unified session data: [actions/unified.ts](actions/unified.ts)
- Persistence coverage: [actions/coverage.ts](actions/coverage.ts)

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
2. Add data calls in [actions/](actions/).
3. Add/extend endpoint response types in [types/endpoints/](types/endpoints/).
4. Register query keys/cache usage in [Lib/queryKeys.ts](Lib/queryKeys.ts).
5. Wire route entry in [app/](app/) and keep page-level orchestration thin.

If you are adding backend endpoint support:

1. Add route handler under [app/api/](app/api/) (proxyBackendGet pattern).
2. Add typed service function in the appropriate [actions/](actions/) module.
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

## 19) Comprehensive Reference — End-to-End Flow, Runtime, and Dependencies

Purpose: a compact, actionable reference for developers to understand the entire app lifecycle (local dev → build → runtime), where data flows end-to-end, the key code locations to change when adding features, and the full dependency manifest used by the project.

**Quick facts**

- Framework: `Next.js` app router (version ^16.2.4). Turbopack is configured in `next.config.ts`.
- React: `19.2.4` (concurrent features enabled by Next.js app router).
- TypeScript: `^5` (strict mode enabled in `tsconfig.json`).
- Styling: `Tailwind CSS v4` with tokens in `app/globals.css` and `styles/f1-loading.css` for animation helpers.

**Local run / build**

Prerequisites: Node.js (18+ recommended), `npm` (or yarn / pnpm). From the repo root:

```
npm ci
npm run dev      # development server
npm run build    # production build (type-checks, compiles)
npm start        # run production server after build
npm run lint     # run eslint
```

If you change route files or delete `app/api` handlers, remove the `.next` directory before rebuilding to avoid stale generated types: `rm -rf .next` then `npm run build`.

**Environment configuration**

- `NEXT_PUBLIC_API_BASE_URL` — public base URL used by frontend helpers when building proxied fetches (default: `http://localhost:8000/api`). Controlled in `Lib/api/config.ts`.
- `BACKEND_API_URL` — backend host used when calling backend directly (default: `http://localhost:8000`).
- `NODE_ENV` — standard Node environment guard for dev/production logic.

No other runtime secrets are embedded in the repository; if you add private keys or tokens, use environment variables injected by your CI/CD provider or local `.env` files excluded from VCS.

**End-to-end request flow (typical page load + data fetch)**

1. Browser navigates to a route in the `app/` tree (for example `/home/2026`).
2. Next.js server renders the route. Many pages use server components with Suspense streaming; see `app/home/[year]/page.tsx` for an example of streaming composition.
3. Page shells (server or client) render UI and mount client components where needed. Example client shell: `features/home/HomePageClient.tsx`. Full shell: `features/home/HomePage.tsx`.
4. UI components request data via feature hooks (under `features/*/hooks/`). Hooks use `@tanstack/react-query` and call typed service functions in `actions/*`.
5. `actions/*` modules are thin server-action-like wrappers that call `Lib/server-client.ts::serverGetJson()` to fetch JSON. The actions represent the feature-level data contract surface.
6. `Lib/server-client.ts` builds the final URL from `Lib/api/config.ts` and performs `fetch()` with `cache: 'no-store'` for server-side reads. It returns typed JSON or `{}` on empty/error responses. (This file now includes request/response logging for debugging.)
7. Depending on configuration, `serverGetJson` targets either the backend directly (`BACKEND_API_URL`) or a Next.js proxy under `app/api/*` which forwards to the backend and normalizes responses.
8. Backend (Django) responds with JSON; responses are adapted by `Lib/adapters.ts` into UI-friendly shapes and returned through hooks into components.
9. Components render using React Query caching strategy (see `Lib/queryKeys.ts`) and present data. Loading fallbacks use `components/animations/SectionLoadingAnimations.tsx`.

**Key code locations (quick map)**

- App router / pages: `app/` — route entrypoints, streaming layout composition, route handlers.
- Feature UI + hooks: `features/<feature>/` — components, hooks, subfeatures. Example features: `season-hub`, `race-detail`, `race-analysis`, `driver-record`.
- Actions (service layer): `actions/` — `actions/season-hub.ts`, `actions/race-detail.ts`, `actions/race-analysis.ts`, `actions/unified.ts`, `actions/driver-record.ts`, plus `actions/index.ts` barrel.
- Request primitive: `Lib/server-client.ts` — the centralized request helper and logging insertion point.
- Adapters & utilities: `Lib/adapters.ts`, `Lib/queryKeys.ts`, `Lib/prefetch.ts`, `Lib/site.ts`, `Lib/theme.ts`.
- Shared UI: `components/` — `Panel.tsx`, `F1LoadingState.tsx`, `ui/YearNavigator.tsx`, animation fallbacks in `components/animations/SectionLoadingAnimations.tsx`.
- Types: `types/` and `types/endpoints/` — typed endpoint contracts and UI types.
- Static assets: `public/` and `public/circuits`.

**Suspense & loading fallbacks**

- App-level streaming is used in many pages; Suspense fallbacks are wired to shared animation components under `components/animations/SectionLoadingAnimations.tsx` and lightweight loading state components like `components/ui/F1LoadingState.tsx`.
- Loading fallbacks are used in `app/*/loading.tsx` and as inline `Suspense` `fallback` props for sections.

**Dependencies (from `package.json`)**

Core runtime:

- `next` ^16.2.4 — App Router, Server Components, Turbopack support. Primary framework.
- `react` 19.2.4 / `react-dom` 19.2.4 — UI library.

Data + app state:

- `@tanstack/react-query` ^5.100.6 — data fetching and cache.
- `@tanstack/react-query-devtools` ^5.100.6 — devtools for caching.
- `@tanstack/query-async-storage-persister`, `@tanstack/react-query-persist-client` ^5.100.x — optional persistence helpers.
- `@supabase/supabase-js` ^2.103.3 — optional persistence/analytics (used where persisting to async storage is needed).

UI primitives & animation:

- `@radix-ui/*` (dialog, select, slider, switch, tabs, tooltip) — accessible primitives used across UI.
- `lucide-react` ^1.14.0 — icon set used for controls (chevrons, etc.).
- `framer-motion` ^12.38.0, `gsap` ^3.15.0 — motion/animation libraries used in heavy interactions (replay, telemetry).
- `d3` ^7.9.0 — data visualization utilities used by analysis/telemetry.

Utilities & styling:

- `clsx` ^2.1.1, `tailwind-merge` ^3.5.0 — classnames and tailwind helpers.
- `tailwindcss` ^4, `@tailwindcss/postcss` ^4 — styling stack.

Storage & helpers:

- `idb-keyval` ^6.2.2 — small wrapper for IndexedDB (used by offline/persist features).

Dev / build tooling (devDependencies):

- `typescript` ^5 — static typing.
- `eslint` ^9 and `eslint-config-next` 16.2.2 — linting rules and config.
- `@types/*` packages for `d3`, `node`, `react`, `react-dom`.

Notes:

- Many packages are current major versions; validate compatibility when upgrading Next.js or React major versions.
- Turbopack is enabled in `next.config.ts`; if you encounter devserver Turbopack issues during upgrades, consider switching to webpack temporarily or checking Next.js migration docs included in `node_modules/next/dist/docs/`.

**Build & CI recommendations**

- Recommended CI steps:
  1.  `npm ci`
  2.  `npm run lint`
  3.  `npm run build`
  4.  Run any smoke tests / E2E tests (not included by default)

- If deploying to Vercel, the default `next build` and `next start` model applies; ensure `NEXT_PUBLIC_API_BASE_URL` and `BACKEND_API_URL` are set in environment variables.

**Testing & QA**

- The repo currently has no test runner script or test directory. Consider adding:
  - `vitest` or `jest` for unit tests
  - `cypress` or `playwright` for E2E tests

Example local verification checklist:

1. `npm ci && npm run build` — validates TypeScript and route/type generation.
2. Run dev server and navigate to `/home/2026`, `/race/2026/1`, `/drivers` and key pages to perform manual smoke checks.
3. Inspect browser console for the new animation logs (`[animation] mount ...`) and request logs (`[serverGetJson] request ...`) to validate loading and backend calls.

**Operational notes & known issues**

- Migration notes: this workspace migrated from a previous `Api_services/` layer to `actions/` and removed several `app/api` proxy handlers. When route handlers are deleted, stale `.next` types may cause transient type errors — remove `.next` and rebuild to regenerate types.
- If you delete or rename route handlers in `app/api`, run a full build after wiping `.next` to avoid stale route type artifacts.
- The home page previously showed missing slider controls due to a split ownership between `HomePageClient` and `HomePageShell`. This was fixed by mounting `HomePageShell` for `/home/[year]` and updating navigation to use `/home/{year}`.

**How to add a new feature endpoint**

1. Add endpoint contract types in `types/endpoints/` if the backend returns new shapes.
2. Add a thin action in `actions/` that calls `serverGetJson()` with the new path and typed return value.
3. Add a hook wrapper under the owning feature `features/<feature>/hooks/` that uses `@tanstack/react-query` with keys from `Lib/queryKeys.ts`.
4. Add a UI component under `features/<feature>/components/` and wire it into the route under `app/`.
5. Add or update `app/*/loading.tsx` with an appropriate fallback animation if the route uses streaming.

**Where to find things quickly**

- App routes & pages: `app/`
- Feature UI & hooks: `features/`
- Service actions: `actions/`
- Request primitive: `Lib/server-client.ts`
- Type contracts: `types/endpoints/`
- Shared components/animations: `components/`
- Build & lint scripts: `package.json`

---

If you'd like, I can now:

- (A) Commit these journal updates and create a PR draft; or
- (B) Run `npm run build` here to validate the changes end-to-end (you can allow me to run the build in this environment); or
- (C) Add a CI config (GitHub Actions) that runs lint + build + smoke tests.

## 18) 2026-05-12 Findings: Home Shell, Sliders, and Logs

Implemented fixes and instrumentation after triaging missing home controls and loading visibility:

1. Home route ownership was consolidated to the full client shell by mounting [features/home/HomePage.tsx](features/home/HomePage.tsx) from [app/home/[year]/page.tsx](app/home/[year]/page.tsx).
2. Year routing mismatch was corrected by introducing `initialYear` in `HomePageShell` and pushing year navigation to `/home/{year}` paths instead of `/home?...` query-only URLs.
3. Shared loading animation instrumentation was added in [components/animations/SectionLoadingAnimations.tsx](components/animations/SectionLoadingAnimations.tsx), with render/mount/unmount console logs via `LoadingShell`.
4. Centralized API call instrumentation was added in [Lib/server-client.ts](Lib/server-client.ts), logging request start, response status, duration, and request errors for every `serverGetJson` call.

Observed root cause for missing race slider:

1. `ArrowSlider` usage existed in `HomePageShell` only, while the active route previously rendered `HomePageClient`, so race/year slider controls were not part of the mounted tree.

Residual risk:

1. This journal still contains historical references to legacy `app/api` proxy guidance in older sections; treat Section 18 as the latest source of truth for this specific fix batch.

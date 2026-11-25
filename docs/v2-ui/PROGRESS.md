# U1a progress: audit and foundation

Branch `v2/ui` (from `master` 2e6b16c). Status: done, awaiting review.

## Commits
1. audit of existing app against the v2 UI plan
2. pinned deps (Astryx core/theme/CLI, StyleX + postcss plugin, uPlot, ECharts, d3-zoom, d3-shape, thinking-orbs, openapi-typescript)
3. typed v2 API client, mock layer, SSE client, telemetry worker stub, no-persist query filter
4. F1 theme, v2 tokens, sandbox page
5. this file, eslint ignores for generated files

## Files
- `docs/v2-ui/AUDIT.md`, `docs/v2-ui/openapi-v2.yaml` (vendored copy)
- `Lib/api/mode.ts`, `Lib/api/v2/{schema.d.ts (generated), payloads.ts, client.ts, queries.ts, sse.ts, telemetryWorkerClient.ts}`
- `Lib/mock/v2/{track,chaos,assistant,index}.ts`; route handlers `app/api/chaos/[[...slug]]`, `app/api/assistant/[[...slug]]`; mock hook added to `app/api/analysis/.../[[...slug]]`
- `workers/telemetry.worker.ts` (columnar decode, typed arrays, transferables; no decimation yet)
- `styles/theme/f1Theme.ts` (+ built `f1.*`, `npm run build:theme`), `styles/v2.css`, `styles/v2-tokens.css`, `Lib/v2/palette.ts`
- `app/(v2)/layout.tsx`, `components/v2/{V2Providers,DriverChip,LiveBadge,Stat,OrbStatus}.tsx`, `features/v2-sandbox/Sandbox.tsx`, page `/v2-sandbox`
- Edited existing: `_Stores/QueryProvider.tsx` (skip `meta.persist === false`), `app/globals.css` (one `@layer` order line at top), `eslint.config.mjs` (ignore generated), `package.json` (+scripts `gen:api`, `build:theme`, `typecheck`).

## Checks
- `tsc --noEmit`: clean.
- `NEXT_PUBLIC_API_MODE=mock npm run build`: passes; `/v2-sandbox` prerendered.
- `npm run lint`: NOT clean, and was not clean before: 163 errors in 32 pre-existing files (mostly `no-explicit-any`). Files I added have 0 errors; the two `any` errors in files I touched (`QueryProvider.tsx`, the analysis proxy route) are original lines.
- Dev server on 3010 (mock mode), HTTP 200: `/v2-sandbox`, `/`, `/season/2024`, `/race/2024/8`; mock `track-map`, `mini-sectors`, `telemetry/delta`, columnar `telemetry` with `start_m/end_m/channels`, `chaos/races`, `chaos/model` return JSON; `POST /api/assistant/ask` streams status, token events (citations and done follow). Not done: visual check in a browser (HTTP only), so light/dark rendering of the sandbox and Barlow Condensed tabular figures are unverified.

## Compatibility findings
- Astryx 0.7.17: React >=19 peer ok (19.2.4), Next 16.2.4 ok in build. Ships prebuilt CSS, so StyleX build plugin is NOT needed for Astryx; `@stylexjs/postcss-plugin` is installed but unused until we write our own StyleX styles. Astryx CLI needs Node >=22.13 (we have 24). `astryx` was not on PATH; use `npx astryx`.
- `astryx init` wrote a 33-line block into AGENTS.md/CLAUDE.md and created GEMINI.md; all reverted/removed. Nothing in those files is changed.
- Astryx `reset.css` is a global `:where(*)` reset in `@layer reset`; to keep legacy Tailwind pages unchanged the layer order line `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;` is first in `globals.css`, and Astryx CSS loads only from the `(v2)` route group. CSS from a route-group layout may stay loaded after client navigation; harmless given the layer order, but re-check legacy visuals in U1b.
- Root Astryx `Theme` writes `data-theme`/`data-astryx-theme` on `<html>`; legacy uses the `dark` class from next-themes, so no clash seen. Mode is bound to next-themes.
- thinking-orbs 0.3.2: React >=18, fine. uPlot, ECharts 6.1, d3-zoom/shape: no peers. `framer-motion` and TanStack Query were already installed (12.38, 5.100.8, unpinned `^`); latest framer-motion on npm is 14.x, not upgraded.
- `npm install` needed a retry (registry served d3-path 3.1.1 intermittently).
- Astryx's `error` status is red; F1 red must still be reserved, so avoid the error variant for non-errors. Accent text and focus rings were re-pointed to sand/charcoal in the theme.

## Decisions
Mock layer = Next route handlers (not MSW), reasons in AUDIT.md section 4. v2 telemetry/delta queries are tagged non-persistent. Fixtures are synthetic and labelled mock (assistant citations say MOCK FIXTURE).

## Open questions
- Race hub URL is `/races/...` in the plan vs existing `/race/...`: redirect at the end of U1b?
- OpenAPI types most v2 bodies as bare `object`; hand-written `payloads.ts` is the real contract. Ask backend to tighten serializers, or accept.
- `/api/assistant/ask` forwards without trailing slash (backend has both).

## Needs from orchestrator
- Decision on the lint baseline (163 legacy errors): fix in a separate cleanup, or relax `no-explicit-any` for legacy folders.
- Confirm `output: "standalone"` timing (planned U1g).

---

# U1b progress: race hub and TrackMap

Status: done, awaiting review. Mock mode only (existing endpoints are not mocked).

## Commits
- lint override (legacy-only relaxations; new code on full rules, `npm run lint` now 0 errors)
- race hub, TrackMap, chaos meter, tabs, telemetry placeholder, classic view move
- follow-ups: neutral tab accent, mock variety, screenshots, this section

## What changed
- Routing: `app/race/[year]/[round]/page.tsx` moved to `/race/[year]/[round]/classic` (legacy Tailwind view, unchanged). The new hub lives at `app/(v2)/race/[year]/[round]/page.tsx` so it gets the Astryx theme; `/race/.../analysis` is untouched. Placeholder `app/(v2)/race/[year]/[round]/telemetry/page.tsx` echoes `drivers`, `lap`, `start_m`, `end_m`.
- `features/race-hub/components/TrackMap.tsx`: one `<path>` per mini-sector coloured by the fastest selected driver; neutral until times load. Corner numbers, dashed DRS zones, d3-zoom (Ctrl/Cmd+wheel, drag, pinch, Reset zoom; reset is instant under reduced motion). Hover or focus fills a polite live readout with each driver's segment time and gap. Roving tabindex: arrow keys move between sectors with a drawn focus ring, Enter/Space/click opens the lab at `/race/Y/R/telemetry?drivers=..&lap=fastest&start_m=..&end_m=..`.
- `ChaosMeter.tsx`: index, p10-p90 band, bars with p10-p90 whiskers, 5-lap heat strip (sand intensity, not red), "Baseline fallback" badge and reason, link to `/chaos/model` (page arrives in U1d). 202 states show an orb (`searching`/`solving`), not a spinner.
- `HubTabs.tsx`: Results, Strategy (ECharts stacked stints by compound), Positions (ECharts lines, dashed repeats), Weather, Incidents; reuse `useRaceResults`, `useTyreStrategy`, `useRacePositions`, `useRaceWeather`, `useRaceIncidents`. Only the active tab mounts. In mock mode these existing endpoints still go to the (absent) backend, so tabs show "not available" there; they were not verified against real data.
- Driver compare chips: top 6 finishers from results, else VER/NOR; 2 to 4 selected.
- Selected-tab underline re-pointed from accent to text colour (`.f1-neutral-accent`), keeping red for the primary button and live states.
- Added exact deps `d3-selection@3.0.0`, `d3-transition@3.0.1` (already present transitively).

## Checks
- tsc clean; lint 0 errors (59 warnings, pre-existing style); build: see final report.
- HTTP 200: `/race/2024/8`, `/classic`, `/analysis`, `/season/2024`, telemetry placeholder with params.
- Playwright is not installed; screenshots via headless Edge: `docs/v2-ui/screens/race-hub-desktop.png` (1440 wide) and `race-hub-narrow-500.png`. Headless Edge cannot go below 500 px wide, so 375 px was NOT captured; at 500 nothing overflows, the layout is a single fluid column below 900 px and the tab list scrolls. Treat 375 as unverified.
- Legacy leakage after v2 -> legacy client navigation: not observed in a browser (no scripted browser). Argument: the layer-order line in `globals.css` puts the Astryx reset below Tailwind's layers, and Astryx component styles use hashed class names, so nothing global applies to legacy markup. Needs a real click-through in U1g.

## Open
- Corner detection in the synthetic circuit finds 5 corners (mock only).
- `package-lock.json` needs `npm install` refresh for the two d3 deps if CI uses `npm ci`.

---

# U1c progress: telemetry lab

Status: done, awaiting review. Mock mode.

## What was built
- `/race/[y]/[r]/telemetry` (page.tsx parses and validates `drivers` (2-4 codes), `lap` (fastest or number), `start_m`, `end_m`; all lab state lives in the URL via `router.replace`).
- `features/telemetry-lab/TelemetryLab.tsx`: driver picker (2-4 toggle chips from the top 10 finishers, else a default list), lap picker (Fastest, or a lap number on Enter/blur), range chip with Reset range.
- `components/TelemetryStack.tsx`: delta trace on top (`telemetry/delta`, first driver is the reference, each other driver is a trace), then speed, throttle, brake, gear, RPM, DRS in uPlot. x = distance, one synced cursor (`uPlot.sync`), corner labels and faint corner lines from the track-map corners (labels on the top and bottom plots), 8% gridlines. Brake, gear and DRS draw as stepped lines. Drag on any chart sets the range.
- `components/MiniMap.tsx`: mini circuit with clickable mini-sectors (click, Enter or Space), the active range highlighted, and a cursor marker.
- Data path: each driver's `telemetry/?format=columnar&channels=speed,throttle,brake,gear,rpm,drs&start_m&end_m` is fetched and decoded in `workers/telemetry.worker.ts` (Float64Array columns, transferred, not copied), cached by TanStack Query with `meta.persist: false`. Brush or sector click changes the URL, which changes the query key and refetches only the sliced range.
- `Lib/v2/decimate.ts`: min/max per-pixel decimation (2 points per CSS pixel; a one-sample spike survives) and a linear resampler for drivers whose distance grids differ. `node Lib/v2/decimate.check.ts` is the runnable check.
- Colours: team colour per driver, second driver of a shared colour dashed (`TEAM_BY_CODE` fallback in `Lib/v2/palette.ts` so teammates match without API data; NOR and PIA show orange solid and dashed). F1 red is not used.
- 202 from `delta` shows an orb ("solving"); loading shows an orb ("searching"). uPlot and the marker have no animation, so reduced motion needs nothing extra.
- No React render on cursor move: uPlot's `setCursor` hook, then one rAF, then direct attribute writes on the mini-map marker and the readout `<output>`.
- `useChartColours` moved to `components/v2/` (race hub re-exports it).

## Performance (rough, headless Edge on this PC, no GPU, mock data 1,500 points x 3 drivers x 7 plots, via CDP, `?bench=1`)
- 300 scripted cursor moves driving all 7 synced plots: avg 0.02-0.06 ms, p95 0.1-0.3 ms of JS per move (timer resolution is 0.1 ms). Far under a 16.7 ms frame.
- Full redraw of 7 plots: 0.2-0.3 ms of JS (canvas rasterisation happens after this and is not captured, so treat it as a lower bound).
- Decimation, node only: 100,000 samples x 6 series to 2,800 points in 5-7 ms warm (20 ms cold).
- Not measured: real frame rate (no GPU or compositor timing here), and decimation inside the browser (mock laps never exceed 2 points per pixel, so it does not engage; it is covered by the node check). Real telemetry will be about the same size (one lap is 400-1,500 samples), so wide-range decimation matters mostly for whole-session pulls.
- Verified in the browser through CDP: hover on a chart moves the mini-map marker and sets the readout (2166 m at 40% of 5,412 m); clicking mini-sector 7 changed the URL to `start_m=1299&end_m=1515` and re-rendered 7 plots.

## Screenshots
`docs/v2-ui/screens/telemetry-lab-desktop.png`, `telemetry-lab-zoomed.png` (start_m 1000, end_m 2000), `telemetry-lab-375.png` (a true 375 px capture via CDP device emulation; `scrollWidth` 375, no horizontal overflow). Earlier headless-Edge limit on narrow widths is bypassed by CDP, so the race hub 375 px capture can be redone the same way.

## Open
- Cursor readout shows distance only; per-driver values at the cursor are not shown (needs a per-plot imperative text; skipped to stay lean).
- The delta compares drivers[0] with each other driver; no picker for the reference.
- Selecting a lap number sends the same lap to every driver, as the API does.
- Mock circuit has 5 corners only, so corner labels are sparse in mock mode.

---

# U1d progress: chaos pages (plus two lab fixes)

Status: done, awaiting review. Mock mode.

## Lab fixes (first commit of the phase)
- Delta reference is explicit and selectable: a "vs" chip row sets `ref` (URL param, default the first driver); one delta line per non-reference driver, in that driver's colour; the caption reads "Delta vs REF: above zero means that driver is slower than REF". Changing the driver set keeps the reference if still selected, else falls back to the first driver.
- Cursor readout lists every driver at the cursor (speed, gear, throttle, braking), built with direct DOM writes inside the existing rAF; values come from the raw columns, not the decimated ones. No React render on scrub. Not re-benchmarked (same path, 3 more lookups per move).

## Pages
- `/chaos` (`?year=&round=` optional; default is the first non-completed round of the current year from the existing schedule hook, else the last, else 1): preview card, circuit history grid, driver tendencies.
  - Preview: model note, Chaos Index with p10 to p90 band and the API's band note, per-target bars with whiskers, top factors (the API's `text`, with Higher or Lower), 5-lap risk strip with a selector for all five targets.
  - Circuit history: `GET /api/chaos/circuits/` lists circuits, then one history call each; small multiples with safety-car share, red-flag share and retirements per race, same scale on every card, sortable by safety cars, red flags, retirements or name.
  - Driver tendencies: quick picks plus a 3-letter code box; p10 to p90 range bar with the tendency marked, races with the event out of races, headline "tendency, not skill" and the API's own label verbatim.
- `/chaos/model`: current runs table, calibration (ECharts reliability diagram per backtest model, dashed perfect line) and a metrics table (Brier, log-loss, AUC, ECE, samples, delta vs the Beta-Binomial baseline) for a chosen prediction cell, then the model card (data, features, models, limitations, changelog; written from the A2 notes, no claims beyond them). The sidebar gets a "Chaos" link.
- Every chaos surface shows the model that produced the numbers (`ModelNote`): model name, run id, training rows, updated date, calibration string, selected-by and interval, a "Fallback: baseline served" badge plus the API's `fallback_reason` banner when `is_fallback`, and an "uncalibrated" notice for a Kumo run without calibration. The race hub's chaos meter already showed the badge.
- Honest states, checked in a browser via `MOCK_CHAOS_STATE=honest` (baseline fallback, identity calibration, `backtest: null`): the preview shows the fallback badge and banner; the model page shows "Calibration is not fitted yet" and "No backtest has run yet" instead of charts.

## Contract notes (for the orchestrator)
- Backtest cells are keyed `"scope|target"` (e.g. `race|sc_vsc_red`) and models are `beta_binomial`, `lightgbm`, `kumo`, per `chaos/backtest.py`; `payloads.ts` was corrected to that (my U1a guess used bare target keys).
- The `model/` response carries only the pooled `overall` metrics. "By season" Brier and log-loss, as the brief asked, cannot be shown until A2 serves `per_season` (it exists in the backtest report). The page says so. Needs from A2: include `per_season` per cell.
- `circuits/` list shape used: `[{slug, name, circuit_type}]` as agreed.
- The circuit history page issues one request per circuit (about 24). A2 could add a summary list; fine for now.

## Checks and screenshots
- tsc clean, lint 0 errors, build: see the final report.
- CDP emulation, 375 px: no horizontal overflow on `/chaos` and `/chaos/model` (`scrollWidth` 375); tables scroll inside their card. Desktop 1440.
- `docs/v2-ui/screens/`: `chaos-desktop.png`, `chaos-375.png`, `chaos-model-desktop.png`, `chaos-model-375.png` (calibrated mock), `chaos-honest-375.png`, `chaos-model-honest-375.png` (honest state).

## Open
- Mock circuits have synthetic numbers; the 24-circuit real list depends on A2's endpoint.
- The preview does not list per-driver risks (`races/<y>/<r>/drivers/`); the client method exists if wanted.

---

# U1e progress: Ask the stewards

Status: done, awaiting review. Mock mode only; the real A3 stream was not exercised.

## Built (`/stewards`, sidebar link added)
- `Lib/api/v2/sse.ts`: `ask()` POSTs, parses frames with their `id:`, and if the stream ends or breaks before `done` or `error` reconnects with `GET /api/assistant/ask/{task_key}/events` and `Last-Event-ID` (up to 3 times, 400 ms backoff steps); the task key comes from the first `status` event. Abort stops everything. The route handler forwards `Last-Event-ID` and forces `text/event-stream` and no-buffering headers.
- `features/stewards/useAsk.ts`: one turn per question, tokens batched per animation frame, `cancel` aborts the fetch, `retry` re-asks in place.
- Status phases to orb: queued and searching = searching, solving = solving, composing = composing (`OrbStatus` queued mapping changed from working to searching). The orb pauses under reduced motion.
- `[E1]` and `[E1, E2]` markers (A3's `_CITE` pattern) become numbered chips once the `citations` event arrives, plain muted text before. A Sources list repeats them. Chips are real buttons (keyboard reachable). Clicking opens a Radix Dialog side sheet (focus trapped, Escape, focus returns): title, doc type, article, page, section, year or race, the extract highlighted, a note that up to 300 characters are quoted, and the FIA link (new tab, noopener).
- `done.not_found` shows "Evidence not found" and what was searched (`tools_used` mapped to readable names), no invented answer.
- Done metadata in small text: grounded, rounds, evidence items, cost. `long_quotes` and `invalid_citations` notices.
- Errors: `auth_expired` (no retry, explains the operator must renew), `rate_limited`, `llm_failed`, `timeout`, `internal`, network; each with a plain message, the code, and Retry where it can help. Cancel button while a turn runs; a cancelled turn offers "Ask again".
- Composer: Enter sends, Shift+Enter newline; optional year and round selects; three starters (Article 33.4, penalty for causing a collision, and a race-specific one that uses the pickers, defaulting to 2024 round 8). A polite live region announces phase changes and "Answer ready" (tokens are not announced).
- Mock scenarios chosen by question text: "banana" or "notfound", "drop" (stream closes after 12 events), "ratelimit", "authexpired", "llmfailed", "timeout", "longquote".

## Verified (CDP, headless Edge, mock)
- Normal: 3 inline chips plus 2 in Sources, meta line "Grounded in the sources · 2 rounds · 2 evidence items · cost $0.019", dialog opens with focus inside it and the extract shown.
- Drop: the first connection delivers events 0 to 11, the reconnect resumes at 12; the answer completes with chips and meta.
- Not found, rate-limit error with Retry, and Cancel ("Cancelled." plus Ask again) all behave as described. At 375 px `scrollWidth` is 375 with the sheet open.
- Screenshots: `docs/v2-ui/screens/stewards-desktop.png` (sheet open), `stewards-375.png`, `stewards-notfound-375.png`, `stewards-error-375.png`, `stewards-drop.png`.

## Notes
- The mock cannot show real-time keepalives or true network drops; the drop is simulated by the server closing the stream.
- A dev-server hiccup returned 404 for all `/api` routes until `.next/dev` was cleared; unrelated to the code.

---

# U1g progress: tests, Docker, CI, budgets

Status: written; build and static checks run here, nothing that needs a browser download or Docker was run here.

## Added
- `e2e/flows.spec.ts` (Playwright, mock mode): (1) race hub, click mini-sector 7, URL and the lab's request carry `start_m`, `end_m`, `format=columnar` and channels; (2) lab scrub moves the map marker and the readout; (3) stewards stream shows text and a citation chip, the side panel opens and closes with Escape; (4) a dropped stream reconnects and finishes; (5) chaos model page renders the calibration chart canvas; (6) legacy leakage: computed styles (body, sidebar, nav link, h1, button) of `/season/2024` after client navigation from the race hub equal those of a fresh load.
- `e2e/perf.spec.ts`: telemetry lab `?bench=1` timing, p95 cursor move under 16 ms (plan budget is 100 ms).
- `playwright.config.ts` (builds nothing itself: expects a mock-mode build, runs `next start` on 3010), `e2e/tsconfig.json`. **`@playwright/test` is not in `package.json`**: the registry downloads were corrupted here again, so the CI workflow installs it with `--no-save` at 1.56.1 and runs `npx tsc -p e2e/tsconfig.json`. On the VM or CI: `npm install --save-dev --save-exact @playwright/test` then `npx playwright install chromium`, commit the lockfile, and remove the `--no-save` step. e2e files are excluded from the root `tsc` and eslint until then. The specs themselves have never been run.
- `next.config.ts`: `output: "standalone"`.
- `Dockerfile` (deps, build, run on `node:22-alpine`, non-root `app` user, `node server.js`, build args for `NEXT_PUBLIC_*`, runtime `BACKEND_URL` and `INTERNAL_API_KEY` stay out of the image), `.dockerignore`. Not built here (no Docker run); the CI job builds `linux/arm64` with QEMU.
- `.github/workflows/frontend.yml`: `npm ci`, lint, `tsc`, mock-mode build, Playwright, then `scripts/perf.sh` (non-blocking until baselines exist), plus an arm64 Docker build job.
- `lighthouse/lighthouserc.json` and `scripts/perf.sh`: race hub and chaos page, 4G-like throttling (RTT 150 ms, 1.6 Mbit/s), assertion LCP under 2.5 s (error), CLS and TBT (warn); the lab interaction budget runs through `e2e/perf.spec.ts`. Lighthouse navigation mode cannot measure interactions, hence the Playwright check.

## Known risks in the specs (never run)
Selectors rely on `[data-sector]`, `.u-over`, `circle[r="34"]`, `.f1-chip` and the sidebar `aside nav a[href^="/season"]`. The leakage test compares a handful of properties; widen the list if it passes too easily.

# U1f progress: 3D replay (code written, NOT built or tested)

Status: BLOCKED on installing three, @react-three/fiber and @react-three/drei. The code is committed but has not been type-checked, linted, built or run.

## Blocker
`npm install` of `three@0.187.0`, `@react-three/fiber@9.8.2`, `@react-three/drei@10.7.9`, `@types/three@0.187.0` fails on this PC: the registry response bodies arrive corrupted (`ERR_SSL_CIPHER_OPERATION_FAILED` in OpenSSL GCM; `curl` on the same URLs returns truncated JSON of varying size, for example the `hls.js` packument, a drei dependency). About 15 attempts with retries, `--maxsockets`, `--legacy-peer-deps` all failed. Without `--legacy-peer-deps` there is also an ERESOLVE from r3f's optional `expo-gl` peer (`react-dom@undefined`), so installs will need `--legacy-peer-deps` or an `overrides` entry. A third-party npm mirror was refused by the permission classifier and not used. `package.json` and the lockfile are unchanged by this phase.
Needs: a working network for `npm install`, or a decision (install on the VM, or I try again later), and a decision on `--legacy-peer-deps`.

## What is written
- `Lib/v2/replay.ts` (tested by `node Lib/v2/replay.check.ts`): a distance-against-time profile per driver from the real `mini-sectors` response (boundaries and cumulative sector times, fastest lap repeated for 3 laps, 0.9 s grid stagger), position on the track-map polyline, and world conversion (1 unit = 100 m, x and y from 1/10 m, y flipped, z elevation exaggerated 3 times). No new endpoint or mock: the mock `mini-sectors` already supplies the times.
- `features/replay3d/Scene.tsx` (imports three, r3f, drei): ribbon extruded along the polyline with elevation, edges (kerbs) coloured by the fastest driver in each mini-sector, cars as coloured spheres moved per frame without React state, play/pause, 1/2/4/8/16x, scrub slider, orbit camera (drei OrbitControls) and a follow-driver camera behind the car; reduced motion starts paused, snaps the follow camera and disables damping.
- `features/replay3d/Replay3D.tsx`: the only file other code imports; it loads `Scene` with `next/dynamic` (`ssr: false`), so three never enters other pages. A poster (SVG of the circuit) replaces the scene when the screen is under 768 px, `hardwareConcurrency <= 4`, or WebGL is missing, with a "Load the 3D view anyway" button. Capability is read with `useSyncExternalStore` (no hydration mismatch).
- Route `/race/[y]/[r]/3d`; the race hub header has a "3D replay" link.

## Still to do once the packages install
tsc, lint, build and confirmation that the 3D chunk is separate (check the chunk list), then a headless-Edge WebGL screenshot attempt, then the report. If drei stays uninstallable, swap `OrbitControls` for `three/examples/jsm/controls/OrbitControls`.

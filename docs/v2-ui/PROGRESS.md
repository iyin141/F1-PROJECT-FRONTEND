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

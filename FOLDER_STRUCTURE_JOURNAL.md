# F1 Control Room Folder Structure Journal

This document is a working map of the frontend workspace. It is meant to help a UI agent place new pages, components, data hooks, and styles in the right folders without fighting the existing structure.

Important correction: this repo is features-first for page sections. The `features/` folder is the primary home for section-specific UI.

## Current Workspace Shape

```text
f1-project-frontend/
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
├── features/
├── app/
├── _Components/
├── _Stores/
├── actions/
├── Hooks/
├── icons/
├── Lib/
├── public/
├── styles/
├── types/
└── utlis/
```

## What Each Folder Is For

### `app/`

App Router pages, route layouts, route loading states, route errors, and route handlers.

Use this folder for:

- page entry points
- route-level layout composition
- loading and error boundaries
- route-specific server components
- route-specific client wrappers when needed

Rules:

- Put each page in the route folder that matches the URL.
- Keep route-specific UI close to the route.
- Prefer server components by default unless interactivity is required.

### `_Components/`

Reusable shared UI components that are cross-feature, not section-owned.

Use this folder for:

- shared headers, panels, cards, tabs, selectors
- primitives reused across multiple features
- presentational components that should not own routing or data fetching

Rules:

- Keep these components focused on rendering.
- Do not put route orchestration here.
- If a component belongs to one section only, keep it in that section under `features/`.

### `features/`

Feature and section modules. This is the primary folder for each major product section.

Current sections:

- `features/season-hub/`
- `features/race-detail/`
- `features/race-analysis/`

Use this folder for:

- section-owned components
- section state and view logic
- section-specific hooks/helpers/types when they are not globally shared

Rules:

- Build each section inside its own feature folder first.
- Keep section internals close together.
- Promote code to `_Components/`, `Hooks/`, `Lib/`, or `types/` only when it becomes cross-feature.

## How To Use `features/`

Use `features/` as the default implementation layer for each product section. Think of each feature folder as a self-contained module that the route composes.

### Feature-first workflow

1. Create or use the section folder in `features/`.
2. Build section UI and local logic in that folder.
3. Keep route files in `app/` focused on orchestration only.
4. Keep API access in `actions/` and import results into the feature layer.
5. Promote files out of the feature folder only when they are reused by other sections.

### What stays inside a feature folder

- section-owned components
- section-only state handling
- section-only hooks/helpers
- section-only types that are not reused elsewhere

### What moves out of a feature folder

- move to `_Components/` when a UI element is reused by multiple sections
- move to `Hooks/` when a hook is reusable outside one section
- move to `Lib/` when logic is pure/shared utility or config
- move to `types/` when contracts/types are shared across sections

### Recommended feature folder template

```text
features/
└── <section>/
	├── components/
	├── hooks/
	├── state/
	├── types/
	├── utils/
	├── index.ts
	└── README.md
```

Template notes:

- `components/`: section-owned UI pieces.
- `hooks/`: section-specific hooks.
- `state/`: local store/context/reducer for the section.
- `types/`: types private to the section.
- `utils/`: helper functions private to the section.
- `index.ts`: clean exports consumed by route files.
- `README.md`: short purpose + boundaries + what is shared vs private.

### Route-to-feature integration pattern

- Route file in `app/` receives params/search params and fetches data.
- Route file passes data into a feature entry component from `features/<section>/`.
- Feature entry composes section components and local state.

### Boundary check before creating new files

Ask these questions:

1. Is this code only for one section? Keep it in `features/<section>/`.
2. Will another section use it now? Place it in shared folders immediately.
3. Might another section use it later but not now? Keep it in the feature until reuse is real.

### `_Stores/`

Application state providers and context wrappers.

Use this folder for:

- theme providers
- global UI state providers
- app-wide context objects

Rules:

- Keep providers minimal and composable.
- Put global concerns here, not page-specific state.

### `actions/`

Server-side action functions and service helpers that call backend endpoints (via `Lib/server-client`).

Use this folder for:

- typed server helpers
- feature-specific action modules
- request wrappers and query builders
- action exports grouped by domain

Rules:

- Keep action helpers free of UI logic.
- Keep data access separate from components.
- Prefer one module per feature or endpoint family.

### `Hooks/`

Shared React hooks.

Use this folder for:

- reusable stateful logic
- UI interaction hooks
- data helpers that are not tied to one page

Rules:

- Hooks should not contain page rendering.
- Hooks should be reusable and easy to test.

### `icons/`

Icon assets or icon components.

Use this folder for:

- custom icons
- icon wrappers
- small visual symbols used across the app

Rules:

- Keep this folder for icon-only artifacts.
- Do not mix layout or page logic here.

### `Lib/`

Shared low-level helpers and configuration.

Use this folder for:

- API config
- theme helpers
- app constants
- shared utility functions that are not React-specific

Rules:

- Put pure helper logic here.
- Keep these files dependency-light.

### `public/`

Static assets served directly by Next.js.

Use this folder for:

- images
- favicons
- static files
- downloadable assets

Rules:

- Anything that should be fetched by URL goes here.

### `styles/`

Legacy or supplemental styling assets.

Use this folder for:

- supporting CSS files
- older style assets if still referenced

Rules:

- Prefer `app/globals.css` for app-wide styles when working inside the App Router.
- Avoid creating parallel style systems unless necessary.

### `types/`

Shared TypeScript types.

Use this folder for:

- API response types
- shared layout and theme types
- domain types
- route data contracts

Rules:

- Keep shared contracts here instead of embedding them in components.
- Use domain-specific files for clarity.

### `utlis/`

Utility folder with the existing project spelling.

Use this folder for:

- miscellaneous helper functions if they already belong here

Rules:

- The folder name is spelled `utlis` in this repo.
- When adding new utilities, check whether they belong in `Lib/` or here before creating more files.

## Placement Rules For New UI Work

### If you are adding a new page

- Create the route in `app/`.
- Add route-specific loading and error boundaries if the page fetches data.
- Keep route orchestration in the page file and place section UI in `features/<section>/`.

### If you are adding a new visual block inside a page

- Put it in `features/<section>/` by default.
- Move it to `_Components/` only if it becomes shared across multiple sections.
- Keep it in the page file only if it is a one-off and very small.

### If you are adding data fetching

- Put request logic in `actions/`.
- Put type contracts in `types/`.
- Keep the page and components focused on composition and rendering.

### If you are adding app-wide state

- Put the provider in `_Stores/`.
- Put helper logic in `Lib/`.

### If you are adding a helper function

- Use `Lib/` for shared config and pure helpers.
- Use `Hooks/` for reusable React logic.

## UI Agent Rules Of Thumb

- Follow the existing layout language instead of inventing a second one.
- Reuse the shared theme, typography, spacing, and card patterns.
- Keep route files thin and move section UI into `features/<section>/`.
- Keep data contracts in `types/` and data access in `actions/`.
- If a page needs loading, error, or empty states, build them at the route level first.
- Favor additive changes that fit the current structure rather than reshaping the project.

## Quick Mental Model

- `app/` = pages and routing
- `features/` = section modules (primary)
- `_Components/` = shared UI blocks (cross-feature)
- `_Stores/` = providers and global state
- `actions/` = API access
- `Hooks/` = reusable React logic
- `Lib/` = shared helpers and config
- `types/` = contracts
- `public/` = static files
- `styles/` = supplemental CSS
- `utlis/` = legacy utility location

## Best Default For New Pages

When a new page is added, the safest pattern is:

1. Create the route in `app/`.
2. Fetch data in the page or via the route layer.
3. Build section UI in `features/<section>/`.
4. Move repeatable UI blocks into `_Components/` only when shared.
5. Keep types in `types/`.
6. Keep request logic in `actions/`.
7. Keep helper logic in `Lib/`.
8. Add loading and error states alongside the route.

This keeps new work easy to slot into the codebase without breaking the current organization.

## Scaffolding Created (automated)

I scaffolded a concrete features-first folder structure and example files to help onboarding.

Files created:

- [features/README.md](features/README.md) — short overview and pointers.
- [features/FEATURE_TEMPLATE.md](features/FEATURE_TEMPLATE.md) — copyable template for new features.
- [features/season-hub/README.md](features/season-hub/README.md) — description and responsibilities.
- [features/season-hub/feature.config.json](features/season-hub/feature.config.json) — feature metadata.
- [features/season-hub/page.tsx](features/season-hub/page.tsx) — feature entry component.
- [features/season-hub/index.ts](features/season-hub/index.ts) — exported entry.
- [features/season-hub/components/YearSelector.tsx](features/season-hub/components/YearSelector.tsx)
- [features/season-hub/components/SeasonOverview.tsx](features/season-hub/components/SeasonOverview.tsx)
- [features/season-hub/types.ts](features/season-hub/types.ts)
- [features/season-hub/api.ts](features/season-hub/api.ts)
- [\_Components/ui/Button.tsx](_Components/ui/Button.tsx)
- [\_Components/ui/README.md](_Components/ui/README.md)

How to use the scaffolding:

1. Create a new feature folder by copying `features/FEATURE_TEMPLATE.md` and renaming the folder to your feature name.
2. Implement UI inside `features/<your-feature>/components` and local hooks in `features/<your-feature>/hooks`.
3. Export a single entry from `features/<your-feature>/index.ts` (for example `export { default } from './page'`).
4. In `app/` route files, import the feature entry and pass route params/data into it:
   - Example (app route):
     ```
     import FeatureEntry from 'features/your-feature';
     export default function Page({ params }) {
     	 const data = await fetchSomething(params);
     	 return <FeatureEntry initialData={data} />;
     }
     ```

5. Keep API calls in `actions/` and shared types in `types/`.

Quick commands:

- Copy template (POSIX): `cp -R features/FEATURE_TEMPLATE.md features/your-feature/ && mv features/your-feature/FEATURE_TEMPLATE.md features/your-feature/README.md`
- Windows PowerShell: `New-Item -ItemType Directory features\\your-feature; Copy-Item features\\FEATURE_TEMPLATE.md features\\your-feature\\README.md`

If you'd like, I can also create a small npm script to scaffold a feature automatically.

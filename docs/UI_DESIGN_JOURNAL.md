# UI Design Journal

A living reference for the frontend visual system: tokens, layout patterns, reusable components, states, and where to find their implementations.

Generated: 2026-05-18

---

**Design Tokens**
- Source: [app/globals.css](app/globals.css#L1-L200)
- Colors (semantic, HSL):
  - Surfaces: `--bg`, `--panel`, `--panel-elev`
  - Borders: `--border-subtle`, `--border`
  - Text: `--text`, `--text-dim`, `--muted`, `--muted-2`
  - Signals / Brand: `--red`, `--green`, `--amber`, `--blue`
  - Tyre compounds (HSL): `--tyre-soft`, `--tyre-medium`, `--tyre-hard`, `--tyre-inter`, `--tyre-wet`
  - Position tints: `--pos-p1`, `--pos-p2`, `--pos-p3`, `--pos-points`, `--pos-rest`
  - Team palette variables: `--team-...` (team HSL values)
- Shadcn/compat aliases: `--background`, `--foreground`, `--card`, `--primary`, `--destructive`, `--input`, `--ring`, `--radius`
- Usage guidance: Prefer the semantic aliases (`--color-text`, `--color-panel`, `--color-border-subtle`, etc.) rather than raw team/compound tokens in components.

**Typography**
- Fonts (globals): `--font-display` (Inter), `--font-mono` (DM Mono).
- Utility classes: `.font-display`, `.font-mono`, `.label-mono` (caps, 10px, mono tracking).
- Headings: component `Panel` uses `h2` with `font-display text-sm font-semibold` for compact section titles.

**Spacing & Radius**
- Global radius: `--radius` (mapped in tokens, default 0.25rem).
- Panels use padding `p-4` / `sm:p-5` and rounded-sm for corners.
- Page-level container: `.page-shell` uses `padding-inline: clamp(1rem, 3vw, 2rem)` for responsive gutters.

**Layout utilities**
- `.panel-scroll` and `.scrollbar-none` for horizontally scrollable panels with hidden scrollbars.
- Grid utilities used in dashboards: `.grid-slots`, `.timing-tower`, `.points-bars`, `.pin-row` (defined in `app/globals.css`).
- Generic table layout is CSS grid-driven (columns defined by column width strings).

**Core Components (implementation links + notes)**
- Panel — [components/Panel.tsx](components/Panel.tsx)
  - Reusable surface with optional header (label/title/action) and internal padding.
  - Header: `label-mono` + `h2` title; content wrapper uses `p-4 sm:p-5`.

- GenericTable — [components/ui/GenericTable.tsx](components/ui/GenericTable.tsx)
  - Grid-based table implementation with column defs, row variants, striped rows, badges (fastlap/pole), and onRowClick.
  - Variant colors are applied using CSS `color-mix` and semantic tokens.

- DriverCode — [components/DriverCode.tsx](components/DriverCode.tsx)
  - Compact driver chip with team color stripe, optional flag, code and truncated name.

- ThemeToggle — [components/ThemeToggle.tsx](components/ThemeToggle.tsx)
  - Small 32x32 toggle using `useAppTheme`, uses `aria-label` for accessibility and inline hover styles.

- Button (simple) — [_Components/ui/Button.tsx]( _Components/ui/Button.tsx )
  - Minimal wrapper with `variant?: 'primary' | 'ghost'` (class names `btn-primary` / `btn-ghost` used by project CSS)

- FadeInPanel (motion wrapper) — [components/animations/FadeInPanel.tsx](components/animations/FadeInPanel.tsx)
  - Framer Motion wrapper with consistent initial/animate transition (opacity + y-offset). Used for small staged reveals.

- Skeletons / loading states
  - `skeleton` utility class with shimmer defined in `app/globals.css` (use on placeholder blocks).
  - Reusable skeleton components exist across `components/` and `_Components/ui/`.

**Visual Patterns & Rules**
- Panels are the primary container for card-like UI — use `Panel` for any section with a header and content area.
- Tables use `GenericTable` for tabular lists; pass `getRowVariant` to surface special rows (pole, fastlap, dnf).
- Use `label-mono` for section metadata (small-caps labels) and `font-mono` for small numeric UI.
- Colors are semantic; avoid hardcoding hex values. Use tyre/team tokens only when domain-specific visualization requires them (tyre chart, team stripe).
- Rounded, subtle borders: default border width and `border-border-subtle` are used to separate panels.
- Buttons: prefer project utility classes (`btn-primary`, `btn-ghost`) but consider migrating to a central `Button` component (if more variants needed).

**State Handling & Accessibility**
- Loading: use `skeleton` + `section-loading` patterns (see `app/globals.css`).
- Empty: `EmptyState` component used throughout (see `components/EmptyState.tsx`).
- Theme toggle has explicit `aria-label`; other interactive elements typically accept `aria-*` in-line when necessary.
- Keyboard focus: rely on browser default outlines + `--ring` token for focus styles (shadcn-compatible aliases exist).

**Animations & Motion**
- Framer Motion is used for micro-animations: [components/animations/FadeInPanel.tsx](components/animations/FadeInPanel.tsx), `PageTransition`, and `RouteTransition` (see `components/animations/`).
- Replay/trajectory animation uses GSAP + Flip in replay components (heavy animation; gated behind user action).
- Motion guidelines: short durations (0.2–0.5s), use ease-out curves for entrance, avoid layout-shifting animations where possible.

**Design Tokens & Where They Are Used**
- `app/globals.css` is the canonical source for tokens.
- `Lib/theme.ts` provides theme-mode utilities (dark/light/system) and store key: `THEME_STORAGE_KEY`.

**Files & Quick Links**
- Tokens & globals: [app/globals.css](app/globals.css)
- Theme utilities: [Lib/theme.ts](Lib/theme.ts)
- Core panels: [components/Panel.tsx](components/Panel.tsx)
- Tables: [components/ui/GenericTable.tsx](components/ui/GenericTable.tsx)
- Driver chip: [components/DriverCode.tsx](components/DriverCode.tsx)
- Theme toggle: [components/ThemeToggle.tsx](components/ThemeToggle.tsx)
- Motion helpers: [components/animations/FadeInPanel.tsx](components/animations/FadeInPanel.tsx)
- Simple button: [_Components/ui/Button.tsx]( _Components/ui/Button.tsx )

**Recommendations / Next steps**
- Expand component docs with screenshots and exact token usage examples (CSS snippets).
- Consolidate button styles into a single reusable `Button` component (currently `_Components/ui/Button.tsx` is minimal).
- Add a short migration guide for contributors: how to name tokens, choose semantic tokens vs raw team/compound tokens, and useful helper functions (e.g., `teamColor()` in `components/DriverCode.tsx`).

---

If you'd like, I can now:
- Add example code snippets to each component entry, or
- Run a repo-wide grep to enumerate every consumer of each token and output a usage map.

Which would you prefer next?
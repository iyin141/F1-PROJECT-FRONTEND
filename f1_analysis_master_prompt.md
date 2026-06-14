# F1 Analysis Page — Master Graph & Card Configuration Prompt

---

## GLOBAL RULES (Apply to Every Component in Every Session)

### UI Framework
- Every card or chart section is wrapped in the `Panel` component (`components/Panel.tsx`)
  Panel headers use `label-mono` for metadata labels and `h2` with `font-display text-sm font-semibold` for titles
- All tabular data uses `GenericTable` (`components/ui/GenericTable.tsx`) with `getRowVariant`
  to surface special rows (fastest lap, pole, DNF, eliminated)
- All driver identifiers render using the `DriverCode` chip (`components/DriverCode.tsx`)
  Never use raw text strings for driver codes in any UI element
- Loading states use the `skeleton` utility class on placeholder blocks
- Empty or unavailable data states use the `EmptyState` component (`components/EmptyState.tsx`)
- Staged panel reveals use `FadeInPanel` (`components/animations/FadeInPanel.tsx`)
  with 0.2–0.5s ease-out durations; avoid layout-shifting animations

### Design Tokens
- Never hardcode hex or RGB colour values anywhere in any component
- Use semantic aliases for general UI: `--color-text`, `--color-panel`, `--color-border-subtle`,
  `--color-text-dim`, `--color-muted`
- Use domain-specific tokens only when the visualisation explicitly requires them:
  - Tyre compounds: `--tyre-soft` (red), `--tyre-medium` (yellow), `--tyre-hard` (grey/white),
    `--tyre-inter` (green), `--tyre-wet` (blue)
  - Team colours: `--team-[name]` HSL variables
  - Position tints: `--pos-p1`, `--pos-p2`, `--pos-p3`, `--pos-points`, `--pos-rest`
- Typography: `label-mono` for small-caps metadata, `font-mono` for all numeric values,
  `font-display` for section headings

### Charting Library
- All charts use **Recharts**
- All colour values passed to Recharts must be resolved from CSS custom properties via
  `getComputedStyle(document.documentElement).getPropertyValue('--token-name')` or `var(--token-name)`
  Never pass raw hex or RGB strings to Recharts props
- Chart type mapping:
  - Time series / lap progression → `LineChart` or `ComposedChart`
  - Distributions / comparisons → `BarChart` or `ComposedChart`
  - Scatter plots → `ScatterChart`
  - Stacked area → `AreaChart` within `ComposedChart`
  - Binary step traces (brake, DRS, gear) → `ComposedChart` with step-interpolated `Line`
  - Gantt-style tyre strategy timeline → custom SVG layer rendered inside a Recharts
    `ComposedChart` using `customized` prop or `ReferenceArea` per stint segment
- All charts sharing an X-axis (e.g. telemetry multi-trace) use a single
  `ComposedChart` with multiple `YAxis` instances keyed by `yAxisId`
- Tooltips use Recharts `Tooltip` with a custom `content` renderer styled
  using Panel surface tokens (`--color-panel`, `--color-border-subtle`)
- Legends use Recharts `Legend` with `DriverCode` chips where driver identity is shown

### Time String Conversion
- All API time values arrive as timedelta strings: `"0 days 00:01:37.123000"`
- Convert to total seconds before any calculation, display, or chart plotting:
  Parse days, hours, minutes, seconds from the string and sum to a float
- Q/SQ phase times arrive as `"1:29.845"` (mm:ss.mmm) — parse separately
- Display format for UI labels: `m:ss.mmm` (e.g. `1:37.123`)
- Display format for delta values: `+X.XXXs` or `−X.XXXs` always with sign

### Session Gating
- Every component declares which sessions it is valid for
- Components must not render for invalid sessions — show `EmptyState` with a
  message explaining which session is required
- Valid session values across the app: `R`, `SQ`, `Q`, `FP1`, `FP2`, `FP3`

### Readiness / can_proceed Handling
- Every API response includes a `readiness` or `meta.can_proceed` boolean
- If `can_proceed = false`: render `EmptyState` with the `message` field from the response
- If partial data is available (`available_data` non-empty but `unavailable_data` non-empty):
  render what is available and show a subtle inline warning for what is missing
- Never crash or show an unhandled error state — always degrade gracefully

### Outlier / Null Lap Exclusion
- Exclude any lap where `lap_time` is null from all time-based charts and averages
- Outlier laps (pit in/out, safety car, formation): detect by
  `lap_time > 1.15 × that driver's personal best in the session`
  Exclude from pace calculations but retain in sequence context where relevant
- Null sector times: exclude that lap from sector calculations only;
  the lap may still appear in lap time charts if `lap_time` is not null

---

## SESSION: RACE (R) & SPRINT RACE (SQ)

Sprint Race follows the same component structure as Race.
Pass `session=R` for Race and `session=SQ` for Sprint Race to all endpoints.

---

### R-1 · Teammate Battle Cards & Graphs

**Valid sessions:** R, SQ

**Data sources:**
- `useLapTimes(year, round, session)` → `/api/analysis/races/{year}/{round}/laps/?session={R|SQ}`
  Fields: `driver_code`, `lap_number`, `lap_time`, `sector1`, `sector2`, `sector3`,
  `compound`, `stint`, `is_personal_best`
- `useTeammateBattles(year, round, session)` → derived from `RaceLapFrame[]`

**Cards (one per teammate pair):**
Wrap each pair in a `Panel`. Header uses `DriverCode` chips for both drivers and team name.
Display using `GenericTable` rows or stat blocks:
- Average lap time delta between the two drivers (e.g. `LEC +0.342s vs SAI`)
- Who led more laps in the race (lap count each driver held the faster time)
- Compound usage summary per driver rendered as tyre compound pills using `--tyre-[compound]` tokens
  (e.g. M → H vs S → M → H)
- A small inline win-rate bar: percentage of laps each driver was faster
  Implement as a split horizontal bar using team colour tokens for each driver's side

**Scatter graph (Recharts ScatterChart):**
- X-axis: `lap_number` (1 → final lap), labelled "Lap"
- Y-axis: `lap_time` converted to seconds, labelled "Lap Time (s)"
- Two `Scatter` series — one per driver — coloured via `--team-[name]` tokens
- Each point shape or border encodes tyre compound using `--tyre-[compound]` tokens:
  SOFT = filled red, MEDIUM = filled yellow, HARD = filled grey,
  INTER = filled green, WET = filled blue
- Exclude null `lap_time` laps and outlier laps entirely from the scatter
- Overlay a 5-lap rolling average trend line per driver using a `Line` inside a
  `ComposedChart` in a lighter shade of the driver's team colour
- Recharts `Tooltip` custom renderer shows:
  `DriverCode` chip, lap number, lap time (`m:ss.mmm`), compound pill,
  stint number, personal best star if `is_personal_best = true`

**Pit stop annotations:**
- Detect pit laps: `stint` number changes between lap N and lap N+1 for that driver
- Render as `ReferenceLine` (vertical dashed) at the pit lap's X position
  labelled with the new compound using `--tyre-[compound]` token colour
- If safety car / VSC laps are available from track status, render as
  `ReferenceArea` with translucent fill using `--amber` (SC) or `--color-muted` (VSC)
  and a top label
- Personal best laps: render a star SVG marker at the point using Recharts `customized`

**Data integrity:**
- Pair drivers by team only — never pair cross-team drivers
- If one driver retired (fewer laps), plot only up to their last recorded lap; no interpolation
- Convert all timedelta strings to seconds before plotting

---

### R-2 · Stint Section — Race Thirds Analysis

**Valid sessions:** R, SQ

**Data source:**
- `useAllStints(year, round, session)` → `/api/analysis/races/{year}/{round}/stints/?session={R|SQ}`
  Fields: `driver_code`, `stint`, `compound`, `lap_start`, `lap_end`, `lap_count`,
  `best_lap`, `avg_pace`, `pace_degradation`

**Race thirds logic:**
- `total_laps` = `max(lap_end)` across all drivers and stints
- Third 1 = laps 1 → `floor(total_laps / 3)`
- Third 2 = `floor(total_laps / 3) + 1` → `floor(total_laps * 2 / 3)`
- Third 3 = `floor(total_laps * 2 / 3) + 1` → `total_laps`
- A stint overlaps a third if: `lap_start <= third_end AND lap_end >= third_start`
- Compute each driver's effective `avg_pace` within each third by weighting
  overlapping stints proportionally by lap count in that third
- Convert all pace timedelta strings to seconds before calculation

**Cards (one per third, wrapped in `Panel`):**
- Title: "Race Third 1 / 2 / 3" with lap range subtitle (e.g. "Laps 1–19")
- `GenericTable` rows sorted by effective `avg_pace` ascending (fastest first)
- Per driver row: `DriverCode` chip, avg pace (`m:ss.mmm`), compound pill(s)
  using `--tyre-[compound]` tokens, tyre count badge (distinct stint count up to that third)
- Fastest driver row styled with `--pos-p1` tint via `getRowVariant`
- All other rows show pace delta from fastest: `+0.XXXs` in `font-mono`
- DNF drivers (no data in that third): grey placeholder row labelled "DNF"
  using `--pos-rest` tint

**Bar chart (Recharts BarChart inside Panel):**
- X-axis: "Third 1", "Third 2", "Third 3"
- Y-axis: avg pace in seconds (lower = faster — label clearly "Avg Pace (s) ↓ faster")
- Grouped bars by driver, coloured via `--team-[name]` tokens
- Compound colour stripe on each bar as a thin top border using `--tyre-[compound]`
- Pace degradation indicator per driver: if Third 3 avg pace is worse than Third 1
  show a downward arrow annotation with delta; if improved show upward arrow
- DNF drivers: grey placeholder bar labelled "DNF"

**Data integrity:**
- Exclude pit transition laps from `avg_pace` calculations
- Tyre count = distinct `compound + stint` combinations, not just distinct compounds
- Only render for session R or SQ

---

### R-3 · Position Tracker Chart

**Valid sessions:** R, SQ

**Data sources:**
- `useRacePositions(year, round, session)` →
  `/api/unified/races/{year}/{round}/positions/?session={R|SQ}&sample_interval=1`
  Fields: `driver_code`, `lap_number`, `position`, `position_change`,
  `gap_to_leader_seconds`, `gap_to_ahead_seconds`, `stint`, `track_status`,
  `lap_time_seconds`, `is_fastest_lap_overall`, `is_fastest_lap_of_lap_number`
- `useLapTimes(year, round, session)` →
  `/api/analysis/races/{year}/{round}/laps/?session={R|SQ}`
  Join on `driver_code + lap_number` to get `compound` per lap

**Line chart (Recharts ComposedChart inside Panel):**
- X-axis: `lap_number`, labelled "Lap"
- Y-axis: `position` inverted (P1 at top, P20 at bottom) labelled "Position"
  Use `domain={[1, 20]}` with `reversed` Y-axis
- One `Line` per driver coloured via `--team-[name]` tokens
- Toggle individual drivers via Recharts `Legend` with `DriverCode` chips as labels
- Legend sorted by final race position (winner at top)
- Recharts `Tooltip` shows: `DriverCode` chip, lap, position,
  `gap_to_leader_seconds`, `lap_time_seconds`

**Compound encoding on lines:**
- Segment each driver's line by compound using the `compound` field from laps endpoint
- Render each segment as a separate `Line` with stroke colour from `--tyre-[compound]`
- At stint boundaries render a small vertical tick using a `ReferenceLine` or
  custom dot on the line

**Track status shading:**
- `track_status` values: `"1"` = Green, `"2"` = Yellow, `"4"` = SC, `"5"` = Red, `"6"` = VSC
- For any lap range where `track_status ≠ "1"` render a `ReferenceArea` spanning full Y:
  Yellow flag = `--amber` translucent, SC = `--amber` stronger,
  VSC = `--color-muted` purple tint, Red flag = `--red` translucent
- Label at top of each band with status name

**Fastest lap markers:**
- `is_fastest_lap_overall = true`: purple triangle marker via custom dot renderer
  using `--pos-p1` or a dedicated purple token
- `is_fastest_lap_of_lap_number = true`: small filled purple dot

**Data integrity:**
- `sample_interval=1` — fetch every lap, no sampling
- Retired drivers: line ends at their last recorded `lap_number`; no interpolation
- Skip points where `position` is null
- If compound from laps endpoint is null for a lap, retain previous known compound colour
- Only render for session R or SQ

---

### R-4 · Lap Analysis — Dual Driver Comparison

**Valid sessions:** R, SQ

**Data source:**
- `useLapTimes(year, round, session)` →
  `/api/analysis/races/{year}/{round}/laps/?session={R|SQ}`
  Fields: `driver_code`, `lap_number`, `lap_time`, `sector1`, `sector2`, `sector3`,
  `compound`, `stint`, `is_personal_best`

UI: Two driver selectors rendered as dropdowns populated from unique `driver_code`
values in the laps data. Both must be selected before charts render.

#### View A — Full Race Lap Comparison

**Line chart (Recharts ComposedChart inside Panel):**
- X-axis: `lap_number`, labelled "Lap"
- Y-axis: `lap_time` in seconds, labelled "Lap Time (s)"
- One `Line` per driver coloured via `--team-[name]` tokens
- Line segments coloured by compound using `--tyre-[compound]` tokens
- `is_personal_best` laps marked with a star custom dot
- Stint boundaries: `ReferenceLine` (vertical dashed) labelled with new compound pill

**Delta bar (Recharts ComposedChart below, shared X-axis):**
- Y-axis: `Driver A lap_time − Driver B lap_time` in seconds
- Positive bars (Driver A slower): coloured with Driver B team token
- Negative bars (Driver A faster): coloured with Driver A team token
- Zero `ReferenceLine` across the full width
- Cumulative delta overlaid as a `Line` using `--color-text-dim`

**Stats panel (inside Panel below charts):**
- Use `GenericTable` or stat block grid:
  Per driver: fastest lap (value + lap number), avg lap time, std deviation,
  personal best count, pit stop count (detected from stint changes)
- Head-to-head row: "Driver A faster: X laps | Driver B faster: Y laps"
- `DriverCode` chips as column headers

#### View B — Single Lap Sector Breakdown

UI: Lap number selector (slider 1 → max lap) carried alongside driver selectors from View A.

**Grouped bar chart (Recharts BarChart inside Panel):**
- X-axis: three groups — "Sector 1", "Sector 2", "Sector 3"
- Y-axis: sector time in seconds
- Two bars per group: Driver A and Driver B coloured via `--team-[name]` tokens
- Value labels on top of each bar in `font-mono`
- Faster bar in each sector gets a `--pos-p1` gold border highlight

**Radar chart (Recharts RadarChart as secondary, inside same Panel):**
- Three axes: S1, S2, S3 — normalised so session fastest = 1.0
- Both drivers overlaid with team colour fills at reduced opacity

**Theoretical best annotation (stat block below charts):**
- Per driver: `best_s1 + best_s2 + best_s3` = theoretical best
- Display: `"Theoretical Best: m:ss.mmm"` vs actual best lap
- Delta: `"Gap to theoretical: +X.XXXs"` in `font-mono`

**Data integrity:**
- Null sector laps excluded from View B; show `EmptyState` if selected lap
  has null sectors for either driver
- If selected lap has no data for one driver show inline notice; do not crash
- Delta direction always: Driver A − Driver B; label clearly
- Only render for session R or SQ

---

### R-5 · Driver Telemetry Panel

**Valid sessions:** R, SQ

**Data sources:**
- Single driver: `usePersistentTelemetry(year, round, driver, lap, session)` →
  `/api/analysis/races/{year}/{round}/telemetry/?driver={driver}&lap={lap}&session={R|SQ}`
  Fields: `distance`, `speed`, `throttle`, `brake`, `gear`, `rpm`, `drs`, `relative_distance`
  Query: `limit_points=1000`, `stride=1` (UI toggle to `limit_points=2000` for full res)
- Overlay: `usePersistentTelemetryOverlay(year, round, driverA, driverB, lap, session)` →
  `/api/analysis/races/{year}/{round}/telemetry/overlay/?driver_a={a}&driver_b={b}&lap={lap}&session={R|SQ}`
  Fields: `distance`, `[DRIVER_A].speed`, `[DRIVER_A].throttle`, `[DRIVER_A].brake`,
  `[DRIVER_A].gear`, `[DRIVER_B].speed`, `[DRIVER_B].throttle`, `[DRIVER_B].brake`,
  `[DRIVER_B].gear`, `delta_speed`, `delta_throttle`
- Summary: `useTelemetrySummary(year, round, driver, lap, session)` →
  `/api/analysis/races/{year}/{round}/telemetry/summary/?driver={driver}&lap={lap}&session={R|SQ}`
  Fields: `avg_speed`, `max_speed`, `avg_throttle`, `brake_events`, `drs_activations`, `gear_changes`

#### Mode A — Single Driver

**Multi-trace stacked chart (single Recharts ComposedChart, shared X-axis = `distance`):**
All traces share one `ComposedChart` with multiple `YAxis` instances keyed by `yAxisId`:
1. Speed (kph) — `Line`, stroke = `--team-[name]` token, `yAxisId="speed"`
2. Throttle (%) — `Area`, fill = `--green` at 40% opacity, `yAxisId="throttle"`, domain `[0,100]`
3. Brake — step-interpolated `Line` (type="stepAfter"), fill `--red` when value=1, `yAxisId="brake"`, domain `[0,1]`
4. Gear — step-interpolated `Line`, stroke = `--color-muted`, `yAxisId="gear"`, domain `[1,8]`
5. RPM — `Line`, stroke = `--amber`, `yAxisId="rpm"`
6. DRS — step-interpolated `Line`, fill = `--blue` tint when active (value > 0), `yAxisId="drs"`, domain `[0,1]`

Sector markers: `ReferenceLine` (vertical dashed) at estimated sector boundary distances
labelled "S1", "S2", "S3" — estimate distances proportionally from sector time ratios × total lap distance

**Summary stat cards (above chart, inside Panel):**
From `TelemetrySummary` endpoint — rendered as a row of stat blocks:
`max_speed` (kph), `avg_speed` (kph), `avg_throttle` (%), `brake_events` (count),
`drs_activations` (count), `gear_changes` (count)
All numeric values in `font-mono`

#### Mode B — Two Driver Overlay

**Overlay chart (Recharts ComposedChart, X-axis = `distance`):**
- Speed: two `Line` series — Driver A solid, Driver B dashed — team colour tokens
- Throttle: two `Area` series overlaid at 30% opacity each — team colour tokens
- Brake: two step `Line` series, each in driver team colour

**Delta speed panel (separate `ComposedChart` below, shared X-axis):**
- Plot `delta_speed` from overlay endpoint
- Positive = Driver A faster: fill above zero with Driver A team colour at 40% opacity
- Negative = Driver B faster: fill below zero with Driver B team colour at 40% opacity
- Zero `ReferenceLine`

**Data integrity:**
- `distance` is primary X-axis; use `relative_distance` only if `distance` is null
- Both `driver` and `lap` are required; handle 400 responses with inline `EmptyState`
  not a page crash
- `brake` is boolean — render as 0/1 on step chart
- `drs > 0` = active — render as binary
- Apply `limit_points=1000` by default; expose full-resolution toggle in UI
- Only render for session R or SQ

---

### R-6 · Stint Analysis & Tyre Strategy

**Valid sessions:** R, SQ

**Data sources:**
- Stints: `useAllStints(year, round, session)` →
  `/api/analysis/races/{year}/{round}/stints/?session={R|SQ}`
  Fields: `driver_code`, `stint`, `compound`, `lap_start`, `lap_end`, `lap_count`,
  `best_lap`, `avg_pace`, `pace_degradation`
- Tyre strategy: `useTyreStrategy(year, round, session)` →
  `/api/analysis/races/{year}/{round}/tyre-strategy/?session={R|SQ}`
  Fields: `stint`, `compound`, `lap_start`, `lap_end`, `laps_completed`,
  `pit_stop_lap`, `pit_stop_loss`

**Tyre strategy timeline (Gantt — custom SVG inside Recharts ComposedChart, inside Panel):**
- Y-axis: one row per driver sorted by finishing position (winner at top)
  Each driver label rendered as `DriverCode` chip
- X-axis: `lap_number` (1 → total laps)
- Each stint rendered as a `ReferenceArea` spanning `lap_start` → `lap_end`,
  fill = `--tyre-[compound]` token, labelled with compound abbreviation (S/M/H/I/W)
  centred in the bar if space allows
- Pit stop events rendered as vertical triangle markers at `pit_stop_lap`
  using Recharts `ReferenceLine` with custom label
- Recharts `Tooltip` on hover: compound name, `lap_start → lap_end`,
  `laps_completed`, `pit_stop_loss` (seconds), `avg_pace` from stints endpoint

**Stint performance table (Recharts below timeline, inside same Panel):**
Use `GenericTable`:
- Columns: Driver | Stint # | Compound | Laps | Avg Pace | Best Lap | Deg Rate | Pit Loss
- All time values formatted as `m:ss.mmm`
- Deg rate: `pace_degradation` timedelta → seconds, displayed as `+Xs/lap`
- Pit loss: `pit_stop_loss` timedelta → seconds, displayed as `XX.Xs lost`; null = "N/A"
- Sort: by driver finishing position (outer), stint number (inner)
- Best `avg_pace` row across all drivers highlighted via `getRowVariant` with `--pos-p1` tint

**Degradation chart (Recharts LineChart inside Panel):**
- X-axis: stint number
- Y-axis: `pace_degradation` in seconds (higher = more degradation)
- One `Line` per driver, `--team-[name]` token colour
- Point per completed stint; label with compound pill at each point
- `ReferenceLine` at 0
- Recharts `Tooltip`: driver, stint, compound, degradation value, laps in stint

**Strategy summary cards (one per driver, Panel grid):**
- Total pit stops (distinct stints − 1)
- Compounds in order rendered as compound pill chain: `SOFT → MEDIUM → HARD`
- Total pit loss: sum of `pit_stop_loss` values in seconds
- Longest stint: stint number, compound, `laps_completed`
- Best stint pace: best `avg_pace` across their stints, which stint/compound

**Data integrity:**
- Convert all timedelta strings to seconds before all calculations
- `pit_stop_loss` null → display "N/A" not zero
- `compound` null → display "UNKNOWN" with `--color-muted` grey colour
- Driver bars in timeline must be contiguous from lap 1 to total laps; no gaps
- Stints endpoint and tyre-strategy endpoint must not produce conflicting lap ranges;
  use stints endpoint as authoritative for lap ranges, tyre-strategy for `pit_stop_lap` and `pit_stop_loss`
- Only render for session R or SQ

---

## SESSION: QUALIFYING (Q) & SPRINT QUALIFYING (SQ_QUALI)

Q and SQ share identical components and layout.
Pass `session=Q` for Qualifying and `session=SQ` for Sprint Qualifying to all endpoints.
No component here renders for R, FP1, FP2, or FP3.

---

### Q-1 · Session Progression & Track Evolution

**Valid sessions:** Q, SQ

**Data sources:**
- `useLapTimes(year, round, session)` → `/api/analysis/races/{year}/{round}/laps/?session={Q|SQ}`
  Fields: `driver_code`, `lap_number`, `lap_time`, `sector1`, `sector2`, `sector3`,
  `compound`, `stint`, `is_personal_best`
- Weather → `/api/unified/races/{year}/{round}/weather/?session={Q|SQ}&per_lap=true`
  Fields: `lap_number`, `track_temp_c`, `air_temp_c`, `humidity_pct`, `wind_speed_ms`, `rainfall`

**Lap classification (pre-process before any chart):**
- Flying lap: `lap_time` not null AND `lap_time ≤ 1.15 × driver's personal best`
- Out lap / in lap: `lap_time` null OR above threshold → exclude from time plots
- Personal best: `is_personal_best = true`

**Track evolution chart (Recharts ComposedChart inside Panel):**
- X-axis: `lap_number` (full session chronological)
- Y-axis left: lap time in seconds (flying laps only)
- Y-axis right: `track_temp_c` from weather endpoint, joined on `lap_number`
- All drivers' flying laps as `Scatter` dots coloured by compound
  using `--tyre-[compound]` tokens, reduced opacity
- Session rolling best lap `Line` (bold): for each lap number the minimum lap time
  set by any driver up to that point — coloured with `--pos-p1` token
- Track temperature as dashed `Line` on right `YAxis` using `--amber` token
- Phase background bands as `ReferenceArea`: Q1/Q2/Q3 (or SQ1/SQ2/SQ3)
  in distinct faint background fills
  Infer phase boundaries from lap number groupings (gaps where times spike above median)
  Label each band at top: "Q1", "Q2", "Q3"
- Rainfall laps: `ReferenceArea` with translucent `--blue` fill, label "Rain"

**Weather strip (below X-axis as a coloured tile row):**
- One tile per lap: track temp (cool=`--blue` tint, hot=`--amber` tint), rainfall icon
- If `track_temp_c` range exceeds 3°C annotate: "Track +Xc" arrow label

**Data integrity:**
- Join weather on `lap_number`; forward-fill nearest row if no exact match
- If weather `can_proceed=false`: render chart without temperature overlay;
  show "Weather data unavailable" inline notice
- Exclude null `lap_time` rows from scatter and rolling best line
- Only render for Q or SQ

---

### Q-2 · Elimination Cutoff Cards

**Valid sessions:** Q, SQ

**Data sources:**
- `useLapTimes` → same as Q-1
- `useQualifyingResults(year, round)` →
  `/api/races/{year}/{round}/qualifying/`
  Fields: `position`, `driver_name`, `driver_number`, `team`, `q1_time`, `q2_time`, `q3_time`

**Cutoff logic:**
- Q1 cutoff: `q1_time` of driver at position 15 (P15 advances, P16 eliminated)
- Q2 cutoff: `q2_time` of driver at position 10 (P10 advances, P11 eliminated)
- Q3: no cutoff
- Margin = driver phase time − cutoff time (negative = safe, positive = eliminated)
- Parse phase times from `"1:29.845"` format to seconds before computing margins

**Two cutoff cards (Q1 and Q2, each in a `Panel`):**

Card header: "Q1 Elimination Line" / "Q2 Elimination Line"
Cutoff time displayed prominently in `font-mono`
Driver sitting on cutoff (P15 / P10): `DriverCode` chip + team name

**Safe / Eliminated split (`GenericTable`):**
- ADVANCED group: drivers who progressed, sorted by phase time ascending
- ELIMINATED group: drivers who did not progress, sorted by phase time ascending
- Per row: `DriverCode` chip, team, phase time, margin formatted as `+X.XXXs` or `−X.XXXs`
  Margin colour: `--green` for safe, `--red` for eliminated
- Compound pill (from laps endpoint `is_personal_best` lap) using `--tyre-[compound]`
- Driver within 0.050s of cutoff on either side: `getRowVariant` highlighted border
  labelled "On the knife edge"

**Margin bar chart (Recharts BarChart, horizontal, inside Panel):**
- Each bar = one driver, length = absolute margin in milliseconds
- Bars left of centre = safe (`--green`), bars right = eliminated (`--red`)
- Centre zero line = cutoff time
- Sort: most safe at left extreme, most eliminated at right extreme
- Driver labels on Y-axis as `DriverCode` chips

**Q2 compound lock panel (inside Q2 card only):**
- List all Q3-advancing drivers (positions 1–10)
- Per driver: `DriverCode` chip, team, compound locked for race start
- Compound from: laps endpoint `is_personal_best=true` lap in Q2 phase
- Group by compound using `--tyre-[compound]` section headers
- Panel note: "Q2 compound lock — these drivers must start the race on this compound"

**Data integrity:**
- `q1_time`, `q2_time`, `q3_time` from qualifying results = authoritative for cutoffs
- Laps endpoint used only for compound identification on best lap
- Driver with no phase time: display "No Time Set" in eliminated group, null margin
- Only render for Q or SQ

---

### Q-3 · Sector Analysis & Theoretical Best

**Valid sessions:** Q, SQ

**Data sources:**
- `useLapTimes` → same as Q-1
- `useSectorAnalysis(year, round, session)` →
  `/api/analysis/races/{year}/{round}/sector-analysis/?session={Q|SQ}`
  Fields: `compound`, `sector`, `avg_time`, `min_time`, `max_time`, `lap_count`

**Per-driver theoretical best (compute client-side from laps data):**
- `best_s1` = min `sector1` across all valid flying laps per driver
- `best_s2` = min `sector2`
- `best_s3` = min `sector3`
- `theoretical_best` = `best_s1 + best_s2 + best_s3`
- `actual_best_lap` = min `lap_time` across all valid flying laps
- `gap_to_theoretical` = `actual_best_lap − theoretical_best`

**Session best sectors:**
- `session_best_s1/s2/s3` = min of each sector across all drivers
- `session_theoretical_best` = sum of all three session bests

**Sector dominance table (`GenericTable` inside Panel):**
- Columns: Driver | S1 | S2 | S3 | Theoretical Best | Actual Best | Gap to Theoretical
- Session-fastest sector: purple accent cell with "PURPLE" label using `--pos-p1` token
- Delta vs session best shown beneath each value in `font-mono --text-dim`
- Sort by `actual_best_lap` ascending
- Gap to theoretical colour: `--green` < 0.100s, `--amber` 0.100–0.300s, `--red` > 0.300s
- Drivers with fewer than 2 valid flying laps: "Limited data" badge via `getRowVariant`

**Sector split bar chart (Recharts BarChart, stacked horizontal, inside Panel):**
- One group per driver, three stacked bars per group: S1, S2, S3
  Each segment a distinct shade (consistent palette via semantic tokens)
- Session best sector bar: purple stroke outline using `--pos-p1`
- Sort by total stacked bar length (fastest at top)

**Driver head-to-head (two driver selectors, inside Panel):**
Side-by-side `GenericTable`:
- Three rows (S1, S2, S3): Driver A time | Sector | Driver B time | Delta
- Faster value in `--green`, slower in `--red`
- Below: theoretical best per driver, gap to theoretical, session theoretical for reference

**Sector improvement over session (Recharts ComposedChart, 3 stacked sub-charts, shared X-axis):**
- X-axis: `lap_number` (chronological)
- One chart per sector, Y-axis = sector time in seconds
- Per driver: `Line` with dots, `--team-[name]` colour
- Filled dot = `is_personal_best` lap, hollow dot = other laps

**Data integrity:**
- Exclude any lap with any null sector from all sector calculations
- Valid flying lap for sectors requires all three sector times non-null
- Do not mix Q and SQ data in the same session's charts
- Only render for Q or SQ

---

### Q-4 · Compound Usage & Tyre Strategy

**Valid sessions:** Q, SQ

**Data sources:**
- `useLapTimes` → same as Q-1
- `useQualifyingResults` → same as Q-2

**Compound usage timeline (Recharts ScatterChart inside Panel):**
- Y-axis: driver rows sorted by final qualifying position, `DriverCode` chips as labels
- X-axis: `lap_number` across full session
- Each flying lap = `Scatter` point coloured by `--tyre-[compound]`
- Point size encodes relative improvement: largest = personal best lap in session
- Personal best point: star border marker
- Phase background bands: `ReferenceArea` per Q1/Q2/Q3 as in Q-1

**Compound distribution cards (one per compound, `Panel` grid):**
- Compound name + `--tyre-[compound]` pill
- Drivers who used it (count)
- Fastest lap on it: `DriverCode` chip + time in `font-mono`
- Avg lap time delta vs SOFT average: `+X.XXXs` in `font-mono`
- Small `BarChart` showing driver count

**Q2 compound lock panel:**
- Same as described in Q-2 Elimination Cutoff Cards
- Render here as a standalone Panel also for discoverability

**Attempt analysis table (`GenericTable` inside Panel):**
- Columns: Driver | Phase | Lap # | Compound | Lap Time | Delta to Personal Best | Is Best
- Delta: `lap_time − driver session best`, formatted `+X.XXXs`
- Sort within driver group: lap number ascending
- Personal best row: `getRowVariant` gold tint via `--pos-p1`

**Data integrity:**
- Null compound laps: labelled "UNKNOWN", `--color-muted` grey, excluded from averages
- Q2 compound lock: use `is_personal_best=true` lap within Q2 phase laps
- Phase inference: lap number groupings (same method as Q-1)
- Only render for Q or SQ

---

### Q-5 · Driver Head-to-Head Qualifying Comparison

**Valid sessions:** Q, SQ

**Data sources:**
- `useLapTimes` → same as Q-1
- `useQualifyingResults` → same as Q-2

UI: Two driver selectors. Neither chart renders until both are selected.

**Phase summary table (`GenericTable` inside Panel):**
- Three rows: Q1, Q2, Q3 (or SQ1/SQ2/SQ3)
- Columns: Phase | Driver A Best | Driver B Best | Delta | Faster Driver
- Source: `q1_time`, `q2_time`, `q3_time` from qualifying results endpoint
- Delta = Driver A − Driver B in seconds, sign-formatted
- Faster driver cell: `DriverCode` chip with `--team-[name]` background
- DNQ cells: "DNQ" label with `--pos-rest` tint
- Overall verdict below table: `"Driver A qualified P[X], Driver B qualified P[Y]"`

**Lap attempt timeline (Recharts ComposedChart inside Panel):**
- X-axis: `lap_number`
- Y-axis: lap time in seconds
- Driver A: solid `Line` + filled `Scatter` dots; Driver B: dashed `Line` + hollow dots
- Both in respective `--team-[name]` colours
- Compound encoded as dot border colour using `--tyre-[compound]`
- Personal best marked with star
- Phase background bands as `ReferenceArea`

**Sector delta panel:**
Reuse the driver head-to-head sector panel from Q-3 verbatim.
Add "Who won qualifying?" verdict bar below:
- Horizontal split bar — Driver A team colour left, Driver B team colour right
- Width proportional to how many sectors each driver was fastest in
- Label: "Driver A: X purple sectors | Driver B: Y purple sectors"

**Improvement curve (Recharts LineChart inside Panel):**
- X-axis: attempt number (1st, 2nd, 3rd flying lap — normalised, not absolute lap number)
- Y-axis: lap time in seconds
- One `Line` per driver, team colours
- Delta `Line` below: Driver A attempt − Driver B attempt at matching attempt numbers

**Data integrity:**
- Phase best times from qualifying results = authoritative; laps endpoint = supplementary
- `q2_time`, `q3_time` null = DNQ for that phase
- Both drivers must have at least one valid flying lap; otherwise `EmptyState`
- Only render for Q or SQ

---

## SESSION: FP1

No elimination context. Lap times treated as exploratory.

---

### FP1-1 · Session Leaderboard Card

**Valid sessions:** FP1

**Data sources:**
- `usePracticeResults(year, round, "FP1")` → `/api/races/{year}/{round}/practice/FP1/`
  Fields: `position`, `driver_name`, `constructor`, `laps`, `best_lap`
- `useLapTimes` → `/api/analysis/races/{year}/{round}/laps/?session=FP1`
  (supplementary: used if results `can_proceed=false`)

`GenericTable` inside `Panel`:
- Columns: Position | Driver | Team | Best Lap | Laps Completed | Gap to P1
- `DriverCode` chip in Driver column
- Gap to P1: `best_lap − P1 best_lap` in `font-mono`
- Laps bar: small `BarChart` inline fill proportional to max laps in session
- Fewer than 3 laps: `getRowVariant` amber tint + "Limited running" badge
- Disclaimer note below table: "FP1 times are not representative of qualifying or race pace"

**Fallback:** if `can_proceed=false` on results endpoint, compute leaderboard from
`min(lap_time)` per driver from laps endpoint

---

### FP1-2 · Compound Sampling Map

**Valid sessions:** FP1

**Data source:** `useLapTimes` → `/api/analysis/races/{year}/{round}/laps/?session=FP1`

**Grid layout (custom SVG or CSS grid inside Panel):**
- Y-axis: driver rows sorted by practice result position, `DriverCode` chips
- X-axis: `lap_number`
- Each lap = coloured tile: filled with `--tyre-[compound]` token colour
- Null `lap_time` (out/in laps): faint outline tile, no fill
- Stints separated by thin vertical gap using `stint` field boundaries

**Compound summary strip (below grid):**
For each compound used: compound pill, driver count, fastest lap `DriverCode` chip + time

---

### FP1-3 · Best Lap Sector Overview

**Valid sessions:** FP1

**Data source:** `useLapTimes` → sector fields from each driver's `is_personal_best` lap

`GenericTable` inside `Panel`:
- Columns: Driver | S1 | S2 | S3 | Total Best Lap
- `DriverCode` chips in Driver column
- Session fastest sector: purple cell accent using `--pos-p1`
- Delta vs session best sector beneath each value in `font-mono --text-dim`
- Null sector: display "—"
- Sort by total best lap ascending
- Note: "Sector times from each driver's personal best lap only"

---

### FP1-4 · Weather Context Panel

**Valid sessions:** FP1

**Data source:** Weather → `/api/unified/races/{year}/{round}/weather/?session=FP1&per_lap=true`

**Recharts ComposedChart inside Panel:**
- X-axis: `lap_number`
- Left Y-axis: `track_temp_c` as `Line` using `--amber`
- Right Y-axis: `air_temp_c` as dashed `Line` using `--blue`
- Rainfall: `ReferenceArea` translucent `--blue` fill, label "Rain"

Stat summary row below chart in `font-mono`:
`"Session track temp range: XXc → XXc | Peak wind: X.Xm/s | Rainfall: Yes/No"`

If `track_temp_c` variance > 5°C: callout note
"Track temperature shifted significantly — early and late lap times are not directly comparable"

If weather `can_proceed=false`: `EmptyState` placeholder "Weather data unavailable"

---

## SESSION: FP2

FP2 is the race simulation session. Long run pace and tyre degradation are the centrepiece.

---

### FP2-1 · Long Run Pace Comparison

**Valid sessions:** FP2

**Data sources:**
- `useLapTimes` → `/api/analysis/races/{year}/{round}/laps/?session=FP2`
- `useAllStints` → `/api/analysis/races/{year}/{round}/stints/?session=FP2`
  Fields: `driver_code`, `stint`, `compound`, `lap_start`, `lap_end`, `lap_count`,
  `best_lap`, `avg_pace`, `pace_degradation`
- Weather → `/api/unified/races/{year}/{round}/weather/?session=FP2&per_lap=true`

**Long run detection:**
- Qualifying sim: `lap_count < 8` AND `compound = SOFT` AND
  `best_lap ≤ 1.05 × session overall best lap`
- Long run: `lap_count >= 8` (UI slider: min=5, max=20, default=8) AND `compound` not null
- Outlier within a stint: `lap_time > 1.15 × median lap_time of that stint`

**Main line chart (Recharts ComposedChart inside Panel):**
- X-axis: lap number within stint (normalised, 1 = first lap of that stint)
- Y-axis: lap time in seconds
- One `Line` per driver per long run stint, `--team-[name]` colour
  Line style encodes compound: SOFT=solid, MEDIUM=dashed, HARD=dotted
- Outlier laps: hollow grey `Scatter` dots, tooltip "Possible out lap / traffic / incident"
- Linear regression trend `Line` per stint in lighter shade via `--color-muted`

Degradation rate stat block per driver below chart:
`"Deg rate: +X.XXXs per lap"` — `--green` < 0.050s/lap, `--amber` 0.050–0.150s/lap, `--red` > 0.150s/lap

**Long run summary table (`GenericTable` inside Panel):**
- Columns: Driver | Compound | Laps | Avg Pace | Best Lap | Deg Rate | Track Temp (avg during run)
- Track temp per run: average `track_temp_c` across laps in that stint from weather data
- Sort by `avg_pace` ascending
- Compound group headers separating MEDIUM and HARD run sections

---

### FP2-2 · Degradation Curve Chart

**Valid sessions:** FP2

**Data source:** `useLapTimes` (long run stints only from FP2-1 detection)

**Recharts LineChart inside Panel:**
- X-axis: lap within stint (1 → max laps)
- Y-axis: delta to that driver's lap 1 time in that stint (seconds, lap 1 = 0.0 baseline)
- One `Line` per driver per long run stint, `--team-[name]` colour
- Same-compound drivers grouped in same sub-chart panel for direct comparison
- Shaded `ReferenceArea` for ±1 std dev of field degradation per compound
  using `--color-muted` at 20% opacity

---

### FP2-3 · Compound Performance Comparison

**Valid sessions:** FP2

**Data source:** `useLapTimes` (long run stints, outliers excluded)

**Recharts ComposedChart inside Panel:**
- X-axis: compound (SOFT, MEDIUM, HARD) groupings
- Y-axis: lap time in seconds
- Box plot distribution per compound (implement as custom `Rectangle` shapes
  representing Q1, median, Q3 quartiles using Recharts `customized` prop)
  Fill = `--tyre-[compound]` at 40% opacity
- Driver median dots overlaid as `Scatter` points, labelled with `DriverCode` chips

Compound delta table below chart (`GenericTable`):
- MEDIUM vs SOFT: `+X.XXXs` avg delta per lap
- HARD vs SOFT: `+X.XXXs` avg delta per lap
- HARD vs MEDIUM: `+X.XXXs` avg delta per lap

---

### FP2-4 · Qualifying Sim Laps

**Valid sessions:** FP2

**Data source:** `useLapTimes` filtered to qualifying sim stints (FP2-1 detection)

`GenericTable` inside `Panel`:
Same structure as FP1-1 leaderboard with these differences:
- Label: "Qualifying Simulation Pace"
- Note: "Short soft-tyre runs only — not race simulation data"
- Extra column: "Lap #" showing which lap the best time was set on
- Drivers with no qualifying sim laps: row labelled "Race sim only — no quali sim"
  via `getRowVariant` muted tint

---

### FP2-5 · Weather Correlation

**Valid sessions:** FP2

Same structure as FP1-4 Weather Context Panel with this addition:
- Each driver's long run lap range shown as a horizontal bracket above the
  temperature chart using `ReferenceArea` with driver team colour stroke and label
- If two teams' long run bracket areas have `track_temp_c` delta > 3°C:
  callout: "Race simulation times may not be directly comparable — track temp delta: +Xc"

---

## SESSION: FP3

FP3 reuses qualifying components. No elimination context.

---

### FP3-1 · Session Leaderboard

**Valid sessions:** FP3

Same structure as FP1-1 with these differences:
- Remove FP1 disclaimer
- Add note: "FP3 pace is the strongest indicator of qualifying performance"
- `getRowVariant` tints:
  - Rows 1–10: `--pos-p1` / `--pos-points` gold tint (projected Q3)
  - Rows 11–15: `--amber` tint (projected Q2 bubble)
  - Rows 16–20: `--red` tint (projected Q1 danger zone)
- Label section: "Projected Quali Zones (indicative)"

---

### FP3-2 · Sector Analysis

**Valid sessions:** FP3

Reuse Q-3 (Sector Analysis & Theoretical Best) component verbatim.
Pass `session=FP3` to all endpoint calls.
Do not render elimination cutoff context.
Add contextual note above component:
"Sector analysis from FP3 — most predictive of qualifying sector performance"

---

### FP3-3 · Compound Usage

**Valid sessions:** FP3

Reuse Q-4 (Compound Usage & Tyre Strategy) component verbatim.
Pass `session=FP3`.
Remove the Q2 Compound Lock Panel entirely.
Add note: "Compound used in FP3 flying laps often indicates qualifying tyre preference"

---

### FP3-4 · Weather Context Panel

**Valid sessions:** FP3

Identical to FP1-4. Pass `session=FP3`.
Additional callout if FP3 `track_temp_c` avg differs from qualifying session avg by > 5°C:
"FP3 conditions differ from qualifying — pace comparison should account for temperature delta"

---

## CROSS-SESSION PROGRESSION VIEW (Practice Toggle)

Accessible via toggle above FP1/FP2/FP3 individual views.
Fetches all three practice sessions in parallel. Renders progressively as each resolves.
If any session returns `can_proceed=false`: exclude from charts; show
"FP[X] data unavailable" inline notice per affected session.

**Data sources (all parallel):**
- Laps: FP1, FP2, FP3 → `/api/analysis/races/{year}/{round}/laps/?session={FP1|FP2|FP3}`
- Results: FP1, FP2, FP3 → `/api/races/{year}/{round}/practice/{FP1|FP2|FP3}/`
- Weather: FP1, FP2, FP3 → `/api/unified/races/{year}/{round}/weather/?session={FP1|FP2|FP3}&per_lap=true`

---

### XS-1 · Best Lap Progression Chart

**Recharts LineChart inside Panel:**
- X-axis: three points — FP1, FP2, FP3 (evenly spaced)
- Y-axis left: best lap time in seconds
- One `Line` per driver, `--team-[name]` colour
- Missing session: line break at that point, hollow dot, tooltip "No data"
- "Field average" `Line` in `--color-muted` grey

**Improvement delta table (`GenericTable` below chart):**
- Columns: Driver | FP1 Best | FP2 Best | FP3 Best | FP1→FP3 Delta | Trend
- FP1→FP3 Delta: negative (faster) = `--green`, positive (slower) = `--red`
- Trend: small inline sparkline of three values
- Sort by FP3 best ascending

---

### XS-2 · Sector Progression Chart

**Three stacked Recharts LineCharts (shared X-axis: FP1, FP2, FP3) inside Panel:**
- One chart per sector (S1, S2, S3)
- Y-axis: best sector time in seconds for that session
- One `Line` per driver, `--team-[name]` colour
- Session theoretical best `Line` (sum of session best sectors) per session
  rendered in `--pos-p1` across all three charts

---

### XS-3 · Compound Performance Evolution

**Recharts BarChart grouped inside Panel:**
- X-axis: sessions (FP1, FP2, FP3) grouped by compound
- Y-axis: best lap time on that compound in seconds
- Bars coloured by `--tyre-[compound]`
- Only include compounds from long runs or flying laps (exclude outlier laps)
- Callout if compound is slower in FP3 than FP1:
  "Track conditions or setup changes may explain this regression"

---

### XS-4 · Weather Across Sessions Panel

**Recharts ComposedChart inside Panel (continuous timeline):**
- X-axis: continuous across FP1, FP2, FP3 with visible `ReferenceLine` dividers
  and session boundary labels
- Y-axis: `track_temp_c` as `Line` using `--amber`
- Rainfall periods: `ReferenceArea` translucent `--blue` across all sessions

Session summary strip below chart (one block per session):
Avg track temp, avg air temp, rainfall yes/no, wind speed range — all in `font-mono`

If FP3 avg `track_temp_c` within 3°C of historical qualifying temp for circuit:
"FP3 conditions closely match typical qualifying conditions at this circuit"

---

## DATA INTEGRITY MASTER RULES (All Sessions)

1. **Time conversion:** All timedelta strings (`"0 days 00:01:37.123000"`) → total seconds
   before any calculation or chart rendering. No exceptions.
2. **Qualifying times** (`"1:29.845"` format) parsed separately to seconds.
3. **Display format:** `m:ss.mmm` for times, `+X.XXXs` / `−X.XXXs` for deltas.
   All numeric values in `font-mono`.
4. **Outlier exclusion:** `lap_time > 1.15 × driver personal best` → exclude from pace
   calculations; retain in sequence context where noted.
5. **Null handling:** Null `lap_time` → exclude from all time charts and averages.
   Null sector times → exclude from sector calculations only.
   Null `compound` → display "UNKNOWN" with `--color-muted`; exclude from compound averages.
   Null `pit_stop_loss` → display "N/A".
6. **can_proceed=false:** Always degrade gracefully using `EmptyState` component.
   Never throw unhandled errors. Show `message` field from response.
7. **Parallel fetches:** Cross-session components must fetch all sessions simultaneously;
   never chain sequentially.
8. **Session gating:** Every component checks its valid session list before rendering.
   Invalid session → `EmptyState` with explanation.
9. **Driver identity:** Always `DriverCode` chip; never raw text string.
10. **Colours:** Always CSS variable tokens; never hardcoded hex or RGB.
11. **Chart colours:** Resolve via `getComputedStyle(document.documentElement).getPropertyValue()`
    before passing to Recharts props.
12. **Tyre token reference:**
    `SOFT → --tyre-soft`, `MEDIUM → --tyre-medium`, `HARD → --tyre-hard`,
    `INTER → --tyre-inter`, `WET → --tyre-wet`
13. **Position token reference:**
    P1 → `--pos-p1`, P2 → `--pos-p2`, P3 → `--pos-p3`,
    Points → `--pos-points`, Rest → `--pos-rest`
14. **Recharts component reference:**
    Time series → `LineChart` / `ComposedChart`
    Bars → `BarChart`
    Scatter → `ScatterChart`
    Mixed → `ComposedChart`
    Binary step traces → `ComposedChart` with step-interpolated `Line` (type="stepAfter")
    Gantt/strategy → custom SVG or `ReferenceArea` inside `ComposedChart`

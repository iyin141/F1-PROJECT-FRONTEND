# Lap Comparison Panel Journal

This document outlines the architecture, data processing, and plotting implementation of the Lap Comparison functionality within the F1 Control Room application.

## 1. Overview and Container Architecture

The lap comparison functionality is orchestrated by the `LapComparisonShell` component. This component acts as a high-level layout workspace that manages driver selection state and coordinates several distinct analytical panels.

### State Management
- **Local State**: `LapComparisonShell` manages `driverA` and `driverB` IDs using standard React `useState`. 
- **Prop Drilling**: It receives the active `year`, `round`, `session`, and available `drivers` array as props, and passes the selected driver IDs down to child panels to ensure they all synchronize to the same comparative context.

### Layout Grid
The shell is laid out using CSS Grid and Flexbox:
- A top control bar provides simple `<select>` dropdowns for Driver A and Driver B.
- A full-width `TyreStrategyPanel` (only visible during Race sessions).
- A 2-column grid containing the `PaceComparison` (lap time trace) and the `SectorHeatmap`.
- A full-width `DriverTelemetryPanel` at the bottom for micro-lap analysis.

---

## 2. Pace Comparison (Lap Time Trace)

The `PaceComparison.tsx` component is responsible for plotting macro lap times across an entire session.

### Data Fetching
It utilizes two primary hooks:
- `useLapTimes`: Fetches every lap time recorded during the session.
- `useRacePositions`: Fetches lap-by-lap track status (e.g., Green, SC, VSC) to contextualize lap times.

### Data Processing
The `useMemo` block in `PaceComparison` is heavily optimized for chart rendering:
1. **Safety Car Bands**: `deriveSCBands` scans the track status of every lap to produce an array of `{ lapFrom, lapTo, type: "SC" | "VSC" }` objects.
2. **Outlier Detection**: Clean laps are separated from anomalous laps (pit laps, SC/VSC laps, lap 1, or laps > 107% of the driver's median time).
3. **P95 Clipping**: To prevent a single 3-minute pit stop from ruining the Y-axis scale, the chart calculates the 95th percentile (`p95`) of all valid lap times and clips the upper domain of the Y-axis.

### Plotting with Recharts
The chart uses a Recharts `<ComposedChart>` to overlay multiple data layers:
- **X-Axis**: Lap number.
- **Y-Axis**: Time in seconds (rendered as MM:SS.xxx via `secondsToHMS`). The Y-axis is effectively reversed by the semantic context (lower is faster, visually emphasized by the `FASTER ↓` label).
- **SC/VSC Reference Areas**: Rendered using Recharts `<ReferenceArea>` blocks filled with yellow opacity to highlight neutralized laps.
- **Lines (Compare Mode)**: 
  - Valid laps are plotted with `<Line>` connecting points.
  - Outliers are plotted using a separate transparent `<Line>` with a custom `<OutlierDot>` to render them as disconnected ghost circles.
- **Pit Markers**: A custom SVG `<rect>` is drawn directly on the X-axis mapping using `<Customized>` to indicate exactly which laps a driver pitted on.
- **Scatter (All Mode)**: If evaluating all drivers, data is plotted as a scatter plot colored by tyre compound (`soft`, `medium`, `hard`, `inter`, `wet`) using the `tyreToken` design system helper.

---

## 3. Driver Telemetry Panel

The `DriverTelemetryPanel.tsx` dives into the micro-analysis of a single lap, plotting raw telemetry (speed, throttle, brake) against distance.

### Data Fetching
- `useLapTimes`: Used implicitly here to find the "Fastest Clean Lap" for the selected driver to provide a smart default lap number.
- `usePersistentTelemetry`: Fetches high-resolution car telemetry for a specific `year`, `round`, `driverId`, and `lapNum`.

### Data Processing
The telemetry array is mapped to guarantee standardized formats:
- Speed (km/h) is kept as-is.
- Throttle (0-100%) is mapped directly.
- Brake (boolean) is converted to a `100` or `0` percentage so it can be plotted alongside throttle on the same secondary Y-axis.

### Plotting with Recharts
- **X-Axis**: Track Distance (meters), which correctly normalizes the X-axis for speed variations compared to plotting against time.
- **Dual Y-Axes**:
  1. `yAxisId="speed"`: Left side, scaled dynamically `[min - 5, max + 5]` for km/h.
  2. `yAxisId="pct"`: Right side, locked `[0, 100]` domain for pedal inputs.
- **Lines**:
  - Speed: Plotted on the left axis with a blue stroke.
  - Throttle: Plotted on the right axis with a green stroke.
  - Brake: Plotted on the right axis with a red stroke.
- **Responsive Layout**: Uses a custom `useResizeObserver` hook to avoid rendering the heavy SVG until the container width is known, preventing layout shift anomalies.

## 4. Aesthetics and Theming
Both panels strictly adhere to the F1 Control Room design language:
- **Monospace Typography**: `font-mono` is used for all axes, tooltips, and labels to mimic raw data terminals.
- **CSS Variables**: Colors are drawn from the global CSS scope (e.g., `hsl(var(--blue))`, `rgba(255,255,255,0.4)`) to support instant light/dark mode toggling.
- **Team Colors**: In compare mode, drivers are assigned a color from a predefined array (`#0088FF`, `#E8002D`, etc.) which maps to their respective car/team color logic.

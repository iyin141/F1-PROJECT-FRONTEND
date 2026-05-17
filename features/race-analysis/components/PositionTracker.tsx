'use client';

import { useMemo, useRef, useCallback } from "react";
import * as d3 from "d3";
import { EmptyState } from "@/components/EmptyState";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { teamColor } from "@/components/DriverCode";
import Skeleton from "@/components/animations/Skeleton";
import { driverById } from "@/Lib/data/drivers";
import { useRacePositions } from "@/features/race-analysis/hooks/useRaceAnalysis";
import type { AnalysisDriverOption } from "@/features/race-analysis/components/DriverSelect";
import type { UnifiedPositionRow } from "@/types/endpoints";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DriverTrace {
  code: string;
  teamColor: string;
  laps: Array<{ lap: number; pos: number }>;
  finalPosition: number;
  isTopThree: boolean;
}

interface ScBand {
  lapFrom: number;
  lapTo: number;
  type: "SC" | "VSC";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHART_H = 440;
const MARGIN = { top: 16, right: 56, bottom: 32, left: 28 };
const GRID_POSITIONS = [1, 5, 10, 15, 20];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive SC/VSC bands from per-row track_status. */
function deriveSCBands(rows: UnifiedPositionRow[]): ScBand[] {
  const lapStatus = new Map<number, string>();
  for (const r of rows) {
    const status = (r.track_status ?? "").toUpperCase();
    if (status && !lapStatus.has(r.lap_number)) {
      lapStatus.set(r.lap_number, status);
    }
  }
  const bands: ScBand[] = [];
  let current: ScBand | null = null;
  const sortedLaps = [...lapStatus.entries()].sort((a, b) => a[0] - b[0]);
  for (const [lap, status] of sortedLaps) {
    const type = status.includes("VIRTUAL") || status === "VSC" ? "VSC" : status.includes("SAFETY") || status === "SC" ? "SC" : null;
    if (type) {
      if (current && current.type === type && current.lapTo === lap - 1) {
        current.lapTo = lap;
      } else {
        if (current) bands.push(current);
        current = { lapFrom: lap, lapTo: lap, type };
      }
    } else {
      if (current) bands.push(current);
      current = null;
    }
  }
  if (current) bands.push(current);
  return bands;
}

/** Build per-driver traces from flat position rows. */
function buildTraces(rows: UnifiedPositionRow[], finishers: AnalysisDriverOption[]): DriverTrace[] {
  const byDriver = new Map<string, Array<{ lap: number; pos: number }>>();
  for (const r of rows) {
    const code = r.driver_code ?? r.driver ?? "";
    if (!code) continue;
    if (!byDriver.has(code)) byDriver.set(code, []);
    byDriver.get(code)!.push({ lap: r.lap_number, pos: r.position });
  }

  // Sort laps within each driver
  for (const [, laps] of byDriver) {
    laps.sort((a, b) => a.lap - b.lap);
  }

  // Determine final positions (last lap)
  const finalPositions = new Map<string, number>();
  for (const [code, laps] of byDriver) {
    finalPositions.set(code, laps[laps.length - 1]?.pos ?? 20);
  }

  return [...byDriver.entries()].map(([code, laps]) => {
    const driver = driverById(code);
    const finisherInfo = finishers.find((f) => f.code === code);
    const team = driver?.team ?? finisherInfo?.team;
    const color = team ? teamColor(team) : "hsl(var(--muted))";
    const finalPos = finalPositions.get(code) ?? 20;
    return {
      code,
      teamColor: color,
      laps,
      finalPosition: finalPos,
      isTopThree: finalPos <= 3,
    };
  }).sort((a, b) => a.finalPosition - b.finalPosition);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PositionTracker = ({
  year,
  round,
  drivers,
  session = "R",
}: {
  year: number;
  round: number;
  drivers: AnalysisDriverOption[];
  session?: string;
}) => {
  const { data: positionsData, isLoading } = useRacePositions(year, round, true, session);
  const { ref, size } = useResizeObserver<HTMLDivElement>();
  const tooltipRef = useRef<SVGGElement | null>(null);

  const { traces, scBands, xDomain, maxPos } = useMemo(() => {
    if (!positionsData?.data?.length) {
      return { traces: [], scBands: [], xDomain: [1, 70] as [number, number], maxPos: 20 };
    }
    const rows = positionsData.data;
    const t = buildTraces(rows, drivers);
    const bands = deriveSCBands(rows);
    const lapNums = rows.map((r) => r.lap_number);
    const xDomain: [number, number] = [
      Math.min(...lapNums),
      Math.max(...lapNums),
    ];
    const maxPos = Math.max(...rows.map((r) => r.position), 20);
    return { traces: t, scBands: bands, xDomain, maxPos };
  }, [positionsData, drivers]);

  const chart = useMemo(() => {
    if (!traces.length || size.width < 80) return null;
    const innerW = Math.max(0, size.width - MARGIN.left - MARGIN.right);
    const innerH = CHART_H - MARGIN.top - MARGIN.bottom;

    const x = d3.scaleLinear().domain(xDomain).range([0, innerW]);
    const y = d3.scaleLinear().domain([0.5, maxPos + 0.5]).range([0, innerH]);

    const lineGen = d3
      .line<{ lap: number; pos: number }>()
      .x((d) => x(d.lap))
      .y((d) => y(d.pos))
      .curve(d3.curveMonotoneX);

    return { x, y, lineGen, innerW, innerH };
  }, [traces, size.width, xDomain, maxPos]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (!chart || !tooltipRef.current || !positionsData?.data) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const xPos = e.clientX - rect.left;
      const lap = Math.round(chart.x.invert(xPos));
      const clampedLap = Math.max(xDomain[0], Math.min(xDomain[1], lap));

      const rows = positionsData.data.filter((r) => r.lap_number === clampedLap);
      const sorted = rows.sort((a, b) => a.position - b.position);

      const g = tooltipRef.current;
      // Clear previous
      while (g.firstChild) g.removeChild(g.firstChild);

      // Vertical crosshair
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(chart.x(clampedLap)));
      line.setAttribute("x2", String(chart.x(clampedLap)));
      line.setAttribute("y1", "0");
      line.setAttribute("y2", String(chart.innerH));
      line.setAttribute("stroke", "hsl(var(--text-dim))");
      line.setAttribute("stroke-width", "1");
      line.setAttribute("stroke-dasharray", "3 3");
      g.appendChild(line);

      // Dots on each trace at crosshair lap
      for (const row of sorted.slice(0, 10)) {
        const t = traces.find((t) => t.code === (row.driver_code ?? row.driver ?? ""));
        if (!t) continue;
        const cx = chart.x(clampedLap);
        const cy = chart.y(row.position);
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", String(cx));
        circle.setAttribute("cy", String(cy));
        circle.setAttribute("r", "3");
        circle.setAttribute("fill", t.teamColor);
        circle.setAttribute("stroke", "hsl(var(--surface))");
        circle.setAttribute("stroke-width", "1.5");
        g.appendChild(circle);
      }
    },
    [chart, positionsData, xDomain, traces],
  );

  const handleMouseLeave = useCallback(() => {
    if (!tooltipRef.current) return;
    while (tooltipRef.current.firstChild) tooltipRef.current.removeChild(tooltipRef.current.firstChild);
  }, []);

  if (isLoading) return <Skeleton height={320} />;

  if (!positionsData?.data?.length || !traces.length) {
    return (
      <EmptyState
        message="Position data unavailable"
        description="Position tracking data has not been collected for this race."
      />
    );
  }

  if (!chart) return <div ref={ref} className="h-110 w-full" />;

  const { x, y, lineGen, innerW, innerH } = chart;

  return (
    <div className="space-y-3">
      {/* Legend — top finishers */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        {traces.filter((t) => t.isTopThree).map((t) => (
          <div key={t.code} className="flex items-center gap-1.5">
            <span
              className="h-0.5 w-5 rounded-full"
              style={{ backgroundColor: t.teamColor }}
            />
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "hsl(var(--text-dim))" }}
            >
              {t.code}
            </span>
          </div>
        ))}
        {scBands.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-4 rounded-sm" style={{ background: "hsl(var(--amber) / 0.22)" }} />
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "hsl(var(--muted))" }}>SC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-4 rounded-sm" style={{ background: "hsl(var(--amber) / 0.12)" }} />
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "hsl(var(--muted))" }}>VSC</span>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <div ref={ref} className="w-full">
        {size.width > 80 && (
          <svg width={size.width} height={CHART_H} style={{ display: "block", overflow: "visible" }}>
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* SC/VSC bands */}
              {scBands.map((band, i) => (
                <rect
                  key={i}
                  x={x(band.lapFrom - 0.5)}
                  y={0}
                  width={Math.max(0, x(band.lapTo + 0.5) - x(band.lapFrom - 0.5))}
                  height={innerH}
                  fill={band.type === "SC" ? "hsl(var(--amber) / 0.12)" : "hsl(var(--amber) / 0.06)"}
                />
              ))}

              {/* Horizontal grid + Y axis labels */}
              {GRID_POSITIONS.map((pos) => (
                <g key={pos} transform={`translate(0,${y(pos)})`}>
                  <line
                    x2={innerW}
                    stroke="hsl(var(--border-subtle))"
                    strokeOpacity={0.4}
                  />
                  <text
                    x={-6}
                    dy="0.32em"
                    textAnchor="end"
                    style={{
                      fontSize: 9,
                      fill: "hsl(var(--muted))",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    P{pos}
                  </text>
                </g>
              ))}

              {/* X axis ticks */}
              {x.ticks(10).map((t) => (
                <g key={t} transform={`translate(${x(t)},${innerH})`}>
                  <line y2={4} stroke="hsl(var(--border-subtle))" strokeOpacity={0.4} />
                  <text
                    y={13}
                    textAnchor="middle"
                    style={{
                      fontSize: 9,
                      fill: "hsl(var(--muted))",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {t}
                  </text>
                </g>
              ))}

              {/* X axis label */}
              <text
                x={innerW / 2}
                y={innerH + 28}
                textAnchor="middle"
                style={{
                  fontSize: 8,
                  fill: "hsl(var(--muted))",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                LAP
              </text>

              {/* Driver lines — muted first, then top 3 on top */}
              {traces.filter((t) => !t.isTopThree).map((t) => (
                <path
                  key={t.code}
                  d={lineGen(t.laps) ?? undefined}
                  fill="none"
                  stroke={t.teamColor}
                  strokeWidth={1}
                  strokeOpacity={0.28}
                />
              ))}
              {traces.filter((t) => t.isTopThree).map((t) => (
                <path
                  key={t.code}
                  d={lineGen(t.laps) ?? undefined}
                  fill="none"
                  stroke={t.teamColor}
                  strokeWidth={2.2}
                  strokeOpacity={0.92}
                />
              ))}

              {/* End-of-race driver code labels on right edge */}
              {traces.map((t) => {
                const last = t.laps[t.laps.length - 1];
                if (!last) return null;
                return (
                  <text
                    key={t.code}
                    x={innerW + 4}
                    y={y(last.pos)}
                    dy="0.32em"
                    style={{
                      fontSize: t.isTopThree ? 10 : 8,
                      fontWeight: t.isTopThree ? 700 : 400,
                      fill: t.isTopThree ? t.teamColor : "hsl(var(--muted))",
                      fontFamily: "var(--font-mono)",
                      opacity: t.isTopThree ? 1 : 0.6,
                    }}
                  >
                    {t.code}
                  </text>
                );
              })}

              {/* Tooltip layer (imperative via ref) */}
              <g ref={tooltipRef} />

              {/* Hover capture rect */}
              <rect
                x={0}
                y={0}
                width={innerW}
                height={innerH}
                fill="transparent"
                style={{ cursor: "crosshair" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            </g>
          </svg>
        )}
      </div>
    </div>
  );
};

'use client';

import { useMemo } from "react";
import * as d3 from "d3";
import { driverById } from "@/Lib/data/drivers";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { useLapTimes } from "@/features/race-analysis/hooks/useRaceAnalysis";
import type { LapTime } from "@/types/ui";

const CHART_H = 280;
const MARGIN = { top: 14, right: 16, bottom: 30, left: 46 };
const COLORS = ["hsl(var(--blue))", "hsl(var(--red))", "hsl(var(--amber))"] as const;
const COMPOUND_COLORS: Record<string, string> = {
  soft: "hsl(var(--red))",
  medium: "hsl(var(--amber))",
  hard: "hsl(var(--text))",
  inter: "hsl(var(--green))",
  wet: "hsl(var(--blue))",
};

export const PaceComparison = ({
  year,
  round,
  mode = "compare",
  driverAId,
  driverBId,
  driverCId,
}: {
  year: number;
  round: number;
  mode?: "compare" | "all";
  driverAId?: string;
  driverBId?: string;
  driverCId?: string;
}) => {
  const { data: laps, isLoading } = useLapTimes(year, round);
  const { ref, size } = useResizeObserver<HTMLDivElement>();

  const chart = useMemo(() => {
    const data = laps;
    if (!data || size.width < 60) return null;
    const innerW = Math.max(0, size.width - MARGIN.left - MARGIN.right);
    const innerH = CHART_H - MARGIN.top - MARGIN.bottom;

    if (mode === "all") {
      const points = data
        .filter((l: LapTime) => !l.pit)
        .map((l: LapTime) => ({
          lap: l.lap,
          timeSec: l.timeMs / 1000,
          compound: (l.compound ?? "soft").toLowerCase(),
          driverId: l.driverId,
        }));

      if (!points.length) return null;

      const allTimes = points.map((p) => p.timeSec).sort(d3.ascending);
      const allLapNums = points.map((p) => p.lap);
      const p95 = d3.quantile(allTimes, 0.95) ?? 95;
      const minT = (allTimes[0] ?? 80) - 0.5;

      const x = d3
        .scaleLinear()
        .domain([d3.min(allLapNums) ?? 1, d3.max(allLapNums) ?? 1])
        .range([0, innerW]);

      const y = d3.scaleLinear().domain([minT, p95 + 1]).range([innerH, 0]).nice();

      return { kind: "all" as const, points, x, y, p95, innerW, innerH };
    }

    const selectedIds = [driverAId, driverBId, driverCId].filter(Boolean) as string[];
    if (selectedIds.length < 2) return null;

    const traces = selectedIds.map((id) => ({
      id,
      laps: data
        .filter((l: LapTime) => l.driverId === id && !l.pit)
        .sort((a, b) => a.lap - b.lap)
        .map((l: LapTime) => ({ lap: l.lap, timeSec: l.timeMs / 1000 })),
    }));

    const allTimes = traces.flatMap((t) => t.laps.map((l) => l.timeSec)).sort(d3.ascending);
    if (!allTimes.length) return null;

    const allLapNums = traces.flatMap((t) => t.laps.map((l) => l.lap));
    const p95 = d3.quantile(allTimes, 0.95) ?? 95;
    const minT = (allTimes[0] ?? 80) - 0.5;

    const x = d3
      .scaleLinear()
      .domain([d3.min(allLapNums) ?? 1, d3.max(allLapNums) ?? 1])
      .range([0, innerW]);

    const y = d3.scaleLinear().domain([minT, p95 + 1]).range([innerH, 0]).nice();

    const lineGen = d3
      .line<{ lap: number; timeSec: number }>()
      .x((d) => x(d.lap))
      .y((d) => y(Math.min(d.timeSec, p95 + 1)))
      .curve(d3.curveMonotoneX);

    return { kind: "compare" as const, traces, x, y, lineGen, p95, innerW, innerH };
  }, [laps, size.width, mode, driverAId, driverBId, driverCId]);

  if (isLoading) return <div className="h-70" />;

  return (
    <div ref={ref} className="w-full">
      {chart && size.width > 60 ? (
        <>
          <svg
            width={size.width}
            height={CHART_H}
            style={{ overflow: "visible", display: "block" }}
          >
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* Grid */}
              {chart.y.ticks(5).map((t) => (
                <g key={t} transform={`translate(0,${chart.y(t)})`}>
                  <line
                    x2={chart.innerW}
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
                    {t.toFixed(1)}
                  </text>
                </g>
              ))}
              {chart.x.ticks(8).map((t) => (
                <g key={t} transform={`translate(${chart.x(t)},${chart.innerH})`}>
                  <line y2={4} stroke="hsl(var(--border-subtle))" strokeOpacity={0.4} />
                  <text
                    y={14}
                    textAnchor="middle"
                    style={{
                      fontSize: 9,
                      fill: "hsl(var(--muted))",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    L{t}
                  </text>
                </g>
              ))}

              {/* Traces */}
              {chart.kind === "compare" &&
                chart.traces.map((tr, i) => (
                  <path
                    key={tr.id}
                    d={chart.lineGen(tr.laps) ?? ""}
                    fill="none"
                    stroke={COLORS[i]}
                    strokeWidth={1.8}
                    strokeOpacity={0.9}
                  />
                ))}

              {chart.kind === "all" &&
                chart.points.map((p, i) => (
                  <circle
                    key={`${p.driverId}-${p.lap}-${i}`}
                    cx={chart.x(p.lap)}
                    cy={chart.y(Math.min(p.timeSec, chart.p95 + 1))}
                    r={2.1}
                    fill={COMPOUND_COLORS[p.compound] ?? "hsl(var(--muted))"}
                    fillOpacity={0.72}
                  >
                    <title>{`${p.driverId} · L${p.lap} · ${p.timeSec.toFixed(3)}s`}</title>
                  </circle>
                ))}
            </g>
          </svg>

          {/* Legend */}
          <div
            className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 px-1 font-mono text-[10px]"
            style={{ color: "hsl(var(--muted))" }}
          >
            {chart.kind === "compare" &&
              chart.traces.map((tr, i) => {
                const drv = driverById(tr.id);
                return (
                  <span key={tr.id} className="flex items-center gap-1.5">
                    <span className="h-px w-5" style={{ background: COLORS[i] }} />
                    <span style={{ color: "hsl(var(--text-dim))" }}>
                      {String.fromCharCode(65 + i)} · {drv?.code ?? tr.id}
                    </span>
                  </span>
                );
              })}

            {chart.kind === "all" && (
              <>
                {([
                  ["soft", "SOFT"],
                  ["medium", "MEDIUM"],
                  ["hard", "HARD"],
                  ["inter", "INTER"],
                  ["wet", "WET"],
                ] as const).map(([key, label]) => (
                  <span key={key} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COMPOUND_COLORS[key] }} />
                    <span style={{ color: "hsl(var(--text-dim))" }}>{label}</span>
                  </span>
                ))}
              </>
            )}

            <span className="ml-auto text-[9px]" style={{ color: "hsl(var(--muted-2))" }}>
              pit laps excluded · clipped at p95 ({chart.p95.toFixed(1)}s)
            </span>
          </div>
        </>
      ) : (
        <div
          className="flex h-70 items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "hsl(var(--muted))" }}
        >
          {mode === "all" ? "NO LAP DATA AVAILABLE" : "SELECT TWO OR THREE DRIVERS ABOVE"}
        </div>
      )}
    </div>
  );
};

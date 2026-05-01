'use client';

import { useMemo } from "react";
import * as d3 from "d3";
import { driverById } from "@/Lib/data/drivers";
import { Skeleton } from "@/components/Skeleton";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import type { LapTime } from "@/types/ui";
import { useAllLaps } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { adaptLapTimes } from "@/Lib/adapters";

const CHART_H = 280;
const MARGIN = { top: 14, right: 16, bottom: 30, left: 46 };
const COLORS = ["hsl(var(--blue))", "hsl(var(--red))"] as const;

export const PaceComparison = ({
  year,
  round,
  driverAId,
  driverBId,
}: {
  year: number;
  round: number;
  driverAId?: string;
  driverBId?: string;
}) => {
  const { data: lapsData, isLoading } = useAllLaps(year, round);
  const laps = { data: lapsData ? adaptLapTimes(lapsData) : undefined, loading: isLoading };
  const { ref, size } = useResizeObserver<HTMLDivElement>();

  const chart = useMemo(() => {
    if (!laps.data || size.width < 60 || !driverAId || !driverBId) return null;

    const innerW = Math.max(0, size.width - MARGIN.left - MARGIN.right);
    const innerH = CHART_H - MARGIN.top - MARGIN.bottom;

    const traces = [driverAId, driverBId].map((id) => ({
      id,
      laps: laps.data!
        .filter((l) => l.driverId === id && !l.pit)
        .sort((a, b) => a.lap - b.lap)
        .map((l) => ({ lap: l.lap, timeSec: l.timeMs / 1000 })),
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

    return { traces, x, y, lineGen, p95, innerW, innerH };
  }, [laps.data, size.width, driverAId, driverBId]);

  if (laps.loading) return <Skeleton className="h-[280px]" />;

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
              {chart.traces.map((tr, i) => (
                <path
                  key={tr.id}
                  d={chart.lineGen(tr.laps) ?? ""}
                  fill="none"
                  stroke={COLORS[i]}
                  strokeWidth={1.8}
                  strokeOpacity={0.9}
                />
              ))}
            </g>
          </svg>

          {/* Legend */}
          <div
            className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 px-1 font-mono text-[10px]"
            style={{ color: "hsl(var(--muted))" }}
          >
            {chart.traces.map((tr, i) => {
              const drv = driverById(tr.id);
              return (
                <span key={tr.id} className="flex items-center gap-1.5">
                  <span className="h-px w-5" style={{ background: COLORS[i] }} />
                  <span style={{ color: "hsl(var(--text-dim))" }}>
                    {i === 0 ? "A" : "B"} · {drv.code}
                  </span>
                </span>
              );
            })}
            <span className="ml-auto text-[9px]" style={{ color: "hsl(var(--muted-2))" }}>
              pit laps excluded · clipped at p95 ({chart.p95.toFixed(1)}s)
            </span>
          </div>
        </>
      ) : (
        <div
          className="flex h-[280px] items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "hsl(var(--muted))" }}
        >
          SELECT DRIVERS ABOVE
        </div>
      )}
    </div>
  );
};

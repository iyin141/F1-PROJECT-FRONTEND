'use client';

import { useMemo } from "react";
import * as d3 from "d3";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { compoundColor } from "@/components/CompoundDot";
import { DRIVERS } from "@/Lib/data/drivers";
import type { Compound, Stint } from "@/types/ui";
import { useAllStints, useTyreStrategy } from "@/features/race-analysis/hooks/useRaceAnalysis";

const COMPOUNDS: Compound[] = ["soft", "medium", "hard", "inter", "wet"];
const ROW_H = 18;
const ROW_GAP = 3;
const MARGIN = { top: 10, right: 16, bottom: 32, left: 52 };

export const TyreStrategy = ({ year, round }: { year: number; round: number }) => {
  const { data: stints, isLoading } = useTyreStrategy(year, round);
  const { ref, size } = useResizeObserver<HTMLDivElement>();

  const chart = useMemo(() => {
    if (!stints || size.width < 60) return null;

    const byDriver = DRIVERS.map((d) => ({
      driver: d,
      stints: (stints ?? [])
        .filter((s) => s.driverId === d.id)
        .sort((a, b) => a.startLap - b.startLap),
    })).filter((d) => d.stints.length > 0);

    const totalLaps = d3.max(stints, (s) => s.endLap) ?? 57;
    const innerW = Math.max(0, size.width - MARGIN.left - MARGIN.right);
    const height =
      MARGIN.top + MARGIN.bottom + byDriver.length * (ROW_H + ROW_GAP);
    const x = d3.scaleLinear().domain([1, totalLaps]).range([0, innerW]);

    return { byDriver, x, xTicks: x.ticks(8), totalLaps, innerW, height };
  }, [stints, size.width]);

  if (isLoading) return null;

  return (
    <div ref={ref} className="w-full">
      {chart && (
        <>
          <svg
            width={size.width}
            height={chart.height}
            style={{ overflow: "visible", display: "block" }}
          >
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* Vertical grid lines */}
              {chart.xTicks.map((tk) => (
                <line
                  key={tk}
                  x1={chart.x(tk)}
                  x2={chart.x(tk)}
                  y1={0}
                  y2={chart.byDriver.length * (ROW_H + ROW_GAP)}
                  stroke="hsl(var(--border-subtle))"
                  strokeOpacity={0.35}
                />
              ))}

              {/* Driver rows */}
              {chart.byDriver.map((d, i) => {
                const yRow = i * (ROW_H + ROW_GAP);
                return (
                  <g key={d.driver.id} transform={`translate(0,${yRow})`}>
                    <text
                      x={-8}
                      y={ROW_H / 2}
                      dy="0.32em"
                      textAnchor="end"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.06em",
                        fill: "hsl(var(--text-dim))",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {d.driver.code}
                    </text>

                    {/* Stint bars */}
                    {d.stints.map((s, j) => (
                      <g key={j}>
                        <rect
                          x={chart.x(s.startLap)}
                          y={0}
                          width={Math.max(2, chart.x(s.endLap) - chart.x(s.startLap))}
                          height={ROW_H}
                          style={{ fill: compoundColor(s.compound), fillOpacity: 0.9 }}
                          rx={1}
                        />
                        {/* Pit marker between stints */}
                        {j < d.stints.length - 1 && (
                          <line
                            x1={chart.x(s.endLap)}
                            x2={chart.x(s.endLap)}
                            y1={-2}
                            y2={ROW_H + 2}
                            stroke="hsl(var(--text))"
                            strokeWidth={1.5}
                            strokeOpacity={0.7}
                          />
                        )}
                      </g>
                    ))}
                  </g>
                );
              })}

              {/* X axis */}
              <g transform={`translate(0,${chart.byDriver.length * (ROW_H + ROW_GAP) + 4})`}>
                {chart.xTicks.map((tk) => (
                  <g key={tk} transform={`translate(${chart.x(tk)},0)`}>
                    <line y2={4} stroke="hsl(var(--border-subtle))" />
                    <text
                      y={14}
                      textAnchor="middle"
                      style={{
                        fontSize: 9,
                        fill: "hsl(var(--muted))",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      L{tk}
                    </text>
                  </g>
                ))}
              </g>
            </g>
          </svg>

          {/* Compound legend */}
          <div
            className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1 font-mono text-[10px] tracking-[0.14em]"
            style={{ color: "hsl(var(--muted))" }}
          >
            {COMPOUNDS.map((c) => (
              <span key={c} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2.5 rounded-sm"
                  style={{ background: compoundColor(c) }}
                />
                {c.toUpperCase()}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-px"
                style={{ background: "hsl(var(--text))", opacity: 0.7 }}
              />
              PIT
            </span>
          </div>
        </>
      )}
    </div>
  );
};

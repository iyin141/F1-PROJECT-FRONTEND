'use client';

import { useMemo } from "react";
import * as d3 from "d3";
import { driverById, DRIVERS } from "@/Lib/data/drivers";
import { teamColor } from "@/components/DriverCode";
import { Skeleton } from "@/components/Skeleton";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import type { LapTime } from "@/types/ui";
import { useAllLaps } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { adaptLapTimes } from "@/Lib/adapters";

const CHART_H = 280;
const MARGIN = { top: 14, right: 14, bottom: 32, left: 46 };
const TOP_N = 10;

export const PaceDistribution = ({ year, round }: { year: number; round: number }) => {
  const { data: lapsData, isLoading } = useAllLaps(year, round);
  const laps = { data: lapsData ? adaptLapTimes(lapsData) : undefined, loading: isLoading };
  const { ref, size } = useResizeObserver<HTMLDivElement>();

  const chart = useMemo(() => {
    if (!laps.data || size.width < 60) return null;

    const innerW = Math.max(0, size.width - MARGIN.left - MARGIN.right);
    const innerH = CHART_H - MARGIN.top - MARGIN.bottom;

    // Top N drivers in grid order from DRIVERS list
    const topDriverIds = DRIVERS.map((d) => d.id)
      .filter((id) => laps.data!.some((l) => l.driverId === id))
      .slice(0, TOP_N);

    const boxes = topDriverIds
      .map((id) => {
        const times = laps
          .data!.filter((l) => l.driverId === id && !l.pit)
          .map((l) => l.timeMs / 1000)
          .sort(d3.ascending);
        if (times.length < 3) return null;
        const drv = driverById(id);
        return {
          code: drv.code,
          team: drv.team,
          min: times[0],
          q1: d3.quantile(times, 0.25)!,
          median: d3.quantile(times, 0.5)!,
          q3: d3.quantile(times, 0.75)!,
          max: times[times.length - 1],
        };
      })
      .filter(Boolean) as {
        code: string;
        team: string;
        min: number;
        q1: number;
        median: number;
        q3: number;
        max: number;
      }[];

    if (!boxes.length) return null;

    const x = d3
      .scaleBand<string>()
      .domain(boxes.map((b) => b.code))
      .range([0, innerW])
      .padding(0.35);

    const allVals = boxes.flatMap((b) => [b.min, b.max]);
    const y = d3
      .scaleLinear()
      .domain([d3.min(allVals)! - 0.2, d3.max(allVals)! + 0.2])
      .range([innerH, 0])
      .nice();

    return { boxes, x, y, innerW, innerH };
  }, [laps.data, size.width]);

  if (laps.loading) return <Skeleton className="h-[280px]" />;

  return (
    <div ref={ref} className="w-full">
      {chart && (
        <svg
          width={size.width}
          height={CHART_H}
          style={{ overflow: "visible", display: "block" }}
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {/* Y grid */}
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

            {/* Box-and-whisker per driver */}
            {chart.boxes.map((b) => {
              const cx = (chart.x(b.code) ?? 0) + chart.x.bandwidth() / 2;
              const bw = chart.x.bandwidth();
              const tc = teamColor(b.team as Parameters<typeof teamColor>[0]);
              return (
                <g key={b.code}>
                  {/* Whisker line */}
                  <line
                    x1={cx}
                    x2={cx}
                    y1={chart.y(b.min)}
                    y2={chart.y(b.max)}
                    stroke={tc}
                    strokeOpacity={0.55}
                    strokeWidth={1}
                  />
                  {/* Min / max caps */}
                  <line
                    x1={cx - bw * 0.22}
                    x2={cx + bw * 0.22}
                    y1={chart.y(b.min)}
                    y2={chart.y(b.min)}
                    stroke={tc}
                    strokeOpacity={0.65}
                  />
                  <line
                    x1={cx - bw * 0.22}
                    x2={cx + bw * 0.22}
                    y1={chart.y(b.max)}
                    y2={chart.y(b.max)}
                    stroke={tc}
                    strokeOpacity={0.65}
                  />
                  {/* IQR box */}
                  <rect
                    x={cx - bw / 2}
                    y={chart.y(b.q3)}
                    width={bw}
                    height={Math.max(1, chart.y(b.q1) - chart.y(b.q3))}
                    fill={tc}
                    fillOpacity={0.2}
                    stroke={tc}
                    strokeWidth={1}
                    strokeOpacity={0.7}
                  />
                  {/* Median line */}
                  <line
                    x1={cx - bw / 2}
                    x2={cx + bw / 2}
                    y1={chart.y(b.median)}
                    y2={chart.y(b.median)}
                    stroke={tc}
                    strokeWidth={2}
                  />
                  {/* Driver label */}
                  <text
                    x={cx}
                    y={chart.innerH + 16}
                    textAnchor="middle"
                    style={{
                      fontSize: 9,
                      fontFamily: "var(--font-mono)",
                      fill: "hsl(var(--muted))",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {b.code}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
};

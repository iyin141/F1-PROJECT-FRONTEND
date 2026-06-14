'use client';

import { useMemo } from "react";
import Skeleton from "@/components/animations/Skeleton";
import { driverById, DRIVERS } from "@/Lib/data/drivers";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { teamColor } from "@/components/DriverCode";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import type { LapTime } from "@/types/ui";
import { useLapTimes } from "@/features/race-analysis/hooks/useRaceAnalysis";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Customized,
} from "recharts";
import { secondsToHMS } from "@/Lib/utils/timeConvert";

const CHART_H = 280;
const MARGIN = { top: 14, right: 14, bottom: 32, left: 46 };
const TOP_N = 10;

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return NaN;
  const idx = q * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const w = idx - lo;
  return sorted[lo] * (1 - w) + sorted[hi] * w;
}

export const PaceDistribution = ({ year, round, session = "R" }: { year: number; round: number; session?: string }) => {
  const { data: laps, isLoading } = useLapTimes(year, round, session);
  const { ref, size } = useResizeObserver<HTMLDivElement>();
  const queryClient = useQueryClient();
  const router = useRouter();

  const chart = useMemo(() => {
    if (!laps || size.width < 60) return null;

    const innerW = Math.max(0, size.width - MARGIN.left - MARGIN.right);
    const innerH = CHART_H - MARGIN.top - MARGIN.bottom;

    const topDriverIds = DRIVERS.map((d) => d.id).filter((id) => {
      const drv = driverById(id);
      return (laps ?? []).some((l) => l.driverId.toUpperCase() === drv.code.toUpperCase());
    }).slice(0, TOP_N);

    const boxes = topDriverIds
      .map((id) => {
        const drv = driverById(id);
        let times = (laps ?? [])
          .filter((l) => l.driverId.toUpperCase() === drv.code.toUpperCase() && !l.pit)
          .map((l) => l.timeMs / 1000)
          .filter(t => t > 50) // basic safety filter (50 seconds)
          .sort((a, b) => a - b);

        if (times.length < 3) return null;

        const medianRaw = times[Math.floor(times.length / 2)];
        const cutoff = medianRaw * 1.07;

        times = times.filter(t => t <= cutoff);
        if (times.length < 3) return null;

        return {
          code: drv.code,
          team: drv.team,
          min: times[0],
          q1: quantile(times, 0.25),
          median: quantile(times, 0.5),
          q3: quantile(times, 0.75),
          max: times[times.length - 1],
        };
      })
      .filter(Boolean) as { code: string; team: string; min: number; q1: number; median: number; q3: number; max: number }[];

    if (!boxes.length) return null;

    const allVals = boxes.flatMap((b) => [b.min, b.max]);
    const yMin = Math.min(...allVals) - 0.2;
    const yMax = Math.max(...allVals) + 0.2;

    return { boxes, innerW, innerH, yMin, yMax };
  }, [laps, size.width]);

  if (isLoading) return <Skeleton height={CHART_H} />;

  return (
    <div ref={ref} className="w-full">
      {chart && (
        <ResponsiveContainer width="100%" height={CHART_H}>
          <ComposedChart data={chart.boxes} margin={{ top: MARGIN.top, right: MARGIN.right, bottom: MARGIN.bottom, left: MARGIN.left }}>
            <CartesianGrid stroke="hsl(var(--border-subtle))" strokeOpacity={0.4} />
            <XAxis dataKey="code" tick={{ fontSize: 9, fill: "hsl(var(--muted))", fontFamily: "var(--font-mono)" }} />
            <YAxis domain={[chart.yMin, chart.yMax]} tick={{ fontSize: 9, fill: "hsl(var(--muted))", fontFamily: "var(--font-mono)" }} tickFormatter={(v) => secondsToHMS(Number(v), true)} />
            <Tooltip formatter={(value: any, name: any) => [secondsToHMS(Number(value), true), name]} />
            <Customized
              component={({ width = 0, height = 0, xAxisMap }: any) => {
                if (!xAxisMap || !xAxisMap[0]) return null;
                const xAxis = xAxisMap[0];
                const scale = xAxis.scale;

                const left = MARGIN.left;
                const right = width - MARGIN.right;
                const innerW = Math.max(0, right - left);
                const step = (typeof scale.step === 'function' ? scale.step() : 0) || (innerW / (chart.boxes.length || 1));

                return (
                  <g>
                    {chart.boxes.map((b, i) => {
                      const bw = typeof scale.bandwidth === 'function' ? scale.bandwidth() : 0;
                      const cx = (scale(b.code) || 0) + bw / 2;
                      const bwEffective = step * 0.6;
                      const xLeft = cx - bwEffective / 2;

                      const yScale = (v: number) => {
                        const t = (v - chart.yMin) / (chart.yMax - chart.yMin || 1);
                        return height - MARGIN.bottom - t * (height - MARGIN.top - MARGIN.bottom);
                      };

                      const tc = teamColor(b.team as Parameters<typeof teamColor>[0]);

                      const yMin = yScale(b.min);
                      const yMax = yScale(b.max);
                      const yQ1 = yScale(b.q1);
                      const yQ3 = yScale(b.q3);
                      const yMed = yScale(b.median);

                      return (
                        <g key={b.code}>
                          {/* Whisker */}
                          <line x1={cx} x2={cx} y1={yMin} y2={yMax} stroke={tc} strokeOpacity={0.4} strokeWidth={1} />
                          {/* Caps */}
                          <line x1={cx - bwEffective * 0.22} x2={cx + bwEffective * 0.22} y1={yMin} y2={yMin} stroke={tc} strokeOpacity={0.5} />
                          <line x1={cx - bwEffective * 0.22} x2={cx + bwEffective * 0.22} y1={yMax} y2={yMax} stroke={tc} strokeOpacity={0.5} />
                          {/* IQR box */}
                          <rect x={xLeft} y={Math.min(yQ3, yQ1)} width={bwEffective} height={Math.max(2, Math.abs(yQ1 - yQ3))} fill={tc} fillOpacity={0.15} stroke={tc} strokeWidth={1} strokeOpacity={0.6} />
                          {/* Median */}
                          <line x1={xLeft} x2={xLeft + bwEffective} y1={yMed} y2={yMed} stroke={tc} strokeWidth={2} strokeOpacity={0.8} />
                        </g>
                      );
                    })}
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

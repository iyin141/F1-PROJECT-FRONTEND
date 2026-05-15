'use client';

import { useMemo, useState } from "react";
import * as d3 from "d3";
import { DriverSelect, type AnalysisDriverOption } from "@/features/race-analysis/components/DriverSelect";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { usePersistentTelemetry } from "@/hooks/usePersistentQuery";

const CHART_H = 260;
const MARGIN = { top: 14, right: 16, bottom: 30, left: 46 };

export function DriverTelemetryPanel({
  year,
  round,
  drivers,
  driverId,
  onDriverChange,
}: {
  year: number;
  round: number;
  drivers: AnalysisDriverOption[];
  driverId: string | null;
  onDriverChange: (id: string | null) => void;
}) {
  const [lapInput, setLapInput] = useState<string>("");
  const lap = lapInput.trim() ? Number(lapInput) : null;
  const lapNum = lap !== null && Number.isFinite(lap) ? lap : null;

  const { data } = usePersistentTelemetry(
    year,
    round,
    driverId ?? undefined,
    lapNum,
    "R",
  );

  const points = useMemo(() => data?.data ?? [], [data?.data]);

  const { ref, size } = useResizeObserver<HTMLDivElement>();
  const chart = useMemo(() => {
    if (!points.length || size.width < 60) return null;

    const innerW = Math.max(0, size.width - MARGIN.left - MARGIN.right);
    const innerH = CHART_H - MARGIN.top - MARGIN.bottom;

    const x = d3
      .scaleLinear()
      .domain([d3.min(points, (d) => d.distance) ?? 0, d3.max(points, (d) => d.distance) ?? 1])
      .range([0, innerW]);

    const y = d3
      .scaleLinear()
      .domain([(d3.min(points, (d) => d.speed) ?? 0) - 5, (d3.max(points, (d) => d.speed) ?? 350) + 5])
      .range([innerH, 0])
      .nice();

    const line = d3
      .line<(typeof points)[number]>()
      .x((d) => x(d.distance))
      .y((d) => y(d.speed))
      .curve(d3.curveMonotoneX);

    return { x, y, line, innerW, innerH };
  }, [points, size.width]);

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap items-center gap-4 border border-border-subtle px-4 py-3"
        style={{ backgroundColor: "var(--surface2)" }}
      >
        <DriverSelect
          label="DRIVER"
          value={driverId}
          onChange={onDriverChange}
          drivers={drivers}
          accent="hsl(var(--blue))"
        />
        <label className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "hsl(var(--muted))" }}>
            LAP
          </span>
          <input
            value={lapInput}
            onChange={(e) => setLapInput(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="required"
            className="w-24 border border-border-subtle px-2 py-1 font-mono text-[11px] tracking-[0.06em] outline-none"
            style={{ backgroundColor: "hsl(var(--bg))", color: "hsl(var(--text))" }}
          />
        </label>
      </div>

      {(
        <div ref={ref} className="w-full">
          {chart ? (
            <>
              <svg width={size.width} height={CHART_H} style={{ overflow: "visible", display: "block" }}>
                <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                  {chart.y.ticks(5).map((t) => (
                    <g key={t} transform={`translate(0,${chart.y(t)})`}>
                      <line x2={chart.innerW} stroke="hsl(var(--border-subtle))" strokeOpacity={0.4} />
                      <text
                        x={-6}
                        dy="0.32em"
                        textAnchor="end"
                        style={{ fontSize: 9, fill: "hsl(var(--muted))", fontFamily: "var(--font-mono)" }}
                      >
                        {t.toFixed(0)}
                      </text>
                    </g>
                  ))}

                  <path d={chart.line(points) ?? ""} fill="none" stroke="hsl(var(--blue))" strokeWidth={1.8} />
                </g>
              </svg>

              <div className="mt-2 flex items-center gap-4 px-1 font-mono text-[10px]" style={{ color: "hsl(var(--muted))" }}>
                <span className="flex items-center gap-1.5">
                  <span className="h-px w-5" style={{ background: "hsl(var(--blue))" }} />
                  <span>{driverId ?? "DRIVER"} SPEED</span>
                </span>
                <span className="ml-auto text-[9px]" style={{ color: "hsl(var(--muted-2))" }}>
                  /api/analysis/races/{year}/{round}/telemetry/
                </span>
              </div>
            </>
          ) : (
            <div
              className="flex h-65 items-center justify-center border border-dashed border-border-subtle font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "hsl(var(--muted))" }}
            >
              Select driver and lap to plot telemetry
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from "react";
import * as d3 from "d3";
import { DriverSelect, type AnalysisDriverOption } from "@/features/race-analysis/components/DriverSelect";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { usePersistentTelemetryOverlay } from "@/hooks/usePersistentQuery";
import type { TelemetryPoint } from "@/types/endpoints";

const CHART_H = 260;
const MARGIN = { top: 14, right: 16, bottom: 30, left: 46 };

type SpeedPoint = { distance: number; a: number; b: number };

function normalizeOverlaySpeed(
  raw: unknown,
  driverA: string,
  driverB: string,
): SpeedPoint[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    const pts: SpeedPoint[] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const distance = Number(row.distance);
      const aRow = row[driverA];
      const bRow = row[driverB];
      if (!Number.isFinite(distance)) continue;
      if (!aRow || !bRow || typeof aRow !== "object" || typeof bRow !== "object") continue;

      const aSpeed = Number((aRow as Record<string, unknown>).speed);
      const bSpeed = Number((bRow as Record<string, unknown>).speed);
      if (!Number.isFinite(aSpeed) || !Number.isFinite(bSpeed)) continue;
      pts.push({ distance, a: aSpeed, b: bSpeed });
    }
    return pts;
  }

  if (typeof raw === "object") {
    const rec = raw as Record<string, unknown>;
    const a = rec[driverA];
    const b = rec[driverB];
    if (!Array.isArray(a) || !Array.isArray(b)) return [];

    const aPts = a as TelemetryPoint[];
    const bPts = b as TelemetryPoint[];
    const len = Math.min(aPts.length, bPts.length);
    const out: SpeedPoint[] = [];
    for (let i = 0; i < len; i += 1) {
      const ap = aPts[i];
      const bp = bPts[i];
      if (!ap || !bp) continue;
      if (!Number.isFinite(ap.distance) || !Number.isFinite(ap.speed) || !Number.isFinite(bp.speed)) continue;
      out.push({ distance: ap.distance, a: ap.speed, b: bp.speed });
    }
    return out;
  }

  return [];
}

export function TelemetryOverlay({
  year,
  round,
  drivers,
  driverAId,
  driverBId,
  onDriverAChange,
  onDriverBChange,
}: {
  year: number;
  round: number;
  drivers: AnalysisDriverOption[];
  driverAId: string | null;
  driverBId: string | null;
  onDriverAChange: (id: string | null) => void;
  onDriverBChange: (id: string | null) => void;
}) {
  const [lapInput, setLapInput] = useState<string>("");
  const lap = lapInput.trim() ? Number(lapInput) : undefined;
  const lapNum = Number.isFinite(lap) ? lap : undefined;

  const { data } = usePersistentTelemetryOverlay(
    year,
    round,
    driverAId ?? undefined,
    driverBId ?? undefined,
    lapNum,
    "R",
  );

  const points = useMemo(
    () => normalizeOverlaySpeed(data?.data, driverAId ?? "", driverBId ?? ""),
    [data?.data, driverAId, driverBId],
  );

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
      .domain([
        (d3.min(points, (d) => Math.min(d.a, d.b)) ?? 0) - 5,
        (d3.max(points, (d) => Math.max(d.a, d.b)) ?? 350) + 5,
      ])
      .range([innerH, 0])
      .nice();

    const line = d3
      .line<SpeedPoint>()
      .x((d) => x(d.distance))
      .y((d) => y(d.a))
      .curve(d3.curveMonotoneX);

    const lineB = d3
      .line<SpeedPoint>()
      .x((d) => x(d.distance))
      .y((d) => y(d.b))
      .curve(d3.curveMonotoneX);

    return { x, y, line, lineB, innerW, innerH };
  }, [points, size.width]);

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap items-center gap-4 border border-border-subtle px-4 py-3"
        style={{ backgroundColor: "var(--surface2)" }}
      >
        <DriverSelect
          label="DRIVER A"
          value={driverAId}
          onChange={onDriverAChange}
          drivers={drivers}
          accent="hsl(var(--blue))"
        />
        <DriverSelect
          label="DRIVER B"
          value={driverBId}
          onChange={onDriverBChange}
          drivers={drivers}
          accent="hsl(var(--red))"
        />
        <label className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "hsl(var(--muted))" }}>
            LAP
          </span>
          <input
            value={lapInput}
            onChange={(e) => setLapInput(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="fastest"
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
                  <path d={chart.lineB(points) ?? ""} fill="none" stroke="hsl(var(--red))" strokeWidth={1.8} />
                </g>
              </svg>

              <div className="mt-2 flex items-center gap-4 px-1 font-mono text-[10px]" style={{ color: "hsl(var(--muted))" }}>
                <span className="flex items-center gap-1.5">
                  <span className="h-px w-5" style={{ background: "hsl(var(--blue))" }} />
                  <span>{driverAId ?? "A"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-px w-5" style={{ background: "hsl(var(--red))" }} />
                  <span>{driverBId ?? "B"}</span>
                </span>
                <span className="ml-auto text-[9px]" style={{ color: "hsl(var(--muted-2))" }}>
                  /api/analysis/races/{year}/{round}/telemetry/overlay/
                </span>
              </div>
            </>
          ) : (
            <div
              className="flex h-65 items-center justify-center border border-dashed border-border-subtle font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "hsl(var(--muted))" }}
            >
              Select two drivers to compare telemetry
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from "react";
import { DriverSelect, type AnalysisDriverOption } from "@/features/race-analysis/components/DriverSelect";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { usePersistentTelemetryOverlay } from "@/hooks/usePersistentQuery";
import type { TelemetryPoint } from "@/types/endpoints";
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const CHART_H = 260;
const MARGIN = { top: 14, right: 16, bottom: 30, left: 46 };

type SpeedPoint = { distance: number; a: number; b: number };

function normalizeOverlaySpeed(raw: unknown, driverA: string, driverB: string): SpeedPoint[] {
  if (!raw) return [];

  // Case: backend traces format (e.g. { traces: [{ driver: 'ANT', data: [...] }] })
  if (typeof raw === "object" && raw !== null && 'traces' in raw) {
    const traces = (raw as any).traces;
    if (Array.isArray(traces)) {
      const aTrace = traces.find((t: any) => t.driver?.toLowerCase() === driverA.toLowerCase());
      const bTrace = traces.find((t: any) => t.driver?.toLowerCase() === driverB.toLowerCase());
      if (aTrace?.data && bTrace?.data) {
        const aPts = aTrace.data;
        const bPts = bTrace.data;
        const len = Math.min(aPts.length, bPts.length);
        const out: SpeedPoint[] = [];
        for (let i = 0; i < len; i += 1) {
          const ap = aPts[i];
          const bp = bPts[i];
          if (!ap || !bp) continue;
          const dist = ap.distance_m ?? ap.distance;
          const speedA = ap.speed_kph ?? ap.speed;
          const speedB = bp.speed_kph ?? bp.speed;
          if (!Number.isFinite(dist) || !Number.isFinite(speedA) || !Number.isFinite(speedB)) continue;
          out.push({ distance: dist, a: speedA, b: speedB });
        }
        return out;
      }
    }
  }

  const findKeyCI = (obj: Record<string, unknown> | null | undefined, key: string) => {
    if (!obj) return undefined;
    const k = Object.keys(obj).find((kk) => kk.toLowerCase() === key.toLowerCase());
    return k;
  };

  // Case: array of rows where each row has driver keys (possibly different casing)
  if (Array.isArray(raw)) {
    const pts: SpeedPoint[] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const distance = Number(row.distance);
      if (!Number.isFinite(distance)) continue;

      const aKey = findKeyCI(row, driverA) ?? driverA;
      const bKey = findKeyCI(row, driverB) ?? driverB;
      const aRow = row[aKey];
      const bRow = row[bKey];
      if (!aRow || !bRow || typeof aRow !== "object" || typeof bRow !== "object") continue;

      const aSpeed = Number((aRow as Record<string, unknown>).speed);
      const bSpeed = Number((bRow as Record<string, unknown>).speed);
      if (!Number.isFinite(aSpeed) || !Number.isFinite(bSpeed)) continue;
      pts.push({ distance, a: aSpeed, b: bSpeed });
    }
    return pts;
  }

  // Case: raw is an object mapping driverCode -> telemetry arrays (keys may differ in case)
  if (typeof raw === "object") {
    const rec = raw as Record<string, unknown>;
    const aKey = findKeyCI(rec, driverA) ?? driverA;
    const bKey = findKeyCI(rec, driverB) ?? driverB;
    const a = rec[aKey];
    const b = rec[bKey];
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

import { useSearchParams } from "next/navigation";

export function TelemetryOverlay({ year, round, drivers, driverAId, driverBId, onDriverAChange, onDriverBChange, session = "R" }: { year: number; round: number; drivers: AnalysisDriverOption[]; driverAId: string | null; driverBId: string | null; onDriverAChange: (id: string | null) => void; onDriverBChange: (id: string | null) => void; session?: string; }) {
  const searchParams = useSearchParams();
  const [lapInput, setLapInput] = useState<string>("");
  const lap = lapInput.trim() ? Number(lapInput) : undefined;
  const lapNum = Number.isFinite(lap) ? lap : undefined;

  const lapA = lapNum ?? (searchParams?.get("lap_a") ? Number(searchParams.get("lap_a")) : undefined);
  const lapB = lapNum ?? (searchParams?.get("lap_b") ? Number(searchParams.get("lap_b")) : undefined);
  
  const options = useMemo(() => {
    const opts: import("@/Lib/queryFunctions/analysis").TelemetryOverlayOptions = {};
    if (searchParams?.has("limit_points")) opts.limit_points = Number(searchParams.get("limit_points"));
    if (searchParams?.has("stride")) opts.stride = Number(searchParams.get("stride"));
    if (searchParams?.has("sector_start")) opts.sector_start = Number(searchParams.get("sector_start"));
    if (searchParams?.has("sector_end")) opts.sector_end = Number(searchParams.get("sector_end"));
    return opts;
  }, [searchParams]);

  const { data } = usePersistentTelemetryOverlay(year, round, driverAId ?? undefined, driverBId ?? undefined, lapA, lapB, session as any, options);

  const points = useMemo(() => normalizeOverlaySpeed(data, driverAId ?? "", driverBId ?? ""), [data, driverAId, driverBId]);

  const { ref, size } = useResizeObserver<HTMLDivElement>();

  const chartData = useMemo(() => {
    if (!points.length) return null;
    const minX = Math.min(...points.map((p) => p.distance));
    const maxX = Math.max(...points.map((p) => p.distance));
    const minY = Math.min(...points.map((p) => Math.min(p.a, p.b))) - 5;
    const maxY = Math.max(...points.map((p) => Math.max(p.a, p.b))) + 5;
    // map to recharts-friendly objects
    const dataRows = points.map((p) => ({ distance: p.distance, A: p.a, B: p.b }));
    return { data: dataRows, minX, maxX, minY, maxY };
  }, [points]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 border border-border-subtle px-4 py-3" style={{ backgroundColor: "var(--surface2)" }}>
        <DriverSelect label="DRIVER A" value={driverAId} onChange={onDriverAChange} drivers={drivers} accent="hsl(var(--blue))" />
        <DriverSelect label="DRIVER B" value={driverBId} onChange={onDriverBChange} drivers={drivers} accent="hsl(var(--red))" />
        <label className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "hsl(var(--muted))" }}>LAP</span>
          <input value={lapInput} onChange={(e) => setLapInput(e.target.value.replace(/[^0-9]/g, ""))} placeholder="fastest" className="w-24 border border-border-subtle px-2 py-1 font-mono text-[11px] tracking-[0.06em] outline-none" style={{ backgroundColor: "hsl(var(--bg))", color: "hsl(var(--text))" }} />
        </label>
      </div>

      <div ref={ref} className="w-full">
        {chartData && size.width > 60 ? (
          <>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <ComposedChart data={chartData.data} margin={{ top: MARGIN.top, right: MARGIN.right, bottom: MARGIN.bottom, left: MARGIN.left }}>
                <CartesianGrid stroke="hsl(var(--border-subtle))" strokeOpacity={0.4} />
                <XAxis dataKey="distance" type="number" domain={[chartData.minX, chartData.maxX]} tick={{ fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }} />
                <YAxis type="number" domain={[chartData.minY, chartData.maxY]} tick={{ fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }} />
                <Tooltip formatter={(value: any, name: any) => [value, name]} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'hsl(var(--muted))' }} />

                <Line type="monotone" dataKey="A" stroke="hsl(var(--blue))" strokeWidth={1.8} dot={false} name={driverAId ?? 'A'} />
                <Line type="monotone" dataKey="B" stroke="hsl(var(--red))" strokeWidth={1.8} dot={false} name={driverBId ?? 'B'} />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-2 flex items-center gap-4 px-1 font-mono text-[10px]" style={{ color: 'hsl(var(--muted))' }}>
              <span className="flex items-center gap-1.5"><span className="h-px w-5" style={{ background: 'hsl(var(--blue))' }} />{driverAId ?? 'A'}</span>
              <span className="flex items-center gap-1.5"><span className="h-px w-5" style={{ background: 'hsl(var(--red))' }} />{driverBId ?? 'B'}</span>
              <span className="ml-auto text-[9px]" style={{ color: 'hsl(var(--muted-2))' }}>/api/analysis/races/{year}/{round}/telemetry/overlay/</span>
            </div>
          </>
        ) : (
          <div className="flex h-65 items-center justify-center border border-dashed border-border-subtle font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--muted))' }}>Select two drivers to compare telemetry</div>
        )}
      </div>
    </div>
  );
}

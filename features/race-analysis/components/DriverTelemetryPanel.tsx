"use client";

import { useMemo, useState, useEffect } from "react";
import { DriverSelect, type AnalysisDriverOption } from "@/features/race-analysis/components/DriverSelect";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { usePersistentTelemetryOverlay } from "@/hooks/usePersistentQuery";
import { useLapTimes } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { getGapInsights, getSectorInsights, getInputTraceInsights } from "@/features/race-analysis/utils/lapInsights";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { useSearchParams } from "next/navigation";

import { deriveCumulativeTime } from "@/features/race-analysis/utils/lapTimeDerivation";

// --- Color Tokens (Matched to PaceComparison) ---
const DRIVER_COLORS = [
  "hsl(var(--blue))",
  "hsl(var(--red))",
  "hsl(var(--green))",
  "hsl(var(--yellow))",
  "hsl(var(--purple))",
];

const MARGIN = { top: 14, right: 16, bottom: 30, left: 46 };
const GRID_STEP_M = 5;

type TracePoint = { distance: number; time: number; speed: number; throttle: number; brake: boolean };

function parseTrace(trace: any[], driverCode: string): TracePoint[] {
  // First, clean up the array to make sure it's valid for derivation
  const cleaned = trace.filter(p => {
    const dist = p.distance_m ?? p.distance;
    const speed = p.speed_kph ?? p.speed;
    return Number.isFinite(dist) && Number.isFinite(speed);
  });
  
  if (cleaned.length === 0) return [];
  
  // Deduplicate identical distances to prevent dDist <= 0
  const monotonic = [cleaned[0]];
  for (let i = 1; i < cleaned.length; i++) {
    const prevDist = monotonic[monotonic.length - 1].distance_m ?? monotonic[monotonic.length - 1].distance ?? 0;
    const currDist = cleaned[i].distance_m ?? cleaned[i].distance ?? 0;
    if (currDist > prevDist) {
      monotonic.push(cleaned[i]);
    } else {
      console.warn(`[parseTrace] Dropping non-monotonic or duplicate distance for ${driverCode}: prev=${prevDist}, curr=${currDist}`);
    }
  }

  const times = deriveCumulativeTime(monotonic);
  
  return monotonic.map((p, i) => {
    return {
      distance: p.distance_m ?? p.distance ?? 0,
      time: times[i], // canonical derived time
      speed: p.speed_kph ?? p.speed ?? 0,
      throttle: p.throttle_pct ?? p.throttle ?? 0,
      brake: Boolean(p.brake)
    };
  });
}

function interpolateAt(dist: number, trace: TracePoint[]): TracePoint | null {
  if (!trace.length) return null;
  const maxD = trace[trace.length - 1].distance;
  const minD = trace[0].distance;
  if (dist < minD || dist > maxD) return null; // STRICTLY RETURN NULL
  if (dist === minD) return trace[0];
  if (dist === maxD) return trace[trace.length - 1];
  
  let l = 0, r = trace.length - 1;
  while (l <= r) {
    const m = (l + r) >> 1;
    if (trace[m].distance === dist) return trace[m];
    if (trace[m].distance < dist) l = m + 1;
    else r = m - 1;
  }
  const p1 = trace[r];
  const p2 = trace[l];
  if (p2.distance === p1.distance) return p1;
  const f = (dist - p1.distance) / (p2.distance - p1.distance);
  
  return {
    distance: dist,
    time: p1.time + (p2.time - p1.time) * f,
    speed: p1.speed + (p2.speed - p1.speed) * f,
    throttle: p1.throttle + (p2.throttle - p1.throttle) * f,
    brake: f < 0.5 ? p1.brake : p2.brake
  };
}

// Sub-components
function DeltaTracePanel({ grid, maxDistance, colorA, colorB, deltaFinal, gradientOffset, tFinalA, tFinalB, codeA, codeB }: any) {
  const { finalGap, largestSwing, leadChanges } = getGapInsights(grid, tFinalA, tFinalB, codeA, codeB);
  return (
    <div className="relative">
      <span className="absolute top-2 right-6 font-mono text-[10px] z-10" style={{ color: deltaFinal > 0 ? colorA : colorB }}>
        GAP: {deltaFinal > 0 ? "+" : ""}{deltaFinal.toFixed(3)}s
      </span>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={grid} margin={{ top: 14, right: MARGIN.right, bottom: 0, left: MARGIN.left }}>
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={gradientOffset} stopColor={colorA} stopOpacity={0.8} />
              <stop offset={gradientOffset} stopColor={colorB} stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border-subtle))" strokeOpacity={0.4} vertical={false} />
          <XAxis dataKey="distance" type="number" domain={[0, maxDistance]} tickFormatter={(v) => String(Math.round(v))} tick={{ fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -16, style: { fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' } }} />
          <YAxis dataKey="delta" domain={['auto', 'auto']} tick={{ fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }} label={{ value: 'GAP (s)', angle: -90, position: 'insideLeft', offset: 8, style: { fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' } }} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--bg))', border: '1px solid hsl(var(--border-subtle))', fontFamily: 'var(--font-mono)', fontSize: 10 }} formatter={(v: number) => [`${v > 0 ? '+' : ''}${v.toFixed(3)}s`, 'Gap to B']} labelFormatter={(v) => `${Number(v).toFixed(0)}m`} />
          <ReferenceLine y={0} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
          <Area type="monotone" dataKey="delta" stroke="#000" strokeWidth={0} fill="url(#splitColor)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="font-mono text-[10px] text-muted leading-relaxed mt-2 max-w-full px-12">
        {finalGap && <div>{finalGap}</div>}
        {largestSwing && <div>{largestSwing}</div>}
        {leadChanges && <div>{leadChanges}</div>}
      </div>
    </div>
  );
}

function SectorComparisonPanel({ sectorsA, sectorsB, grid, colorA, colorB, codeA, codeB }: any) {
  const { summaryLine, perSector } = getSectorInsights(sectorsA, sectorsB, codeA, codeB);
  const sectors = [0, 1, 2].map(i => {
    const sA = sectorsA[i];
    const sB = sectorsB[i];
    const minD = Math.min(sA.start, sB.start);
    const maxD = Math.max(sA.end, sB.end);
    
    const sectorGrid = grid.filter((g: any) => g.distance >= minD && g.distance <= maxD).map((g: any) => ({
      ...g,
      localDistance: g.distance - minD
    }));
    
    const minSpeed = sectorGrid.length ? Math.min(...sectorGrid.map((g: any) => Math.min(g.speedA, g.speedB))) : 0;
    const maxSpeed = sectorGrid.length ? Math.max(...sectorGrid.map((g: any) => Math.max(g.speedA, g.speedB))) : 0;
    
    const timeA = sA.time;
    const timeB = sB.time;
    const delta = timeB - timeA;
    const isAFaster = delta > 0; 
    
    return {
      index: i,
      name: `SECTOR ${i + 1}`,
      timeA, timeB, delta, deltaColor: isAFaster ? colorA : colorB,
      localMaxDistance: maxD - minD,
      data: sectorGrid,
      domain: [Math.max(0, minSpeed - 5), maxSpeed + 5]
    };
  });

  return (
    <div className="flex flex-col w-full">
      {summaryLine && (
        <div className="font-mono text-[10px] text-muted leading-relaxed mb-4 text-center px-4">
          {summaryLine}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {sectors.map((s, i) => (
        <div key={i} className="flex-1 min-w-0 border border-border-subtle p-2">
          <div className="flex justify-between items-center mb-2 font-mono text-[10px]">
            <span className="font-bold">{s.name}</span>
            <div className="flex items-center gap-2">
              <span style={{ color: colorA }}>{codeA}: {s.timeA.toFixed(3)}s</span>
              <span className="text-muted" style={{ color: "hsl(var(--muted))" }}>·</span>
              <span style={{ color: colorB }}>{codeB}: {s.timeB.toFixed(3)}s</span>
              <span className="text-muted" style={{ color: "hsl(var(--muted))" }}>·</span>
              <span style={{ color: s.deltaColor }}>Δ {s.delta > 0 ? "+" : ""}{s.delta.toFixed(3)}s</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={s.data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="hsl(var(--border-subtle))" strokeOpacity={0.4} />
              <XAxis dataKey="localDistance" type="number" domain={[0, s.localMaxDistance]} tickFormatter={(v) => String(Math.round(v))} tick={{ fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }} />
              <YAxis yAxisId="speed" domain={s.domain} tickFormatter={(v) => String(Math.round(v))} tick={{ fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--bg))', border: '1px solid hsl(var(--border-subtle))', fontFamily: 'var(--font-mono)', fontSize: 10 }} labelFormatter={(v) => `${Number(v).toFixed(0)}m`} />
              <Line yAxisId="speed" type="monotone" dataKey="speedA" stroke={colorA} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line yAxisId="speed" type="monotone" dataKey="speedB" stroke={colorB} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="font-mono text-[10px] text-muted leading-relaxed mt-2 max-w-full px-2 h-[40px]">
            {perSector[i].leadStr && <div>{perSector[i].leadStr}</div>}
            {perSector[i].speedStr && <div>{perSector[i].speedStr}</div>}
          </div>
        </div>
      ))}
    </div>
  </div>);
}

function SpeedTracePanel({ grid, maxDistance, activeTrace, traceA, traceB, codeA, codeB }: any) {
  const { speedCompare, brakingInfo } = getInputTraceInsights(traceA, traceB, activeTrace, codeA, codeB);
  const minSpeed = Math.min(...grid.map((g: any) => activeTrace === "A" ? g.speedA : g.speedB));
  const maxSpeed = Math.max(...grid.map((g: any) => activeTrace === "A" ? g.speedA : g.speedB));
  
  return (
    <div className="flex flex-col">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={grid} margin={MARGIN}>
          <CartesianGrid stroke="hsl(var(--border-subtle))" strokeOpacity={0.4} />
          <XAxis dataKey="distance" type="number" domain={[0, maxDistance]} tickFormatter={(v) => String(Math.round(v))} tick={{ fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -16, style: { fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' } }} />
          <YAxis yAxisId="speed" domain={[Math.max(0, minSpeed - 5), maxSpeed + 5]} tickFormatter={(v) => String(Math.round(v))} tick={{ fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }} label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', offset: 8, style: { fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' } }} />
          <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tickFormatter={(v) => String(Math.round(v))} tick={{ fontSize: 9, fill: 'hsl(var(--muted))', fontFamily: 'var(--font-mono)' }} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--bg))', border: '1px solid hsl(var(--border-subtle))', fontFamily: 'var(--font-mono)', fontSize: 10 }} labelFormatter={(v) => `${Number(v).toFixed(0)}m`} />
          <Line yAxisId="speed" type="monotone" dataKey={activeTrace === "A" ? "speedA" : "speedB"} stroke="hsl(var(--blue))" strokeWidth={1.8} dot={false} name="Speed" isAnimationActive={false} />
          <Line yAxisId="pct" type="monotone" dataKey={activeTrace === "A" ? "throttleA" : "throttleB"} stroke="hsl(var(--green))" strokeWidth={1.2} dot={false} name="Throttle %" isAnimationActive={false} />
          <Area yAxisId="pct" type="step" dataKey={activeTrace === "A" ? "brakeA_mapped" : "brakeB_mapped"} stroke="hsl(var(--red))" fill="hsl(var(--red))" fillOpacity={0.3} dot={false} name="Brake" isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="font-mono text-[10px] text-muted leading-relaxed mt-2 max-w-full px-12">
        {speedCompare && <div>{speedCompare}</div>}
        {brakingInfo && <div>{brakingInfo}</div>}
      </div>
    </div>
  );
}

// ... existing component code below
export function DriverTelemetryPanel({
  year,
  round,
  drivers,
  driverAId,
  driverBId,
  onDriverAChange,
  onDriverBChange,
  session = "R"
}: {
  year: number;
  round: number;
  drivers: AnalysisDriverOption[];
  driverAId: string | null;
  driverBId: string | null;
  onDriverAChange: (id: string | null) => void;
  onDriverBChange: (id: string | null) => void;
  session?: string;
}) {
  const searchParams = useSearchParams();
  const [lapInput, setLapInput] = useState<string>("");
  const lapNum = lapInput.trim() ? Number(lapInput) : null;
  const parsedLapNum = lapNum !== null && Number.isFinite(lapNum) ? lapNum : undefined;

  const [activeTrace, setActiveTrace] = useState<"A" | "B">("A");
  const [activeTab, setActiveTab] = useState<"DELTA" | "SECTORS" | "SPEED">("DELTA");

  // Fastest clean laps as defaults
  const { data: lapsData } = useLapTimes(year, round, session);
  const fastestLapA = useMemo(() => {
    if (!driverAId || !lapsData?.length) return undefined;
    const driverLaps = lapsData.filter((l: any) => l.driverId.toUpperCase() === driverAId.toUpperCase() && !l.pit && l.timeMs > 0);
    return driverLaps.length ? (driverLaps.reduce((best: any, l: any) => l.timeMs < best.timeMs ? l : best).lap as number) : undefined;
  }, [driverAId, lapsData]);

  const fastestLapB = useMemo(() => {
    if (!driverBId || !lapsData?.length) return undefined;
    const driverLaps = lapsData.filter((l: any) => l.driverId.toUpperCase() === driverBId.toUpperCase() && !l.pit && l.timeMs > 0);
    return driverLaps.length ? (driverLaps.reduce((best: any, l: any) => l.timeMs < best.timeMs ? l : best).lap as number) : undefined;
  }, [driverBId, lapsData]);

  const finalLapA = parsedLapNum ?? fastestLapA;
  const finalLapB = parsedLapNum ?? fastestLapB;

  const lapDataA = useMemo(() => lapsData?.find((l: any) => l.driverId.toUpperCase() === driverAId?.toUpperCase() && l.lap === finalLapA), [lapsData, driverAId, finalLapA]);
  const lapDataB = useMemo(() => lapsData?.find((l: any) => l.driverId.toUpperCase() === driverBId?.toUpperCase() && l.lap === finalLapB), [lapsData, driverBId, finalLapB]);

  useEffect(() => {
    if (fastestLapA != null && lapInput.trim() === "") {
      setLapInput(String(fastestLapA));
    }
  }, [fastestLapA]);

  const options = useMemo(() => {
    const opts: import("@/Lib/queryFunctions/analysis").TelemetryOverlayOptions = { stride: 4 };
    if (searchParams?.has("limit_points")) opts.limit_points = Number(searchParams.get("limit_points"));
    if (searchParams?.has("stride")) opts.stride = Number(searchParams.get("stride"));
    if (searchParams?.has("sector_start")) opts.sector_start = Number(searchParams.get("sector_start"));
    if (searchParams?.has("sector_end")) opts.sector_end = Number(searchParams.get("sector_end"));
    return opts;
  }, [searchParams]);

  const { data, isLoading, isFetching } = usePersistentTelemetryOverlay(
    year, round, driverAId ?? undefined, driverBId ?? undefined, finalLapA, finalLapB, session as any, options
  );

  const { grid, traceA, traceB, sectorsA, sectorsB, maxDistance, colorA, colorB, codeA, codeB, deltaFinal, tFinalA, tFinalB } = useMemo(() => {
    const codeA = drivers.find(d => d.id === driverAId)?.code ?? "A";
    const codeB = drivers.find(d => d.id === driverBId)?.code ?? "B";
    const colorA = DRIVER_COLORS[0];
    const colorB = DRIVER_COLORS[1];

    const raw = data as any;
    const traces = raw?.traces;
    if (!Array.isArray(traces) || traces.length < 2) return { grid: [], sectorsA: [], sectorsB: [], maxDistance: 0, colorA, colorB, codeA, codeB, deltaFinal: 0, tFinalA: 0, tFinalB: 0 };
    
    const traceAData = traces.find((t: any) => t.driver?.toLowerCase() === codeA.toLowerCase())?.data ?? [];
    const traceBData = traces.find((t: any) => t.driver?.toLowerCase() === codeB.toLowerCase())?.data ?? [];
    
    const traceA = parseTrace(traceAData, codeA);
    const traceB = parseTrace(traceBData, codeB);

    if (!traceA.length || !traceB.length) return { grid: [], sectorsA: [], sectorsB: [], maxDistance: 0, colorA, colorB, codeA, codeB, deltaFinal: 0, tFinalA: 0, tFinalB: 0 };

    const minD = 0;
    const maxA = Math.max(...traceA.map(t => t.distance));
    const maxB = Math.max(...traceB.map(t => t.distance));
    const maxD = Math.min(maxA, maxB);
    
    const grid = [];
    for (let d = minD; d <= maxD; d += GRID_STEP_M) {
      const pA = interpolateAt(d, traceA);
      const pB = interpolateAt(d, traceB);
      if (pA && pB) {
        grid.push({
          distance: d,
          delta: pB.time - pA.time,
          speedA: pA.speed, speedB: pB.speed,
          throttleA: pA.throttle, throttleB: pB.throttle,
          brakeA: pA.brake, brakeB: pB.brake,
          brakeA_mapped: pA.brake ? 100 : 0,
          brakeB_mapped: pB.brake ? 100 : 0,
          timeA: pA.time, timeB: pB.time,
        });
      }
    }

    const tFinalA = traceA[traceA.length - 1].time;
    const tFinalB = traceB[traceB.length - 1].time;

    // --- SECTOR BOUNDARY LOGIC ---
    const sector1MsA = lapDataA?.sector1Ms ?? 0;
    const sector2MsA = lapDataA?.sector2Ms ?? 0;
    const sector3MsA = lapDataA?.sector3Ms ?? 0;
    const sector1MsB = lapDataB?.sector1Ms ?? 0;
    const sector2MsB = lapDataB?.sector2Ms ?? 0;
    const sector3MsB = lapDataB?.sector3Ms ?? 0;

    function findDistanceForTime(time: number, trace: TracePoint[]): number {
      if (!trace.length) return 0;
      if (time <= trace[0].time) return trace[0].distance;
      if (time >= trace[trace.length - 1].time) return trace[trace.length - 1].distance;
      let l = 0, r = trace.length - 1;
      while (l <= r) {
        const m = (l + r) >> 1;
        if (trace[m].time === time) return trace[m].distance;
        if (trace[m].time < time) l = m + 1;
        else r = m - 1;
      }
      const p1 = trace[r];
      const p2 = trace[l];
      if (p2.time === p1.time) return p1.distance;
      const f = (time - p1.time) / (p2.time - p1.time);
      return p1.distance + (p2.distance - p1.distance) * f;
    }

    const s1EndA = sector1MsA > 0 ? findDistanceForTime(sector1MsA / 1000, traceA) : maxA * 0.33;
    const s2EndA = sector2MsA > 0 ? findDistanceForTime((sector1MsA + sector2MsA) / 1000, traceA) : maxA * 0.66;
    
    const s1EndB = sector1MsB > 0 ? findDistanceForTime(sector1MsB / 1000, traceB) : maxB * 0.33;
    const s2EndB = sector2MsB > 0 ? findDistanceForTime((sector1MsB + sector2MsB) / 1000, traceB) : maxB * 0.66;

    function getSectorTopSpeed(trace: TracePoint[], startD: number, endD: number) {
      if (!trace.length) return 0;
      let maxSpeed = 0;
      for (let i = 0; i < trace.length; i++) {
        if (trace[i].distance >= startD && trace[i].distance <= endD) {
          if (trace[i].speed > maxSpeed) maxSpeed = trace[i].speed;
        }
      }
      return maxSpeed;
    }

    const sectorsA = [
      { start: 0, end: s1EndA, time: sector1MsA / 1000, topSpeedA: getSectorTopSpeed(traceA, 0, s1EndA) },
      { start: s1EndA, end: s2EndA, time: sector2MsA / 1000, topSpeedA: getSectorTopSpeed(traceA, s1EndA, s2EndA) },
      { start: s2EndA, end: maxA, time: sector3MsA / 1000, topSpeedA: getSectorTopSpeed(traceA, s2EndA, maxA) }
    ];
    const sectorsB = [
      { start: 0, end: s1EndB, time: sector1MsB / 1000, topSpeedB: getSectorTopSpeed(traceB, 0, s1EndB) },
      { start: s1EndB, end: s2EndB, time: sector2MsB / 1000, topSpeedB: getSectorTopSpeed(traceB, s1EndB, s2EndB) },
      { start: s2EndB, end: maxB, time: sector3MsB / 1000, topSpeedB: getSectorTopSpeed(traceB, s2EndB, maxB) }
    ];

    const deltaFinal = tFinalB - tFinalA;

    return { grid, traceA, traceB, sectorsA, sectorsB, maxDistance: maxD, colorA, colorB, codeA, codeB, deltaFinal, tFinalA, tFinalB };
  }, [data, driverAId, driverBId, drivers, lapDataA, lapDataB]);

  const { ref, size } = useResizeObserver<HTMLDivElement>();
  
  const minDelta = useMemo(() => grid.length ? Math.min(...grid.map(g => g.delta)) : 0, [grid]);
  const maxDelta = useMemo(() => grid.length ? Math.max(...grid.map(g => g.delta)) : 0, [grid]);
  // Calculate gradient offset for 0
  const gradientOffset = useMemo(() => {
    if (maxDelta <= 0) return 0;
    if (minDelta >= 0) return 1;
    return maxDelta / (maxDelta - minDelta);
  }, [maxDelta, minDelta]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-4 border border-border-subtle px-4 py-3" style={{ backgroundColor: "var(--surface2)" }}>
          <DriverSelect label="DRIVER A" value={driverAId} onChange={onDriverAChange} drivers={drivers} accent={colorA} />
          <DriverSelect label="DRIVER B" value={driverBId} onChange={onDriverBChange} drivers={drivers} accent={colorB} />
          <label className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "hsl(var(--muted))" }}>LAP</span>
            <input value={lapInput} onChange={(e) => setLapInput(e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 12" className="w-16 border border-border-subtle px-2 py-1 font-mono text-[11px] outline-none" style={{ backgroundColor: "hsl(var(--bg))", color: "hsl(var(--text))" }} />
          </label>
          {fastestLapA != null && (
            <button onClick={() => setLapInput(String(fastestLapA))} className="border border-border-subtle px-2 py-1 font-mono text-[10px] transition-colors hover:border-blue-500" style={{ color: "hsl(var(--blue))" }}>
              FASTEST A ({fastestLapA})
            </button>
          )}
          {activeTab === "SPEED" && (
            <div className="ml-auto flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "hsl(var(--muted))" }}>Show Trace:</span>
              <button onClick={() => setActiveTrace("A")} className="border border-border-subtle px-2 py-1 font-mono text-[10px] transition-colors" style={{ backgroundColor: activeTrace === "A" ? colorA : "transparent", color: activeTrace === "A" ? "#000" : colorA }}>{codeA}</button>
              <button onClick={() => setActiveTrace("B")} className="border border-border-subtle px-2 py-1 font-mono text-[10px] transition-colors" style={{ backgroundColor: activeTrace === "B" ? colorB : "transparent", color: activeTrace === "B" ? "#000" : colorB }}>{codeB}</button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-2">
          {(["DELTA", "SECTORS", "SPEED"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors border border-border-subtle"
              style={{
                backgroundColor: activeTab === tab ? "hsl(var(--blue))" : "transparent",
                color: activeTab === tab ? "hsl(var(--bg))" : "hsl(var(--muted))",
              }}
            >
              {tab === "DELTA" ? "GAP TRACE" : tab === "SECTORS" ? "SECTORS" : "INPUT TRACE"}
            </button>
          ))}
        </div>
      </div>

      <div ref={ref} className="w-full flex flex-col gap-1 min-h-[260px]">
        {isLoading || isFetching ? (
          <div className="flex h-64 items-center justify-center border border-dashed border-border-subtle font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--blue))' }}>
            Fetching telemetry stream…
          </div>
        ) : grid.length > 0 && size.width > 60 ? (
          <>
            {activeTab === "DELTA" && <DeltaTracePanel grid={grid} maxDistance={maxDistance} colorA={colorA} colorB={colorB} deltaFinal={deltaFinal} gradientOffset={gradientOffset} tFinalA={tFinalA} tFinalB={tFinalB} codeA={codeA} codeB={codeB} />}
            {activeTab === "SECTORS" && <SectorComparisonPanel sectorsA={sectorsA} sectorsB={sectorsB} grid={grid} colorA={colorA} colorB={colorB} codeA={codeA} codeB={codeB} />}
            {activeTab === "SPEED" && <SpeedTracePanel grid={grid} maxDistance={maxDistance} activeTrace={activeTrace} traceA={traceA} traceB={traceB} codeA={codeA} codeB={codeB} />}
          </>
        ) : (
          <div className="flex h-64 items-center justify-center border border-dashed border-border-subtle font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--muted))' }}>
            {!driverAId || !driverBId ? "Select two drivers" : "No telemetry data found"}
          </div>
        )}
      </div>
      
      {process.env.NODE_ENV !== 'production' && grid.length > 0 && (
        <div className="text-[9px] font-mono p-2 border border-dashed border-border-subtle mt-4 text-muted flex gap-4 overflow-x-auto">
          <span>DEBUG:</span>
          <span>t_derived (A): {tFinalA.toFixed(3)}s</span>
          <span>t_derived (B): {tFinalB.toFixed(3)}s</span>
          <span style={{ color: colorA }}>GAP: {(tFinalB - tFinalA).toFixed(3)}s</span>
          <span>useLapTimes (A): {(lapDataA?.timeMs ? lapDataA.timeMs / 1000 : 0).toFixed(3)}s</span>
          <span>useLapTimes (B): {(lapDataB?.timeMs ? lapDataB.timeMs / 1000 : 0).toFixed(3)}s</span>
          <span style={{ color: colorB }}>LAP Δ: {((lapDataB?.timeMs ? lapDataB.timeMs / 1000 : 0) - (lapDataA?.timeMs ? lapDataA.timeMs / 1000 : 0)).toFixed(3)}s</span>
        </div>
      )}
    </div>
  );
}

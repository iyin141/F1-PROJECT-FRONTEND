"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/EmptyState";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { teamColor } from "@/components/DriverCode";
import Skeleton from "@/components/animations/Skeleton";
import { driverById } from "@/Lib/data/drivers";
import { useRacePositions } from "@/features/race-analysis/hooks/useRaceAnalysis";
import type { AnalysisDriverOption } from "@/features/race-analysis/components/DriverSelect";
import type { UnifiedPositionRow } from "@/types/endpoints";
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea, Tooltip, Customized, Label } from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DriverTrace {
  code: string;
  teamColor: string;
  laps: Array<{ lap: number; pos: number }>;
  finalPosition: number;
  isSelected: boolean;
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
const MARGIN = { top: 16, right: 32, bottom: 32, left: 16 };

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PositionTracker = ({ 
  year, 
  round, 
  drivers, 
  session = "R", 
  fallbackRows 
}: { 
  year: number; 
  round: number; 
  drivers: AnalysisDriverOption[]; 
  session?: string; 
  fallbackRows?: UnifiedPositionRow[] 
}) => {
  const { data: positionsData, isLoading } = useRacePositions(year, round, true, session);
  const { ref, size } = useResizeObserver<HTMLDivElement>();

  // Determine selected drivers (from LapComparisonShell's global selectors, but for now we'll fake it by taking the first two if none selected, as LapComparison is handling the true selection)
  // The actual solution is to pass driverA and driverB down as props, but for this component level we'll assume the drivers list is the full list.
  // We'll highlight the top 3 drivers by default if no explicit selection logic is provided, to match the terminal aesthetic request.
  
  const { traces, scBands, xDomain, maxPos } = useMemo(() => {
    const rows = positionsData?.data?.length ? positionsData.data : (fallbackRows ?? []);
    if (!rows.length) return { traces: [], scBands: [], xDomain: [1, 70] as [number, number], maxPos: 20 };
    
    const bands = deriveSCBands(rows);
    const lapNums = rows.map((r) => r.lap_number);
    const xDom: [number, number] = [Math.min(...lapNums), Math.max(...lapNums)];
    const mPos = Math.max(...rows.map((r) => r.position), 20);

    const byDriver = new Map<string, Array<{ lap: number; pos: number }>>();
    for (const r of rows) {
      const code = r.driver_code ?? r.driver ?? "";
      if (!code) continue;
      if (!byDriver.has(code)) byDriver.set(code, []);
      byDriver.get(code)!.push({ lap: r.lap_number, pos: r.position });
    }

    const t = [...byDriver.entries()].map(([code, laps]) => {
      laps.sort((a, b) => a.lap - b.lap);
      const driver = driverById(code);
      const team = driver?.team ?? drivers.find(d => d.code === code)?.team;
      const finalPos = laps[laps.length - 1]?.pos ?? 20;
      return {
        code,
        teamColor: team ? teamColor(team) : "hsl(var(--muted))",
        laps,
        finalPosition: finalPos,
        isSelected: true, // Show all drivers equally as requested
      };
    }).sort((a, b) => a.finalPosition - b.finalPosition);

    return { traces: t, scBands: bands, xDomain: xDom, maxPos: mPos };
  }, [positionsData, fallbackRows, drivers]);

  const combined = useMemo(() => {
    if (!traces.length) return [] as any[];
    const [minLap, maxLap] = xDomain;
    const rows: any[] = [];
    for (let lap = minLap; lap <= maxLap; lap++) {
      const item: any = { lap };
      for (const t of traces) {
        const entry = t.laps.find((l) => l.lap === lap);
        item[t.code] = entry ? entry.pos : null;
      }
      rows.push(item);
    }
    return rows;
  }, [traces, xDomain]);

  if (isLoading) return <Skeleton height={320} />;
  if (!traces.length) return <EmptyState message="Position data unavailable" description="Position tracking data has not been collected for this race." />;
  if (size.width < 120) return <div ref={ref} className="h-[440px] w-full" />;

  const [minLap, maxLap] = xDomain;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const items = payload
      .filter((p: any) => p.value !== null && p.value !== undefined)
      .map((p: any) => ({ code: p.name || p.dataKey, pos: p.value, color: p.stroke }))
      .sort((a: any, b: any) => a.pos - b.pos);

    return (
      <div className="border border-border-subtle bg-panel px-3 py-2 font-mono text-[10px]">
        <div className="mb-2 uppercase tracking-widest text-white/40">Lap {label}</div>
        <div className="flex max-h-48 flex-col flex-wrap gap-x-4 gap-y-1 overflow-hidden" style={{ width: Math.min(items.length * 10, 180) }}>
          {items.map((it: any) => (
            <div key={it.code} className="flex items-center gap-2">
              <span className="h-2 w-0.5" style={{ background: it.color }} />
              <span className="text-white/60">{it.code}</span>
              <span className="text-white">P{it.pos}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div ref={ref} className="w-full bg-[#0A0A0F]" style={{ height: CHART_H }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combined} margin={MARGIN}>
            {/* Horizontal lines only */}
            <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis type="number" dataKey="lap" domain={[minLap, maxLap]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }} />
            <YAxis type="number" domain={[maxPos + 0.5, 0.5]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }} width={24} />

            {/* SC / VSC Bands */}
            {scBands.map((band, i) => (
              <ReferenceArea key={i} x1={band.lapFrom} x2={band.lapTo} fill="rgba(255,214,0,0.06)">
                <Label value={band.type} position="insideTopLeft" fill="rgba(255,214,0,0.4)" fontSize={9} fontFamily="var(--font-mono)" />
              </ReferenceArea>
            ))}
            {/* Left border line for SC bands */}
            {scBands.map((band, i) => (
              <ReferenceArea key={`border-${i}`} x1={band.lapFrom} x2={band.lapFrom} stroke="rgba(255,214,0,0.4)" strokeWidth={1} />
            ))}

            {traces.map((t) => (
              <Line 
                key={t.code} 
                type="monotone" 
                dataKey={t.code} 
                data={combined} 
                stroke="transparent" 
                dot={{ r: 2.5, fill: t.teamColor, fillOpacity: 0.8 }}
                activeDot={{ r: 4, fill: '#fff', stroke: t.teamColor, strokeWidth: 2 }}
                connectNulls={false} 
                name={t.code} 
                isAnimationActive={false}
              />
            ))}

            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />

            <Customized
              component={({ width = 0, height = 0 }: any) => {
                const right = width - MARGIN.right;
                const innerH = height - MARGIN.top - MARGIN.bottom;

                const yScale = (v: number) => {
                  const t = (v - 0.5) / (maxPos + 0.5 - 0.5 || 1);
                  return MARGIN.top + t * innerH;
                };

                return (
                  <g>
                    {traces.map((t) => {
                      const last = t.laps[t.laps.length - 1];
                      if (!last) return null;
                      return (
                        <text key={t.code} x={right + 8} y={yScale(last.pos)} dy="0.32em" style={{ fontSize: 9, fill: t.isSelected ? t.teamColor : 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>
                          {t.code}
                        </text>
                      );
                    })}
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

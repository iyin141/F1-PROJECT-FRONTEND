"use client";
import React, { useMemo } from "react";
import { Panel } from "@/components/Panel";
import { useTyreStrategy, useRacePositions } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { teamColor } from "@/components/DriverCode";
import { resolveTyreColor } from "@/Lib/recharts-tokens";
import type { AnalysisDriverOption } from "@/features/race-analysis/components/DriverSelect";
import { F1LoadingState } from "@/components/ui/F1LoadingState";
import { useResizeObserver } from "@/hooks/use-resize-observer";

export function TyreStrategyPanel({ 
  year, 
  round, 
  session = "R", 
  drivers 
}: { 
  year: number; 
  round: number; 
  session?: string; 
  drivers: AnalysisDriverOption[]; 
}) {
  const { data: stints, isLoading: stintsLoading } = useTyreStrategy(year, round, session);
  const { data: positionsData } = useRacePositions(year, round, true, session);
  const { ref, size } = useResizeObserver<HTMLDivElement>();

  const rows = useMemo(() => {
    if (!stints || stints.length === 0) return [];
    
    // Group stints by driver
    const byDriver = new Map<string, typeof stints>();
    for (const s of stints) {
      if (!byDriver.has(s.driverId)) byDriver.set(s.driverId, []);
      byDriver.get(s.driverId)!.push(s);
    }
    
    // Sort drivers by final position (using positionsData if available, fallback to length of drivers)
    const finalPosMap = new Map<string, number>();
    if (positionsData?.data) {
      for (const r of positionsData.data) {
        finalPosMap.set(r.driver_code ?? r.driver, r.position);
      }
    } else {
      drivers.forEach((d, i) => finalPosMap.set(d.code, i));
    }

    const rowData = Array.from(byDriver.entries()).map(([code, s]) => ({
      code,
      stints: s.sort((a, b) => a.startLap - b.startLap),
      finalPos: finalPosMap.get(code) ?? 99,
      team: drivers.find((d) => d.code === code)?.team,
    }));

    rowData.sort((a, b) => a.finalPos - b.finalPos);
    return rowData;
  }, [stints, positionsData, drivers]);

  if (stintsLoading) {
    return (
      <Panel title="TYRE STRATEGY GANTT">
        <F1LoadingState variant="gantt" />
      </Panel>
    );
  }

  if (rows.length === 0) {
    return (
      <Panel title="TYRE STRATEGY GANTT">
        <div className="flex h-32 items-center justify-center font-mono text-[11px] text-white/35">
          STRATEGY DATA UNAVAILABLE
        </div>
      </Panel>
    );
  }

  // Calculate layout
  const ROW_H = 28;
  const GAP = 2;
  const LABEL_W = 48;
  const totalLaps = Math.max(...rows.flatMap(r => r.stints.map(s => s.endLap)));
  const contentW = Math.max(size.width - LABEL_W, 100);
  const lapW = contentW / (totalLaps || 1);
  const height = rows.length * (ROW_H + GAP);

  return (
    <Panel title="TYRE STRATEGY GANTT" className="overflow-x-auto">
      <div ref={ref} className="min-w-[600px] bg-[#0A0A0F] py-2">
        <svg width="100%" height={height} style={{ display: 'block' }}>
          {/* Vertical grid lines every 10 laps */}
          {Array.from({ length: Math.ceil(totalLaps / 10) + 1 }).map((_, i) => {
            const lap = i * 10;
            const x = LABEL_W + lap * lapW;
            return (
              <g key={`grid-${lap}`}>
                <line x1={x} y1={0} x2={x} y2={height} stroke="rgba(255,255,255,0.04)" />
                {lap > 0 && lap <= totalLaps && (
                  <text x={x} y={10} fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
                    L{lap}
                  </text>
                )}
              </g>
            );
          })}

          {/* Rows */}
          {rows.map((row, i) => {
            const y = i * (ROW_H + GAP);
            const teamCol = row.team ? teamColor(row.team) : "hsl(var(--muted))";
            
            return (
              <g key={row.code} transform={`translate(0, ${y})`}>
                {/* Row background (zebra striping for readability) */}
                <rect x={0} y={0} width="100%" height={ROW_H} fill={i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent"} />
                
                {/* Driver Label */}
                <rect x={4} y={4} width={3} height={ROW_H - 8} fill={teamCol} />
                <text x={12} y={ROW_H / 2} dy="0.32em" fill="rgba(255,255,255,0.8)" fontSize="12" fontFamily="var(--font-mono)">
                  {row.code}
                </text>

                {/* Stints */}
                {row.stints.map((stint, j) => {
                  const sX = LABEL_W + Math.max(0, stint.startLap - 1) * lapW;
                  const eX = LABEL_W + stint.endLap * lapW;
                  const w = Math.max(eX - sX, 2);
                  const color = resolveTyreColor(stint.compound);
                  
                  return (
                    <g key={`stint-${j}`}>
                      <rect x={sX} y={4} width={w} height={ROW_H - 8} fill={color} rx={2}>
                        <title>{`Compound: ${stint.compound.toUpperCase()}
Laps: ${stint.startLap} - ${stint.endLap}
Avg Pace: ${(stint.avgPaceMs / 1000).toFixed(3)}s`}</title>
                      </rect>
                      {/* Pit diamond at the end of the stint (if not the last stint) */}
                      {j < row.stints.length - 1 && (
                        <polygon 
                          points={`${eX},${ROW_H/2 - 4} ${eX+4},${ROW_H/2} ${eX},${ROW_H/2 + 4} ${eX-4},${ROW_H/2}`}
                          fill="#FFF"
                          stroke={color}
                          strokeWidth={1}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </Panel>
  );
}

export default TyreStrategyPanel;

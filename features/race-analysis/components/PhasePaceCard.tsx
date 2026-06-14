"use client";
import React, { useMemo } from "react";
import { Panel } from "@/components/Panel";
import { useRaceLapFrames } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { detectPhasesByLapCount } from "@/features/race-analysis/utils/phaseDetection";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

export default function PhasePaceCard({ year, round, session = "R" }: { year: number; round: number; session?: string }) {
  const q = useRaceLapFrames(year, round, session);
  const frames = q.data ?? [];
  const totalLaps = frames.length || 0;
  const phases = detectPhasesByLapCount(totalLaps);

  const phaseAverages = useMemo(() => {
    if (!frames.length || phases.length === 0) return [] as { phase: string; avgSec: number | null }[];
    return phases.map((p) => {
      const rows: number[] = [];
      for (const f of frames) {
        if (f.lap < p.startLap || f.lap > p.endLap) continue;
        for (const d of Object.values(f.drivers)) {
          if (d.lapTimeMs != null) rows.push(d.lapTimeMs);
        }
      }
      const avg = rows.length ? rows.reduce((s, v) => s + v, 0) / rows.length : null;
      return { phase: p.name, avgSec: avg != null ? avg / 1000 : null };
    });
  }, [frames, phases]);

  return (
    <Panel title="Race Thirds — Phase Pace">
      {phaseAverages.length === 0 ? (
        <div>No phase data available</div>
      ) : (
        <div style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={phaseAverages} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
              <XAxis dataKey="phase" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => (v == null ? "—" : `${(v as number).toFixed(3)}s`)} />
              <Bar dataKey="avgSec" fill="hsl(var(--blue))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}

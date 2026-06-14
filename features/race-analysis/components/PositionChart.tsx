"use client";
import React from "react";
import { Panel } from "@/components/Panel";
import { useRacePositions } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { resolvePosColor } from "@/Lib/recharts-tokens";

export default function PositionChart({ year, round, session = "R" }: { year: number; round: number; session?: string }) {
  const q = useRacePositions(year, round, true, session);
  if (q.isLoading) return <Panel title="Position Tracker">Loading…</Panel>;
  if (q.isError || !q.data) return <Panel title="Position Tracker">No position data</Panel>;
  const rows = q.data.data ?? [];
  const laps = Array.from(new Set(rows.map((r) => r.lap_number ?? r.lap ?? 0))).sort((a, b) => a - b).filter((n) => n > 0);
  if (!laps.length) return <Panel title="Position Tracker">No laps available</Panel>;

  const lastLap = laps[laps.length - 1];
  const lastRows = rows.filter((r) => (r.lap_number ?? r.lap ?? 0) === lastLap).sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  const topDrivers = lastRows.slice(0, 3).map((r) => r.driver_code);

  const maxPos = Math.max(...rows.map((r) => (r.position ?? 0)));

  const data = laps.map((lap) => {
    const entry: Record<string, any> = { lap };
    for (const d of topDrivers) {
      const row = rows.find((r) => (r.driver_code === d) && ((r.lap_number ?? r.lap ?? 0) === lap));
      entry[d] = row?.position ?? null;
    }
    return entry;
  });

  return (
    <Panel title="Position Tracker">
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 20, left: 12 }}>
            <XAxis dataKey="lap" tick={{ fontSize: 11 }} />
            <YAxis domain={[maxPos || 20, 1]} allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {topDrivers.map((d, i) => (
              <Line key={d} type="monotone" dataKey={d} stroke={resolvePosColor(i + 1)} strokeWidth={2} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

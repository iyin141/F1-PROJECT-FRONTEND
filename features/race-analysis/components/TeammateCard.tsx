"use client";
import React from "react";
import { Panel } from "@/components/Panel";
import { useTeammateBattles } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { TeammateBattle } from "@/types/ui";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";
import { getTokenColor } from "@/Lib/recharts-tokens";
import { formatDeltaMs } from "@/Lib/format";

export default function TeammateCard({ year, round, session = "R" }: { year: number; round: number; session?: string }) {
  const { data, isLoading, isError } = useTeammateBattles(year, round, session);
  const queryClient = useQueryClient();
  const router = useRouter();
  if (isLoading) return <Panel title="Teammate Battles">Loading…</Panel>;
  if (isError || !data || data.length === 0) return <Panel title="Teammate Battles">No teammate battles available</Panel>;
  return (
    <Panel title="Teammate Battles">
      <ul className="space-y-2">
        {data.map((b: TeammateBattle, idx) => (
          <li key={idx} className="text-sm">
            <div className="flex items-center justify-between">
              <div>
                <strong>{b.driverA.code}</strong> vs <strong>{b.driverB.code}</strong>
                <div className="text-xs text-muted">Winner: {b.overallWinner ?? "—"}</div>
              </div>
              <div className="w-36 h-10">
                {b.phases && b.phases.length > 0 ? (
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={b.phases.map((p) => ({ phase: p.phase, deltaSec: p.deltaMs != null ? p.deltaMs / 1000 : null }))}>
                      <XAxis dataKey="phase" hide />
                      <Tooltip formatter={(value: any) => (value == null ? "—" : formatDeltaMs(Math.round(value * 1000)))} />
                      <Line type="monotone" dataKey="deltaSec" stroke={getTokenColor("--muted")} strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-muted">No phase data</div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

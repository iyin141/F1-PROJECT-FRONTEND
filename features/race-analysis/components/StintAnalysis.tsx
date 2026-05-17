'use client';

import { useMemo } from "react";
import { GenericTable } from "@/components/ui/GenericTable";
import { useAllStints } from "@/features/race-analysis/hooks/useRaceAnalysis";
import Skeleton from "@/components/animations/Skeleton";
import { formatLapMs } from "@/Lib/format";
import type { AnalysisDriverOption } from "@/features/race-analysis/components/DriverSelect";
import type { Stint } from "@/types/ui";

type StintRow = {
  driver: string;
  stint: number;
  compound: string;
  lapStart: number;
  lapEnd: number;
  lapCount: number;
  avgPace: string;
  bestLap: string;
  degradation: string;
};

export function StintAnalysis({
  year,
  round,
  drivers,
  session = "R",
}: {
  year: number;
  round: number;
  drivers: AnalysisDriverOption[];
  session?: string;
}) {
  const { data, isLoading } = useAllStints(year, round, session);

  const rows = useMemo(() => {
    const raw = (data ?? []) as Stint[];
    const out: StintRow[] = [];

    for (const r of raw) {
      const driver = typeof r.driverId === "string" ? r.driverId : null;
      if (!driver) continue;

      const lapStart = Number(r.startLap ?? 0);
      const lapEnd = Number(r.endLap ?? lapStart);
      const lapCount = Number(Math.max(0, lapEnd - lapStart + 1));

      out.push({
        driver,
        stint: Number(r.stintNumber ?? 0),
        compound: String(r.compound ?? "unknown").toUpperCase(),
        lapStart,
        lapEnd,
        lapCount,
        avgPace: typeof r.avgPaceMs === "number" && r.avgPaceMs > 0 ? formatLapMs(r.avgPaceMs) : "-",
        bestLap: "-",
        degradation: "-",
      });
    }

    const order = new Map(drivers.map((d, idx) => [d.code, idx] as const));
    out.sort((a, b) => {
      const ai = order.get(a.driver) ?? 999;
      const bi = order.get(b.driver) ?? 999;
      if (ai !== bi) return ai - bi;
      return a.stint - b.stint;
    });

    return out;
  }, [data, drivers]);

  const timeline = useMemo(() => {
    const maxLap = rows.reduce((m, r) => Math.max(m, r.lapEnd), 1);
    const byDriver = new Map<string, StintRow[]>();

    for (const row of rows) {
      const list = byDriver.get(row.driver) ?? [];
      list.push(row);
      byDriver.set(row.driver, list);
    }

    return { maxLap, byDriver };
  }, [rows]);

  if (isLoading) return <Skeleton height={256} />;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {Array.from(timeline.byDriver.entries()).map(([driver, stints]) => (
          <div key={driver} className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "hsl(var(--muted))" }}>
              {driver}
            </span>
            <div className="relative h-5 rounded-sm border border-border-subtle" style={{ backgroundColor: "var(--surface2)" }}>
              {stints.map((s) => {
                const left = (s.lapStart / timeline.maxLap) * 100;
                const width = (Math.max(1, s.lapEnd - s.lapStart + 1) / timeline.maxLap) * 100;
                const bg =
                  s.compound === "SOFT"
                    ? "hsl(var(--red))"
                    : s.compound === "MEDIUM"
                      ? "hsl(var(--amber))"
                      : s.compound === "HARD"
                        ? "hsl(var(--text))"
                        : "hsl(var(--muted))";
                return (
                  <div
                    key={`${driver}-${s.stint}`}
                    className="absolute top-0 h-full"
                    style={{ left: `${left}%`, width: `${width}%`, background: bg, opacity: 0.75 }}
                    title={`${driver} stint ${s.stint}: L${s.lapStart}-L${s.lapEnd} (${s.compound})`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <GenericTable
        columns={[
          { key: "driver", width: "80px", header: "DRIVER", render: (r: StintRow) => r.driver },
          { key: "stint", width: "60px", header: "STINT", render: (r: StintRow) => r.stint },
          { key: "compound", width: "90px", header: "COMPOUND", render: (r: StintRow) => r.compound },
          { key: "laps", width: "90px", header: "LAPS", render: (r: StintRow) => `L${r.lapStart}-L${r.lapEnd}` },
          { key: "lapCount", width: "70px", header: "COUNT", render: (r: StintRow) => r.lapCount },
          { key: "avg", width: "110px", header: "AVG PACE", render: (r: StintRow) => r.avgPace },
          { key: "best", width: "100px", header: "BEST", render: (r: StintRow) => r.bestLap },
          { key: "degrade", width: "110px", header: "DEGRADATION", render: (r: StintRow) => r.degradation },
        ]}
        data={rows}
        getRowKey={(r) => `${r.driver}-${r.stint}-${r.lapStart}`}
      />
    </div>
  );
}

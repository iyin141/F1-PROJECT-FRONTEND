'use client';

import { useMemo } from "react";
import { driverById } from "@/Lib/data/drivers";
import { useSectorAnalysis, useDriverSectors } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { F1LoadingState } from "@/components/ui/F1LoadingState";

type ColKey = "s1" | "s2" | "s3";

import { parseTimeMs } from "@/Lib/adapters";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cellStyle(value: number, min: number, isPB: boolean): React.CSSProperties {
  if (Math.abs(value - min) < 0.0005) {
    // Session best in sector: purple bg, purple text
    return { background: "rgba(170,0,255,0.15)", color: "#AA00FF" };
  }
  if (isPB) {
    // Personal best: green text
    return { color: "#00C853" };
  }
  
  const diff = value - min;
  if (diff <= 0.1) {
    return { color: "#FFFFFF" };
  }
  if (diff <= 0.5) {
    return { color: "rgba(255,255,255,0.6)" };
  }
  
  // Beyond 0.5s: muted text
  return { color: "rgba(255,255,255,0.35)" };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SectorHeatmap = ({
  year,
  round,
  driverId,
  session = "R",
}: {
  year: number;
  round: number;
  driverId?: string;
  session?: string;
}) => {
  const driverSectorsQuery = useDriverSectors(year, round, driverId, session);
  const sectorQuery = useSectorAnalysis(year, round, session);

  const isLoading = driverId ? driverSectorsQuery.isLoading : sectorQuery.isLoading;

  const sectors = useMemo(() => {
    if (driverId && driverSectorsQuery.data) {
      const sData = driverSectorsQuery.data.data;
      if (!sData || !Array.isArray(sData)) return { data: undefined, loading: false };
      const result = sData.map((s: any) => ({
        driverId,
        s1Ms: parseTimeMs(s.sector1 ?? s.s1) ?? 0,
        s2Ms: parseTimeMs(s.sector2 ?? s.s2) ?? 0,
        s3Ms: parseTimeMs(s.sector3 ?? s.s3) ?? 0,
      }));
      return { data: result, loading: false };
    }

    if (!driverId && sectorQuery.data) {
      return { data: sectorQuery.data, loading: false };
    }

    return { data: undefined, loading: isLoading };
  }, [driverId, driverSectorsQuery.data, sectorQuery.data, isLoading]);

  const { rows, colStats } = useMemo(() => {
    if (!sectors.data) return { rows: [], colStats: [] };

    const rawRows = sectors.data.map((d) => ({
      code: driverById(d.driverId)?.code ?? d.driverId,
      s1: d.s1Ms / 1000,
      s2: d.s2Ms / 1000,
      s3: d.s3Ms / 1000,
      total: (d.s1Ms + d.s2Ms + d.s3Ms) / 1000
    }));

    // Find personal bests for each driver in each sector
    // Since rows might contain multiple laps per driver (if driverId is set),
    // or just one row per driver (if overall session).
    const driverPBs = new Map<string, {s1: number, s2: number, s3: number}>();
    for (const r of rawRows) {
      if (!driverPBs.has(r.code)) {
        driverPBs.set(r.code, { s1: r.s1, s2: r.s2, s3: r.s3 });
      } else {
        const pb = driverPBs.get(r.code)!;
        pb.s1 = Math.min(pb.s1, r.s1);
        pb.s2 = Math.min(pb.s2, r.s2);
        pb.s3 = Math.min(pb.s3, r.s3);
      }
    }

    const rowsWithPB = rawRows.map(r => ({
      ...r,
      pb: driverPBs.get(r.code)!
    }));

    // Sort by best overall lap time
    rowsWithPB.sort((a, b) => a.total - b.total);

    const colStats = (["s1", "s2", "s3"] as ColKey[]).map((col) => {
      const vals = rawRows.map((r) => r[col]);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(
        vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length,
      );
      return { col, min, max, std };
    });

    return { rows: rowsWithPB, colStats };
  }, [sectors.data]);

  if (sectors.loading) return <F1LoadingState variant="table-rows" rows={12} />;

  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center font-mono text-[11px] text-white/35">
        SECTOR DATA UNAVAILABLE
      </div>
    );
  }

  const colFor = (col: ColKey) => colStats.find((c) => c.col === col)!;
  const widestCol = [...colStats].sort((a, b) => b.max - b.min - (a.max - a.min))[0];
  const tightestCol = [...colStats].sort((a, b) => a.std - b.std)[0];

  return (
    <div className="flex flex-col bg-[#0A0A0F]">
      {/* Column headers */}
      <div className="grid grid-cols-[48px_1fr_1fr_1fr] items-center border-b border-border-subtle px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-white/40">
        <span>DRV</span>
        <span className="text-right">S1</span>
        <span className="text-right">S2</span>
        <span className="text-right">S3</span>
      </div>

      {/* Data rows */}
      <div className="flex flex-col divide-y divide-white/5 max-h-[360px] overflow-y-auto scrollbar-none py-1">
        {rows.map((r, i) => (
          <div key={`${r.code}-${i}`} className="grid grid-cols-[48px_1fr_1fr_1fr] items-center px-4 py-[6px] font-mono text-[11px]">
            <span className="font-semibold tracking-wider text-white/70">{r.code}</span>
            {(["s1", "s2", "s3"] as ColKey[]).map((col) => {
              const cs = colFor(col);
              const isPB = r[col] <= r.pb[col];
              return (
                <span
                  key={col}
                  className="text-right tabular-nums px-1.5 py-0.5 rounded-sm"
                  style={cellStyle(r[col], cs.min, isPB)}
                >
                  {r[col].toFixed(3)}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* Insights footer */}
      {widestCol && tightestCol && (
        <div className="mt-auto space-y-1 border-t border-border-subtle bg-panel px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em]">
          <div className="flex justify-between">
            <span className="text-white/40">WHERE THE RACE WAS WON</span>
            <span className="text-white/70">
              {widestCol.col.toUpperCase()} · SPREAD {(widestCol.max - widestCol.min).toFixed(3)}s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">MOST CONSISTENT SECTOR</span>
            <span className="text-white/70">
              {tightestCol.col.toUpperCase()} · σ {tightestCol.std.toFixed(3)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

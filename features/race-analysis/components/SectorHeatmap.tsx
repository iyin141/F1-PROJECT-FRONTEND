'use client';

import { useMemo } from "react";
import { driverById } from "@/Lib/data/drivers";
import { useSectorAnalysis, useDriverSectors } from "@/features/race-analysis/hooks/useRaceAnalysis";

type ColKey = "s1" | "s2" | "s3";

function cellStyle(value: number, min: number, max: number): React.CSSProperties {
  if (Math.abs(value - min) < 0.0005) {
    // Best (fastest) cell — purple highlight
    return { background: "rgba(170,0,255,0.8)", color: "hsl(var(--text))" };
  }
  const t = (value - min) / Math.max(0.0001, max - min);
  // green → amber → red gradient
  const hue = Math.round(120 - t * 120);
  return { background: `hsl(${hue} 55% 22%)`, color: "hsl(var(--text))" };
}

export const SectorHeatmap = ({
  year,
  round,
  driverId,
}: {
  year: number;
  round: number;
  driverId?: string;
}) => {
  // Use driver-specific sectors hook when driverId is provided
  const driverSectorsQuery = useDriverSectors(year, round, driverId);
  // Fall back to all-driver sectors when no specific driver
  const sectorQuery = useSectorAnalysis(year, round);

  const isLoading = driverId ? driverSectorsQuery.isLoading : sectorQuery.isLoading;
  const data = driverId ? driverSectorsQuery.data : sectorQuery.data;

  // Extract sectors from data
  const sectors = useMemo(() => {
    if (driverId && driverSectorsQuery.data) {
      // For single driver: data contains sector data array
      const sectors = driverSectorsQuery.data.data;
      if (!sectors || !Array.isArray(sectors)) return { data: undefined, loading: false };

      const result = sectors.map((s: any) => ({
        driverId,
        s1Ms: (s.s1_ms ?? s.s1 ?? 0) * 1000, // Convert to ms
        s2Ms: (s.s2_ms ?? s.s2 ?? 0) * 1000,
        s3Ms: (s.s3_ms ?? s.s3 ?? 0) * 1000,
      }));
      return { data: result, loading: false };
    }

    if (!driverId && sectorQuery.data) {
      // For all drivers: sectorQuery.data is already adapted
      return { data: sectorQuery.data, loading: false };
    }

    return { data: undefined, loading: isLoading };
  }, [driverId, driverSectorsQuery, sectorQuery, isLoading]);

  const { rows, colStats } = useMemo(() => {
    if (!sectors.data) return { rows: [], colStats: [] };

    const rows = sectors.data.map((d) => ({
      code: driverById(d.driverId)?.code ?? d.driverId,
      s1: d.s1Ms / 1000,
      s2: d.s2Ms / 1000,
      s3: d.s3Ms / 1000,
    }));

    const colStats = (["s1", "s2", "s3"] as ColKey[]).map((col) => {
      const vals = rows.map((r) => r[col]);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(
        vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length,
      );
      return { col, min, max, std };
    });

    return { rows, colStats };
  }, [sectors.data]);

  if (sectors.loading) return <div className="h-96" />;

  const colFor = (col: ColKey) => colStats.find((c) => c.col === col)!;

  const widestCol = [...colStats].sort((a, b) => b.max - b.min - (a.max - a.min))[0];
  const tightestCol = [...colStats].sort((a, b) => a.std - b.std)[0];

  return (
    <div>
      {/* Column headers */}
      <div
        className="grid border-b border-border-subtle px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em]"
        style={{
          gridTemplateColumns: "56px 1fr 1fr 1fr",
          color: "hsl(var(--muted))",
        }}
      >
        <span>DRV</span>
        <span className="text-center">SECTOR 1</span>
        <span className="text-center">SECTOR 2</span>
        <span className="text-center">SECTOR 3</span>
      </div>

      {/* Data rows */}
      {rows.map((r) => (
        <div
          key={r.code}
          className="grid items-center gap-1 px-4 py-0.5 font-mono text-[11px]"
          style={{ gridTemplateColumns: "56px 1fr 1fr 1fr" }}
        >
          <span
            className="font-bold tracking-[0.06em]"
            style={{ color: "hsl(var(--text-dim))" }}
          >
            {r.code}
          </span>
          {(["s1", "s2", "s3"] as ColKey[]).map((col) => {
            const cs = colFor(col);
            return (
              <span
                key={col}
                className="px-2 py-1 text-center tabular-nums"
                style={cellStyle(r[col], cs.min, cs.max)}
              >
                {r[col].toFixed(3)}
              </span>
            );
          })}
        </div>
      ))}

      {/* Insights footer */}
      {widestCol && tightestCol && (
        <div className="mt-4 space-y-1 border-t border-border-subtle px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em]">
          <div className="flex justify-between">
            <span style={{ color: "hsl(var(--muted))" }}>WHERE THE RACE WAS WON</span>
            <span style={{ color: "hsl(var(--text-dim))" }}>
              {widestCol.col.toUpperCase()} · SPREAD {(widestCol.max - widestCol.min).toFixed(3)}s
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "hsl(var(--muted))" }}>MOST CONSISTENT SECTOR</span>
            <span style={{ color: "hsl(var(--text-dim))" }}>
              {tightestCol.col.toUpperCase()} · σ {tightestCol.std.toFixed(3)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

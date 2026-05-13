'use client';

import { useMemo } from "react";
import { CompoundDot } from "@/components/CompoundDot";
import { teamColor } from "@/components/DriverCode";
import { formatLapMs } from "@/Lib/format";
import { useRaceLapFrames } from "@/features/race-analysis/hooks/useRaceAnalysis";
import type { RaceLapFrame } from "@/types/ui";
import type { Compound } from "@/types/ui";
import type { AnalysisDriverOption } from "./DriverSelect";

const COMPOUND_LABELS: Compound[] = ["soft", "medium", "hard", "inter", "wet"];
const COMPOUND_COLORS: Record<Compound, string> = {
  soft: "hsl(var(--red))",
  medium: "hsl(var(--amber))",
  hard: "hsl(var(--text-dim))",
  inter: "#39b54a",
  wet: "hsl(var(--blue))",
};

// ---------------------------------------------------------------------------
// Derive summary stats from frames — pure, no hooks
// ---------------------------------------------------------------------------

interface CompoundFastest {
  compound: Compound;
  driverCode: string;
  lapTimeMs: number;
  lap: number;
}

interface StintTopDriver {
  stintNumber: number;
  drivers: { code: string; avgMs: number }[];
}

function deriveCompoundFastest(frames: RaceLapFrame[]): CompoundFastest[] {
  const best = new Map<Compound, CompoundFastest>();

  for (const frame of frames) {
    for (const [code, entry] of Object.entries(frame.drivers)) {
      if (!entry.compound || entry.lapTimeMs === null || entry.lapTimeMs < 55_000) continue;
      const c = entry.compound;
      const existing = best.get(c);
      if (!existing || entry.lapTimeMs < existing.lapTimeMs) {
        best.set(c, { compound: c, driverCode: code, lapTimeMs: entry.lapTimeMs, lap: frame.lap });
      }
    }
  }

  return COMPOUND_LABELS.filter((c) => best.has(c)).map((c) => best.get(c)!);
}

function deriveStintTopFive(frames: RaceLapFrame[]): StintTopDriver[] {
  // accumulate per driver per stint: lap times
  const stintTimes = new Map<number, Map<string, number[]>>();

  for (const frame of frames) {
    for (const [code, entry] of Object.entries(frame.drivers)) {
      if (entry.stint === null || entry.lapTimeMs === null || entry.lapTimeMs < 55_000) continue;
      if (!stintTimes.has(entry.stint)) stintTimes.set(entry.stint, new Map());
      const driverMap = stintTimes.get(entry.stint)!;
      if (!driverMap.has(code)) driverMap.set(code, []);
      driverMap.get(code)!.push(entry.lapTimeMs);
    }
  }

  const result: StintTopDriver[] = [];
  for (const [stintNum, driverMap] of stintTimes) {
    const avgs: { code: string; avgMs: number }[] = [];
    for (const [code, times] of driverMap) {
      if (times.length < 2) continue;
      avgs.push({ code, avgMs: times.reduce((a, b) => a + b, 0) / times.length });
    }
    avgs.sort((a, b) => a.avgMs - b.avgMs);
    result.push({ stintNumber: stintNum, drivers: avgs.slice(0, 5) });
  }

  return result.sort((a, b) => a.stintNumber - b.stintNumber);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RaceSummaryStatsProps {
  year: number;
  round: number;
  drivers: AnalysisDriverOption[];
}

export const RaceSummaryStats = ({ year, round, drivers }: RaceSummaryStatsProps) => {
  const { data: frames, isLoading } = useRaceLapFrames(year, round);

  const compoundFastest = useMemo(() => deriveCompoundFastest(frames ?? []), [frames]);
  const stintTop5 = useMemo(() => deriveStintTopFive(frames ?? []), [frames]);

  if (isLoading) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* --- Fastest lap per compound --- */}
      <div
        className="border border-border-subtle"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div
          className="border-b border-border-subtle px-4 py-2.5"
          style={{ backgroundColor: "var(--surface2)" }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--muted))" }}
          >
            FASTEST LAP · BY COMPOUND
          </span>
        </div>

        <div className="divide-y divide-border-subtle">
          {compoundFastest.length === 0 ? (
            <div
              className="px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: "hsl(var(--muted-2))" }}
            >
              No data
            </div>
          ) : (
            compoundFastest.map((cf) => {
              const driver = drivers.find((d) => d.code === cf.driverCode);
              return (
                <div
                  key={cf.compound}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <CompoundDot compound={cf.compound} />
                  <span
                    className="w-16 font-mono text-[10px] uppercase tracking-[0.14em]"
                    style={{ color: COMPOUND_COLORS[cf.compound] }}
                  >
                    {cf.compound.toUpperCase()}
                  </span>
                  <span
                    className="font-mono text-[12px] font-semibold tracking-[0.06em]"
                    style={{
                      color: driver
                        ? teamColor(driver.team)
                        : "hsl(var(--text-dim))",
                    }}
                  >
                    {cf.driverCode}
                  </span>
                  <span
                    className="ml-auto font-mono text-[11px] tabular-nums"
                    style={{ color: "hsl(var(--text-dim))" }}
                  >
                    {formatLapMs(cf.lapTimeMs)}
                  </span>
                  <span
                    className="w-10 text-right font-mono text-[9px] uppercase tracking-[0.14em]"
                    style={{ color: "hsl(var(--muted))" }}
                  >
                    L{cf.lap}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- Top 5 per stint --- */}
      <div
        className="border border-border-subtle"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div
          className="border-b border-border-subtle px-4 py-2.5"
          style={{ backgroundColor: "var(--surface2)" }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--muted))" }}
          >
            TOP 5 · BY STINT
          </span>
        </div>

        <div className="divide-y divide-border-subtle">
          {stintTop5.length === 0 ? (
            <div
              className="px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: "hsl(var(--muted-2))" }}
            >
              No stint data
            </div>
          ) : (
            stintTop5.map((st) => (
              <div key={st.stintNumber} className="px-4 py-3">
                <div
                  className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.22em]"
                  style={{ color: "hsl(var(--muted))" }}
                >
                  STINT {st.stintNumber}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {st.drivers.map((d, idx) => {
                    const driver = drivers.find((dr) => dr.code === d.code);
                    return (
                      <div key={d.code} className="flex items-center gap-1.5">
                        <span
                          className="font-mono text-[9px]"
                          style={{ color: "hsl(var(--muted-2))" }}
                        >
                          {idx + 1}.
                        </span>
                        <span
                          className="font-mono text-[11px] font-semibold tracking-[0.06em]"
                          style={{
                            color: driver
                              ? teamColor(driver.team)
                              : "hsl(var(--text-dim))",
                          }}
                        >
                          {d.code}
                        </span>
                        <span
                          className="font-mono text-[9px] tabular-nums"
                          style={{ color: "hsl(var(--muted))" }}
                        >
                          {formatLapMs(d.avgMs)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

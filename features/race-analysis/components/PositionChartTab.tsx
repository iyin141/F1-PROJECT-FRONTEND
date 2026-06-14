'use client';

import { Panel } from "@/components/Panel";
import { PositionTracker } from "./PositionTracker";
import type { AnalysisDriverOption } from "./DriverSelect";
import { useAllLaps, useRaceLapFrames } from "../hooks/useRaceAnalysis";
import Skeleton from "@/components/animations/Skeleton";
import { motion } from "framer-motion";
import type { RaceLapFrame } from "@/types/ui";
import type { UnifiedPositionRow } from "@/types/endpoints";

function PanelEntry({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Derive approximate lap-by-lap positions from frames using cumulative race time. */
function derivePositionsFromFrames(frames: RaceLapFrame[]): UnifiedPositionRow[] {
  const cumulative = new Map<string, number>();
  const rows: UnifiedPositionRow[] = [];

  for (const frame of frames) {
    // Update cumulative times
    for (const [code, entry] of Object.entries(frame.drivers)) {
      if (entry.lapTimeMs != null && entry.lapTimeMs > 0) {
        cumulative.set(code, (cumulative.get(code) ?? 0) + entry.lapTimeMs);
      }
    }

    // Rank drivers by cumulative elapsed time this lap
    const ranked = [...cumulative.entries()]
      .sort(([, a], [, b]) => a - b)
      .map(([code], i) => ({ code, pos: i + 1 }));

    for (const { code, pos } of ranked) {
      rows.push({
        driver_code: code,
        driver: code,
        lap_number: frame.lap,
        position: pos,
        track_status: null,
      } as UnifiedPositionRow);
    }
  }
  return rows;
}

export function PositionChartTab({
  year,
  round,
  session,
  drivers,
}: {
  year: number;
  round: number;
  session: string;
  drivers: AnalysisDriverOption[];
}) {
  const { data: lapsData, isLoading } = useAllLaps(year, round, session);
  const { data: frames } = useRaceLapFrames(year, round, session);
  const sessionCovered = lapsData?.meta?.can_proceed ?? (!!lapsData && lapsData.data.length > 0);
  const fallbackRows = frames && frames.length > 0 ? derivePositionsFromFrames(frames) : undefined;

  if (isLoading) {
    return <Skeleton height={320} />;
  }

  if (!sessionCovered) {
    return (
      <div
        className="flex h-72 flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border-subtle"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <span
          className="font-mono text-[11px] uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--muted))" }}
        >
          {session.toUpperCase() === "R" ? "RACE" : session.toUpperCase()} · TELEMETRY DATA NOT AVAILABLE
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "hsl(var(--muted-2))" }}
        >
          Requires live API connection
        </span>
      </div>
    );
  }

  return (
    <PanelEntry delay={0.04}>
      <Panel label="PANEL 1 · POSITION TRACKER" title="Driver Positions — Lap by Lap">
        <PositionTracker year={year} round={round} session={session} drivers={drivers} fallbackRows={fallbackRows} />
      </Panel>
    </PanelEntry>
  );
}

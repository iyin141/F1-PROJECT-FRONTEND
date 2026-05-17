'use client';

import { Panel } from "@/components/Panel";
import { PositionTracker } from "./PositionTracker";
import type { AnalysisDriverOption } from "./DriverSelect";
import { useAllLaps } from "../hooks/useRaceAnalysis";
import Skeleton from "@/components/animations/Skeleton";
import { motion } from "framer-motion";

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
  const sessionCovered = lapsData?.meta?.can_proceed ?? (!!lapsData && lapsData.data.length > 0);

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
        <PositionTracker year={year} round={round} session={session} drivers={drivers} />
      </Panel>
    </PanelEntry>
  );
}

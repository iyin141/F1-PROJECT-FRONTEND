'use client';

import { useState } from "react";
import { Panel } from "@/components/Panel";
import { DriverSelect, type AnalysisDriverOption } from "./DriverSelect";
import { PaceComparison } from "./PaceComparison";
import { PaceDistribution } from "./PaceDistribution";
import { SectorHeatmap } from "./SectorHeatmap";
import { useAllLaps } from "../hooks/useRaceAnalysis";
import Skeleton from "@/components/animations/Skeleton";
import { motion } from "framer-motion";

type LapViewMode = "COMPARE" | "ALL DRIVERS";

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

export function LapAnalysisTab({
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
  const [lapViewMode, setLapViewMode] = useState<LapViewMode>("COMPARE");
  const { data: lapsData, isLoading } = useAllLaps(year, round, session);
  const sessionCovered = lapsData?.meta?.can_proceed ?? (!!lapsData && lapsData.data.length > 0);

  const [driverAId, setDriverAId] = useState<string | null>(null);
  const [driverBId, setDriverBId] = useState<string | null>(null);
  const [driverCId, setDriverCId] = useState<string | null>(null);

  const driverA = drivers.find((d) => d.id === driverAId) ?? drivers[0];
  const driverB = drivers.find((d) => d.id === driverBId) ?? drivers[1];
  const driverC = drivers.find((d) => d.id === driverCId) ?? null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={48} />
        <Skeleton height={280} />
        <Skeleton height={320} />
      </div>
    );
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
    <div className="space-y-6">
      <div
        className="flex flex-wrap items-center gap-4 border border-border-subtle px-4 py-3"
        style={{ backgroundColor: "var(--surface2)" }}
      >
        <div className="flex items-center gap-2">
          {(["COMPARE", "ALL DRIVERS"] as const).map((mode) => {
            const active = lapViewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setLapViewMode(mode)}
                className="border border-border-subtle px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
                style={{
                  backgroundColor: active ? "hsl(var(--red))" : "transparent",
                  color: active ? "hsl(var(--text))" : "hsl(var(--muted))",
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>

        {lapViewMode === "COMPARE" && (
          <>
            <DriverSelect
              label="DRIVER A"
              value={driverA?.id ?? null}
              onChange={setDriverAId}
              drivers={drivers}
              accent="hsl(var(--blue))"
            />
            <DriverSelect
              label="DRIVER B"
              value={driverB?.id ?? null}
              onChange={setDriverBId}
              drivers={drivers}
              accent="hsl(var(--red))"
            />
            <DriverSelect
              label="DRIVER C"
              value={driverC?.id ?? null}
              onChange={setDriverCId}
              drivers={drivers}
              accent="hsl(var(--amber))"
              allowEmpty
              emptyLabel="OPTIONAL"
            />
          </>
        )}
      </div>

      <PanelEntry delay={0.05}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Panel
            label="PANEL 1 · LAP ANALYSIS"
            title={
              lapViewMode === "ALL DRIVERS"
                ? "All Drivers · Scatter"
                : `${driverA?.code ?? "—"} vs ${driverB?.code ?? "—"}${driverC ? ` vs ${driverC.code}` : ""}`
            }
          >
            <PaceComparison
              year={year}
              round={round}
              session={session}
              mode={lapViewMode === "ALL DRIVERS" ? "all" : "compare"}
              driverAId={driverA?.id}
              driverBId={driverB?.id}
              driverCId={driverC?.id ?? undefined}
            />
          </Panel>
          <Panel label="LAP TIME DISTRIBUTION" title="Box Plot — Top 10">
            <PaceDistribution year={year} round={round} session={session} />
          </Panel>
        </div>
      </PanelEntry>

      <PanelEntry delay={0.1}>
        <Panel label="PANEL 2 · SECTOR ANALYSIS" title="Heat Map">
          <SectorHeatmap year={year} round={round} session={session} />
        </Panel>
      </PanelEntry>
    </div>
  );
}

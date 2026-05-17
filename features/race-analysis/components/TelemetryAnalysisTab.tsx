'use client';

import { useState } from "react";
import { Panel } from "@/components/Panel";
import { TelemetryOverlay } from "./TelemetryOverlay";
import { DriverTelemetryPanel } from "./DriverTelemetryPanel";
import type { AnalysisDriverOption } from "./DriverSelect";
import { useAllLaps } from "../hooks/useRaceAnalysis";
import Skeleton from "@/components/animations/Skeleton";
import { motion } from "framer-motion";

type TelemetryTab = "OVERLAY" | "SINGLE";

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

export function TelemetryAnalysisTab({
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
  const [telemetryTab, setTelemetryTab] = useState<TelemetryTab>("OVERLAY");
  const { data: lapsData, isLoading } = useAllLaps(year, round, session);
  const sessionCovered = lapsData?.meta?.can_proceed ?? (!!lapsData && lapsData.data.length > 0);

  const [driverAId, setDriverAId] = useState<string | null>(null);
  const [driverBId, setDriverBId] = useState<string | null>(null);

  const driverA = drivers.find((d) => d.id === driverAId) ?? drivers[0];
  const driverB = drivers.find((d) => d.id === driverBId) ?? drivers[1];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={48} />
        <Skeleton height={280} />
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
        className="flex flex-wrap items-center gap-2 border border-border-subtle px-4 py-3"
        style={{ backgroundColor: "var(--surface2)" }}
      >
        {(["OVERLAY", "SINGLE"] as const).map((tab) => {
          const active = telemetryTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setTelemetryTab(tab)}
              className="border border-border-subtle px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
              style={{
                backgroundColor: active ? "hsl(var(--blue))" : "transparent",
                color: active ? "hsl(var(--text))" : "hsl(var(--muted))",
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <PanelEntry delay={0.05}>
        <Panel
          label={
            telemetryTab === "OVERLAY"
              ? "PANEL 1 · DRIVER OVERLAY"
              : "PANEL 1 · SINGLE DRIVER"
          }
          title={
            telemetryTab === "OVERLAY"
              ? `${driverA?.code ?? "—"} vs ${driverB?.code ?? "—"}`
              : `${driverA?.code ?? "—"} · Telemetry`
          }
        >
          {telemetryTab === "OVERLAY" ? (
            <TelemetryOverlay
              year={year}
              round={round}
              session={session}
              drivers={drivers}
              driverAId={driverA?.id ?? null}
              driverBId={driverB?.id ?? null}
              onDriverAChange={setDriverAId}
              onDriverBChange={setDriverBId}
            />
          ) : (
            <DriverTelemetryPanel
              year={year}
              round={round}
              session={session}
              drivers={drivers}
              driverId={driverA?.id ?? null}
              onDriverChange={setDriverAId}
            />
          )}
        </Panel>
      </PanelEntry>
    </div>
  );
}

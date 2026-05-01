'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Panel } from "@/components/Panel";
import { EmptyState } from "@/components/EmptyState";
import { teamColor } from "@/components/DriverCode";
import { ConsistencyCards } from "@/features/race-analysis/components/ConsistencyCards";
import { PaceComparison } from "@/features/race-analysis/components/PaceComparison";
import { PaceDistribution } from "@/features/race-analysis/components/PaceDistribution";
import { SectorHeatmap } from "@/features/race-analysis/components/SectorHeatmap";
import { TyreStrategy } from "@/features/race-analysis/components/TyreStrategy";
import type { TeamId } from "@/types/ui";
import { useRaceResults } from "@/features/race-detail/hooks/useRaceDetail";
import { useCoverageRound } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { adaptRaceResults } from "@/Lib/adapters";
import { normalizeSession } from "@/Lib/format";

const SESSIONS = ["RACE", "QUALIFYING", "FP1", "FP2", "FP3"] as const;
type Session = (typeof SESSIONS)[number];

export const AnalysisPanels = ({ year, round }: { year: number; round: number }) => {
  const [session, setSession] = useState<Session>("RACE");
  const sessionCode = normalizeSession(session);

  const { data: coverageData, isLoading: coverageLoading } = useCoverageRound(year, round);
  const sessionCovered = coverageData?.sessions[sessionCode]?.available ?? false;

  const { data: resultsData, isLoading: resultsLoading } = useRaceResults(year, round);
  const results = { data: resultsData ? adaptRaceResults(resultsData) : undefined, loading: resultsLoading };

  const drivers = (results.data ?? [])
    .filter((r) => typeof r.position === "number")
    .sort((a, b) => (a.position as number) - (b.position as number))
    .map((r) => r.driver);

  const [driverAId, setDriverAId] = useState<string | null>(null);
  const [driverBId, setDriverBId] = useState<string | null>(null);

  const driverA = drivers.find((d) => d.id === driverAId) ?? drivers[0];
  const driverB = drivers.find((d) => d.id === driverBId) ?? drivers[1];

  return (
    <div>
      {/* Session selector */}
      <div
        className="flex items-stretch border border-border-subtle"
        style={{ backgroundColor: "var(--surface)" }}
      >
        {SESSIONS.map((s) => {
          const active = s === session;
          return (
            <button
              key={s}
              onClick={() => setSession(s)}
              className="flex-1 border-r border-border-subtle px-4 py-3.5 font-mono text-[11px] tracking-[0.22em] transition-colors last:border-r-0"
              style={{
                backgroundColor: active ? "hsl(var(--red))" : "transparent",
                color: active ? "hsl(var(--text))" : "hsl(var(--muted))",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = "hsl(var(--text-dim))";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = "hsl(var(--muted))";
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Driver A/B selector — RACE only */}
      {session === "RACE" && drivers.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-4 border-x border-b border-border-subtle px-5 py-3"
          style={{ backgroundColor: "var(--surface2)" }}
        >
          <DriverSelect
            label="DRIVER A"
            value={driverA?.id ?? ""}
            onChange={setDriverAId}
            drivers={drivers}
            accent="hsl(var(--blue))"
          />
          <DriverSelect
            label="DRIVER B"
            value={driverB?.id ?? ""}
            onChange={setDriverBId}
            drivers={drivers}
            accent="hsl(var(--red))"
          />
          <span
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--muted))" }}
          >
            SESSION · RACE
          </span>
        </div>
      )}

      <div className="space-y-8 pt-6">
        {session === "RACE" ? (
          coverageLoading || !sessionCovered ? (
            <EmptyState
              message={coverageLoading ? "Checking coverage…" : "Data not available"}
              description={
                coverageLoading
                  ? undefined
                  : "Analysis data has not been collected for this race session."
              }
            />
          ) : (
            <>
            {/* Tyre Strategy */}
            <PanelEntry delay={0.05}>
              <Panel label="PANEL 1 · TYRE STRATEGY" title="Stints & Pit Stops">
                <TyreStrategy year={year} round={round} />
              </Panel>
            </PanelEntry>

            {/* Pace panels — side-by-side on wide screens */}
            <PanelEntry delay={0.1}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <Panel
                  label="PANEL 2 · LAP-BY-LAP PACE"
                  title={`${driverA?.code ?? "—"} vs ${driverB?.code ?? "—"}`}
                >
                  <PaceComparison
                    year={year}
                    round={round}
                    driverAId={driverA?.id}
                    driverBId={driverB?.id}
                  />
                </Panel>
                <Panel label="LAP TIME DISTRIBUTION" title="Box Plot — Top 10">
                  <PaceDistribution year={year} round={round} />
                </Panel>
              </div>
            </PanelEntry>

            {/* Consistency */}
            <PanelEntry delay={0.15}>
              <Panel label="PANEL 3 · CONSISTENCY" title="Driver Consistency Score">
                <ConsistencyCards year={year} round={round} />
              </Panel>
            </PanelEntry>

            {/* Sectors */}
            <PanelEntry delay={0.2}>
              <Panel label="PANEL 4 · SECTOR ANALYSIS" title="Heat Map">
                <SectorHeatmap year={year} round={round} />
              </Panel>
            </PanelEntry>
            </>
          )
        ) : (
          <div
            className="flex h-72 flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border-subtle"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <span
              className="font-mono text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--muted))" }}
            >
              {session} · TELEMETRY DATA NOT AVAILABLE
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: "hsl(var(--muted-2))" }}
            >
              Requires live API connection
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

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

function DriverSelect({
  label,
  value,
  onChange,
  drivers,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  drivers: { id: string; code: string; team: TeamId; firstName: string; lastName: string }[];
  accent: string;
}) {
  const selectedDriver = drivers.find((d) => d.id === value);
  return (
    <label className="flex items-center gap-2">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: accent }}
      >
        {label}
      </span>
      {selectedDriver && (
        <span
          className="h-3 w-[3px] rounded-sm"
          style={{ background: teamColor(selectedDriver.team) }}
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border-subtle px-2 py-1 font-mono text-[11px] tracking-[0.06em] outline-none"
        style={{ backgroundColor: "hsl(var(--bg))", color: "hsl(var(--text))" }}
      >
        {drivers.map((d) => (
          <option key={d.id} value={d.id} style={{ backgroundColor: "hsl(var(--bg))" }}>
            {d.code} — {d.firstName} {d.lastName}
          </option>
        ))}
      </select>
    </label>
  );
}

'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Panel } from "@/components/Panel";
import { EmptyState } from "@/components/EmptyState";
import { ConsistencyCards } from "@/features/race-analysis/components/ConsistencyCards";
import {
  DriverSelect,
  type AnalysisDriverOption,
} from "@/features/race-analysis/components/DriverSelect";
import { PaceComparison } from "@/features/race-analysis/components/PaceComparison";
import { PaceDistribution } from "@/features/race-analysis/components/PaceDistribution";
import { RaceSummaryStats } from "@/features/race-analysis/components/RaceSummaryStats";
import { SectorHeatmap } from "@/features/race-analysis/components/SectorHeatmap";
import { StintAnalysis } from "@/features/race-analysis/components/StintAnalysis";
import { TeammateBattles } from "@/features/race-analysis/components/TeammateBattles";
import { TelemetryOverlay } from "@/features/race-analysis/components/TelemetryOverlay";
import { TyreStrategy } from "@/features/race-analysis/components/TyreStrategy";
import { DriverTelemetryPanel } from "@/features/race-analysis/components/DriverTelemetryPanel";
import { PositionTracker } from "@/features/race-analysis/components/PositionTracker";
import { useRaceResults } from "@/features/race-detail/hooks/useRaceDetail";
import { useAllLaps } from "@/features/race-analysis/hooks/useRaceAnalysis";

const SESSIONS = ["RACE", "QUALIFYING", "FP1", "FP2", "FP3"] as const;
type Session = (typeof SESSIONS)[number];
const ANALYSIS_TABS = ["RACE OVERVIEW", "POSITION CHART", "LAP ANALYSIS", "DRIVER TELEMETRY", "STINT ANALYSIS", "STRATEGY"] as const;
type AnalysisTab = (typeof ANALYSIS_TABS)[number];
type LapViewMode = "COMPARE" | "ALL DRIVERS";
type TelemetryTab = "OVERLAY" | "SINGLE";

export const AnalysisPanels = ({ year, round }: { year: number; round: number }) => {
  const [session, setSession] = useState<Session>("RACE");
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>("RACE OVERVIEW");
  const [lapViewMode, setLapViewMode] = useState<LapViewMode>("COMPARE");
  const [telemetryTab, setTelemetryTab] = useState<TelemetryTab>("OVERLAY");

  const { data: lapsData, isLoading: lapsLoading } = useAllLaps(year, round);
  const sessionCovered = lapsData?.meta?.can_proceed ?? (!!lapsData && lapsData.data.length > 0);

  const { data: results, isLoading: resultsLoading } = useRaceResults(year, round);

  const drivers: AnalysisDriverOption[] = (results ?? [])
    .filter((r) => typeof r.position === "number")
    .sort((a, b) => (a.position as number) - (b.position as number))
    .map((r) => r.driver);

  const [driverAId, setDriverAId] = useState<string | null>(null);
  const [driverBId, setDriverBId] = useState<string | null>(null);
  const [driverCId, setDriverCId] = useState<string | null>(null);

  const driverA = drivers.find((d) => d.id === driverAId) ?? drivers[0];
  const driverB = drivers.find((d) => d.id === driverBId) ?? drivers[1];
  const driverC = drivers.find((d) => d.id === driverCId) ?? null;

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

      {/* Analysis tab selector — keep sessions, add analysis grouping below */}
      {session === "RACE" && drivers.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-4 border-x border-b border-border-subtle px-5 py-3"
          style={{ backgroundColor: "var(--surface2)" }}
        >
          {ANALYSIS_TABS.map((tab) => {
            const active = tab === analysisTab;
            return (
              <button
                key={tab}
                onClick={() => setAnalysisTab(tab)}
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
          lapsLoading || !sessionCovered ? (
            <EmptyState
              message={lapsLoading ? "Loading analysis…" : "Data not available"}
              description={
                lapsLoading
                  ? undefined
                  : "Analysis data has not been collected for this race session."
              }
            />
          ) : (
            <>
              {analysisTab === "RACE OVERVIEW" && (
                <>
                  <PanelEntry delay={0.03}>
                    <Panel label="PANEL 1 · SUMMARY" title="Race Summary Stats">
                      <RaceSummaryStats year={year} round={round} drivers={drivers} />
                    </Panel>
                  </PanelEntry>

                  <PanelEntry delay={0.07}>
                    <Panel label="PANEL 2 · CONSISTENCY" title="Driver Consistency Score">
                      <ConsistencyCards year={year} round={round} />
                    </Panel>
                  </PanelEntry>

                  <PanelEntry delay={0.11}>
                    <Panel label="PANEL 3 · TEAMMATE BATTLES" title="Phase Comparison — Race Thirds">
                      <TeammateBattles year={year} round={round} drivers={drivers} />
                    </Panel>
                  </PanelEntry>
                </>
              )}

              {analysisTab === "POSITION CHART" && (
                <PanelEntry delay={0.04}>
                  <Panel label="PANEL 1 · POSITION TRACKER" title="Driver Positions — Lap by Lap">
                    <PositionTracker year={year} round={round} drivers={drivers} />
                  </Panel>
                </PanelEntry>
              )}

              {analysisTab === "LAP ANALYSIS" && (
                <>
                  <div
                    className="flex flex-wrap items-center gap-4 border border-border-subtle px-4 py-3"
                    style={{ backgroundColor: "var(--surface2)" }}
                  >
                    <div className="flex items-center gap-2">
                      {["COMPARE", "ALL DRIVERS"].map((mode) => {
                        const active = lapViewMode === mode;
                        return (
                          <button
                            key={mode}
                            onClick={() => setLapViewMode(mode as LapViewMode)}
                            className="border border-border-subtle px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]"
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
                          mode={lapViewMode === "ALL DRIVERS" ? "all" : "compare"}
                          driverAId={driverA?.id}
                          driverBId={driverB?.id}
                          driverCId={driverC?.id ?? undefined}
                        />
                      </Panel>
                      <Panel label="LAP TIME DISTRIBUTION" title="Box Plot — Top 10">
                        <PaceDistribution year={year} round={round} />
                      </Panel>
                    </div>
                  </PanelEntry>

                  <PanelEntry delay={0.1}>
                    <Panel label="PANEL 2 · SECTOR ANALYSIS" title="Heat Map">
                      <SectorHeatmap year={year} round={round} />
                    </Panel>
                  </PanelEntry>
                </>
              )}

              {analysisTab === "DRIVER TELEMETRY" && (
                <>
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
                          className="border border-border-subtle px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]"
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
                          drivers={drivers}
                          driverId={driverA?.id ?? null}
                          onDriverChange={setDriverAId}
                        />
                      )}
                    </Panel>
                  </PanelEntry>
                </>
              )}

              {analysisTab === "STINT ANALYSIS" && (
                <PanelEntry delay={0.05}>
                  <Panel label="PANEL 1 · STINT ANALYSIS" title="Driver Stint Comparison">
                    <StintAnalysis year={year} round={round} drivers={drivers} />
                  </Panel>
                </PanelEntry>
              )}

              {analysisTab === "STRATEGY" && (
                <PanelEntry delay={0.05}>
                  <Panel label="PANEL 1 · TYRE STRATEGY" title="Stints & Pit Stops">
                    <TyreStrategy year={year} round={round} />
                  </Panel>
                </PanelEntry>
              )}
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

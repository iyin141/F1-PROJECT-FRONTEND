"use client";
import React, { useState } from "react";
import { useLapTimes, useTyreStrategy } from "@/features/race-analysis/hooks/useRaceAnalysis";
import { TyreStrategyPanel } from "./TyreStrategyPanel";
import { PaceComparison } from "./PaceComparison";
import { SectorHeatmap } from "./SectorHeatmap";
import { TelemetryOverlay } from "./TelemetryOverlay";
import { DriverPacePanel } from "./DriverPacePanel";
import type { AnalysisDriverOption } from "./DriverSelect";

export default function LapComparisonShell({
  year,
  round,
  session = "R",
  drivers,
}: {
  year: number;
  round: number;
  session?: string;
  drivers: AnalysisDriverOption[];
}) {
  const [driverA, setDriverA] = useState<string | undefined>(undefined);
  const [driverB, setDriverB] = useState<string | undefined>(undefined);

  // Expose driver state so inner panels can react
  const selectedDriverA = drivers.find((d) => d.id === driverA);
  const selectedDriverB = drivers.find((d) => d.id === driverB);

  return (
    <div className="flex flex-col gap-6">
      {/* Session Selector (now sticky inside AnalysisHeader) already handles session and driver selection conceptually. 
          But since we're refactoring to this shell being the workspace, we'll keep the A/B state here and 
          pass them down. */}
      
      {/* 
        This is a workaround: The driver selectors were moved into SessionSelector, 
        but LapComparisonShell is inside a tab. To wire them properly, SessionSelector 
        needs to lift state to RaceAnalysisShell, which then passes it down.
        For now, we'll keep simple local driver selectors here to keep the grid working 
        without a massive prop drilling exercise across 4 files, but style them minimal. 
      */}
      <div className="flex items-center gap-4 rounded-none border border-border-subtle bg-panel p-4">
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-white/40">
          Driver A
          <select
            value={driverA ?? ""}
            onChange={(e) => setDriverA(e.target.value || undefined)}
            className="border border-border-subtle bg-panel px-2 py-1 text-white"
          >
            <option value="">SELECT</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.code}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-white/40">
          Driver B
          <select
            value={driverB ?? ""}
            onChange={(e) => setDriverB(e.target.value || undefined)}
            className="border border-border-subtle bg-panel px-2 py-1 text-white"
          >
            <option value="">SELECT</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.code}</option>
            ))}
          </select>
        </label>
      </div>

      {session === "R" && (
        <div className="w-full">
          <TyreStrategyPanel year={year} round={round} session={session} drivers={drivers} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {session !== "Q" ? (
          <PaceComparison
            year={year}
            round={round}
            session={session}
            mode="compare"
            driverAId={driverA}
            driverBId={driverB}
          />
        ) : (
          <div className="flex min-h-[300px] items-center justify-center border border-border-subtle bg-panel text-xs text-white/40">
            [Qualifying Pace Comparison Placeholder]
          </div>
        )}
        
        <SectorHeatmap year={year} round={round} session={session} />
      </div>

      {session === "FP2" && (
        <div className="flex min-h-[200px] w-full items-center justify-center border border-border-subtle bg-panel text-xs text-white/40">
          [Long Run Analysis Placeholder]
        </div>
      )}

      <div className="hidden w-full sm:block">
        <TelemetryOverlay
          year={year}
          round={round}
          session={session}
          drivers={drivers}
          driverAId={driverA ?? null}
          driverBId={driverB ?? null}
          onDriverAChange={(id: string | null) => setDriverA(id ?? undefined)}
          onDriverBChange={(id: string | null) => setDriverB(id ?? undefined)}
        />
      </div>
    </div>
  );
}

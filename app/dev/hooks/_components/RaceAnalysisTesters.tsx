"use client";

import React, { useState } from "react";

import {
  useCoverageSeason,
  useCoverageRound,
  useTyreStrategy,
  useDriverLaps,
  useDriverPace,
  useDriverStints,
  useDriverSectors,
  useTelemetry,
  useTelemetryOverlay,
  useTelemetrySummary,
} from "@/features/race-analysis/hooks/useRaceAnalysis";
import type { AnalysisSessionName } from "@/types/api";
import {
  HookCard,
  ExecuteBar,
  ParamField,
  SelectField,
  ResultPanel,
  GroupSection,
} from "./ui";

const SESSION_OPTS: { label: string; value: AnalysisSessionName }[] = [
  { label: "Race (R)", value: "R" },
  { label: "Qualifying (Q)", value: "Q" },
  { label: "FP1", value: "FP1" },
  { label: "FP2", value: "FP2" },
  { label: "FP3", value: "FP3" },
];

// ---------------------------------------------------------------------------
// useCoverageSeason
// ---------------------------------------------------------------------------
function CoverageSeasonRunner({ year }: { year: number }) {
  const q = useCoverageSeason(year);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function CoverageSeasonTester() {
  const [year, setYear] = useState("2024");
  const [active, setActive] = useState<number | null>(null);

  return (
    <HookCard
      name="useCoverageSeason"
      signature="year: number"
      description="Fetches the coverage flags for every round in a season — which data (telemetry, laps, stints, etc.) is available per round."
      queryKey={`["coverage", "season", ${year || "year"}]`}
      group="Race Analysis"
    >
      <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
      <ExecuteBar
        onExecute={() => setActive(Number(year))}
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active !== null && <CoverageSeasonRunner year={active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useCoverageRound
// ---------------------------------------------------------------------------
function CoverageRoundRunner({ year, round }: { year: number; round: number }) {
  const q = useCoverageRound(year, round);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function CoverageRoundTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<{ year: number; round: number } | null>(null);

  return (
    <HookCard
      name="useCoverageRound"
      signature="year: number, round: number"
      description="Fetches session-level coverage flags for a single race round — used to gate telemetry and analysis queries."
      queryKey={`["coverage", "round", ${year || "year"}, ${round || "round"}]`}
      group="Race Analysis"
    >
      <div className="grid grid-cols-2 gap-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
      </div>
      <ExecuteBar
        onExecute={() => setActive({ year: Number(year), round: Number(round) })}
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <CoverageRoundRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useTyreStrategy
// ---------------------------------------------------------------------------
function TyreStrategyRunner({ year, round }: { year: number; round: number }) {
  const q = useTyreStrategy(year, round);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function TyreStrategyTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<{ year: number; round: number } | null>(null);

  return (
    <HookCard
      name="useTyreStrategy"
      signature="year: number, round: number"
      description="Fetches the tyre strategy grid for all drivers — stint compounds, lengths, and pit stop laps for the whole race."
      queryKey={`["analysis", "tyre", ${year || "year"}, ${round || "round"}]`}
      group="Race Analysis"
    >
      <div className="grid grid-cols-2 gap-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
      </div>
      <ExecuteBar
        onExecute={() => setActive({ year: Number(year), round: Number(round) })}
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <TyreStrategyRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverLaps
// ---------------------------------------------------------------------------
function DriverLapsRunner({
  year,
  round,
  driver,
}: {
  year: number;
  round: number;
  driver: string;
}) {
  const q = useDriverLaps(year, round, driver);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverLapsTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [driver, setDriver] = useState("VER");
  const [active, setActive] = useState<{
    year: number;
    round: number;
    driver: string;
  } | null>(null);

  return (
    <HookCard
      name="useDriverLaps"
      signature="year: number, round: number, driver?: string"
      description="Fetches per-lap timing data for a specific driver — lap times, sector splits, compound, and tyre age."
      queryKey={`["analysis", "laps", ${year || "year"}, ${round || "round"}, "${driver || "driver"}"]`}
      group="Race Analysis"
    >
      <div className="grid grid-cols-3 gap-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
        <ParamField label="driver" value={driver} onChange={setDriver} placeholder="VER" note="3-letter code" />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({ year: Number(year), round: Number(round), driver })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <DriverLapsRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverPace
// ---------------------------------------------------------------------------
function DriverPaceRunner({
  year,
  round,
  driver,
}: {
  year: number;
  round: number;
  driver: string;
}) {
  const q = useDriverPace(year, round, driver);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverPaceTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [driver, setDriver] = useState("VER");
  const [active, setActive] = useState<{
    year: number;
    round: number;
    driver: string;
  } | null>(null);

  return (
    <HookCard
      name="useDriverPace"
      signature="year: number, round: number, driver?: string"
      description="Fetches race pace statistics for a driver — median lap time, best lap, and lap-time variability."
      queryKey={`["analysis", "pace", ${year || "year"}, ${round || "round"}, "${driver || "driver"}"]`}
      group="Race Analysis"
    >
      <div className="grid grid-cols-3 gap-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
        <ParamField label="driver" value={driver} onChange={setDriver} placeholder="VER" note="3-letter code" />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({ year: Number(year), round: Number(round), driver })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <DriverPaceRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverStints
// ---------------------------------------------------------------------------
function DriverStintsRunner({
  year,
  round,
  driver,
}: {
  year: number;
  round: number;
  driver: string;
}) {
  const q = useDriverStints(year, round, driver);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverStintsTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [driver, setDriver] = useState("VER");
  const [active, setActive] = useState<{
    year: number;
    round: number;
    driver: string;
  } | null>(null);

  return (
    <HookCard
      name="useDriverStints"
      signature="year: number, round: number, driver?: string"
      description="Fetches stint breakdown for a driver — compound, start lap, end lap, and tyre age per stint."
      queryKey={`["analysis", "stints", ${year || "year"}, ${round || "round"}, "${driver || "driver"}"]`}
      group="Race Analysis"
    >
      <div className="grid grid-cols-3 gap-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
        <ParamField label="driver" value={driver} onChange={setDriver} placeholder="VER" note="3-letter code" />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({ year: Number(year), round: Number(round), driver })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <DriverStintsRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverSectors
// ---------------------------------------------------------------------------
function DriverSectorsRunner({
  year,
  round,
  driver,
}: {
  year: number;
  round: number;
  driver: string;
}) {
  const q = useDriverSectors(year, round, driver);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverSectorsTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [driver, setDriver] = useState("VER");
  const [active, setActive] = useState<{
    year: number;
    round: number;
    driver: string;
  } | null>(null);

  return (
    <HookCard
      name="useDriverSectors"
      signature="year: number, round: number, driver?: string"
      description="Fetches per-lap sector timing data for a driver — S1, S2, S3 times and mini-sector flags."
      queryKey={`["analysis", "sectors", ${year || "year"}, ${round || "round"}, "${driver || "driver"}"]`}
      group="Race Analysis"
    >
      <div className="grid grid-cols-3 gap-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
        <ParamField label="driver" value={driver} onChange={setDriver} placeholder="VER" note="3-letter code" />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({ year: Number(year), round: Number(round), driver })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <DriverSectorsRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useTelemetry — coverage-gated
// ---------------------------------------------------------------------------
interface TelemetryParams {
  year: number;
  round: number;
  driver: string;
  lap: number;
  session: AnalysisSessionName;
}

function TelemetryRunner({ year, round, driver, lap, session }: TelemetryParams) {
  const q = useTelemetry(year, round, driver, lap, session);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function TelemetryTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [driver, setDriver] = useState("VER");
  const [lap, setLap] = useState("5");
  const [session, setSession] = useState<AnalysisSessionName>("R");
  const [active, setActive] = useState<TelemetryParams | null>(null);

  return (
    <HookCard
      name="useTelemetry"
      signature="year, round, driver?, lap, session"
      description="Fetches raw telemetry channels for a single lap — speed, throttle, brake, gear, RPM, DRS. Coverage-gated: only fires if the coverage endpoint confirms telemetry is available."
      queryKey={`["analysis", "telemetry", ${year || "year"}, ${round || "round"}, "${driver || "driver"}", ${lap || "lap"}, "${session}"]`}
      group="Race Analysis"
      warning="Requires coverage data to be available for the selected session. Query will stay in 'idle' if coverage says telemetry is unavailable."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
        <ParamField label="driver" value={driver} onChange={setDriver} placeholder="VER" note="3-letter code" />
        <ParamField label="lap" type="number" value={lap} onChange={setLap} placeholder="5" />
        <SelectField
          label="session"
          value={session}
          onChange={(v) => setSession(v as AnalysisSessionName)}
          options={SESSION_OPTS}
        />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({
            year: Number(year),
            round: Number(round),
            driver,
            lap: Number(lap),
            session,
          })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <TelemetryRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useTelemetryOverlay — coverage-gated, two drivers
// ---------------------------------------------------------------------------
interface OverlayParams {
  year: number;
  round: number;
  driverA: string;
  driverB: string;
  lap: number | undefined;
  session: AnalysisSessionName;
}

function TelemetryOverlayRunner({
  year,
  round,
  driverA,
  driverB,
  lap,
  session,
}: OverlayParams) {
  const q = useTelemetryOverlay(year, round, driverA, driverB, lap, session);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function TelemetryOverlayTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [driverA, setDriverA] = useState("VER");
  const [driverB, setDriverB] = useState("NOR");
  const [lap, setLap] = useState("5");
  const [session, setSession] = useState<AnalysisSessionName>("R");
  const [active, setActive] = useState<OverlayParams | null>(null);

  return (
    <HookCard
      name="useTelemetryOverlay"
      signature="year, round, driverA?, driverB?, lap?, session"
      description="Fetches side-by-side telemetry for two drivers on the same lap. Driver codes are sorted alphabetically before the cache key is formed."
      queryKey={`["analysis", "telemetryOverlay", ${year || "year"}, ${round || "round"}, "${[driverA, driverB].sort().join("+")}"]`}
      group="Race Analysis"
      warning="Coverage-gated. Both drivers must be present and lap must be specified. Driver codes are alphabetically sorted in the query key."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
        <ParamField label="lap" type="number" value={lap} onChange={setLap} placeholder="5" note="optional" />
        <ParamField label="driverA" value={driverA} onChange={setDriverA} placeholder="VER" />
        <ParamField label="driverB" value={driverB} onChange={setDriverB} placeholder="NOR" />
        <SelectField
          label="session"
          value={session}
          onChange={(v) => setSession(v as AnalysisSessionName)}
          options={SESSION_OPTS}
        />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({
            year: Number(year),
            round: Number(round),
            driverA,
            driverB,
            lap: lap ? Number(lap) : undefined,
            session,
          })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <TelemetryOverlayRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useTelemetrySummary — coverage-gated
// ---------------------------------------------------------------------------
interface TelemetrySummaryParams {
  year: number;
  round: number;
  driver: string;
  lap: number;
  session: AnalysisSessionName;
}

function TelemetrySummaryRunner({
  year,
  round,
  driver,
  lap,
  session,
}: TelemetrySummaryParams) {
  const q = useTelemetrySummary(year, round, driver, lap, session);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function TelemetrySummaryTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [driver, setDriver] = useState("VER");
  const [lap, setLap] = useState("5");
  const [session, setSession] = useState<AnalysisSessionName>("R");
  const [active, setActive] = useState<TelemetrySummaryParams | null>(null);

  return (
    <HookCard
      name="useTelemetrySummary"
      signature="year, round, driver?, lap, session"
      description="Fetches aggregated telemetry statistics for a lap — min/max/avg across speed, throttle, brake, and gear channels."
      queryKey={`["analysis", "telemetrySummary", ${year || "year"}, ${round || "round"}, "${driver || "driver"}", ${lap || "lap"}, "${session}"]`}
      group="Race Analysis"
      warning="Coverage-gated — requires telemetry to be available for the session."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
        <ParamField label="driver" value={driver} onChange={setDriver} placeholder="VER" note="3-letter code" />
        <ParamField label="lap" type="number" value={lap} onChange={setLap} placeholder="5" />
        <SelectField
          label="session"
          value={session}
          onChange={(v) => setSession(v as AnalysisSessionName)}
          options={SESSION_OPTS}
        />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({
            year: Number(year),
            round: Number(round),
            driver,
            lap: Number(lap),
            session,
          })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <TelemetrySummaryRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export function RaceAnalysisGroup() {
  return (
    <GroupSection
      id="race-analysis"
      title="Race Analysis"
      description="Coverage flags, driver analysis, and coverage-gated telemetry"
      count={10}
    >
      <CoverageSeasonTester />
      <CoverageRoundTester />
      <TyreStrategyTester />
      <DriverLapsTester />
      <DriverPaceTester />
      <DriverStintsTester />
      <DriverSectorsTester />
      <TelemetryTester />
      <TelemetryOverlayTester />
      <TelemetrySummaryTester />
    </GroupSection>
  );
}

"use client";

import React, { useState } from "react";

import {
  useDriverYearList,
  useDriverCareerStandings,
} from "@/features/driver-record/hooks/useDriverCareer";
import {
  useDriverSeasonRounds,
  useDriverSeasonResults,
} from "@/features/driver-record/hooks/useDriverSeason";
import {
  useDriverRaceLaps,
  useDriverRaceStints,
  useDriverRacePace,
  useDriverRaceSectors,
} from "@/features/driver-record/hooks/useDriverAnalysis";
import {
  useDriverTelemetryCoverage,
  useDriverTelemetry,
} from "@/features/driver-record/hooks/useDriverTelemetry";
import type { AnalysisSessionName } from "@/types/api";
import {
  HookCard,
  ExecuteBar,
  ParamField,
  SelectField,
  ResultPanel,
  GroupSection,
  QueryStatus,
} from "./ui";

const SESSION_OPTS: { label: string; value: AnalysisSessionName }[] = [
  { label: "Race (R)", value: "R" },
  { label: "Qualifying (Q)", value: "Q" },
  { label: "FP1", value: "FP1" },
  { label: "FP2", value: "FP2" },
  { label: "FP3", value: "FP3" },
];

// ---------------------------------------------------------------------------
// useDriverYearList
// ---------------------------------------------------------------------------
function DriverYearListRunner({ driverCode }: { driverCode: string }) {
  const q = useDriverYearList(driverCode);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverYearListTester() {
  const [code, setCode] = useState("VER");
  const [active, setActive] = useState<string | null>(null);

  return (
    <HookCard
      name="useDriverYearList"
      signature="driverCode: string"
      description="Scans seasons backwards from the current year to find every year a driver competed. Returns an array of years in descending order."
      queryKey={`["driver", "${code || "code"}", "yearList"]`}
      group="Driver Career"
      warning="This fires sequential API requests backwards year-by-year until 3 consecutive misses. It can make 5–20+ network calls on first run. Results are cached indefinitely once resolved."
    >
      <ParamField
        label="driverCode"
        value={code}
        onChange={setCode}
        placeholder="VER"
        note="3-letter code e.g. VER, HAM, NOR"
      />
      <ExecuteBar
        onExecute={() => setActive(code)}
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <DriverYearListRunner driverCode={active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverCareerStandings
// ---------------------------------------------------------------------------
function DriverCareerStandingsRunner({
  driverCode,
  years,
}: {
  driverCode: string;
  years: number[];
}) {
  const results = useDriverCareerStandings(driverCode, years);
  const isPending = results.some((r) => r.isPending);
  const isError = results.some((r) => r.isError);
  const status: QueryStatus = isPending ? "pending" : isError ? "error" : "success";

  const data = results.map((r, i) => ({
    year: years[i],
    status: r.status,
    data: r.data,
  }));

  return (
    <ResultPanel
      status={status}
      data={data}
      error={isError ? new Error("One or more year queries failed") : null}
      updatedAt={Math.max(...results.map((r) => r.dataUpdatedAt ?? 0))}
    />
  );
}

function DriverCareerStandingsTester() {
  const [code, setCode] = useState("VER");
  const [yearsStr, setYearsStr] = useState("2024,2023,2022");
  const [active, setActive] = useState<{ code: string; years: number[] } | null>(null);

  function parseYears(s: string): number[] {
    return s
      .split(",")
      .map((y) => Number(y.trim()))
      .filter((y) => !isNaN(y) && y > 1950);
  }

  return (
    <HookCard
      name="useDriverCareerStandings"
      signature="driverCode: string, years: number[]"
      description="Loads the championship standing row for the driver in each year provided. Cache-first — reuses Season Hub data when available."
      queryKey={`["driver", "${code || "code"}", "seasonStanding", year] × n`}
      group="Driver Career"
    >
      <ParamField
        label="driverCode"
        value={code}
        onChange={setCode}
        placeholder="VER"
        note="3-letter code"
      />
      <ParamField
        label="years"
        value={yearsStr}
        onChange={setYearsStr}
        placeholder="2024,2023,2022"
        note="comma-separated"
      />
      <ExecuteBar
        onExecute={() => setActive({ code, years: parseYears(yearsStr) })}
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && (
        <DriverCareerStandingsRunner driverCode={active.code} years={active.years} />
      )}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverSeasonRounds
// ---------------------------------------------------------------------------
function DriverSeasonRoundsRunner({ year }: { year: number }) {
  const q = useDriverSeasonRounds(year);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverSeasonRoundsTester() {
  const [year, setYear] = useState("2024");
  const [active, setActive] = useState<number | null>(null);

  return (
    <HookCard
      name="useDriverSeasonRounds"
      signature="year: number"
      description="Loads the round list for a season. Shares the ['races','all',year] cache key with useSeasonSchedule — no duplicate fetch if Season Hub already loaded it."
      queryKey={`["races", "all", ${year || "year"}]`}
      group="Driver Season"
    >
      <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
      <ExecuteBar
        onExecute={() => setActive(Number(year))}
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active !== null && <DriverSeasonRoundsRunner year={active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverSeasonResults
// ---------------------------------------------------------------------------
function DriverSeasonResultsRunner({
  driverCode,
  year,
  rounds,
}: {
  driverCode: string;
  year: number;
  rounds: number[];
}) {
  const results = useDriverSeasonResults(driverCode, year, rounds, true);
  const isPending = results.some((r) => r.isPending);
  const isError = results.some((r) => r.isError);
  const status: QueryStatus = isPending ? "pending" : isError ? "error" : "success";

  const data = results.map((r, i) => ({
    round: rounds[i],
    status: r.status,
    data: r.data,
  }));

  return (
    <ResultPanel
      status={status}
      data={data}
      error={isError ? new Error("One or more round queries failed") : null}
      updatedAt={Math.max(...results.map((r) => r.dataUpdatedAt ?? 0))}
    />
  );
}

function DriverSeasonResultsTester() {
  const [code, setCode] = useState("VER");
  const [year, setYear] = useState("2024");
  const [roundsStr, setRoundsStr] = useState("1,2,3");
  const [active, setActive] = useState<{
    code: string;
    year: number;
    rounds: number[];
  } | null>(null);

  function parseRounds(s: string): number[] {
    return s
      .split(",")
      .map((r) => Number(r.trim()))
      .filter((r) => !isNaN(r) && r > 0);
  }

  return (
    <HookCard
      name="useDriverSeasonResults"
      signature="driverCode, year, rounds: number[], enabled"
      description="Fetches race results filtered to this driver for each specified round. One query per round via useQueries, all cached individually."
      queryKey={`["driver", "${code || "code"}", "roundResult", ${year || "year"}, round] × n`}
      group="Driver Season"
    >
      <div className="grid grid-cols-2 gap-3">
        <ParamField
          label="driverCode"
          value={code}
          onChange={setCode}
          placeholder="VER"
          note="3-letter code"
        />
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
      </div>
      <ParamField
        label="rounds"
        value={roundsStr}
        onChange={setRoundsStr}
        placeholder="1,2,3"
        note="comma-separated round numbers"
      />
      <ExecuteBar
        onExecute={() =>
          setActive({ code, year: Number(year), rounds: parseRounds(roundsStr) })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && (
        <DriverSeasonResultsRunner
          driverCode={active.code}
          year={active.year}
          rounds={active.rounds}
        />
      )}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverRaceLaps
// ---------------------------------------------------------------------------
function DriverRaceLapsRunner({
  driverCode,
  year,
  round,
}: {
  driverCode: string;
  year: number;
  round: number;
}) {
  const q = useDriverRaceLaps(driverCode, year, round, true);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverRaceLapsTester() {
  const [code, setCode] = useState("VER");
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<{
    code: string;
    year: number;
    round: number;
  } | null>(null);

  return (
    <HookCard
      name="useDriverRaceLaps"
      signature="driverCode, year, round, enabled"
      description="Fetches per-lap timing data for a single driver — lap times, sector splits, tyre compound and age. Race session only."
      queryKey={`["driver", "${code || "code"}", "raceLaps", ${year || "year"}, ${round || "round"}]`}
      group="Driver Analysis"
    >
      <div className="grid grid-cols-3 gap-3">
        <ParamField
          label="driverCode"
          value={code}
          onChange={setCode}
          placeholder="VER"
          note="3-letter code"
        />
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({ code, year: Number(year), round: Number(round) })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && (
        <DriverRaceLapsRunner driverCode={active.code} year={active.year} round={active.round} />
      )}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverRaceStints
// ---------------------------------------------------------------------------
function DriverRaceStintsRunner({
  driverCode,
  year,
  round,
}: {
  driverCode: string;
  year: number;
  round: number;
}) {
  const q = useDriverRaceStints(driverCode, year, round, true);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverRaceStintsTester() {
  const [code, setCode] = useState("VER");
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<{
    code: string;
    year: number;
    round: number;
  } | null>(null);

  return (
    <HookCard
      name="useDriverRaceStints"
      signature="driverCode, year, round, enabled"
      description="Fetches stint breakdown for a driver across the race — compound per stint, tyre age, start/end lap."
      queryKey={`["driver", "${code || "code"}", "raceStints", ${year || "year"}, ${round || "round"}]`}
      group="Driver Analysis"
    >
      <div className="grid grid-cols-3 gap-3">
        <ParamField
          label="driverCode"
          value={code}
          onChange={setCode}
          placeholder="VER"
          note="3-letter code"
        />
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({ code, year: Number(year), round: Number(round) })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && (
        <DriverRaceStintsRunner driverCode={active.code} year={active.year} round={active.round} />
      )}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverRacePace
// ---------------------------------------------------------------------------
function DriverRacePaceRunner({
  driverCode,
  year,
  round,
}: {
  driverCode: string;
  year: number;
  round: number;
}) {
  const q = useDriverRacePace(driverCode, year, round, true);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverRacePaceTester() {
  const [code, setCode] = useState("VER");
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<{
    code: string;
    year: number;
    round: number;
  } | null>(null);

  return (
    <HookCard
      name="useDriverRacePace"
      signature="driverCode, year, round, enabled"
      description="Fetches race pace statistics for a driver — median, best, and variance across all laps."
      queryKey={`["driver", "${code || "code"}", "racePace", ${year || "year"}, ${round || "round"}]`}
      group="Driver Analysis"
    >
      <div className="grid grid-cols-3 gap-3">
        <ParamField
          label="driverCode"
          value={code}
          onChange={setCode}
          placeholder="VER"
          note="3-letter code"
        />
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({ code, year: Number(year), round: Number(round) })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && (
        <DriverRacePaceRunner driverCode={active.code} year={active.year} round={active.round} />
      )}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverRaceSectors
// ---------------------------------------------------------------------------
function DriverRaceSectorsRunner({
  driverCode,
  year,
  round,
}: {
  driverCode: string;
  year: number;
  round: number;
}) {
  const q = useDriverRaceSectors(driverCode, year, round, true);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverRaceSectorsTester() {
  const [code, setCode] = useState("VER");
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<{
    code: string;
    year: number;
    round: number;
  } | null>(null);

  return (
    <HookCard
      name="useDriverRaceSectors"
      signature="driverCode, year, round, enabled"
      description="Fetches per-lap sector timing for a driver — S1, S2, S3 times per lap across the entire race."
      queryKey={`["driver", "${code || "code"}", "raceSectors", ${year || "year"}, ${round || "round"}]`}
      group="Driver Analysis"
    >
      <div className="grid grid-cols-3 gap-3">
        <ParamField
          label="driverCode"
          value={code}
          onChange={setCode}
          placeholder="VER"
          note="3-letter code"
        />
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({ code, year: Number(year), round: Number(round) })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && (
        <DriverRaceSectorsRunner driverCode={active.code} year={active.year} round={active.round} />
      )}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverTelemetryCoverage
// ---------------------------------------------------------------------------
function DriverTelemetryCoverageRunner({
  year,
  round,
}: {
  year: number;
  round: number;
}) {
  const q = useDriverTelemetryCoverage(year, round);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverTelemetryCoverageTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<{ year: number; round: number } | null>(null);

  return (
    <HookCard
      name="useDriverTelemetryCoverage"
      signature="year: number, round: number"
      description="Fetches session coverage flags for a race round. Internally gates useDriverTelemetry — if coverage says telemetry is unavailable, the telemetry query will never fire."
      queryKey={`["coverage", "round", ${year || "year"}, ${round || "round"}]`}
      group="Driver Telemetry"
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
      {active && <DriverTelemetryCoverageRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverTelemetry
// ---------------------------------------------------------------------------
interface DriverTelemetryParams {
  driverCode: string;
  year: number;
  round: number;
  lap: number;
  session: AnalysisSessionName;
}

function DriverTelemetryRunner({
  driverCode,
  year,
  round,
  lap,
  session,
}: DriverTelemetryParams) {
  const q = useDriverTelemetry(driverCode, year, round, lap, session);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function DriverTelemetryTester() {
  const [code, setCode] = useState("VER");
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [lap, setLap] = useState("5");
  const [session, setSession] = useState<AnalysisSessionName>("R");
  const [active, setActive] = useState<DriverTelemetryParams | null>(null);

  return (
    <HookCard
      name="useDriverTelemetry"
      signature="driverCode, year, round, lap, session"
      description="Fetches raw telemetry channels for a single driver lap — speed, throttle, brake, gear, RPM, DRS. Internally fetches coverage first and only fires if telemetry is confirmed available."
      queryKey={`["driver", "${code || "code"}", "telemetry", ${year || "year"}, ${round || "round"}, ${lap || "lap"}, "${session}"]`}
      group="Driver Telemetry"
      warning="Coverage-gated. The query will stay idle if the backend coverage check says telemetry is unavailable for the selected session. Run useDriverTelemetryCoverage first to verify."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ParamField
          label="driverCode"
          value={code}
          onChange={setCode}
          placeholder="VER"
          note="3-letter code"
        />
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
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
            driverCode: code,
            year: Number(year),
            round: Number(round),
            lap: Number(lap),
            session,
          })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <DriverTelemetryRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export function DriverRecordGroup() {
  return (
    <GroupSection
      id="driver-record"
      title="Driver Record"
      description="Career discovery, per-season results, race analysis, and telemetry"
      count={10}
    >
      <DriverYearListTester />
      <DriverCareerStandingsTester />
      <DriverSeasonRoundsTester />
      <DriverSeasonResultsTester />
      <DriverRaceLapsTester />
      <DriverRaceStintsTester />
      <DriverRacePaceTester />
      <DriverRaceSectorsTester />
      <DriverTelemetryCoverageTester />
      <DriverTelemetryTester />
    </GroupSection>
  );
}

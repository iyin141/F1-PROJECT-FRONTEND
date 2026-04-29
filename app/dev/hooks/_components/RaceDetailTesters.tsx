"use client";

import React, { useState } from "react";

import {
  useRaceDetail,
  useRaceResults,
  useQualifyingResults,
  usePracticeResults,
  useRaceWeather,
  useRaceIncidents,
  useReplayData,
} from "@/features/race-detail/hooks/useRaceDetail";
import type { PracticeSessionName } from "@/types/api";
import {
  HookCard,
  ExecuteBar,
  ParamField,
  SelectField,
  ResultPanel,
  GroupSection,
  QueryStatus,
} from "./ui";

// ---------------------------------------------------------------------------
// Shared year + round param helpers
// ---------------------------------------------------------------------------
interface YearRound {
  year: number;
  round: number;
}

// ---------------------------------------------------------------------------
// useRaceDetail
// ---------------------------------------------------------------------------
function RaceDetailRunner({ year, round }: YearRound) {
  const q = useRaceDetail(year, round);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function RaceDetailTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<YearRound | null>(null);

  return (
    <HookCard
      name="useRaceDetail"
      signature="year: number, round: number"
      description="Fetches metadata for a single race — circuit info, date, name, and session schedule."
      queryKey={`["races", "detail", ${year || "year"}, ${round || "round"}]`}
      group="Race Detail"
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
      {active && <RaceDetailRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useRaceResults
// ---------------------------------------------------------------------------
function RaceResultsRunner({ year, round }: YearRound) {
  const q = useRaceResults(year, round);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function RaceResultsTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<YearRound | null>(null);

  return (
    <HookCard
      name="useRaceResults"
      signature="year: number, round: number"
      description="Fetches race classification — final positions, points, fastest lap, and gap times."
      queryKey={`["races", "results", ${year || "year"}, ${round || "round"}]`}
      group="Race Detail"
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
      {active && <RaceResultsRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useQualifyingResults
// ---------------------------------------------------------------------------
function QualifyingResultsRunner({ year, round }: YearRound) {
  const q = useQualifyingResults(year, round);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function QualifyingResultsTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<YearRound | null>(null);

  return (
    <HookCard
      name="useQualifyingResults"
      signature="year: number, round: number"
      description="Fetches Q1/Q2/Q3 qualifying results, lap times, and grid positions."
      queryKey={`["races", "qualifying", ${year || "year"}, ${round || "round"}]`}
      group="Race Detail"
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
      {active && <QualifyingResultsRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// usePracticeResults
// ---------------------------------------------------------------------------
interface PracticeParams extends YearRound {
  session: PracticeSessionName;
}

function PracticeResultsRunner({ year, round, session }: PracticeParams) {
  const q = usePracticeResults(year, round, session);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function PracticeResultsTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [session, setSession] = useState<PracticeSessionName>("FP1");
  const [active, setActive] = useState<PracticeParams | null>(null);

  const SESSION_OPTS = [
    { label: "FP1", value: "FP1" },
    { label: "FP2", value: "FP2" },
    { label: "FP3", value: "FP3" },
  ];

  return (
    <HookCard
      name="usePracticeResults"
      signature="year: number, round: number, session: PracticeSessionName"
      description="Fetches practice session classification — lap times and sector times for the selected free practice session."
      queryKey={`["races", "practice", ${year || "year"}, ${round || "round"}, "${session}"]`}
      group="Race Detail"
    >
      <div className="grid grid-cols-3 gap-3">
        <ParamField label="year" type="number" value={year} onChange={setYear} placeholder="2024" />
        <ParamField label="round" type="number" value={round} onChange={setRound} placeholder="1" />
        <SelectField
          label="session"
          value={session}
          onChange={(v) => setSession(v as PracticeSessionName)}
          options={SESSION_OPTS}
        />
      </div>
      <ExecuteBar
        onExecute={() =>
          setActive({ year: Number(year), round: Number(round), session })
        }
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active && <PracticeResultsRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useRaceWeather
// ---------------------------------------------------------------------------
function RaceWeatherRunner({ year, round }: YearRound) {
  const q = useRaceWeather(year, round);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function RaceWeatherTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<YearRound | null>(null);

  return (
    <HookCard
      name="useRaceWeather"
      signature="year: number, round: number"
      description="Fetches per-lap weather data for the race session — air/track temperature, humidity, wind speed, and rainfall."
      queryKey={`["unified", "weather", ${year || "year"}, ${round || "round"}]`}
      group="Race Detail"
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
      {active && <RaceWeatherRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useRaceIncidents
// ---------------------------------------------------------------------------
function RaceIncidentsRunner({ year, round }: YearRound) {
  const q = useRaceIncidents(year, round);
  return (
    <ResultPanel status={q.status} data={q.data} error={q.error} updatedAt={q.dataUpdatedAt} />
  );
}

function RaceIncidentsTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<YearRound | null>(null);

  return (
    <HookCard
      name="useRaceIncidents"
      signature="year: number, round: number"
      description="Fetches race incidents — safety cars, VSC periods, red flags, and track status changes."
      queryKey={`["unified", "incidents", ${year || "year"}, ${round || "round"}]`}
      group="Race Detail"
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
      {active && <RaceIncidentsRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useReplayData — fires 3 parallel queries
// ---------------------------------------------------------------------------
function ReplayDataRunner({ year, round }: YearRound) {
  const { positions, incidents, pitStops, isPending, isError } = useReplayData(
    year,
    round,
    true,
  );

  const status: QueryStatus = isPending
    ? "pending"
    : isError
    ? "error"
    : "success";

  const data = {
    positions: {
      status: positions.status,
      count: Array.isArray(positions.data?.data)
        ? positions.data.data.length
        : null,
    },
    incidents: {
      status: incidents.status,
      data: incidents.data,
    },
    pitStops: {
      status: pitStops.status,
      data: pitStops.data,
    },
  };

  return (
    <ResultPanel
      status={status}
      data={data}
      error={isError ? new Error("One or more parallel queries failed") : null}
      updatedAt={Math.max(
        positions.dataUpdatedAt,
        incidents.dataUpdatedAt,
        pitStops.dataUpdatedAt,
      )}
    />
  );
}

function ReplayDataTester() {
  const [year, setYear] = useState("2024");
  const [round, setRound] = useState("1");
  const [active, setActive] = useState<YearRound | null>(null);

  return (
    <HookCard
      name="useReplayData"
      signature="year: number, round: number, enabled: boolean"
      description="Fires three parallel useQueries — positions, incidents, and pit stops — for race replay animations. Heavy payload; only loads on demand."
      queryKey={`["unified", "positions" | "incidents" | "pitStops", ${year || "year"}, ${round || "round"}]`}
      group="Race Detail"
      warning="This fires 3 concurrent requests. Positions data can be several MB for a full race."
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
      {active && <ReplayDataRunner {...active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export function RaceDetailGroup() {
  return (
    <GroupSection
      id="race-detail"
      title="Race Detail"
      description="Race, qualifying, practice results and unified session data"
      count={7}
    >
      <RaceDetailTester />
      <RaceResultsTester />
      <QualifyingResultsTester />
      <PracticeResultsTester />
      <RaceWeatherTester />
      <RaceIncidentsTester />
      <ReplayDataTester />
    </GroupSection>
  );
}

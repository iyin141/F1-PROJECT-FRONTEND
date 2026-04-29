"use client";

import React, { useState } from "react";

import {
  useSeasonSchedule,
  useDriverStandings,
  useConstructorStandings,
} from "@/features/season-hub/hooks/useSeasonHub";
import {
  HookCard,
  ExecuteBar,
  ParamField,
  ResultPanel,
  GroupSection,
} from "./ui";

// ---------------------------------------------------------------------------
// useSeasonSchedule
// ---------------------------------------------------------------------------
function SeasonScheduleRunner({ year }: { year: number }) {
  const q = useSeasonSchedule(year);
  return (
    <ResultPanel
      status={q.status}
      data={q.data}
      error={q.error}
      updatedAt={q.dataUpdatedAt}
    />
  );
}

function SeasonScheduleTester() {
  const [year, setYear] = useState("2024");
  const [active, setActive] = useState<number | null>(null);

  return (
    <HookCard
      name="useSeasonSchedule"
      signature="year: number"
      description="Fetches the full race calendar for a season — round numbers, circuit details, dates, and session schedule."
      queryKey={`["races", "all", ${year || "year"}]`}
      group="Season Hub"
    >
      <ParamField
        label="year"
        type="number"
        value={year}
        onChange={setYear}
        placeholder="2024"
      />
      <ExecuteBar
        onExecute={() => setActive(Number(year))}
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active !== null && <SeasonScheduleRunner year={active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useDriverStandings
// ---------------------------------------------------------------------------
function DriverStandingsRunner({ year }: { year: number }) {
  const q = useDriverStandings(year);
  return (
    <ResultPanel
      status={q.status}
      data={q.data}
      error={q.error}
      updatedAt={q.dataUpdatedAt}
    />
  );
}

function DriverStandingsTester() {
  const [year, setYear] = useState("2024");
  const [active, setActive] = useState<number | null>(null);

  return (
    <HookCard
      name="useDriverStandings"
      signature="year: number"
      description="Fetches the World Drivers' Championship standings for the given season, including points, wins, and position."
      queryKey={`["standings", "drivers", ${year || "year"}]`}
      group="Season Hub"
    >
      <ParamField
        label="year"
        type="number"
        value={year}
        onChange={setYear}
        placeholder="2024"
      />
      <ExecuteBar
        onExecute={() => setActive(Number(year))}
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active !== null && <DriverStandingsRunner year={active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// useConstructorStandings
// ---------------------------------------------------------------------------
function ConstructorStandingsRunner({ year }: { year: number }) {
  const q = useConstructorStandings(year);
  return (
    <ResultPanel
      status={q.status}
      data={q.data}
      error={q.error}
      updatedAt={q.dataUpdatedAt}
    />
  );
}

function ConstructorStandingsTester() {
  const [year, setYear] = useState("2024");
  const [active, setActive] = useState<number | null>(null);

  return (
    <HookCard
      name="useConstructorStandings"
      signature="year: number"
      description="Fetches the World Constructors' Championship standings for the given season."
      queryKey={`["standings", "constructors", ${year || "year"}]`}
      group="Season Hub"
    >
      <ParamField
        label="year"
        type="number"
        value={year}
        onChange={setYear}
        placeholder="2024"
      />
      <ExecuteBar
        onExecute={() => setActive(Number(year))}
        onReset={() => setActive(null)}
        hasResult={active !== null}
      />
      {active !== null && <ConstructorStandingsRunner year={active} />}
    </HookCard>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export function SeasonHubGroup() {
  return (
    <GroupSection
      id="season-hub"
      title="Season Hub"
      description="Season-level standings and race schedule"
      count={3}
    >
      <SeasonScheduleTester />
      <DriverStandingsTester />
      <ConstructorStandingsTester />
    </GroupSection>
  );
}

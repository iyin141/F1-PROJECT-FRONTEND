'use client';

import { useState, useTransition } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { RaceOverviewAnalysisTab } from "./RaceOverviewAnalysisTab";
import { PositionChartTab } from "./PositionChartTab";
import { LapAnalysisTab } from "./LapAnalysisTab";
import { TelemetryAnalysisTab } from "./TelemetryAnalysisTab";
import type { AnalysisDriverOption } from "./DriverSelect";

type AnalysisTabsProps = {
  year: number;
  round: number;
  session: string;
  drivers: AnalysisDriverOption[];
};

export const AnalysisTabs = ({ year, round, session, drivers }: AnalysisTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isPending, startTransition] = useTransition();

  const tabs: Array<[string, string]> = [
    ["overview", "Overview"],
    ["position", "Position Chart"],
    ["lap", "Lap Analysis"],
    ["telemetry", "Driver Telemetry"],
  ];

  return (
    <Tabs.Root
      defaultValue="overview"
      onValueChange={(value) => {
        startTransition(() => setActiveTab(value));
      }}
    >
      <Tabs.List className="scrollbar-none mb-6 flex overflow-x-auto border-b border-border-subtle">
        {tabs.map(([value, label]) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="-mb-px px-5 py-3 font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text data-[state=active]:border-b-2 data-[state=active]:border-red data-[state=active]:text-text cursor-pointer whitespace-nowrap"
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className={isPending ? "pointer-events-none opacity-70 transition-opacity duration-200" : "transition-opacity duration-200"}>
        <Tabs.Content value="overview">
          <RaceOverviewAnalysisTab year={year} round={round} session={session} drivers={drivers} />
        </Tabs.Content>
        <Tabs.Content value="position">
          <PositionChartTab year={year} round={round} session={session} drivers={drivers} />
        </Tabs.Content>
        <Tabs.Content value="lap">
          <LapAnalysisTab year={year} round={round} session={session} drivers={drivers} />
        </Tabs.Content>
        <Tabs.Content value="telemetry">
          <TelemetryAnalysisTab year={year} round={round} session={session} drivers={drivers} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
};

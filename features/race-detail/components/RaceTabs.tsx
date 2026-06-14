'use client';

import { useState, useTransition } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { OverviewTab } from "@/features/race-detail/components/OverviewTab";
import { PracticeTab } from "@/features/race-detail/components/PracticeTab";
import { QualifyingTab } from "@/features/race-detail/components/QualifyingTab";
import { RaceTab } from "@/features/race-detail/components/RaceTab";
import { SprintTab } from "@/features/race-detail/components/SprintTab";
import { ReplayTab } from "@/features/race-detail/components/ReplayTab";
import { DriverRecordTab } from "@/features/race-detail/components/DriverRecordTab";

type RaceTabsProps = {
  year: number;
  round: number;
  upcoming: boolean;
  isSprint: boolean;
  practiceSessions: ("FP1" | "FP2" | "FP3")[];
};

export const RaceTabs = ({ year, round, upcoming, isSprint, practiceSessions }: RaceTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isPending, startTransition] = useTransition();

  // Build tab list dynamically based on session data
  const tabs: Array<[string, string]> = [
    ["overview", "Overview"],
    ["race", "Race"],
  ];

  if (isSprint) {
    tabs.push(["sprint", "Sprint"]);
  }

  tabs.push(["qualifying", "Qualifying"]);

  if (practiceSessions.length > 0) {
    tabs.push(["practice", "Practice"]);
  }

  tabs.push(["replay", "Replay"]);
  tabs.push(["driver-record", "Driver Record"]);

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
            className="-mb-px px-5 py-3 font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text data-[state=active]:border-b-2 data-[state=active]:border-red data-[state=active]:text-text"
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className={isPending ? "pointer-events-none opacity-70" : ""}>
      <Tabs.Content value="overview"><OverviewTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
      <Tabs.Content value="race"><RaceTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
      {isSprint && (
        <Tabs.Content value="sprint"><SprintTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
      )}
      <Tabs.Content value="qualifying"><QualifyingTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
      {practiceSessions.length > 0 && (
        <Tabs.Content value="practice"><PracticeTab year={year} round={round} upcoming={upcoming} availableSessions={practiceSessions} /></Tabs.Content>
      )}
      <Tabs.Content value="replay"><ReplayTab year={year} round={round} upcoming={upcoming} enabled={activeTab === "replay"} /></Tabs.Content>
      <Tabs.Content value="driver-record"><DriverRecordTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
      </div>
    </Tabs.Root>
  );
};

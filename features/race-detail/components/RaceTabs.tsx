'use client';

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { OverviewTab } from "@/features/race-detail/components/OverviewTab";
import { PracticeTab } from "@/features/race-detail/components/PracticeTab";
import { QualifyingTab } from "@/features/race-detail/components/QualifyingTab";
import { RaceTab } from "@/features/race-detail/components/RaceTab";
import { ReplayTab } from "@/features/race-detail/components/ReplayTab";
import { DriverRecordTab } from "@/features/race-detail/components/DriverRecordTab";

type RaceTabsProps = {
  year: number;
  round: number;
  upcoming: boolean;
};

export const RaceTabs = ({ year, round, upcoming }: RaceTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  return (
    <Tabs.Root defaultValue="overview" onValueChange={setActiveTab}>
      <Tabs.List className="scrollbar-none mb-6 flex overflow-x-auto border-b border-border-subtle">
        {[["overview", "Overview"], ["race", "Race"], ["qualifying", "Qualifying"], ["practice", "Practice"], ["replay", "Replay"], ["driver-record", "Driver Record"]].map(([value, label]) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="-mb-px px-5 py-3 font-mono text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-text data-[state=active]:border-b-2 data-[state=active]:border-red data-[state=active]:text-text"
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="overview"><OverviewTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
      <Tabs.Content value="race"><RaceTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
      <Tabs.Content value="qualifying"><QualifyingTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
      <Tabs.Content value="practice"><PracticeTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
      <Tabs.Content value="replay"><ReplayTab year={year} round={round} upcoming={upcoming} enabled={activeTab === "replay"} /></Tabs.Content>
      <Tabs.Content value="driver-record"><DriverRecordTab year={year} round={round} upcoming={upcoming} /></Tabs.Content>
    </Tabs.Root>
  );
};

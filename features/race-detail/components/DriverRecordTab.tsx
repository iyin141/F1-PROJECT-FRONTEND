'use client';

import { Panel } from "@/components/Panel";
import { EmptyState } from "@/components/EmptyState";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";

export const DriverRecordTab = ({ year, round }: RaceTabProps) => {
  return (
    <Panel label="DRIVER RECORD" title={`${year} · ROUND ${String(round).padStart(2, "0")}`}>
      <EmptyState
        message="DRIVER RECORD COMING SOON"
        description="Driver record views will be available in this tab."
      />
    </Panel>
  );
};

'use client';

import { Panel } from "@/components/Panel";
import { ReplayScrubber } from "@/features/race-detail/components/ReplayScrubber";
import { NotAvailable } from "@/features/race-detail/components/NotAvailable";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";

export const ReplayTab = ({ year, round, upcoming, enabled }: RaceTabProps) => {
  if (upcoming) return <NotAvailable />;

  return (
    <Panel label="RACE REPLAY" title="Position-by-lap timeline (GSAP)">
      <ReplayScrubber year={year} round={round} enabled={enabled ?? false} />
    </Panel>
  );
};

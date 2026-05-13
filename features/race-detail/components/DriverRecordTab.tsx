'use client';

import Link from "next/link";
import { Panel } from "@/components/Panel";
import { EmptyState } from "@/components/EmptyState";
import { DriverCode } from "@/components/DriverCode";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";
import { useRaceResults } from "@/features/race-detail/hooks/useRaceDetail";

export const DriverRecordTab = ({ year, round }: RaceTabProps) => {
  const { data: results = [], isLoading: resultsLoading } = useRaceResults(year, round);

  return (
    <Panel label="DRIVER RECORD" title={`${year} · ROUND ${String(round).padStart(2, "0")}`}>
      {!results.length ? (
        <EmptyState
          message="NO RACE RESULTS"
          description="Results are not yet available for this race."
        />
      ) : (
        <ul className="divide-y divide-border-subtle border border-border-subtle">
          {results.map((result, idx) => (
            <li key={result.driver.code}>
              <Link
                href={`/drivers/${result.driver.code}/${year}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-panel-elev"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tabular-nums text-text-dim">{String(idx + 1).padStart(2, "0")}</span>
                  <DriverCode driver={result.driver} showName />
                </div>
                <span className="font-mono text-[10px] tabular-nums text-green">+{result.points} pts</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

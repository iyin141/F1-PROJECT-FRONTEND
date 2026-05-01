'use client';

import { useState } from "react";
import { Panel } from "@/components/Panel";
import { Skeleton } from "@/components/Skeleton";
import { DriverCode } from "@/components/DriverCode";
import { CompoundDot } from "@/components/CompoundDot";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import { NotAvailable } from "@/features/race-detail/components/NotAvailable";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";
import type { PracticeResult } from "@/types/ui";
import { PodiumBlock } from "@/components/PodiumBlock";
import { usePracticeResults } from "@/features/race-detail/hooks/useRaceDetail";
import { adaptPracticeResults } from "@/Lib/adapters";

const columns: ColumnDef<PracticeResult>[] = [
  {
    key: "pos",
    width: "1fr",
    header: "POS",
    render: r => <span className="tabular-nums">{r.position}</span>,
  },
  {
    key: "driver",
    width: "4fr",
    header: "DRIVER",
    render: r => <div className="min-w-0"><DriverCode driver={r.driver} showName /></div>,
  },
  {
    key: "lap",
    width: "3fr",
    header: "BEST LAP",
    render: r => <span className="tabular-nums">{r.bestLap}</span>,
  },
  {
    key: "laps",
    width: "2fr",
    header: "LAPS",
    render: r => <span className="tabular-nums text-text-dim">{r.laps}</span>,
  },
  {
    key: "tyre",
    width: "1fr",
    header: "TYRE",
    render: r => <span>{r.compound && <CompoundDot compound={r.compound} />}</span>,
  },
  {
    key: "gap",
    width: "1fr",
    header: "GAP",
    render: r => <span className="truncate text-[10px] text-text-dim">{r.gap}</span>,
  },
];

export const PracticeTab = ({ year, round, upcoming }: RaceTabProps) => {
  const [session, setSession] = useState<"fp1" | "fp2" | "fp3">("fp1");
  const { data: pData, isLoading } = usePracticeResults(year, round, session.toUpperCase() as "FP1" | "FP2" | "FP3");
  const p = { data: pData ? adaptPracticeResults(pData) : undefined, loading: isLoading };

  if (upcoming) return <NotAvailable />;

  const allResults = p.data ?? [];
  const podiumResults = allResults.filter((r) => r.position === 1 || r.position === 2 || r.position === 3);
  const tableResults = allResults.filter((r) => r.position !== 1 && r.position !== 2 && r.position !== 3);

  return (
    <Panel
      label={`PRACTICE · ${session.toUpperCase()}`}
      action={
        <div className="flex gap-1">
          {(["fp1", "fp2", "fp3"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSession(s)}
              className={`rounded-sm px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${session === s ? "bg-red text-white" : "text-text-dim hover:text-text"}`}
            >
              {s}
            </button>
          ))}
        </div>
      }
    >
      {p.loading ? <Skeleton className="h-96" /> : (
        <div className="space-y-4">
          {podiumResults.length === 3 && (
            <PodiumBlock
              results={podiumResults}
              label={`${session.toUpperCase()} TOP 3`}
              renderStats={(r) => (
                <>
                  <span
                    className="tabular-nums font-bold"
                    style={{ color: "var(--purple)" }}
                  >
                    {r.bestLap ?? "—"}
                  </span>
                  <span style={{ color: "hsl(var(--muted))" }}>
                    {r.laps} LAPS
                  </span>
                  {r.compound && (
                    <span className="flex items-center gap-1" style={{ color: "hsl(var(--muted))" }}>
                      <CompoundDot compound={r.compound} />
                    </span>
                  )}
                </>
              )}
            />
          )}
          <div className="panel-scroll w-full">
          <GenericTable<PracticeResult>
            className="data-grid w-full min-w-[36rem] font-mono text-xs md:min-w-[42rem]"
            columns={columns}
            data={tableResults}
            getRowKey={r => r.driver.id}
            striped
          />
          </div>
        </div>
      )}
    </Panel>
  );
};

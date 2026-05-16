'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { fetchDriverCareer, fetchDriverSeason } from "@/Lib/queryFunctions";
import { useMemo, useState, useTransition } from "react";
import { Panel } from "@/components/Panel";
import { teamColor } from "@/components/DriverCode";
import { CompoundDot } from "@/components/CompoundDot";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import { NotAvailable } from "@/features/race-detail/components/NotAvailable";
import type { RaceTabProps } from "@/features/race-detail/components/tab-types";
import type { PracticeResult } from "@/types/ui";
import { PodiumBlock } from "@/components/PodiumBlock";
import { usePracticeResults } from "@/features/race-detail/hooks/useRaceDetail";
import { getDriverFlagUrl } from "@/Lib/nationality";
import { FlagImage } from "@/_Components/ui/FlagImage";

const buildColumns = (
  year: number,
  prefetchDriverRoute: (driverCode: string) => void,
): ColumnDef<PracticeResult>[] => [
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
    render: (r) => {
      const flag = getDriverFlagUrl(r.driver.code, 40);
      return (
        <div className="inline-flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-3.5 w-0.75 rounded-sm"
            style={{ backgroundColor: teamColor(r.driver.team) }}
          />
          {flag ? <FlagImage src={flag} /> : null}
          <Link
            href={`/drivers/${r.driver.code}/${year}`}
            onMouseEnter={() => prefetchDriverRoute(r.driver.code)}
            className="font-semibold transition-colors hover:text-blue"
          >
            {r.driver.code}
          </Link>
          <span className="truncate text-text-dim">{r.driver.lastName}</span>
        </div>
      );
    },
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

type PracticeTabProps = RaceTabProps & {
  availableSessions?: ("FP1" | "FP2" | "FP3")[];
};

export const PracticeTab = ({ year, round, upcoming, availableSessions }: PracticeTabProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Use the available sessions from the race schedule, defaulting to all three
  const sessions = availableSessions?.length ? availableSessions : (["FP1", "FP2", "FP3"] as const);
  const [session, setSession] = useState<"FP1" | "FP2" | "FP3">(sessions[0]);

  const queryClient = useQueryClient();

  // call both next route prefetch and react-query data prefetch (cache-first)
  const prefetchDriverRouteAndData = (driverCode: string) => {
    router.prefetch(`/drivers/${driverCode}/${year}`);
    void fetchDriverCareer(driverCode, queryClient);
    if (year !== undefined) void fetchDriverSeason(driverCode, year, queryClient);
  };

  const columns = useMemo(
    () => buildColumns(year, prefetchDriverRouteAndData),
    [year],
  );

  const { data: pData, isLoading } = usePracticeResults(year, round, session);
  const p = { data: pData ?? undefined, loading: isLoading };

  if (upcoming) return <NotAvailable />;

  const allResults = p.data ?? [];
  const podiumResults = allResults.filter((r) => r.position === 1 || r.position === 2 || r.position === 3);
  const tableResults = allResults.filter((r) => r.position !== 1 && r.position !== 2 && r.position !== 3);

  return (
    <Panel
      label={`PRACTICE · ${session}`}
      action={
        <div className={`flex gap-1 ${isPending ? "pointer-events-none opacity-70" : ""}`}>
          {sessions.map(s => (
            <button
              key={s}
              onClick={() => startTransition(() => setSession(s))}
              className={`rounded-sm px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${session === s ? "bg-red text-white" : "text-text-dim hover:text-text"}`}
            >
              {s}
            </button>
          ))}
        </div>
      }
    >
      {(
        <div className="space-y-4">
          {podiumResults.length === 3 && (
            <PodiumBlock
              results={podiumResults}
              label={`${session} TOP 3`}
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
            className="data-grid w-full min-w-xl font-mono text-xs md:min-w-2xl"
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

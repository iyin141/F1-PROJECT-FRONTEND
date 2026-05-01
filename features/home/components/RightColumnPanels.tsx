'use client';

import Link from "next/link";
import { Panel } from "@/components/Panel";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { DriverCode, teamColor } from "@/components/DriverCode";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import { formatDate, countdownTo } from "@/Lib/format";
import { useEffect, useState } from "react";
import type { ConstructorStanding, DriverStanding, Race, SessionSchedule } from "@/types/ui";

const scheduleColumns: ColumnDef<SessionSchedule>[] = [
  {
    key: "session",
    width: "1fr",
    header: "SESSION",
    render: session => <span className="uppercase text-text-dim">{session.id}</span>,
  },
  {
    key: "starts",
    width: "1fr",
    header: "START",
    align: "right",
    render: session => (
      <span className="tabular-nums text-text-dim">
        {formatDate(session.startsAt, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
      </span>
    ),
  },
];

const standingsColumns: ColumnDef<DriverStanding>[] = [
  {
    key: "position",
    width: "1fr",
    header: "POS",
    render: standing => <span className="w-4 tabular-nums text-muted">{standing.position}</span>,
  },
  {
    key: "driver",
    width: "4fr",
    header: "DRIVER",
    render: standing => <DriverCode driver={standing.driver} showName />,
  },
  {
    key: "points",
    width: "1fr",
    header: "PTS",
    align: "right",
    render: standing => <span className="tabular-nums">{standing.points}</span>,
  },
];

const constructorColumns: ColumnDef<ConstructorStanding>[] = [
  {
    key: "position",
    width: "1fr",
    header: "POS",
    render: standing => <span className="w-4 tabular-nums text-muted">{standing.position}</span>,
  },
  {
    key: "team",
    width: "4fr",
    header: "TEAM",
    render: standing => (
      <span className="inline-flex min-w-0 items-center gap-2 font-mono text-xs tracking-wider">
        <span
          aria-hidden
          className="inline-block h-[14px] w-[3px] rounded-sm"
          style={{ background: teamColor(standing.team.id) }}
        />
        <span className="truncate text-text" title={standing.team.name}>
          {standing.team.name}
        </span>
      </span>
    ),
  },
  {
    key: "points",
    width: "1fr",
    header: "PTS",
    align: "right",
    render: standing => <span className="tabular-nums">{standing.points}</span>,
  },
];

const Countdown = ({ iso }: { iso: string }) => {
  const [t, setT] = useState(countdownTo(iso));

  useEffect(() => {
    const interval = setInterval(() => setT(countdownTo(iso)), 1000);
    return () => clearInterval(interval);
  }, [iso]);

  if (t.past) return <span className="font-mono text-red">RACE STARTED</span>;

  return (
    <div className="flex gap-4 font-mono">
      {[["DAYS", t.days], ["HRS", t.hours], ["MIN", t.minutes], ["SEC", t.seconds]].map(([label, value]) => (
        <div key={label as string} className="text-center">
          <div className="text-2xl font-bold tabular-nums">{String(value).padStart(2, "0")}</div>
          <div className="label-mono">{label}</div>
        </div>
      ))}
    </div>
  );
};

type RightColumnPanelsProps = {
  year: number;
  nextRace: Race | undefined;
  nextRaceLoading: boolean;
  standings: DriverStanding[] | undefined;
  standingsLoading: boolean;
  constructors: ConstructorStanding[] | undefined;
  constructorsLoading: boolean;
};

export const RightColumnPanels = ({
  year,
  nextRace,
  nextRaceLoading,
  standings,
  standingsLoading,
  constructors,
  constructorsLoading,
}: RightColumnPanelsProps) => {
  const [championshipView, setChampionshipView] = useState<"drivers" | "constructors">("drivers");

  return (
    <div className="space-y-6">
      <Panel label="NEXT RACE" title={nextRace?.name ?? "OFF SEASON"}>
        {nextRaceLoading ? (
          <Skeleton className="h-28" />
        ) : !nextRace ? (
          <EmptyState message="OFF SEASON" description="Awaiting next season opener." />
        ) : (
          <>
            <div className="scrollbar-none overflow-x-auto">
              <Countdown iso={nextRace.date} />
            </div>
            <div className="mt-4 border-t border-border-subtle pt-4">
              <div className="mb-2 label-mono">SESSION SCHEDULE</div>
              <GenericTable<SessionSchedule>
                className="font-mono text-xs"
                columns={scheduleColumns}
                data={nextRace.sessions}
                getRowKey={session => session.id}
                striped
              />
            </div>
          </>
        )}
      </Panel>

      <Panel
        label="CHAMPIONSHIP"
        title={championshipView === "drivers" ? "Drivers · Top 5" : "Constructors · Top 5"}
        action={
          <Link
            href={`/season/${year}`}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim transition-colors hover:text-text text-nowrap"
          >
            See All
          </Link>
        }
      >
        <div className="mb-3 flex border-b border-border-subtle">
          {([
            ["drivers", "Drivers"],
            ["constructors", "Constructors"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setChampionshipView(value)}
              className="-mb-px border-b-2 px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors"
              style={{
                borderBottomColor:
                  championshipView === value ? "hsl(var(--red))" : "transparent",
                color:
                  championshipView === value ? "hsl(var(--text))" : "hsl(var(--text-dim))",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {championshipView === "drivers" ? (
          standingsLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
          ) : (
            <GenericTable<DriverStanding>
              className="font-mono text-xs"
              columns={standingsColumns}
              data={standings?.slice(0, 5) ?? []}
              getRowKey={standing => standing.driver.id}
              striped
            />
          )
        ) : constructorsLoading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
        ) : (
          <GenericTable<ConstructorStanding>
            className="font-mono text-xs"
            columns={constructorColumns}
            data={constructors?.slice(0, 5) ?? []}
            getRowKey={standing => standing.team.id}
            striped
          />
        )}
      </Panel>
    </div>
  );
};

'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DriverCode } from "@/components/DriverCode";
import { EmptyState } from "@/components/EmptyState";
import { Panel } from "@/components/Panel";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import { formatDate } from "@/Lib/format";
import type { Driver, Race } from "@/types/ui";

type CalendarRow = {
  race: Race;
  completed: boolean;
  live: boolean;
  isLatest: boolean;
  winner?: Driver;
  podium: Driver[];
  showLinks: boolean;
  showAnalysis: boolean;
};

const columns: ColumnDef<CalendarRow>[] = [
  {
    key: "round",
    width: "1fr",
    header: "R",
    render: row => <span className="tabular-nums text-text-dim">{String(row.race.round).padStart(2, "0")}</span>,
  },
  {
    key: "date",
    width: "2fr",
    header: "DATE",
    render: row => <span className="text-text-dim">{formatDate(row.race.date)}</span>,
  },
  {
    key: "gp",
    width: "3fr",
    header: "GP",
    render: row => <span className="text-text">{row.race.shortName}</span>,
  },
  {
    key: "winner",
    width: "2fr",
    header: "WINNER",
    render: row => (
      row.completed
        ? row.winner ? <DriverCode driver={row.winner} /> : null
        : <span className="text-muted">—</span>
    ),
  },
  {
    key: "podium",
    width: "3fr",
    header: "PODIUM",
    render: row => (
      <span className="flex gap-2">
        {row.completed
          ? row.podium.map(driver => <DriverCode key={driver.id} driver={driver} className="text-text-dim" />)
          : <span className="text-muted">UPCOMING</span>}
      </span>
    ),
  },
  {
    key: "analysis",
    width: "84px",
    header: " ",
    align: "right",
    render: row => (
      <span className="flex items-center justify-end gap-2">
        {row.showAnalysis && (
          <Link
            href={`/race/${row.race.year}/${row.race.round}/analysis`}
            onClick={(event) => event.stopPropagation()}
            className="text-[10px] text-red hover:underline"
          >
            ANALYSIS
          </Link>
        )}
      </span>
    ),
  },
  {
    key: "go",
    width: "28px",
    header: " ",
    align: "right",
    render: row => (
      row.showLinks ? <ChevronRight size={14} className="text-text-dim" /> : null
    ),
  },
];

const SpotlightCard = ({
  label,
  race,
  winner,
}: {
  label: string;
  race: Race | undefined;
  winner?: Driver;
}) => {
  const router = useRouter();

  if (!race) {
    return (
      <div className="rounded-xs border border-border-subtle bg-panel-elev px-4 py-3">
        <div className="label-mono">{label}</div>
        <div className="mt-2 font-display text-sm font-semibold text-text">TBC</div>
      </div>
    );
  }

  const content = (
    <>
      <div className="label-mono">{label}</div>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-display text-sm font-semibold text-text">{race.name}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
            R{String(race.round).padStart(2, "0")} · {formatDate(race.date)}
          </div>
          <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {race.circuit.name}
          </div>
        </div>
        {winner ? <DriverCode driver={winner} /> : null}
      </div>
    </>
  );

  return (
    <Link
      href={`/race/${race.year}/${race.round}`}
      onMouseEnter={() => router.prefetch(`/race/${race.year}/${race.round}`)}
      className="block rounded-xs border border-border-subtle bg-panel-elev px-4 py-3 transition-colors hover:border-border"
    >
      {content}
    </Link>
  );
};

type CalendarPanelProps = {
  year: number;
  calendar: Race[] | undefined;
  loading: boolean;
  view: "list" | "grid";
};

export const CalendarPanel = ({ year, calendar, loading, view }: CalendarPanelProps) => {
  const router = useRouter();
  const isPre2018 = year < 2018;
  const liveRace = calendar?.find(r => r.status === "live");
  const nextRace = calendar?.find(r => r.status === "upcoming");
  const lastCompletedRace = [...(calendar ?? [])].reverse().find(r => r.status === "completed");
  const lastCompletedRound = calendar?.filter(r => r.status === "completed").pop()?.round;
  const spotlightRace = liveRace ?? lastCompletedRace;
  const spotlightWinner = undefined;
  const rows: CalendarRow[] = (calendar ?? []).map(race => {
    const completed = race.status === "completed";

    return {
      race,
      completed,
      live: race.status === "live",
      isLatest: race.round === lastCompletedRound,
      winner: undefined,
      podium: [],
      showLinks: !isPre2018,
      showAnalysis: completed && !isPre2018,
    };
  });

  return (
    <Panel label={view === "list" ? "RACE CALENDAR · LIST" : "RACE CALENDAR · GRID"} title={`${calendar?.length ?? 0} rounds`}>
      {!calendar?.length ? (
        <EmptyState message={`NO RACE DATA FOR ${year}`} description="No fixtures available for this season." />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <SpotlightCard
              label={liveRace ? "CURRENT WEEKEND" : "LAST RACE"}
              race={spotlightRace}
              winner={spotlightWinner}
            />
            <SpotlightCard
              label="NEXT RACE"
              race={nextRace}
            />
          </div>

          <div className="panel-scroll w-full">
            <GenericTable<CalendarRow>
              className="data-grid w-full min-w-160 font-mono text-xs md:min-w-184"
              columns={columns}
              data={rows}
              getRowKey={row => `${row.race.year}-${row.race.round}`}
              onRowClick={(row) => {
                if (row.showLinks) {
                  router.push(`/race/${row.race.year}/${row.race.round}`);
                }
              }}
              getRowClassName={row => row.isLatest ? "border-l-2 border-border" : ""}
              striped
            />
          </div>
        </div>
      )}
    </Panel>
  );
};

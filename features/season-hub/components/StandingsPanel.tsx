'use client';

import * as Tabs from "@radix-ui/react-tabs";
import { DriverLink } from "@/components/ui/DriverLink";
import { useDriverStandings, useConstructorStandings } from "@/features/season-hub/hooks/useSeasonHub";
import { teamColor } from "@/components/DriverCode";
import { Panel } from "@/components/Panel";
import { Skeleton } from "@/components/Skeleton";
import { TableSkeleton } from "@/components/animations/TableSkeleton";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import type { ConstructorStanding, DriverStanding } from "@/types/ui";
import { getDriverFlagUrl } from "@/Lib/nationality";
import { FlagImage } from "@/_Components/ui/FlagImage";

const getDriverColumns = (
  year: number,
): ColumnDef<DriverStanding>[] => [
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
    render: (standing) => {
      const flag = getDriverFlagUrl(standing.driver.code, 40);
      return (
      <span className="inline-flex min-w-0 items-center gap-2 font-mono text-xs tracking-wider">
        <span
          aria-hidden
          className="inline-block h-3.5 w-0.75 rounded-sm"
          style={{ backgroundColor: teamColor(standing.driver.team) }}
        />
        {flag ? <FlagImage src={flag} /> : null}
        <DriverLink driver={standing.driver} year={year} />
        <span className="truncate text-text-dim">{standing.driver.lastName}</span>
      </span>
      );
    },
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
    render: standing => <span style={{ color: `hsl(var(${standing.team.colorVar}))` }}>{standing.team.shortName}</span>,
  },
  {
    key: "points",
    width: "1fr",
    header: "PTS",
    align: "right",
    render: standing => <span className="tabular-nums">{standing.points}</span>,
  },
];

type StandingsPanelProps = {
  year: number;
  drivers: DriverStanding[] | undefined;
  driversLoading: boolean;
  constructors: ConstructorStanding[] | undefined;
  constructorsLoading: boolean;
};

export const StandingsPanel = ({
  year,
  drivers,
  driversLoading,
  constructors,
  constructorsLoading,
}: StandingsPanelProps) => {


  // Fallback hooks: if parent doesn't supply props, these hooks will
  // provide the canonical standings and trigger the client fetch.
  const driverStandingsQuery = useDriverStandings(year);
  const constructorStandingsQuery = useConstructorStandings(year);

  const driversData = drivers ?? driverStandingsQuery.data;
  const driversIsLoading = driversLoading || driverStandingsQuery.isLoading;

  const constructorsData = constructors ?? constructorStandingsQuery.data;
  const constructorsIsLoading = constructorsLoading || constructorStandingsQuery.isLoading;

  const driverColumns = getDriverColumns(year);

  return (
    <Panel label="STANDINGS" title={`${year} Championship`}>
      <Tabs.Root defaultValue="drivers">
        <Tabs.List className="mb-3 flex border-b border-border-subtle">
          {[ ["drivers", "Drivers"], ["constructors", "Constructors"] ].map(([value, label]) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="-mb-px px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-dim data-[state=active]:border-b-2 data-[state=active]:border-red data-[state=active]:text-text"
            >
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="drivers">
          {driversIsLoading ? (
            <TableSkeleton rows={10} customTexts={["Updating driver standings...", "Calculating championship points..."]} />
          ) : (
            <GenericTable<DriverStanding>
              className="font-mono text-xs"
              columns={driverColumns}
              data={driversData ?? []}
              getRowKey={standing => standing.driver.id}
              striped
            />
          )}
        </Tabs.Content>
        <Tabs.Content value="constructors">
          {constructorsIsLoading ? (
            <TableSkeleton rows={10} customTexts={["Updating constructor standings...", "Calculating team points..."]} />
          ) : (
            <GenericTable<ConstructorStanding>
              className="font-mono text-xs"
              columns={constructorColumns}
              data={constructorsData ?? []}
              getRowKey={standing => standing.team.id}
              striped
            />
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Panel>
  );
};

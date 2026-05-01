'use client';

import * as Tabs from "@radix-ui/react-tabs";
import { DriverCode } from "@/components/DriverCode";
import { Panel } from "@/components/Panel";
import { Skeleton } from "@/components/Skeleton";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import type { ConstructorStanding, DriverStanding } from "@/types/ui";

const driverColumns: ColumnDef<DriverStanding>[] = [
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
          {driversLoading ? (
            <div className="space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
          ) : (
            <GenericTable<DriverStanding>
              className="font-mono text-xs"
              columns={driverColumns}
              data={drivers ?? []}
              getRowKey={standing => standing.driver.id}
              striped
            />
          )}
        </Tabs.Content>
        <Tabs.Content value="constructors">
          {constructorsLoading ? (
            <div className="space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
          ) : (
            <GenericTable<ConstructorStanding>
              className="font-mono text-xs"
              columns={constructorColumns}
              data={constructors ?? []}
              getRowKey={standing => standing.team.id}
              striped
            />
          )}
        </Tabs.Content>
      </Tabs.Root>
    </Panel>
  );
};

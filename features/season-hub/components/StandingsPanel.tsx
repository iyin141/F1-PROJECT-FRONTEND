'use client';

import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchDriverData } from "@/Lib/clientPrefetch";
import { teamColor } from "@/components/DriverCode";
import { Panel } from "@/components/Panel";
import { GenericTable, type ColumnDef } from "@/components/ui/GenericTable";
import type { ConstructorStanding, DriverStanding } from "@/types/ui";
import { getDriverFlagUrl } from "@/Lib/nationality";
import { FlagImage } from "@/_Components/ui/FlagImage";

const getDriverColumns = (
  year: number,
  prefetchDriverRoute: (driverCode: string) => void,
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
        <Link
          href={`/drivers/${standing.driver.code}/${year}`}
          onMouseEnter={() => prefetchDriverRoute(standing.driver.code)}
          className="font-semibold transition-colors hover:text-blue"
        >
          {standing.driver.code}
        </Link>
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
  const router = useRouter();
  const queryClient = useQueryClient();

  const prefetchDriverRoute = (driverCode: string) => {
    router.prefetch(`/drivers/${driverCode}/${year}`);
    void prefetchDriverData(queryClient, driverCode, year);
  };

  const driverColumns = getDriverColumns(year, prefetchDriverRoute);

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
            <GenericTable<DriverStanding>
              className="font-mono text-xs"
              columns={driverColumns}
              data={drivers ?? []}
              getRowKey={standing => standing.driver.id}
              striped
            />
        </Tabs.Content>
        <Tabs.Content value="constructors">
            <GenericTable<ConstructorStanding>
              className="font-mono text-xs"
              columns={constructorColumns}
              data={constructors ?? []}
              getRowKey={standing => standing.team.id}
              striped
            />
        </Tabs.Content>
      </Tabs.Root>
    </Panel>
  );
};

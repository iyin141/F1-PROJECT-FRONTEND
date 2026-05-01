import { cn } from "@/Lib/utils";
import { TEAMS } from "@/Lib/data/drivers";
import { DriverFlag } from "@/components/ui/DriverFlag";
import type { Driver, TeamId } from "@/types/ui";

interface Props {
  driver: Driver;
  className?: string;
  showName?: boolean;
  showFlag?: boolean;
}

export const teamColor = (teamId: TeamId) =>
  `hsl(var(${TEAMS[teamId]?.colorVar ?? "--muted"}))`;

export const DriverCode = ({ driver, className, showName, showFlag = true }: Props) => (
  <span className={cn("inline-flex min-w-0 items-center gap-2 font-mono text-xs tracking-wider", className)}>
    <span
      aria-hidden
      className="inline-block w-[3px] h-[14px] rounded-sm"
      style={{ background: teamColor(driver.team) }}
    />
    {showFlag && <DriverFlag driverCode={driver.code} />}
    <span className="font-semibold">{driver.code}</span>
    {showName && <span className="truncate text-text-dim">{driver.lastName}</span>}
  </span>
);

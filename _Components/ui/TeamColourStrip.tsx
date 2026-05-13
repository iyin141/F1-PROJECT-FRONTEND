import { TEAMS } from "@/Lib/data/drivers";
import type { TeamId } from "@/types/ui";

type TeamColourStripProps = {
  teamId: TeamId;
  className?: string;
};

export function TeamColourStrip({ teamId, className }: TeamColourStripProps) {
  const team = TEAMS[teamId];

  return (
    <span
      className={["inline-block h-full w-0.75 rounded-sm", className].filter(Boolean).join(" ")}
      style={{ backgroundColor: `hsl(var(${team.colorVar}))` }}
      aria-hidden
    />
  );
}

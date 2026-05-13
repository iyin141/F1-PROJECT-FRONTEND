import { TEAMS } from "@/Lib/data/drivers";
import type { TeamId } from "@/types/ui";

type TeamMonogramProps = {
  teamId: TeamId;
  size?: "sm" | "md";
  className?: string;
};

const SIZE_CLASS: Record<NonNullable<TeamMonogramProps["size"]>, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
};

function getMonogram(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function TeamMonogram({ teamId, size = "sm", className }: TeamMonogramProps) {
  const team = TEAMS[teamId];
  const monogram = getMonogram(team.shortName);

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full border border-border-subtle font-mono font-semibold tracking-wide text-black",
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundColor: `hsl(var(${team.colorVar}))` }}
      aria-label={team.name}
      title={team.name}
    >
      {monogram}
    </span>
  );
}

import { TeamMonogram } from "@/_Components/ui/TeamMonogram";
import { TeamColourStrip } from "@/_Components/ui/TeamColourStrip";
import type { CareerSeason } from "@/features/driver-record/types/driverRecord.types";
import type { TeamId } from "@/types/ui";
import { displayStat } from "@/features/driver-record/utlis/driverStatHelpers";

type CareerRowProps = {
  season: CareerSeason;
  selected: boolean;
  teamId: TeamId;
  onSelect: (year: number) => void;
};

export function CareerRow({ season, selected, teamId, onSelect }: CareerRowProps) {
  const isChampion = season.champion;

  return (
    <tr
      data-career-row="true"
      className="h-12 md:h-14 cursor-pointer border-b border-border-subtle odd:bg-surface even:bg-surface2"
      style={{
        background: isChampion
          ? "linear-gradient(to right, rgba(255,215,0,0.08) 0%, transparent 60%)"
          : undefined,
      }}
      onClick={() => onSelect(season.year)}
    >
      <td className="w-0.75 p-0 align-stretch">
        {isChampion ? (
          <span className="inline-block h-full w-0.75 bg-yellow" aria-hidden />
        ) : (
          <TeamColourStrip teamId={teamId} />
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-3xl leading-none text-text">{season.year}</span>
          <TeamMonogram teamId={teamId} size="sm" />
          {selected && <span className="font-mono text-[10px] tracking-[0.15em] text-red">SELECTED</span>}
        </div>
      </td>
      <td className="px-2 py-2 text-right font-mono text-[12px] text-text">{season.wins}</td>
      <td className="px-2 py-2 text-right font-mono text-[12px] text-text">{displayStat(season, "podiums")}</td>
      <td className="px-2 py-2 text-right font-mono text-[12px] text-text-dim">{displayStat(season, "poles")}</td>
      <td className="hidden px-2 py-2 text-right font-mono text-[12px] text-text-dim lg:table-cell">{displayStat(season, "fastest_laps")}</td>
      <td className="px-2 py-2 text-right font-mono text-[12px] text-text-dim">{season.races}</td>
      <td className="px-2 py-2 text-right font-mono text-[10px] tracking-[0.15em]" style={{ color: isChampion ? "hsl(var(--amber))" : "hsl(var(--muted))" }}>
        {isChampion ? "WDC" : "-"}
      </td>
    </tr>
  );
}

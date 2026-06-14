import { TeamMonogram } from "@/_Components/ui/TeamMonogram";
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
      className="h-[52px] cursor-pointer transition-colors hover:bg-white/5"
      style={{
        background: isChampion && !selected ? "rgba(255,214,0,0.04)" : selected ? "rgba(255,255,255,0.08)" : "transparent",
      }}
      onClick={() => onSelect(season.year)}
    >
      <td className="w-1 p-0 align-stretch">
        <span 
          className="inline-block h-full w-1" 
          style={{ background: isChampion ? "hsl(var(--amber))" : "transparent" }} 
          aria-hidden 
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl text-white" style={{ color: isChampion ? "hsl(var(--amber))" : "white" }}>
            {season.year}
          </span>
          <TeamMonogram teamId={teamId} size="sm" />
          {selected && <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">OPEN</span>}
        </div>
      </td>
      <td className="px-3 py-2 text-right font-mono text-[11px] tabular-nums text-white">
        {season.wins}
      </td>
      <td className="px-3 py-2 text-right font-mono text-[11px] tabular-nums text-white/70">
        {displayStat(season, "podiums")}
      </td>
      <td className="px-3 py-2 text-right font-mono text-[11px] tabular-nums text-white/40">
        {displayStat(season, "poles")}
      </td>
      <td className="hidden px-3 py-2 text-right font-mono text-[11px] tabular-nums text-white/40 lg:table-cell">
        {displayStat(season, "fastest_laps")}
      </td>
      <td className="px-3 py-2 text-right font-mono text-[11px] tabular-nums text-white/40">
        {season.races}
      </td>
      <td className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: isChampion ? "hsl(var(--amber))" : "rgba(255,255,255,0.2)" }}>
        {isChampion ? "WDC" : "-"}
      </td>
    </tr>
  );
}

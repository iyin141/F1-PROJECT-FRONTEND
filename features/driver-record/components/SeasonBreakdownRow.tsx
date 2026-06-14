import { TyreCompound } from "@/_Components/ui/TyreCompound";
import type { SeasonRace } from "@/features/driver-record/types/driverRecord.types";
import { formatDate } from "@/Lib/format";
import { formatFinish } from "@/features/driver-record/utlis/driverStatHelpers";

type SeasonBreakdownRowProps = {
  race: SeasonRace;
  showQualifying: boolean;
};

function isDnfStatus(status: string) {
  const upper = status.toUpperCase();
  return upper.includes("DNF") || upper.includes("DNS") || upper.includes("DSQ") || upper.includes("RETIRED");
}

export function SeasonBreakdownRow({ race, showQualifying }: SeasonBreakdownRowProps) {
  const dnf = isDnfStatus(race.status) || race.finishPosition === null;
  const finish = formatFinish(race.finishPosition, race.status);
  const win = race.finishPosition === 1;

  return (
    <tr className="hover:bg-white/5" style={{ opacity: dnf ? 0.5 : 1 }}>
      <td className="px-4 py-[10px] font-mono text-[11px] text-white/40">{race.round}</td>
      <td className="px-2 py-[10px] font-mono text-[11px] uppercase tracking-wider text-white">
        {win ? <span className="text-[hsl(var(--amber))]">{race.raceName}</span> : race.raceName}
      </td>
      <td className="hidden px-2 py-[10px] font-mono text-[10px] text-white/40 md:table-cell">{formatDate(race.raceDate)}</td>
      <td className="hidden px-2 py-[10px] font-mono text-[11px] text-white/40 md:table-cell">{race.gridPosition ?? "-"}</td>
      <td className="px-2 py-[10px] text-right font-mono text-[11px] font-bold" style={{ color: dnf ? "hsl(var(--red))" : win ? "hsl(var(--amber))" : "hsl(var(--text))" }}>
        {finish}
      </td>
      <td className="px-4 py-[10px] text-right font-mono text-[11px] tabular-nums text-white/70">{race.points}</td>
      {showQualifying && (
        <>
          <td className="hidden px-2 py-[10px] text-right font-mono text-[11px] text-white/40 lg:table-cell">{race.qualifyingPosition ?? "-"}</td>
          <td className="hidden px-2 py-[10px] text-right font-mono text-[11px] text-white/40 lg:table-cell">{race.qualifyingTime ?? "-"}</td>
        </>
      )}
      <td className="px-2 py-[10px] text-center">{race.fastestLap ? <span className="text-[hsl(var(--purple))]">FL</span> : <span className="text-white/20">-</span>}</td>
      <td className="px-4 py-[10px] text-right font-mono text-[10px] uppercase tracking-wider" style={{ color: dnf ? "hsl(var(--red))" : "rgba(255,255,255,0.4)" }}>
        {race.status}
      </td>
    </tr>
  );
}

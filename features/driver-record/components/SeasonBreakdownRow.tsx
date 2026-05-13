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

  return (
    <tr className="border-b border-border-subtle odd:bg-surface even:bg-surface2" style={{ opacity: dnf ? 0.65 : 1 }}>
      <td className="px-2 py-3 font-mono text-[12px] text-text-dim">{race.round}</td>
      <td className="px-2 py-3 font-sans text-[13px] text-text">{race.raceName}</td>
      <td className="hidden px-2 py-3 font-mono text-[11px] text-text-dim md:table-cell">{formatDate(race.raceDate)}</td>
      <td className="hidden px-2 py-3 font-mono text-[12px] text-text-dim md:table-cell">{race.gridPosition ?? "-"}</td>
      <td className="px-2 py-3 font-display text-xl md:text-2xl leading-none" style={{ color: dnf ? "hsl(var(--red))" : "hsl(var(--text))" }}>
        {finish}
      </td>
      <td className="px-2 py-3 text-right font-mono text-[1.1rem] tabular-nums text-text">{race.points}</td>
      {showQualifying && (
        <>
          <td className="hidden px-2 py-3 font-mono text-[12px] text-text-dim lg:table-cell">{race.qualifyingPosition ?? "-"}</td>
          <td className="hidden px-2 py-3 font-mono text-[12px] text-text-dim lg:table-cell">{race.qualifyingTime ?? "-"}</td>
        </>
      )}
      <td className="px-2 py-3 text-center"><TyreCompound active={race.fastestLap} /></td>
      <td className="px-2 py-3 font-sans text-[12px]" style={{ color: dnf ? "hsl(var(--red))" : "hsl(var(--muted))" }}>{race.status}</td>
    </tr>
  );
}

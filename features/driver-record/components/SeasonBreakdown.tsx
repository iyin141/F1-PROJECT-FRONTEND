import { AnimatePresence, motion } from "framer-motion";
import type { DriverSeasonData } from "@/features/driver-record/types/driverRecord.types";
import { seasonHasQualifyingData } from "@/features/driver-record/utlis/driverStatHelpers";
import { SeasonBreakdownRow } from "@/features/driver-record/components/SeasonBreakdownRow";

type SeasonBreakdownProps = {
  year: number | null;
  season?: DriverSeasonData;
  loading: boolean;
  isError: boolean;
  onRetry: () => void;
  onClose: () => void;
};

function isDnfStatus(status: string) {
  const upper = status.toUpperCase();
  return upper.includes("DNF") || upper.includes("DNS") || upper.includes("DSQ") || upper.includes("RETIRED");
}

export function SeasonBreakdown({
  year,
  season,
  loading,
  isError,
  onRetry,
  onClose,
}: SeasonBreakdownProps) {
  return (
    <AnimatePresence initial={false}>
      {year !== null && (
        <motion.div
          key={year}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="border border-border-subtle bg-panel mt-4">
            <header className="flex items-center justify-between border-b border-border-subtle px-4 h-[40px]">
              <div className="flex items-baseline gap-3">
                <h3 className="font-mono text-sm tracking-widest text-white">{year} SEASON</h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {season ? `${season.totalRaces} races` : "Breakdown"}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-white"
              >
                [ CLOSE ]
              </button>
            </header>

            {loading && (
              <div className="p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-white/5 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && isError && (
              <div className="flex flex-col items-center justify-center gap-3 p-12">
                <p className="font-mono text-xs uppercase tracking-widest text-white/40">Could not load {year} season data</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white"
                >
                  [ RETRY ]
                </button>
              </div>
            )}

            {!loading && !isError && season && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-2xl border-collapse">
                    <thead>
                      <tr className="border-b border-border-subtle bg-white/5 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">
                        <th className="px-4 py-2 w-12">RD</th>
                        <th className="px-2 py-2">RACE</th>
                        <th className="hidden px-2 py-2 md:table-cell">DATE</th>
                        <th className="hidden px-2 py-2 md:table-cell w-16">GRID</th>
                        <th className="px-2 py-2 w-16 text-right">FINISH</th>
                        <th className="px-4 py-2 w-16 text-right">PTS</th>
                        {seasonHasQualifyingData(season.races) && (
                          <>
                            <th className="hidden px-2 py-2 lg:table-cell w-20 text-right">QUAL POS</th>
                            <th className="hidden px-2 py-2 lg:table-cell text-right">QUAL TIME</th>
                          </>
                        )}
                        <th className="px-2 py-2 w-12 text-center">FL</th>
                        <th className="px-4 py-2 w-32 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/70">
                      {season.races.map((race) => (
                        <SeasonBreakdownRow
                          key={`${race.year}-${race.round}`}
                          race={race}
                          showQualifying={seasonHasQualifyingData(season.races)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-px border-t border-border-subtle bg-border-subtle md:grid-cols-4 xl:grid-cols-7">
                  {(() => {
                    const races = season.races.length;
                    const wins = season.races.filter((r) => r.finishPosition === 1).length;
                    const podiums = season.races.filter((r) => r.finishPosition !== null && r.finishPosition <= 3).length;
                    const poles = season.races.filter((r) => r.qualifyingPosition === 1).length;
                    const hasAnyQuali = seasonHasQualifyingData(season.races);
                    const fastestLaps = season.races.filter((r) => r.fastestLap).length;
                    const points = season.races.reduce((acc, r) => acc + r.points, 0);
                    const dnfs = season.races.filter((r) => isDnfStatus(r.status) || r.finishPosition === null).length;

                    const items = [
                      ["RACES", String(races)],
                      ["WINS", String(wins)],
                      ["PODIUMS", String(podiums)],
                      ["POLES", hasAnyQuali ? String(poles) : "-"],
                      ["FASTEST", hasAnyQuali ? String(fastestLaps) : "-"],
                      ["POINTS", String(points)],
                      ["DNFS", String(dnfs)],
                    ] as const;

                    return items.map(([label, value]) => (
                      <div key={label} className="bg-panel px-4 py-3 flex items-center justify-between">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">{label}</div>
                        <div className="font-mono text-sm font-semibold text-white">{value}</div>
                      </div>
                    ));
                  })()}
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

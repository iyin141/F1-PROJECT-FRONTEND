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
          <div className="rounded-lg border border-border-subtle bg-surface2 p-3 md:p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                <h3 className="font-display text-3xl text-text">{year}</h3>
                <p className="font-sans text-[13px] text-text-dim">
                  {season ? `${season.totalRaces} races` : "Season breakdown"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-dim"
              >
                Close
              </button>
            </div>

            {loading && (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-13" />
                ))}
              </div>
            )}

            {!loading && isError && (
              <div className="space-y-3 py-6 text-center">
                <p className="font-mono text-[12px] text-text-dim">Could not load {year} season data</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-dim"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !isError && season && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-2xl border-collapse">
                    <thead>
                      <tr className="border-b border-border-subtle text-left font-mono text-[10px] tracking-[0.15em] text-text-dim">
                        <th className="px-2 py-2">RD</th>
                        <th className="px-2 py-2">RACE</th>
                        <th className="hidden px-2 py-2 md:table-cell">DATE</th>
                        <th className="hidden px-2 py-2 md:table-cell">GRID</th>
                        <th className="px-2 py-2">FINISH</th>
                        <th className="px-2 py-2 text-right">PTS</th>
                        {seasonHasQualifyingData(season.races) && (
                          <>
                            <th className="hidden px-2 py-2 lg:table-cell">QUAL POS</th>
                            <th className="hidden px-2 py-2 lg:table-cell">QUAL TIME</th>
                          </>
                        )}
                        <th className="px-2 py-2 text-center">FL</th>
                        <th className="px-2 py-2">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
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

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-md border border-border-subtle bg-surface p-2 md:grid-cols-4 xl:grid-cols-7">
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
                      <div key={label} className="text-center">
                        <div className="font-display text-xl md:text-2xl leading-none text-text">{value}</div>
                        <div className="font-mono text-[9px] tracking-[0.15em] text-text-dim">{label}</div>
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

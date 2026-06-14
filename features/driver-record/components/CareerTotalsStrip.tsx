import type { CareerSeason, CareerTotals } from "@/features/driver-record/types/driverRecord.types";

type CareerTotalsStripProps = {
  seasons: CareerSeason[];
  totals?: CareerTotals;
};

function safePercent(wins: number, races: number) {
  if (!races) return "0.0%";
  return `${((wins / races) * 100).toFixed(1)}%`;
}

export function CareerTotalsStrip({ seasons, totals }: CareerTotalsStripProps) {
  const races = seasons.reduce((acc, s) => acc + s.races, 0);
  const wins = totals?.totalWins ?? 0;
  const championships = totals?.championships ?? 0;
  const podiums = totals?.totalPodiums ?? 0;

  const items = [
    { label: "SEASONS", value: String(seasons.length) },
    { label: "RACES", value: String(races) },
    { label: "WINS", value: String(wins) },
    { label: "CHAMPS", value: String(championships) },
    { label: "PODIUMS", value: String(podiums) },
    { label: "WIN RATE", value: safePercent(wins, races) },
  ];

  return (
    <div className="grid grid-cols-2 gap-px border-y border-border-subtle bg-border-subtle md:grid-cols-3 xl:grid-cols-6 mb-8 mt-[-24px]">
      {items.map((item) => (
        <div key={item.label} className="bg-panel px-6 py-4 flex flex-col justify-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">{item.label}</div>
          <div className="font-mono text-xl text-white">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

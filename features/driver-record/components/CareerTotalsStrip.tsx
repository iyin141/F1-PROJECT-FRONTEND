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
    <div className="grid grid-cols-2 divide-x divide-y divide-border-subtle rounded-[10px] border border-border-subtle bg-surface md:grid-cols-3 xl:grid-cols-6 xl:divide-y-0">
      {items.map((item) => (
        <div key={item.label} className="px-3 py-3 text-center">
          <div className="font-display text-xl md:text-2xl text-text">{item.value}</div>
          <div className="font-mono text-[10px] tracking-[0.15em] text-text-dim">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

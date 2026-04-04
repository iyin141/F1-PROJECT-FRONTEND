import Link from "next/link";

import type { Race } from "@/types/races";

type RaceCardProps = {
  race: Race;
  year: number;
};

function formatRaceDate(value: string | null) {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function RaceCard({ race, year }: RaceCardProps) {
  return (
    <Link href={`/races/${year}/${race.round}`} className="block">
      <article className="group rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 transition hover:border-red-700 hover:bg-zinc-900">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Round {race.round}</p>
        <h3 className="mt-2 text-lg font-semibold text-zinc-100 group-hover:text-red-400">
          {race.name}
        </h3>
        <p className="mt-2 text-sm text-zinc-300">{race.location}, {race.country}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-zinc-500">
          {formatRaceDate(race.date)}
        </p>
      </article>
    </Link>
  );
}

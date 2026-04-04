"use client";

import { useMemo, useState } from "react";

import type { ConstructorStanding, DriverStanding } from "@/types/standings";

type StandingsPanelProps = {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
};

export default function StandingsPanel({
  drivers,
  constructors,
}: StandingsPanelProps) {
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const [showAllConstructors, setShowAllConstructors] = useState(false);

  const visibleDrivers = useMemo(
    () => (showAllDrivers ? drivers : drivers.slice(0, 5)),
    [drivers, showAllDrivers],
  );

  const visibleConstructors = useMemo(
    () => (showAllConstructors ? constructors : constructors.slice(0, 5)),
    [constructors, showAllConstructors],
  );

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm uppercase tracking-[0.2em] text-red-400">
            {showAllDrivers ? "Drivers Championship" : "Drivers Top 5"}
          </h2>
          <button
            type="button"
            onClick={() => setShowAllDrivers((prev) => !prev)}
            className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs uppercase tracking-[0.15em] text-zinc-300 transition hover:border-red-700 hover:text-red-300"
          >
            {showAllDrivers ? "Show Less" : "Show More"}
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {visibleDrivers.map((driver) => (
            <li key={`${driver.position}-${driver.driver_name}`} className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2 text-sm">
              <span className="text-zinc-200">{driver.position}. {driver.driver_name}</span>
              <span className="text-zinc-400">{driver.points} pts</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm uppercase tracking-[0.2em] text-red-400">
            {showAllConstructors ? "Constructors Championship" : "Constructors Top 5"}
          </h2>
          <button
            type="button"
            onClick={() => setShowAllConstructors((prev) => !prev)}
            className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs uppercase tracking-[0.15em] text-zinc-300 transition hover:border-red-700 hover:text-red-300"
          >
            {showAllConstructors ? "Show Less" : "Show More"}
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {visibleConstructors.map((constructor) => (
            <li key={`${constructor.position}-${constructor.constructor_name}`} className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2 text-sm">
              <span className="text-zinc-200">{constructor.position}. {constructor.constructor_name}</span>
              <span className="text-zinc-400">{constructor.points} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

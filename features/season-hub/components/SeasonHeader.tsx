'use client';

import type { ChangeEvent } from "react";

type SeasonHeaderProps = {
  year: number;
  years: number[] | undefined;
  onYearChange: (year: number) => void;
};

export const SeasonHeader = ({ year, years, onYearChange }: SeasonHeaderProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onYearChange(Number(event.target.value));
  };

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="label-mono">SEASON HUB</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">{year} Season</h1>
      </div>
      <select
        value={year}
        onChange={handleChange}
        className="rounded-sm border border-border-subtle bg-panel px-3 py-2 font-mono text-xs"
      >
        {(years ?? [2024]).map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </header>
  );
};

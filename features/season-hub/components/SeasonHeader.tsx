'use client';

import { YearNavigator } from "@/components/ui/YearNavigator";

type SeasonHeaderProps = {
  year: number;
  years: number[] | undefined;
  onNavigate?: (nextYear: number) => void;
};

export const SeasonHeader = ({ year, years, onNavigate }: SeasonHeaderProps) => {
  const minYear = years?.length ? Math.min(...years) : 1950;
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="label-mono">SEASON HUB</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">{year} Season</h1>
      </div>
      <YearNavigator year={year} minYear={minYear} onNavigate={onNavigate} />
    </header>
  );
};

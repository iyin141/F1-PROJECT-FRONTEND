"use client";

import { useEffect, useState } from "react";

type YearSelectorProps = {
  year: number;
  minYear?: number;
  onChange: (year: number) => void;
};

export default function YearSelector({
  year,
  minYear = 1950,
  onChange,
}: YearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const [inputValue, setInputValue] = useState(String(year));

  useEffect(() => {
    setInputValue(String(year));
  }, [year]);

  function commitYear(rawValue: string) {
    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue)) {
      setInputValue(String(year));
      return;
    }

    const normalizedYear = Math.min(
      Math.max(Math.trunc(parsedValue), minYear),
      currentYear,
    );

    setInputValue(String(normalizedYear));
    onChange(normalizedYear);
  }

  return (
    <label className="inline-flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Season</span>
      <input
        type="number"
        inputMode="numeric"
        min={minYear}
        max={currentYear}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={(event) => commitYear(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commitYear((event.target as HTMLInputElement).value);
            (event.target as HTMLInputElement).blur();
          }
        }}
        className="w-24 rounded-md border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100 outline-none ring-red-500 transition focus:ring-2"
      />
    </label>
  );
}

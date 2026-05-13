'use client';

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type YearNavigatorProps = {
  year: number;
  minYear?: number;
  maxYear?: number;
  label?: string;
};

const MIN_YEAR = 1950;

export function YearNavigator({
  year,
  minYear = MIN_YEAR,
  maxYear = new Date().getFullYear(),
  label = "Year",
}: YearNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToYear = useCallback(
    (nextYear: number) => {
      if (nextYear < minYear || nextYear > maxYear) return;

      const segments = pathname.split("/");
      const yearIndex = segments.findIndex(
        (segment) => /^\d{4}$/.test(segment) && Number(segment) >= MIN_YEAR,
      );

      if (yearIndex === -1) return;
      segments[yearIndex] = String(nextYear);
      router.push(segments.join("/"));
    },
    [maxYear, minYear, pathname, router],
  );

  return (
    <div className="flex items-center gap-2 rounded-sm border border-border-subtle bg-panel px-2 py-1.5">
      <span className="label-mono whitespace-nowrap">{label}</span>
      <button
        type="button"
        onClick={() => navigateToYear(year - 1)}
        disabled={year <= minYear}
        data-nav-trigger="true"
        className="nav-arrow nav-arrow--prev inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border-subtle text-text transition-colors hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous year"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="min-w-28 text-center font-mono text-xs uppercase tracking-[0.12em] text-text">
        {year}
      </span>
      <button
        type="button"
        onClick={() => navigateToYear(year + 1)}
        disabled={year >= maxYear}
        data-nav-trigger="true"
        className="nav-arrow nav-arrow--next inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border-subtle text-text transition-colors hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next year"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

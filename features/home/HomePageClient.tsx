'use client';

import { YearNavigator } from "@/components/ui/YearNavigator";
import { useNavStore } from "@/_Stores/navStore";
import { StatusStrip } from "@/features/home/components/StatusStrip";
import { ThemeToggle } from "@/components/ThemeToggle";

type HomePageClientProps = {
  year: number;
};

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Home Page Shell (Header/Navigation Only)
 *
 * This client component renders only the page header and navigation.
 * All data sections are rendered by server components with Suspense boundaries in page.tsx.
 *
 * This enables streaming: the header renders immediately while data sections
 * load independently in parallel.
 */
export function HomePageClient({ year }: HomePageClientProps) {
  const setHomeYear = useNavStore((s) => s.setHomeYear);

  const onNavigate = (nextYear: number) => {
    setHomeYear(nextYear);
    window.history.replaceState(null, "", `/?year=${nextYear}`);
  };
  return (
    <main className="min-h-screen w-full page-shell">
      <StatusStrip calendar={undefined} leader={undefined} hasError={false} onRetry={() => {}} year={year} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight">Race Control</h1>
          <YearNavigator year={year} maxYear={CURRENT_YEAR} onNavigate={onNavigate} />
        </div>
        <ThemeToggle />
      </div>
    </main>
  );
}

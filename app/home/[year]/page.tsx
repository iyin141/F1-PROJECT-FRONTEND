import { notFound } from "next/navigation";
import { HydrationBoundary, prefetchQueries } from "@/Lib/prefetch";
import { queryKeys } from "@/Lib/queryKeys";
import { HomePageShell } from "@/features/home/HomePage";

type HomeYearPageProps = {
  params: Promise<{ year: string }>;
};

const MIN_YEAR = 1950;

export default async function HomeYearPage({ params }: HomeYearPageProps) {
  const { year: yearParam } = await params;
  const parsed = Number(yearParam);
  const currentYear = new Date().getFullYear();
  const year = Number.isFinite(parsed) ? parsed : currentYear;

  if (year < MIN_YEAR || year > currentYear) {
    notFound();
  }

  console.log("[prefetch] HomeYearPage: starting prefetch", { year });
  const { dehydratedState } = await prefetchQueries([
    {
      queryKey: queryKeys.schedule.season(year),
      pathname: `/races/${year}/`,
    },
    {
      queryKey: queryKeys.driverStandings.grid(year),
      pathname: `/drivers/${year}/`,
    },
    {
      queryKey: queryKeys.constructorStandings.year(year),
      pathname: `/constructors/${year}/`,
    },
  ]);
  console.log("[prefetch] HomeYearPage: prefetch complete", { year });

  return (
    <HydrationBoundary state={dehydratedState}>
      <HomePageShell initialYear={year} />
    </HydrationBoundary>
  );
}

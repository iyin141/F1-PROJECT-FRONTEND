import { HydrationBoundary, prefetchQueries } from "@/Lib/prefetch";
import { queryKeys } from "@/Lib/queryKeys";
import { HomePageShell } from "@/features/home/HomePage";

export default async function HomePage() {
  const currentYear = new Date().getFullYear();
  const MIN_YEAR = 1950;

  if (currentYear < MIN_YEAR) {
    throw new Error(`Current year ${currentYear} is before ${MIN_YEAR}`);
  }

  console.log("[prefetch] HomePage: starting prefetch", { year: currentYear });
  const { dehydratedState } = await prefetchQueries([
    {
      queryKey: queryKeys.schedule.season(currentYear),
      pathname: `/races/${currentYear}/`,
    },
    {
      queryKey: queryKeys.driverStandings.grid(currentYear),
      pathname: `/drivers/${currentYear}/`,
    },
    {
      queryKey: queryKeys.constructorStandings.year(currentYear),
      pathname: `/constructors/${currentYear}/`,
    },
  ]);
  console.log("[prefetch] HomePage: prefetch complete", { year: currentYear });

  return (
    <HydrationBoundary state={dehydratedState}>
      <HomePageShell initialYear={currentYear} />
    </HydrationBoundary>
  );
}

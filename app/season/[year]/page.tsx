import { notFound } from "next/navigation";
import { SeasonHubShell } from "@/features/season-hub/SeasonHub";

type SeasonPageProps = {
  params: Promise<{ year: string }>;
};

const MIN_YEAR = 1950;

export default async function SeasonHub({ params }: SeasonPageProps) {
  const { year: yearParam } = await params;
  const parsed = Number(yearParam);
  const currentYear = new Date().getFullYear();
  const year = Number.isFinite(parsed) ? parsed : currentYear;

  if (year < MIN_YEAR || year > currentYear) {
    notFound();
  }

  return <SeasonHubShell year={year} />;
}

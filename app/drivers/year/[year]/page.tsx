import { notFound } from "next/navigation";
import { DriversHubPage } from "@/features/drivers-hub/DriversHubPage";

type DriversYearPageProps = {
  params: Promise<{ year: string }>;
};

const MIN_YEAR = 1950;

export default async function DriversYearPage({ params }: DriversYearPageProps) {
  const { year: yearParam } = await params;
  const parsed = Number(yearParam);
  const currentYear = new Date().getFullYear();
  const year = Number.isFinite(parsed) ? parsed : currentYear;

  if (year < MIN_YEAR || year > currentYear) {
    notFound();
  }

  return <DriversHubPage year={year} />;
}

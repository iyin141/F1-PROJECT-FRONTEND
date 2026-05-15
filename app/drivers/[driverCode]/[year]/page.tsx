import { notFound } from "next/navigation";
import { DriverRecordShell } from "@/features/driver-record";

type DriverYearPageProps = {
  params: Promise<{ driverCode: string; year: string }>;
};

const MIN_YEAR = 1950;

export default async function DriverYearPage({ params }: DriverYearPageProps) {
  const { driverCode: rawCode, year: yearParam } = await params;
  const driverCode = rawCode.toUpperCase();

  const parsed = Number(yearParam);
  const currentYear = new Date().getFullYear();
  const year = Number.isFinite(parsed) ? parsed : currentYear;

  if (year < MIN_YEAR || year > currentYear) {
    notFound();
  }

  return <DriverRecordShell driverCode={driverCode} year={year} />;
}

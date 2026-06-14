import { notFound } from "next/navigation";
import { RaceDetailShell } from "@/features/race-detail/RaceDetail";

type RaceDetailPageProps = {
  params: Promise<{ year: string; round: string }>;
};

const MIN_YEAR = 1950;

export default async function RaceDetailPage({ params }: RaceDetailPageProps) {
  const { year: yearParam, round: roundParam } = await params;
  const year = Number(yearParam);
  const round = Number(roundParam);
  const currentYear = new Date().getFullYear();

  if (year < MIN_YEAR || year > currentYear || round < 1 || round > 24) {
    notFound();
  }

  return <RaceDetailShell year={year} round={round} />;
}

import { notFound } from "next/navigation";
import { RaceAnalysisShell } from "@/features/race-analysis/RaceAnalysis";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race Analysis · F1 Control Room",
};

type AnalysisPageProps = {
  params: Promise<{ year: string; round: string }>;
};

const MIN_YEAR = 1950;

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { year: yearParam, round: roundParam } = await params;
  const year = Number(yearParam);
  const round = Number(roundParam);
  const currentYear = new Date().getFullYear();

  if (year < MIN_YEAR || year > currentYear || round < 1 || round > 24) {
    notFound();
  }

  return <RaceAnalysisShell year={year} round={round} />;
}

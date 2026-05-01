import { RaceAnalysisShell } from "@/features/race-analysis/RaceAnalysis";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race Analysis · F1 Control Room",
};

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ year: string; round: string }>;
}) {
  const { year, round } = await params;
  return (
    <RaceAnalysisShell year={parseInt(year, 10)} round={parseInt(round, 10)} />
  );
}

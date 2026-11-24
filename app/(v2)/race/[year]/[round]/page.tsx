import { notFound } from "next/navigation";
import { RaceHub } from "@/features/race-hub/RaceHub";

type Props = { params: Promise<{ year: string; round: string }> };

export default async function RaceHubPage({ params }: Props) {
  const { year: y, round: r } = await params;
  const year = Number(y);
  const round = Number(r);
  if (!(year >= 1950 && year <= new Date().getFullYear() && round >= 1 && round <= 24)) notFound();
  return <RaceHub year={year} round={round} />;
}

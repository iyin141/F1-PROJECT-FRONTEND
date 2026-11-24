import type { Metadata } from "next";
import { ChaosHome } from "@/features/chaos/ChaosHome";

export const metadata: Metadata = { title: "Chaos · F1 Control Room" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function ChaosPage({ searchParams }: Props) {
  const q = await searchParams;
  const year = Number(q.year) >= 1950 ? Number(q.year) : new Date().getFullYear();
  const round = Number(q.round) >= 1 ? Number(q.round) : null;
  return <ChaosHome year={year} round={round} />;
}

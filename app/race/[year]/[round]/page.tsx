'use client';

import { useParams } from "next/navigation";
import { RaceDetailShell } from "@/features/race-detail/RaceDetail";

export default function RaceDetail() {
  const params = useParams();
  const year = Number(params.year);
  const round = Number(params.round);

  return <RaceDetailShell year={year} round={round} />;
}

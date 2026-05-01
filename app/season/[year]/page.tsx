'use client';

import { useParams, useRouter } from "next/navigation";
import { SeasonHubShell } from "@/features/season-hub/SeasonHub";

export default function SeasonHub() {
  const params = useParams();
  const router = useRouter();
  const year = Number(params.year) || 2024;

  return (
    <SeasonHubShell
      year={year}
      onYearChange={(nextYear) => router.push(`/season/${nextYear}`)}
    />
  );
}

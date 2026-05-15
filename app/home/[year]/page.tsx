import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { HomePageShell } from "@/features/home/HomePage";

type HomeYearPageProps = {
  params: Promise<{ year: string }>;
};

const MIN_YEAR = 1950;

export default async function HomeYearPage({ params }: HomeYearPageProps) {
  const { year: yearParam } = await params;
  const parsed = Number(yearParam);
  const currentYear = new Date().getFullYear();
  const year = Number.isFinite(parsed) ? parsed : currentYear;

  if (year < MIN_YEAR || year > currentYear) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="page-shell" />}>
      <HomePageShell initialYear={year} />
    </Suspense>
  );
}

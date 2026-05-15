import React, { Suspense } from "react";
import { HomePageShell } from "@/features/home/HomePage";
import { Skeleton } from "@/components/Skeleton";

export default function RootPage() {
  const currentYear = new Date().getFullYear();
  const MIN_YEAR = 1950;

  if (currentYear < MIN_YEAR) {
    throw new Error(`Current year ${currentYear} is before ${MIN_YEAR}`);
  }

  return (
    <Suspense
      fallback={
        <div className="page-shell">
          <Skeleton className="min-h-screen" />
        </div>
      }
    >
      <HomePageShell initialYear={currentYear} />
    </Suspense>
  );
}

import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";
import { DriversHubPage } from "@/features/drivers-hub/DriversHubPage";

export default function DriversIndexPage({ searchParams }: { searchParams?: { year?: string } }) {
  const year = searchParams?.year ? Number(searchParams.year) : new Date().getFullYear();

  return (
    <Suspense fallback={<Skeleton />}>
      {/* Server provides the initial year; client shell seeds nav store */}
      <DriversHubPage year={year} />
    </Suspense>
  );
}

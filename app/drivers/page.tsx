import { Suspense, use } from "react";
import { Skeleton } from "@/components/Skeleton";
import { DriversHubPage } from "@/features/drivers-hub/DriversHubPage";

export default function DriversIndexPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = use(searchParams);
  const year = params?.year ? Number(params.year) : new Date().getFullYear();

  return (
    <Suspense fallback={<Skeleton />}>
      {/* Server provides the initial year; client shell seeds nav store */}
      <DriversHubPage year={year} />
    </Suspense>
  );
}


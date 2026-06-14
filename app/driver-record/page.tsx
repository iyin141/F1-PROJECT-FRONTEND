import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { DriverRecordShell } from "@/features/driver-record/components/DriverRecordShell";

export default function DriverRecordPage({ searchParams }: { searchParams?: { code?: string; year?: string } }) {
  const code = searchParams?.code ? searchParams.code.toUpperCase() : undefined;
  const year = searchParams?.year ? Number(searchParams.year) : new Date().getFullYear();

  if (!code) {
    return <EmptyState message="DRIVER RECORD" description="Open a driver record with ?code=VER&year=2024" />;
  }

  return (
    <Suspense fallback={<Skeleton />}>
      <DriverRecordShell driverCode={code} year={year} />
    </Suspense>
  );
}

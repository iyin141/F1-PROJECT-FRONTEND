import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";
import { DriverRecordShell } from "@/features/driver-record/components/DriverRecordShell";

type Props = {
  params: { driverCode: string };
  searchParams?: { year?: string };
};

export default function DriverRecordLegacyPage({ params, searchParams }: Props) {
  const code = params.driverCode.toUpperCase();
  const year = searchParams?.year ? Number(searchParams.year) : new Date().getFullYear();

  return (
    <Suspense fallback={<Skeleton />}>
      <DriverRecordShell driverCode={code} year={year} />
    </Suspense>
  );
}

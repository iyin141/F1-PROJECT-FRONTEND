import { redirect } from "next/navigation";

export default async function DriverRecordLegacyPage({
  params,
}: {
  params: Promise<{ driverCode: string }>;
}) {
  const { driverCode } = await params;
  redirect(`/drivers/${driverCode.toUpperCase()}/${new Date().getFullYear()}`);
}

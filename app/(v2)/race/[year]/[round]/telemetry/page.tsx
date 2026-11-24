import { notFound } from "next/navigation";
import { TelemetryLab, type LabParams } from "@/features/telemetry-lab/TelemetryLab";

type Props = { params: Promise<{ year: string; round: string }>; searchParams: Promise<Record<string, string | undefined>> };

const num = (v: string | undefined) => (v !== undefined && v !== "" && Number.isFinite(Number(v)) ? Number(v) : null);

/** Telemetry lab. State lives in the URL: drivers, lap (fastest or a number), start_m and end_m. */
export default async function TelemetryLabPage({ params, searchParams }: Props) {
  const { year: y, round: r } = await params;
  const q = await searchParams;
  const year = Number(y), round = Number(r);
  if (!(year >= 1950 && year <= new Date().getFullYear() && round >= 1 && round <= 24)) notFound();

  const drivers = [...new Set((q.drivers ?? "VER,NOR").split(",").map((d) => d.trim().toUpperCase()).filter((d) => /^[A-Z]{3}$/.test(d)))].slice(0, 4);
  const lapN = num(q.lap);
  const start = num(q.start_m), end = num(q.end_m);
  const params_: LabParams = {
    drivers: drivers.length >= 2 ? drivers : ["VER", "NOR"],
    lap: lapN !== null && lapN >= 1 ? Math.floor(lapN) : null,
    startM: start !== null && start >= 0 ? start : null,
    endM: end !== null && end > (start ?? 0) ? end : null,
  };
  return <TelemetryLab year={year} round={round} params={params_} />;
}

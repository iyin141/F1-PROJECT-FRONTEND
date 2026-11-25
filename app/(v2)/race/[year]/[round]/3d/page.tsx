import { notFound } from "next/navigation";
import { Replay3D } from "@/features/replay3d/Replay3D";

type Props = { params: Promise<{ year: string; round: string }> };

export default async function Replay3DPage({ params }: Props) {
  const { year: y, round: r } = await params;
  const year = Number(y), round = Number(r);
  if (!(year >= 1950 && year <= new Date().getFullYear() && round >= 1 && round <= 24)) notFound();
  return <Replay3D year={year} round={round} />;
}

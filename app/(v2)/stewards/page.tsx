import type { Metadata } from "next";
import { Stewards } from "@/features/stewards/Stewards";

export const metadata: Metadata = { title: "Ask the stewards · F1 Control Room" };

export default function StewardsPage() {
  return <Stewards />;
}

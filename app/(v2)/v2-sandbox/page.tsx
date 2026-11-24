import type { Metadata } from "next";
import { Sandbox } from "@/features/v2-sandbox/Sandbox";

export const metadata: Metadata = { title: "v2 sandbox · F1 Control Room" };

export default function Page() {
  return <Sandbox />;
}

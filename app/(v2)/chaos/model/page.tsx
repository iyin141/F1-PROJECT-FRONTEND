import type { Metadata } from "next";
import { VStack } from "@astryxdesign/core/VStack";
import { ChaosHeader } from "@/features/chaos/components/ChaosNav";
import { ModelPageView } from "@/features/chaos/components/ModelPageView";

export const metadata: Metadata = { title: "How Chaos is calculated · F1 Control Room" };

export default function ChaosModelPage() {
  return (
    <VStack gap={4} padding={4} style={{ maxWidth: 1200, margin: "0 auto" }}>
      <ChaosHeader current="model" title="How Chaos is calculated" lead="The model runs, how well they predict, and what they cannot tell you." />
      <ModelPageView />
    </VStack>
  );
}

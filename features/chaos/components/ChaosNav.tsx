"use client";

import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

/** Shared header for the chaos pages. */
export function ChaosHeader({ title, lead, current }: { title: string; lead: string; current: "preview" | "model" }) {
  return (
    <VStack gap={2}>
      <HStack justify="between" align="end" wrap="wrap" gap={3}>
        <Heading level={1}>{title}</Heading>
        <HStack gap={4} role="navigation" aria-label="Chaos pages">
          <Link href="/chaos" aria-current={current === "preview" ? "page" : undefined}>Preview and history</Link>
          <Link href="/chaos/model" aria-current={current === "model" ? "page" : undefined}>How it works</Link>
        </HStack>
      </HStack>
      <Text color="secondary">{lead}</Text>
    </VStack>
  );
}

"use client";

import { ThinkingOrb } from "thinking-orbs";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import type { AssistantPhase } from "@/Lib/api/v2/payloads";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

const STATE = { queued: "working", searching: "searching", solving: "solving", composing: "composing", idle: "breathing" } as const;

/** Agent-state indicator: searching while retrieving, solving while reasoning, composing while streaming. Pauses for reduced motion. */
export function OrbStatus({ phase, message }: { phase: AssistantPhase | "idle"; message?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <HStack gap={2} align="center">
      <ThinkingOrb state={STATE[phase]} size={20} paused={reduced} theme="auto" />
      {message ? <Text color="secondary">{message}</Text> : null}
    </HStack>
  );
}

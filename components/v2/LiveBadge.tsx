import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";

/** Live state marker. One of the only two places F1 red appears (the other is the primary action). */
export function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <HStack gap={1.5} align="center" role="status">
      <i className="f1-live-dot" aria-hidden />
      <Text weight="semibold">{label}</Text>
    </HStack>
  );
}

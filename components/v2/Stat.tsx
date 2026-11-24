import { VStack } from "@astryxdesign/core/VStack";
import { Text } from "@astryxdesign/core/Text";

/** A number that must line up: condensed display face, tabular figures, small caption below. */
export function Stat({ value, caption, unit }: { value: string | number; caption: string; unit?: string }) {
  return (
    <VStack gap={0.5}>
      <Text className="f1-num" style={{ fontSize: "var(--font-size-display, 2.75rem)", lineHeight: 1, fontWeight: 600 }}>
        {value}
        {unit ? <small style={{ fontSize: "0.4em", marginInlineStart: 4 }}>{unit}</small> : null}
      </Text>
      <Text color="secondary">{caption}</Text>
    </VStack>
  );
}

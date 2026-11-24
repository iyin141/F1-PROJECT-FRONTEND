import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";

/** Driver code with a team-colour swatch. A dashed swatch marks the second driver of a shared colour. */
export function DriverChip({ code, colour, dashed = false }: { code: string; colour: string; dashed?: boolean }) {
  return (
    <HStack gap={1.5} align="center">
      <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden>
        <line x1="1" y1="4" x2="21" y2="4" stroke={colour} strokeWidth="3" strokeLinecap="butt" strokeDasharray={dashed ? "5 3" : undefined} />
      </svg>
      <Text weight="semibold" className="f1-num">{code}</Text>
    </HStack>
  );
}
